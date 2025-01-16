export enum Orientation {
  FRONT,
  FRONT_90,
  SIDE,
  SIDE_90,
  TOP,
  TOP_90,
}

export const ORIENTATIONS = [
  Orientation.FRONT,
  Orientation.FRONT_90,
  Orientation.SIDE,
  Orientation.SIDE_90,
  Orientation.TOP,
  Orientation.TOP_90,
];

export interface PointItf {
  x: number;
  y: number;
  z: number;
}

export interface DimensionsItf {
  length: number;
  width: number;
  depth: number;
}

export interface PatternItf {
  long: number;
  wide: number;
  deep: number;
}

export interface BoxItf {
  name: string;
  dimensions: DimensionsItf;
  enabled: boolean;
}

export interface ItemItf {
  name: string;
  dimensions: DimensionsItf;
}

export interface ItemGroupItf {
  item: ItemItf;
  quantity: number;
}

export interface CongruencyGroupItf {
  dimensions: DimensionsItf;
  itemGroups: ItemGroupItf[];
}

export interface SpaceItf {
  boxIdx: number;
  dimensions: DimensionsItf;
  offset: PointItf;
}

export interface PackedItemsItf {
  boxIdx: number;
  itemGroups: ItemGroupItf[];
  offset: PointItf;
  dimensions: DimensionsItf;
  pattern: PatternItf;
}

export interface PackedBoxItf {
  box: BoxItf;
  packedItems: PackedItemsItf[];
}

export interface PackedStats {
  totalBoxes: number;
  mostItemsPerBox: number;
  spaceUsed: number;
}
