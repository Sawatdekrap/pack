import { DimensionsItf, PackedItemsItf } from "../../interfaces";

export const quantity = (pi: PackedItemsItf): number =>
  pi.itemGroups.reduce((t, ig) => t + ig.quantity, 0);

export const getBoundingDims = (
  allPackeditems: PackedItemsItf[]
): DimensionsItf => {
  const boundingDims: DimensionsItf = {
    length: 0,
    width: 0,
    depth: 0,
  };
  allPackeditems.forEach((pi) => {
    boundingDims.length = Math.max(
      boundingDims.length,
      pi.offset.x + pi.dimensions.length
    );
    boundingDims.width = Math.max(
      boundingDims.width,
      pi.offset.y + pi.dimensions.width
    );
    boundingDims.depth = Math.max(
      boundingDims.depth,
      pi.offset.z + pi.dimensions.depth
    );
  });
  return boundingDims;
};
