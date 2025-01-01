import { BoxItf, ItemGroupItf } from "./interfaces";

export const EMPTY_BOX: BoxItf = {
  name: "",
  dimensions: {
    length: 0,
    width: 0,
    depth: 0,
  },
  enabled: true,
};

export const EMPTY_ITEM_GROUP: ItemGroupItf = {
  item: {
    name: "",
    dimensions: {
      length: 0,
      width: 0,
      depth: 0,
    },
  },
  quantity: 1,
};

export const INITIAL_BOXES: BoxItf[] = [
  {
    name: "Box 1",
    dimensions: {
      length: 500,
      width: 500,
      depth: 300,
    },
    enabled: true,
  },
  {
    name: "Box 2",
    dimensions: {
      length: 300,
      width: 300,
      depth: 300,
    },
    enabled: true,
  },
];

export const INITIAL_ITEM_GROUPS: ItemGroupItf[] = [
  {
    item: {
      name: "Item 1",
      dimensions: {
        length: 500,
        width: 300,
        depth: 100,
      },
    },
    quantity: 1,
  },
  {
    item: {
      name: "Item 2",
      dimensions: {
        length: 400,
        width: 300,
        depth: 200,
      },
    },
    quantity: 1,
  },
  {
    item: {
      name: "Item 3",
      dimensions: {
        length: 400,
        width: 400,
        depth: 100,
      },
    },
    quantity: 1,
  },
  {
    item: {
      name: "Item 4",
      dimensions: {
        length: 200,
        width: 200,
        depth: 200,
      },
    },
    quantity: 2,
  },
  {
    item: {
      name: "Item 5",
      dimensions: {
        length: 200,
        width: 100,
        depth: 100,
      },
    },
    quantity: 1,
  },
  {
    item: {
      name: "Item 6",
      dimensions: {
        length: 100,
        width: 100,
        depth: 200,
      },
    },
    quantity: 1,
  },
  {
    item: {
      name: "Item 7",
      dimensions: {
        length: 300,
        width: 300,
        depth: 300,
      },
    },
    quantity: 1,
  },
];
