import { DimensionsItf, Orientation, ORIENTATIONS } from "../../interfaces";

export const volume = (dimensions: DimensionsItf): number =>
  dimensions.length * dimensions.width * dimensions.depth;

export const rotate = (
  dims: DimensionsItf,
  orientation: Orientation
): DimensionsItf => {
  switch (orientation) {
    case Orientation.FRONT:
      return {
        length: dims.length,
        width: dims.width,
        depth: dims.depth,
      };
    case Orientation.FRONT_90:
      return {
        length: dims.depth,
        width: dims.width,
        depth: dims.length,
      };
    case Orientation.SIDE:
      return {
        length: dims.width,
        width: dims.length,
        depth: dims.depth,
      };
    case Orientation.SIDE_90:
      return {
        length: dims.depth,
        width: dims.length,
        depth: dims.width,
      };
    case Orientation.TOP:
      return {
        length: dims.length,
        width: dims.depth,
        depth: dims.width,
      };
    case Orientation.TOP_90:
      return {
        length: dims.width,
        width: dims.depth,
        depth: dims.length,
      };
  }
};

export const orientationToBeSame = (
  dimensionsA: DimensionsItf,
  dimensionsB: DimensionsItf
): Orientation | null => {
  if (volume(dimensionsA) !== volume(dimensionsB)) return null;

  return (
    ORIENTATIONS.find((o) => rotate(dimensionsA, o) === dimensionsB) || null
  );
};

export const fitsStrictly = (
  dimensionsA: DimensionsItf,
  dimensionsB: DimensionsItf
) =>
  dimensionsA.length >= dimensionsB.length &&
  dimensionsA.width >= dimensionsB.width &&
  dimensionsA.depth >= dimensionsB.depth;

export const fitOrientations = (
  dimensionsA: DimensionsItf,
  dimensionsB: DimensionsItf
): Orientation[] => {
  if (volume(dimensionsA) < volume(dimensionsB)) return [];

  return ORIENTATIONS.filter((o) =>
    fitsStrictly(dimensionsA, rotate(dimensionsB, o))
  );
};
