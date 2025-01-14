import { PackedItemsItf, PackedBoxItf, SpaceItf } from "../interfaces";
import {
  BoxItf,
  CongruencyGroupItf,
  DimensionsItf,
  ItemGroupItf,
} from "../interfaces";
import * as _cg from "./utils/congruencyGroup";
import * as _d from "./utils/dimensions";
import * as _s from "./utils/space";
import * as _pi from "./utils/packedItems";

const compDimsKey = (dimensions: DimensionsItf): number =>
  dimensions.length ** 2 + dimensions.width ** 2 + dimensions.depth ** 2;

const compDims = (dimsA: DimensionsItf, dimsB: DimensionsItf): number => {
  return compDimsKey(dimsA) - compDimsKey(dimsB);
};

export const pack = (
  boxes: BoxItf[],
  itemGroups: ItemGroupItf[],
  emptySpaceRatio: number
) => {
  const sortedCongruencyGroups = _cg
    .gatherCongruencyGroups(itemGroups)
    .sort((a, b) => -compDims(a.dimensions, b.dimensions));

  const sortedBoxes = [...boxes].sort(
    (a, b) => _d.volume(a.dimensions) - _d.volume(b.dimensions)
  );

  const usableSpaces: SpaceItf[] = [];

  const smallestItemVolume = _d.volume(
    sortedCongruencyGroups[sortedCongruencyGroups.length - 1].dimensions
  );

  const allPackedItems: PackedItemsItf[] = [];
  const usedBoxes: BoxItf[] = [];

  sortedCongruencyGroups.forEach((cg, cgIdx) => {
    while (_cg.quantity(cg) > 0) {
      let spaceToUse: SpaceItf | null = null;

      // Select space from used boxes
      const spaceToUseIdx = usableSpaces.findIndex(
        (us) => _d.fitOrientations(us.dimensions, cg.dimensions).length > 0
      );
      if (spaceToUseIdx !== -1) {
        spaceToUse = usableSpaces.splice(spaceToUseIdx, 1)[0];
      }

      // Select space from an unused box
      let boxToUse: BoxItf;
      if (spaceToUse === null) {
        boxToUse = nextBoxToUse(
          sortedBoxes,
          cg,
          sortedCongruencyGroups.slice(cgIdx, cgIdx + 1),
          emptySpaceRatio
        );
        usedBoxes.push(boxToUse);
        spaceToUse = _s.spaceFromBox(boxToUse, usedBoxes.length - 1);
      }

      const potentialPackedItems = getPotentialPackedItems(cg, spaceToUse);
      const [packedItems, newSpaces] = selectPackedItemsAndNegativeSpace(
        potentialPackedItems,
        spaceToUse
      );

      allPackedItems.push(packedItems);
      updateCongruencyGroup(cg, packedItems);

      newSpaces
        .filter((s) => _d.volume(s.dimensions) >= smallestItemVolume)
        .forEach((s) => usableSpaces.push(s));
      usableSpaces.sort(
        (a, b) => _d.volume(a.dimensions) - _d.volume(b.dimensions)
      );
    }
  });

  const packedBoxes: PackedBoxItf[] = usedBoxes.map((b) => ({
    box: b,
    packedItems: [],
  }));
  allPackedItems.forEach((pi) => packedBoxes[pi.boxIdx].packedItems.push(pi));
  packedBoxes.forEach((pb) =>
    pb.packedItems.sort((pba, pbb) => {
      if (pba.offset.z !== pbb.offset.z) {
        return pba.offset.z - pbb.offset.z;
      } else if (pba.offset.y !== pbb.offset.y) {
        return pba.offset.y - pbb.offset.y;
      } else {
        return pba.offset.x - pbb.offset.x;
      }
    })
  );

  return packedBoxes;
};

const nextBoxToUse = (
  sortedBoxes: BoxItf[],
  congruencyGroup: CongruencyGroupItf,
  remainingCongruencyGroups: CongruencyGroupItf[],
  emptySpaceRatio: number
): BoxItf => {
  const remainingVolume =
    emptySpaceRatio *
      remainingCongruencyGroups.reduce(
        (t, cg) => (t += _d.volume(cg.dimensions) * _cg.quantity(cg)),
        0
      ) +
    _d.volume(congruencyGroup.dimensions) * _cg.quantity(congruencyGroup);

  // NOTE the || in the return clause is a bit problematic if it's a really big box
  // Probably want to update this to use emptySpaceRatio as a max instead of a min
  // and not use boxes that are too large (?)
  return (
    sortedBoxes.find(
      (b) =>
        _d.volume(b.dimensions) >= remainingVolume &&
        _d.fitOrientations(b.dimensions, congruencyGroup.dimensions)
    ) || sortedBoxes[sortedBoxes.length - 1]
  );
};

