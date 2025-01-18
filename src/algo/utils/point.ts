import { Orientation, PointItf } from "../../interfaces";

export const rotate = (point: PointItf, orientation: Orientation): PointItf => {
  switch (orientation) {
    case Orientation.FRONT:
      return {
        x: point.x,
        y: point.y,
        z: point.z,
      };
    case Orientation.FRONT_90:
      return {
        x: point.z,
        y: point.y,
        z: point.x,
      };
    case Orientation.SIDE:
      return {
        x: point.y,
        y: point.x,
        z: point.z,
      };
    case Orientation.SIDE_90:
      return {
        x: point.z,
        y: point.x,
        z: point.y,
      };
    case Orientation.TOP:
      return {
        x: point.x,
        y: point.z,
        z: point.y,
      };
    case Orientation.TOP_90:
      return {
        x: point.y,
        y: point.z,
        z: point.x,
      };
  }
};
