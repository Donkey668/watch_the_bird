"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  NOTEBOOK_MAX_NOTE_LENGTH,
  clipNoteCharacters,
  countNoteCharacters,
  getCurrentBeijingDateTime,
  isValidObservationDate,
  type NotebookCoordinates,
  type NotebookFieldErrors,
  type NotebookLocationSource,
  type NotebookRecordInput,
  type NotebookRecordSnapshot,
} from "@/lib/records/notebook";
import {
  RecordMapPickerDialog,
  type RecordMapPickerResult,
} from "./record-map-picker-dialog";

type RecordEditorDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  record: NotebookRecordSnapshot | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: NotebookRecordInput) => Promise<
    | {
        ok: true;
      }
    | {
        ok: false;
        message: string;
        fieldErrors?: NotebookFieldErrors;
      }
  >;
};

type RecordEditorState = {
  observationDate: string;
  observationTime: string;
  birdPoint: string;
  speciesName: string;
  note: string;
  locationSource: NotebookLocationSource;
  coordinates: NotebookCoordinates | null;
};

type ActivePicker = "date" | "time" | null;

type LocationStatus = {
  tone: "info" | "error";
  message: string;
} | null;

type ObservationDateParts = {
  year: string;
  month: string;
  day: string;
};

type LocationResolveResponse = {
  requestStatus: "success" | "invalid_input" | "failed";
  message: string;
  location: {
    label: string;
    coordinates: NotebookCoordinates;
    source: "device" | "map";
    usedFallbackLabel: boolean;
  } | null;
};

function createInitialState(
  record: NotebookRecordSnapshot | null,
): RecordEditorState {
  const beijingNow = getCurrentBeijingDateTime();

  if (!record) {
    return {
      observationDate: beijingNow.observationDate,
      observationTime: beijingNow.observationTime,
      birdPoint: "",
      speciesName: "",
      note: "",
      locationSource: "manual",
      coordinates: null,
    };
  }

  return {
    observationDate: record.observationDate,
    observationTime: record.observationTime,
    birdPoint: record.birdPoint,
    speciesName: record.speciesName,
    note: record.note,
    locationSource: record.locationSource,
    coordinates: record.coordinates,
  };
}

function getObservationDateParts(value: string): ObservationDateParts {
  const safeValue = isValidObservationDate(value)
    ? value
    : getCurrentBeijingDateTime().observationDate;
  const [year = "2000", month = "01", day = "01"] = safeValue.split("-");

  return {
    year,
    month,
    day,
  };
}

function getDayCount(year: string, month: string) {
  const numericYear = Number(year);
  const numericMonth = Number(month);

  if (!Number.isInteger(numericYear) || !Number.isInteger(numericMonth)) {
    return 31;
  }

  if (numericMonth < 1 || numericMonth > 12) {
    return 31;
  }

  return new Date(numericYear, numericMonth, 0).getDate();
}

function getYearOptions(selectedYear: string) {
  const currentYear = Number(getCurrentBeijingDateTime().observationDate.slice(0, 4));
  const numericSelectedYear = Number(selectedYear);
  const baseYear = Number.isInteger(numericSelectedYear)
    ? numericSelectedYear
    : currentYear;
  const startYear = Math.min(currentYear - 10, baseYear - 5);
  const endYear = Math.max(currentYear + 1, baseYear + 5);

  return Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => `${startYear + index}`,
  );
}

function getMonthOptions() {
  return Array.from({ length: 12 }, (_, index) =>
    `${index + 1}`.padStart(2, "0"),
  );
}

function getDayOptions(year: string, month: string) {
  return Array.from({ length: getDayCount(year, month) }, (_, index) =>
    `${index + 1}`.padStart(2, "0"),
  );
}

function getHourMinuteParts(time: string) {
  const [hour = "00", minute = "00"] = time.split(":");

  return {
    hour,
    minute,
  };
}

