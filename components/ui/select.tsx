"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  onValueChange?: (value: string) => void;
};

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      options,
      value,
      placeholder = "请选择一项",
      name,
      disabled = false,
      onValueChange,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const contentId = React.useId();

    const selectedOption = React.useMemo(
      () => options.find((option) => option.value === value) ?? null,
      [options, value],
    );

    React.useEffect(() => {
      if (!open) {
        return;
      }

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target;
        if (!(target instanceof Node)) {
          return;
        }

        if (!rootRef.current?.contains(target)) {
          setOpen(false);
        }
      };

      window.addEventListener("pointerdown", handlePointerDown);
      return () => {
        window.removeEventListener("pointerdown", handlePointerDown);
      };
    }, [open]);

    const handleToggle = React.useCallback(() => {
      if (disabled) {
        return;
      }

      setOpen((current) => !current);
    }, [disabled]);

    const handleSelect = React.useCallback(
      (nextValue: string) => {
        onValueChange?.(nextValue);
        setOpen(false);
      },
      [onValueChange],
    );

    const handleTriggerKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) {
          return;
        }

        if (
          event.key === "ArrowDown" ||
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          setOpen(true);
        }

        if (event.key === "Escape") {
          setOpen(false);
        }
      },
      [disabled],
    );

    return (
      <div ref={rootRef} className={cn("relative w-full", className)}>
        {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
        <button
          ref={ref}
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={contentId}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-primary)] shadow-sm transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
            open && "border-[var(--accent)]",
          )}
        >
          <span className="truncate">
            {selectedOption?.label ?? placeholder}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "text-xs text-[var(--text-secondary)] transition-transform",
              open && "rotate-180",
            )}
          >
            v
          </span>
        </button>

        {open ? (
          <div
            id={contentId}
            role="listbox"
            tabIndex={-1}
            className="absolute right-0 top-[calc(100%+0.375rem)] z-30 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-1 shadow-[0_16px_36px_-20px_rgba(31,42,31,0.45)]"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center rounded-sm px-2 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                    isSelected
                      ? "bg-[var(--surface-muted)] text-[var(--accent-strong)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
