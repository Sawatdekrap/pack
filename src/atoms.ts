import { atom } from "jotai";
import { BoxItf, ItemGroupItf, PackedBoxItf } from "./interfaces";
import { INITIAL_BOXES, INITIAL_ITEM_GROUPS } from "./data";

export const boxesAtom = atom<BoxItf[]>(INITIAL_BOXES);

export const itemGroupsAtom = atom<ItemGroupItf[]>(INITIAL_ITEM_GROUPS);

export const packedBoxesAtom = atom<PackedBoxItf[]>([]);
