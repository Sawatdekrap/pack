import { PackedItemsItf } from "../../interfaces";

export const quantity = (pi: PackedItemsItf): number =>
  pi.itemGroups.reduce((t, ig) => t + ig.quantity, 0);
