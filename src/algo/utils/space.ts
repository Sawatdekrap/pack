import { BoxItf, PackedItemsItf, SpaceItf } from "../../interfaces";

export const spaceFromBox = (box: BoxItf, boxIdx: number): SpaceItf => ({
  boxIdx,
  dimensions: box.dimensions,
  offset: {
    x: 0,
    y: 0,
    z: 0,
  },
});

// NOTE this can be expanded and/or simplified
export const potentialNegativeSpacesFromPackedItems = (
  packedItems: PackedItemsItf,
  space: SpaceItf
): SpaceItf[][] => [
  [
    {
      boxIdx: space.boxIdx,
      dimensions: {
        length: space.dimensions.length - packedItems.dimensions.length,
        width: space.dimensions.width,
        depth: space.dimensions.depth,
      },
      offset: {
        x: space.offset.x + packedItems.dimensions.length,
        y: space.offset.y,
        z: space.offset.z,
      },
    },
    {
      boxIdx: space.boxIdx,
      dimensions: {
        length: packedItems.dimensions.length,
        width: space.dimensions.width - packedItems.dimensions.width,
        depth: space.dimensions.depth,
      },
      offset: {
        x: space.offset.x,
        y: space.offset.y + packedItems.dimensions.width,
        z: space.offset.z,
      },
    },
    {
      boxIdx: space.boxIdx,
      dimensions: {
        length: packedItems.dimensions.length,
        width: packedItems.dimensions.width,
        depth: space.dimensions.depth - packedItems.dimensions.depth,
      },
      offset: {
        x: space.offset.x,
        y: space.offset.y,
        z: space.offset.z + packedItems.dimensions.depth,
      },
    },
  ],
  [
    {
      boxIdx: space.boxIdx,
      dimensions: {
        length: space.dimensions.length,
        width: space.dimensions.width - packedItems.dimensions.width,
        depth: space.dimensions.depth,
      },
      offset: {
        x: space.offset.x,
        y: space.offset.y + packedItems.dimensions.width,
        z: space.offset.z,
      },
    },
    {
      boxIdx: space.boxIdx,
      dimensions: {
        length: space.dimensions.length,
        width: packedItems.dimensions.width,
        depth: space.dimensions.depth - packedItems.dimensions.depth,
      },
      offset: {
        x: space.offset.x,
        y: space.offset.y,
        z: space.offset.z + packedItems.dimensions.depth,
      },
    },
    {
      boxIdx: space.boxIdx,
      dimensions: {
        length: space.dimensions.length - packedItems.dimensions.length,
        width: packedItems.dimensions.width,
        depth: packedItems.dimensions.depth,
      },
      offset: {
        x: space.offset.x + packedItems.dimensions.length,
        y: space.offset.y,
        z: space.offset.z,
      },
    },
  ],
  [
    {
      boxIdx: space.boxIdx,
      dimensions: {
        length: space.dimensions.length,
        width: space.dimensions.width,
        depth: space.dimensions.depth - packedItems.dimensions.depth,
      },
      offset: {
        x: space.offset.x,
        y: space.offset.y,
        z: space.offset.z + packedItems.dimensions.depth,
      },
    },
    {
      boxIdx: space.boxIdx,
      dimensions: {
        length: space.dimensions.length - packedItems.dimensions.length,
        width: space.dimensions.width,
        depth: packedItems.dimensions.depth,
      },
      offset: {
        x: space.offset.x + packedItems.dimensions.length,
        y: space.offset.y,
        z: space.offset.z,
      },
    },
    {
      boxIdx: space.boxIdx,
      dimensions: {
        length: packedItems.dimensions.length,
        width: space.dimensions.width - packedItems.dimensions.width,
        depth: packedItems.dimensions.depth,
      },
      offset: {
        x: space.offset.x,
        y: space.offset.y + packedItems.dimensions.width,
        z: space.offset.z,
      },
    },
  ],
];
