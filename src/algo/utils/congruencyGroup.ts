import { CongruencyGroupItf, ItemGroupItf } from "../../interfaces";
import { orientationToBeSame } from "./dimensions";

export const gatherCongruencyGroups = (
  itemGroups: ItemGroupItf[],
): CongruencyGroupItf[] => {
  const congruencyGroups: CongruencyGroupItf[] = [];
  itemGroups.forEach((ig) => {
    let foundCongruencyGroup = false;
    congruencyGroups.forEach((cg) => {
      const dimensions = cg.dimensions;
      if (orientationToBeSame(dimensions, ig.item.dimensions) !== null) {
        cg.itemGroups.push(ig);
        foundCongruencyGroup = true;
      }
    });
    if (!foundCongruencyGroup) {
      congruencyGroups.push({
        dimensions: ig.item.dimensions,
        itemGroups: [ig],
      });
    }
  });

  return congruencyGroups;
};

export const quantity = (cg: CongruencyGroupItf): number =>
  cg.itemGroups.reduce((t, ig) => t + ig.quantity, 0);
