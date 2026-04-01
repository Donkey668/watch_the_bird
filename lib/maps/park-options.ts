export type ParkId =
  | "shenzhen-bay-park"
  | "shenzhen-east-lake-park"
  | "bijia-mountain-park"
  | "fairy-lake-botanical-garden";

export type ParkOption = {
  id: ParkId;
  name: string;
  city: string;
  location: [number, number];
  districtName: string;
  districtCode: string;
  isDefault?: boolean;
};

export const PARK_OPTIONS: ParkOption[] = [
  {
    id: "shenzhen-bay-park",
    name: "深圳湾公园",
    city: "深圳",
    location: [113.9654, 22.5238],
    districtName: "\u5357\u5c71\u533a",
    districtCode: "440305",
    isDefault: true,
  },
  {
    id: "shenzhen-east-lake-park",
    name: "深圳东湖公园",
    city: "深圳",
    location: [114.1476, 22.5639],
    districtName: "\u7f57\u6e56\u533a",
    districtCode: "440303",
  },
  {
    id: "bijia-mountain-park",
    name: "笔架山公园",
    city: "深圳",
    location: [114.0625, 22.5554],
    districtName: "\u798f\u7530\u533a",
    districtCode: "440304",
  },
  {
    id: "fairy-lake-botanical-garden",
    name: "仙湖植物园",
    city: "深圳",
    location: [114.1859, 22.5745],
    districtName: "\u7f57\u6e56\u533a",
    districtCode: "440303",
  },
];

export const DEFAULT_PARK =
  PARK_OPTIONS.find((park) => park.isDefault) ?? PARK_OPTIONS[0];

export function getParkById(id: string) {
  return PARK_OPTIONS.find((park) => park.id === id) ?? null;
}

export function isParkId(id: string): id is ParkId {
  return PARK_OPTIONS.some((park) => park.id === id);
}
