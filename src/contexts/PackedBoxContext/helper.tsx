import { DimensionsItf, PackedBoxItf, PackedStats } from "../../interfaces";

const getMostitemsPerBox = (packedBoxes: PackedBoxItf[]): number => {
  return packedBoxes.reduce((most, pb) => {
    return Math.max(
      most,
      pb.packedItems.reduce(
        (pbt, pi) => pbt + pi.itemGroups.reduce((t, ig) => t + ig.quantity, 0),
        0
      )
    );
  }, 0);
};

const volume = (dims: DimensionsItf) => dims.length * dims.width * dims.depth;

const getSpaceEfficiency = (packedBoxes: PackedBoxItf[]): number => {
  const totalBoxVolume = packedBoxes.reduce(
    (t, pb) => t + volume(pb.box.dimensions),
    0
  );
  const totalItemVolume = packedBoxes.reduce(
    (t, pb) =>
      t +
      pb.packedItems.reduce(
        (pit, pi) =>
          pit +
          pi.itemGroups.reduce(
            (igt, ig) => igt + volume(ig.item.dimensions) * ig.quantity,
            0
          ),
        0
      ),
    0
  );
  return Math.ceil((100 * totalItemVolume) / totalBoxVolume);
};

export const getStats = (packedBoxes: PackedBoxItf[]): PackedStats => {
  return {
    totalBoxes: packedBoxes.length,
    mostItemsPerBox: getMostitemsPerBox(packedBoxes),
    spaceUsed: getSpaceEfficiency(packedBoxes),
  };
};