function getLocationErrorMessage(error: GeolocationPositionError | Error) {
  if ("code" in error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "未获得定位权限，请检查设备设置。";
      case error.POSITION_UNAVAILABLE:
        return "当前无法获取定位信息。";
      case error.TIMEOUT:
        return "定位超时，请稍后重试。";
      default:
        return "定位失败，请稍后重试。";
    }
  }

  return error.message || "定位失败，请稍后重试。";
}

function scrollSelectedIntoView(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
) {
  window.requestAnimationFrame(() => {
    containerRef.current
      ?.querySelector<HTMLElement>(selector)
      ?.scrollIntoView({ block: "center" });
  });
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7.5 10 12.5 15 7.5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2.25" />
    </svg>
  );
}

export function RecordEditorDialog({
  open,
  mode,
  record,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: RecordEditorDialogProps) {
  const [draft, setDraft] = useState<RecordEditorState>(() =>
    createInitialState(record),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<NotebookFieldErrors>({});
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapPickerInstanceKey, setMapPickerInstanceKey] = useState(0);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(null);

  const dateTriggerRef = useRef<HTMLButtonElement | null>(null);
  const timeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const datePanelRef = useRef<HTMLDivElement | null>(null);
  const timePanelRef = useRef<HTMLDivElement | null>(null);
  const yearListRef = useRef<HTMLDivElement | null>(null);
  const monthListRef = useRef<HTMLDivElement | null>(null);
  const dayListRef = useRef<HTMLDivElement | null>(null);
  const hourListRef = useRef<HTMLDivElement | null>(null);
  const minuteListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraft(createInitialState(record));
    setIsDirty(false);
    setSubmitError(null);
    setFieldErrors({});
    setIsDiscardDialogOpen(false);
    setActivePicker(null);
    setIsMapPickerOpen(false);
    setMapPickerInstanceKey(0);
    setIsResolvingLocation(false);
    setLocationStatus(null);
  }, [open, record]);

  useEffect(() => {
    if (!activePicker) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const panelRef = activePicker === "date" ? datePanelRef : timePanelRef;
      const triggerRef =
        activePicker === "date" ? dateTriggerRef : timeTriggerRef;

      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      setActivePicker(null);
    }

    window.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [activePicker]);

  useEffect(() => {
    if (activePicker === "date") {
      const { year, month, day } = getObservationDateParts(draft.observationDate);
      scrollSelectedIntoView(yearListRef, `[data-year-value="${year}"]`);
      scrollSelectedIntoView(monthListRef, `[data-month-value="${month}"]`);
      scrollSelectedIntoView(dayListRef, `[data-day-value="${day}"]`);
      return;
    }

    if (activePicker === "time") {
      const { hour, minute } = getHourMinuteParts(draft.observationTime);
      scrollSelectedIntoView(hourListRef, `[data-hour-value="${hour}"]`);
      scrollSelectedIntoView(minuteListRef, `[data-minute-value="${minute}"]`);
    }
  }, [activePicker, draft.observationDate, draft.observationTime]);

  const noteCharacterCount = useMemo(
    () => countNoteCharacters(draft.note),
    [draft.note],
  );
  const selectedDateParts = useMemo(
    () => getObservationDateParts(draft.observationDate),
    [draft.observationDate],
  );
  const yearOptions = useMemo(
    () => getYearOptions(selectedDateParts.year),
    [selectedDateParts.year],
  );
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const dayOptions = useMemo(
    () => getDayOptions(selectedDateParts.year, selectedDateParts.month),
    [selectedDateParts.month, selectedDateParts.year],
  );
  const hourOptions = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => `${index}`.padStart(2, "0")),
    [],
  );
  const minuteOptions = useMemo(
    () =>
      Array.from({ length: 60 }, (_, index) => `${index}`.padStart(2, "0")),
    [],
  );
  const { hour: selectedHour, minute: selectedMinute } = getHourMinuteParts(
    draft.observationTime,
  );

  function clearNamedFieldErrors(...keys: Array<keyof NotebookFieldErrors>) {
    setFieldErrors((current) => {
      if (keys.every((key) => !current[key])) {
        return current;
      }

      const next = { ...current };
      for (const key of keys) {
        delete next[key];
      }
      return next;
    });
  }

  function updateDraft<Key extends keyof RecordEditorState>(
    key: Key,
    value: RecordEditorState[Key],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
    setIsDirty(true);
    setSubmitError(null);
    setLocationStatus(null);
    clearNamedFieldErrors(key as keyof NotebookFieldErrors);
  }

  function updateBirdPointManually(value: string) {
    setDraft((current) => ({
      ...current,
      birdPoint: value,
      locationSource: "manual",
      coordinates: null,
    }));
    setIsDirty(true);
    setSubmitError(null);
    setLocationStatus(null);
    clearNamedFieldErrors("birdPoint", "coordinates");
  }

  function updateObservationDatePart(
    part: keyof ObservationDateParts,
    value: string,
  ) {
    const nextParts = {
      ...getObservationDateParts(draft.observationDate),
      [part]: value,
    };
    const maxDay = getDayCount(nextParts.year, nextParts.month);
    const numericDay = Number(nextParts.day);
    const normalizedDay =
      Number.isInteger(numericDay) && numericDay > 0
        ? Math.min(numericDay, maxDay)
        : 1;

    updateDraft(
      "observationDate",
      `${nextParts.year}-${nextParts.month}-${`${normalizedDay}`.padStart(2, "0")}`,
    );
  }

  function updateObservationTime(nextHour: string, nextMinute: string) {
    updateDraft("observationTime", `${nextHour}:${nextMinute}`);
  }

  function handleAttemptClose() {
    if (isSubmitting || isResolvingLocation) {
      return;
    }

    if (activePicker) {
      setActivePicker(null);
      return;
    }

    if (isMapPickerOpen) {
      setIsMapPickerOpen(false);
      return;
    }

    if (isDirty) {
      setIsDiscardDialogOpen(true);
      return;
    }

    onOpenChange(false);
  }

  async function resolveCoordinates(
    coordinates: NotebookCoordinates,
    source: "device",
  ) {
    setIsResolvingLocation(true);
    setLocationStatus(null);
    setSubmitError(null);

    try {
      const query = new URLSearchParams({
        longitude: `${coordinates.longitude}`,
        latitude: `${coordinates.latitude}`,
        source,
      });
      const response = await fetch(
        `/api/records/location/resolve?${query.toString()}`,
        {
          cache: "no-store",
        },
      );
      const payload = (await response.json()) as LocationResolveResponse;

      if (
        response.ok &&
        payload.requestStatus === "success" &&
        payload.location
      ) {
        const resolvedLocation = payload.location;

        setDraft((current) => ({
          ...current,
          birdPoint: resolvedLocation.label,
          locationSource: source,
          coordinates,
        }));
        setIsDirty(true);
        clearNamedFieldErrors("birdPoint", "coordinates");
        setLocationStatus(
          resolvedLocation.usedFallbackLabel
            ? {
                tone: "info",
                message: "暂未获取到详细地址，已使用经纬度填充鸟点。",
              }
            : null,
        );
        return;
      }

      setLocationStatus({
        tone: "error",
        message: payload.message,
      });
    } catch {
      setLocationStatus({
        tone: "error",
        message: "位置解析失败，请稍后重试。",
      });
    } finally {
      setIsResolvingLocation(false);
    }
  }

  async function handleUseCurrentLocation() {
    if (isSubmitting || isResolvingLocation) {
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus({
        tone: "error",
        message: "当前设备不支持定位。",
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 0,
        });
      });

      await resolveCoordinates(
        {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        },
        "device",
      );
    } catch (error) {
      setLocationStatus({
        tone: "error",
        message: getLocationErrorMessage(error as GeolocationPositionError | Error),
      });
    }
  }

  function handleMapLocationConfirm(result: RecordMapPickerResult) {
    setDraft((current) => ({
      ...current,
      birdPoint: result.label,
      locationSource: "map",
      coordinates: result.coordinates,
    }));
    setIsDirty(true);
    setSubmitError(null);
    clearNamedFieldErrors("birdPoint", "coordinates");
    setLocationStatus(
      result.usedFallbackLabel
        ? {
            tone: "info",
            message: "暂未获取到详细地址，已使用经纬度填充鸟点。",
          }
        : null,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await onSubmit({
      observationDate: draft.observationDate,
      observationTime: draft.observationTime,
      birdPoint: draft.birdPoint,
      speciesName: draft.speciesName,
      note: draft.note,
      locationSource: draft.locationSource,
      coordinates: draft.coordinates,
    });

    if (result.ok) {
      setIsDirty(false);
      setSubmitError(null);
      setFieldErrors({});
      setLocationStatus(null);
      setActivePicker(null);
      setIsMapPickerOpen(false);
      return;
    }

    setSubmitError(result.message);
    setFieldErrors(result.fieldErrors ?? {});
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleAttemptClose();
          }
        }}
      >
        <DialogContent
          className="max-w-[22rem] gap-0 overflow-hidden p-0"
          onEscapeKeyDown={(event) => {
            if (isMapPickerOpen || activePicker) {
              event.preventDefault();
              setIsMapPickerOpen(false);
              setActivePicker(null);
              return;
            }

            if (isSubmitting || isResolvingLocation) {
              event.preventDefault();
              return;
            }

            if (isDirty) {
              event.preventDefault();
              setIsDiscardDialogOpen(true);
            }
          }}
          onInteractOutside={(event) => {
            if (isMapPickerOpen || activePicker) {
              event.preventDefault();
              setActivePicker(null);
              return;
            }

            if (isSubmitting || isResolvingLocation) {
              event.preventDefault();
              return;
            }

            if (isDirty) {
              event.preventDefault();
              setIsDiscardDialogOpen(true);
            }
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="space-y-5 p-5">
              <DialogHeader className="space-y-2">
                <DialogTitle>{mode === "edit" ? "编辑记录" : "新增记录"}</DialogTitle>
                <DialogDescription>
                  {mode === "edit"
                    ? "修改时间、鸟名、鸟点和备注后，可直接保存当前记录。"
                    : "已自动填入当前北京时间，请补充鸟名、鸟点和备注。"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative space-y-2">
                  <label className="text-sm font-medium text-[var(--text-primary)]">
                    日期
                  </label>
                  <button
                    ref={dateTriggerRef}
                    type="button"
                    onClick={() =>
                      setActivePicker((current) =>
                        current === "date" ? null : "date",
                      )
                    }
                    className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
                  >
                    <span>{draft.observationDate}</span>
                    <ChevronIcon open={activePicker === "date"} />
                  </button>
                  {fieldErrors.observationDate ? (
                    <p className="text-xs leading-5 text-rose-700">
                      {fieldErrors.observationDate}
                    </p>
                  ) : null}

                  {activePicker === "date" ? (
                    <div
                      ref={datePanelRef}
                      className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[18rem] max-w-[calc(100vw-4rem)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 shadow-[0_18px_40px_-24px_rgba(31,42,31,0.55)]"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-[var(--text-secondary)]">
                            年
                          </p>
                          <div
                            ref={yearListRef}
                            className="max-h-52 space-y-1 overflow-y-auto overscroll-contain snap-y snap-mandatory scroll-smooth pr-1"
                          >
                            {yearOptions.map((yearValue) => (
                              <button
                                key={yearValue}
                                type="button"
                                data-year-value={yearValue}
                                onClick={() =>
                                  updateObservationDatePart("year", yearValue)
                                }
                                className={cn(
                                  "flex h-10 w-full snap-center items-center justify-center rounded-xl text-sm transition-colors",
                                  selectedDateParts.year === yearValue
                                    ? "bg-emerald-600 text-white"
                                    : "text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
                                )}
                              >
                                {yearValue}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-[var(--text-secondary)]">
                            月
                          </p>
                          <div
                            ref={monthListRef}
                            className="max-h-52 space-y-1 overflow-y-auto overscroll-contain snap-y snap-mandatory scroll-smooth pr-1"
                          >
                            {monthOptions.map((monthValue) => (
                              <button
                                key={monthValue}
                                type="button"
                                data-month-value={monthValue}
                                onClick={() =>
                                  updateObservationDatePart("month", monthValue)
                                }
                                className={cn(
                                  "flex h-10 w-full snap-center items-center justify-center rounded-xl text-sm transition-colors",
                                  selectedDateParts.month === monthValue
                                    ? "bg-emerald-600 text-white"
                                    : "text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
                                )}
                              >
                                {monthValue}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-[var(--text-secondary)]">
                            日
                          </p>
                          <div
                            ref={dayListRef}
                            className="max-h-52 space-y-1 overflow-y-auto overscroll-contain snap-y snap-mandatory scroll-smooth pr-1"
                          >
                            {dayOptions.map((dayValue) => (
                              <button
                                key={dayValue}
                                type="button"
                                data-day-value={dayValue}
                                onClick={() =>
                                  updateObservationDatePart("day", dayValue)
                                }
                                className={cn(
                                  "flex h-10 w-full snap-center items-center justify-center rounded-xl text-sm transition-colors",
                                  selectedDateParts.day === dayValue
                                    ? "bg-emerald-600 text-white"
                                    : "text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
                                )}
                              >
                                {dayValue}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="relative space-y-2">
                  <label className="text-sm font-medium text-[var(--text-primary)]">
                    时间
                  </label>
                  <button
                    ref={timeTriggerRef}
                    type="button"
                    onClick={() =>
                      setActivePicker((current) =>
                        current === "time" ? null : "time",
                      )
                    }
                    className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
                  >
                    <span>{draft.observationTime}</span>
                    <ChevronIcon open={activePicker === "time"} />
                  </button>
                  {fieldErrors.observationTime ? (
                    <p className="text-xs leading-5 text-rose-700">
                      {fieldErrors.observationTime}
                    </p>
                  ) : null}

                  {activePicker === "time" ? (
                    <div
                      ref={timePanelRef}
                      className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[16.5rem] max-w-[calc(100vw-4rem)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 shadow-[0_18px_40px_-24px_rgba(31,42,31,0.55)]"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-[var(--text-secondary)]">
                            小时
                          </p>
                          <div
                            ref={hourListRef}
                            className="max-h-44 space-y-1 overflow-y-auto overscroll-contain snap-y snap-mandatory scroll-smooth pr-1"
                          >
                            {hourOptions.map((hourValue) => (
                              <button
                                key={hourValue}
                                type="button"
                                data-hour-value={hourValue}
                                onClick={() =>
                                  updateObservationTime(hourValue, selectedMinute)
                                }
                                className={cn(
                                  "flex h-10 w-full snap-center items-center justify-center rounded-xl text-sm transition-colors",
                                  selectedHour === hourValue
                                    ? "bg-emerald-600 text-white"
                                    : "text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
                                )}
                              >
                                {hourValue}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-[var(--text-secondary)]">
                            分钟
                          </p>
                          <div
                            ref={minuteListRef}
                            className="max-h-44 space-y-1 overflow-y-auto overscroll-contain snap-y snap-mandatory scroll-smooth pr-1"
                          >
                            {minuteOptions.map((minuteValue) => (
                              <button
                                key={minuteValue}
                                type="button"
                                data-minute-value={minuteValue}
                                onClick={() =>
                                  updateObservationTime(selectedHour, minuteValue)
                                }
                                className={cn(
                                  "flex h-10 w-full snap-center items-center justify-center rounded-xl text-sm transition-colors",
                                  selectedMinute === minuteValue
                                    ? "bg-emerald-600 text-white"
                                    : "text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
                                )}
                              >
                                {minuteValue}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="record-species-name"
                  className="text-sm font-medium text-[var(--text-primary)]"
                >
                  鸟名
                </label>
                <Input
                  id="record-species-name"
                  value={draft.speciesName}
                  onChange={(event) => updateDraft("speciesName", event.target.value)}
                  placeholder="请输入鸟名"
                  disabled={isSubmitting || isResolvingLocation}
                />
                {fieldErrors.speciesName ? (
                  <p className="text-xs leading-5 text-rose-700">
                    {fieldErrors.speciesName}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="record-bird-point"
                    className="text-sm font-medium text-[var(--text-primary)]"
                  >
                    鸟点
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void handleUseCurrentLocation();
                      }}
                      disabled={isSubmitting || isResolvingLocation}
                      className="h-8 gap-1 px-2"
                    >
                      <LocationIcon />
                      定位
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActivePicker(null);
                        setMapPickerInstanceKey((current) => current + 1);
                        setIsMapPickerOpen(true);
                      }}
                      disabled={isSubmitting || isResolvingLocation}
                      className="h-8 px-2"
                    >
                      地图
                    </Button>
                  </div>
                </div>
                <Input
                  id="record-bird-point"
                  value={draft.birdPoint}
                  onChange={(event) => updateBirdPointManually(event.target.value)}
                  placeholder="请输入观测地点"
                  disabled={isSubmitting || isResolvingLocation}
                />
                {fieldErrors.birdPoint ? (
                  <p className="text-xs leading-5 text-rose-700">
                    {fieldErrors.birdPoint}
                  </p>
                ) : null}
                {fieldErrors.coordinates ? (
                  <p className="text-xs leading-5 text-rose-700">
                    {fieldErrors.coordinates}
                  </p>
                ) : null}
                {locationStatus ? (
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm leading-6",
                      locationStatus.tone === "error"
                        ? "border border-rose-200 bg-rose-50 text-rose-900"
                        : "border border-amber-200 bg-amber-50 text-amber-900",
                    )}
                  >
                    {locationStatus.message}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="record-note"
                    className="text-sm font-medium text-[var(--text-primary)]"
                  >
                    备注
                  </label>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {noteCharacterCount}/{NOTEBOOK_MAX_NOTE_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="record-note"
                  value={draft.note}
                  onChange={(event) =>
                    updateDraft(
                      "note",
                      clipNoteCharacters(event.target.value),
                    )
                  }
                  placeholder="可填写本次观测的补充说明"
                  disabled={isSubmitting || isResolvingLocation}
                  maxLength={NOTEBOOK_MAX_NOTE_LENGTH}
                />
                {fieldErrors.note ? (
                  <p className="text-xs leading-5 text-rose-700">
                    {fieldErrors.note}
                  </p>
                ) : null}
              </div>

              {submitError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-900">
                  {submitError}
                </div>
              ) : null}
            </div>

            <DialogFooter className="gap-2 border-t border-[var(--border-subtle)] px-5 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleAttemptClose}
                disabled={isSubmitting || isResolvingLocation}
                className="w-full sm:w-full"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isResolvingLocation}
                className="w-full sm:w-full"
              >
                {isSubmitting
                  ? mode === "edit"
                    ? "保存中..."
                    : "添加中..."
                  : mode === "edit"
                    ? "保存"
                    : "添加"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <DialogContent className="max-w-[20rem]">
          <DialogHeader>
            <DialogTitle>是否放弃编辑？</DialogTitle>
            <DialogDescription>
              当前填写内容尚未保存，确认后将直接关闭编辑区。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDiscardDialogOpen(false)}
              className="w-full sm:w-full"
            >
              否
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsDiscardDialogOpen(false);
                setIsDirty(false);
                onOpenChange(false);
              }}
              className="w-full sm:w-full"
            >
              是
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RecordMapPickerDialog
        key={mapPickerInstanceKey}
        open={isMapPickerOpen}
        initialCoordinates={draft.coordinates}
        onOpenChange={setIsMapPickerOpen}
        onConfirm={handleMapLocationConfirm}
      />
    </>
  );
}