const getPotentialPackedItems = (
  congruencyGroup: CongruencyGroupItf,
  space: SpaceItf
): PackedItemsItf[] => {
  const potentialPackedItems: PackedItemsItf[] = [];
  for (const o of _d.fitOrientations(
    space.dimensions,
    congruencyGroup.dimensions
  )) {
    const rotatedDims = _d.rotate(congruencyGroup.dimensions, o);
    // TODO can do packable dimensions in all orderings of axes to get better packing
    // TODO can also simplify when qty is 1
    // TODO how should this be packed?
    // TODO should this instead first pack in the most-available dimensions? Comes with some assumptions
    const packableLengths = Math.min(
      Math.floor(space.dimensions.length / rotatedDims.length),
      _cg.quantity(congruencyGroup)
    );
    const packableWidths = Math.min(
      Math.floor(space.dimensions.width / rotatedDims.width),
      Math.floor(_cg.quantity(congruencyGroup) / packableLengths)
    );
    const packableDepths = Math.min(
      Math.floor(space.dimensions.depth / rotatedDims.depth),
      Math.floor(
        _cg.quantity(congruencyGroup) / (packableLengths * packableWidths)
      )
    );
    const packableQuantity = packableLengths * packableWidths * packableDepths;

    const packedItems: PackedItemsItf = {
      boxIdx: space.boxIdx,
      itemGroups: [],
      offset: space.offset,
      dimensions: {
        length: rotatedDims.length * packableLengths,
        width: rotatedDims.width * packableWidths,
        depth: rotatedDims.depth * packableDepths,
      },
      pattern: {
        long: packableLengths,
        wide: packableWidths,
        deep: packableDepths,
      },
    };
    for (const ig of congruencyGroup.itemGroups) {
      if (ig.quantity + _pi.quantity(packedItems) >= packableQuantity) {
        const partialItemGroup: ItemGroupItf = {
          item: ig.item,
          quantity: packableQuantity - _pi.quantity(packedItems),
        };
        packedItems.itemGroups.push(partialItemGroup);
        break;
      }
      packedItems.itemGroups.push(ig);
    }

    potentialPackedItems.push(packedItems);
  }

  const maxQuantity = Math.max(
    ...potentialPackedItems.map((pi) => _pi.quantity(pi))
  );
  return potentialPackedItems.filter((pi) => _pi.quantity(pi) === maxQuantity);
};

const selectPackedItemsAndNegativeSpace = (
  potentialPackedItems: PackedItemsItf[],
  space: SpaceItf
): [PackedItemsItf, SpaceItf[]] => {
  let bestPackedItems: PackedItemsItf | null = null;
  let bestNegativeSpaceGroup: SpaceItf[] | null = null;
  let bestNegativeSpaceVolume: number = -1;
  for (const packedItems of potentialPackedItems) {
    const negativeSpaceGroups = _s.potentialNegativeSpacesFromPackedItems(
      packedItems,
      space
    );

    const largestGroup = negativeSpaceGroups.sort(
      (a, b) => -compDims(a[0].dimensions, b[0].dimensions)
    )[0];
    const largestGroupVolume = _d.volume(largestGroup[0].dimensions);
    if (largestGroupVolume > bestNegativeSpaceVolume) {
      bestPackedItems = packedItems;
      bestNegativeSpaceGroup = largestGroup;
      bestNegativeSpaceVolume = largestGroupVolume;
    }
  }

  return [
    bestPackedItems as PackedItemsItf,
    bestNegativeSpaceGroup as SpaceItf[],
  ];
};

const updateCongruencyGroup = (
  congruencyGroup: CongruencyGroupItf,
  packedItems: PackedItemsItf
) => {
  let packedQuantity = 0;
  const remainingItemGroups: ItemGroupItf[] = [];
  const packedItemsQty = _pi.quantity(packedItems);
  for (const itemGroup of congruencyGroup.itemGroups) {
    if (packedQuantity === packedItemsQty) {
      remainingItemGroups.push(itemGroup);
      break;
    } else if (packedQuantity + itemGroup.quantity > packedItemsQty) {
      const requiredQuantity = packedItemsQty - packedQuantity;
      const remainingQuantity = itemGroup.quantity - requiredQuantity;
      remainingItemGroups.push({
        item: itemGroup.item,
        quantity: remainingQuantity,
      });
      packedQuantity += requiredQuantity;
      break;
    } else {
      packedQuantity += itemGroup.quantity;
    }
  }

  congruencyGroup.itemGroups = remainingItemGroups;
};
