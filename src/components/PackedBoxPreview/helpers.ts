import { Orientation } from "../../interfaces";

export const rotatedDimensions = (
  dimensions: [number, number, number],
  orientation: Orientation
): [number, number, number] => {
  switch (orientation) {
    case Orientation.FRONT:
      return [dimensions[0], dimensions[1], dimensions[2]];
    case Orientation.FRONT_90:
      return [dimensions[2], dimensions[1], dimensions[0]];
    case Orientation.SIDE:
      return [dimensions[1], dimensions[0], dimensions[2]];
    case Orientation.SIDE_90:
      return [dimensions[2], dimensions[0], dimensions[1]];
    case Orientation.TOP:
      return [dimensions[0], dimensions[2], dimensions[1]];
    case Orientation.TOP_90:
      return [dimensions[1], dimensions[2], dimensions[0]];
    default:
      throw Error("Invalid orientation");
  }
};

export const offsetDimensionsInBox = (
  position: [number, number, number],
  dimensions: [number, number, number],
  boxDimensions: [number, number, number]
): [number, number, number] => {
  return [
    position[0] + dimensions[0] / 2 - boxDimensions[0] / 2,
    position[1] + dimensions[1] / 2 - boxDimensions[1] / 2,
    position[2] + dimensions[2] / 2 - boxDimensions[2] / 2,
  ];
};

export const colorFromString = (str: string): string => {
  const hue = str.split("").reduce((acc, char) => {
    return Math.floor(acc * char.charCodeAt(0)) % 360;
  }, 1);
  return `hsl(${hue}, 100%, 80%)`;
};
