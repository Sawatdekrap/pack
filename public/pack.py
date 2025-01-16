from dataclasses import dataclass
from enum import StrEnum


class Orientation(StrEnum):
    FRONT = "front"  # Closest plane is width x height
    FRONT_90 = "front_90"
    SIDE = "side"  # Clostest plane is depth x height
    SIDE_90 = "side_90"
    TOP = "top"  # Closest plane is width x depth
    TOP_90 = "top_90"

    @property
    def inverse(self):
        if self == Orientation.FRONT:
            return Orientation.FRONT
        elif self == Orientation.FRONT_90:
            return Orientation.FRONT_90
        elif self == Orientation.SIDE:
            return Orientation.SIDE
        elif self == Orientation.SIDE_90:
            return Orientation.TOP_90
        elif self == Orientation.TOP:
            return Orientation.TOP
        elif self == Orientation.TOP_90:
            return Orientation.SIDE_90


@dataclass
class Dimensions:
    width: float
    height: float
    depth: float

    @property
    def volume(self):
        return self.width * self.height * self.depth

    def copy(self) -> "Dimensions":
        return Dimensions(self.width, self.height, self.depth)

    def rotate(self, orientation: Orientation) -> "Dimensions":
        if orientation == Orientation.FRONT:
            return Dimensions(self.width, self.height, self.depth)
        elif orientation == Orientation.FRONT_90:
            return Dimensions(self.depth, self.height, self.width)
        elif orientation == Orientation.SIDE:
            return Dimensions(self.height, self.width, self.depth)
        elif orientation == Orientation.SIDE_90:
            return Dimensions(self.depth, self.width, self.height)
        elif orientation == Orientation.TOP:
            return Dimensions(self.width, self.depth, self.height)
        elif orientation == Orientation.TOP_90:
            return Dimensions(self.height, self.depth, self.width)

    def fits_strictly(self, other: "Dimensions") -> bool:
        return (
            self.width >= other.width
            and self.height >= other.height
            and self.depth >= other.depth
        )

    def fit_orientations(self, other: "Dimensions") -> list[Orientation]:
        if self.volume < other.volume:
            return []

        fit_orientations = []
        for orientation in Orientation:
            if self.fits_strictly(other.rotate(orientation)):
                fit_orientations.append(orientation)
        return fit_orientations

    def orientation_to_be_same(self, other: "Dimensions") -> Orientation | None:
        if self.volume != other.volume:
            return None

        for orientation in Orientation:
            if self.rotate(orientation) == other:
                return orientation

        return None


@dataclass
class Point:
    x: float
    y: float
    z: float


@dataclass
class Box:
    id: str
    name: str
    dimensions: Dimensions


@dataclass
class Item:
    id: str
    name: str
    dimensions: Dimensions


@dataclass
class ItemGroup:
    item: Item
    quantity: int


@dataclass
class CongruencyGroup:
    dimensions: Dimensions
    item_groups: list[ItemGroup]

    @property
    def quantity(self) -> int:
        return sum(item_group.quantity for item_group in self.item_groups)


@dataclass
class Space:
    box_idx: int
    dimensions: Dimensions
    offset: Point

    @classmethod
    def from_box(cls, box, box_idx):
        return cls(box_idx, box.dimensions.copy(), Point(0.0, 0.0, 0.0))


@dataclass
class Pattern:
    wide: int
    high: int
    deep: int


@dataclass
class PackedItems:
    box_idx: int
    item_groups: list[ItemGroup]
    offset: Point
    dimensions: Dimensions
    pattern: Pattern

    @property
    def quantity(self) -> int:
        return sum(item_group.quantity for item_group in self.item_groups)


@dataclass
class PackedBox:
    box: Box
    packed_items: list[PackedItems]


def pack(
    boxes: list[Box],
    item_groups: list[ItemGroup],
    empty_space_ratio: float,
) -> list[PackedBox]:
    congruency_groups = gather_congruency_groups(item_groups)
    sorted_congruency_groups = list(sorted(
        congruency_groups,
        key=lambda x: x.dimensions.width**2 + x.dimensions.height**2 + x.dimensions.depth**2,
        reverse=True,
    ))

    sorted_boxes = list(sorted(
        boxes,
        key=lambda x: x.dimensions.volume,
    ))

    usable_spaces = []

    smallest_item_volume = sorted_congruency_groups[-1].dimensions.volume

    all_packed_items = []
    used_boxes = []
    for congruency_group_idx, congruency_group in enumerate(sorted_congruency_groups):
        while congruency_group.quantity > 0:
            space_to_use = None

            # Select space from used box spaces
            space_to_use_idx = None
            for space_idx, space in enumerate(usable_spaces):
                orientations_in_space = space.dimensions.fit_orientations(congruency_group.dimensions)
                if orientations_in_space:
                    space_to_use_idx = space_idx
                    break
            if space_to_use_idx is not None:
                space_to_use = usable_spaces.pop(space_idx)

            # Select space from an unused box
            if space_to_use is None:
                box_to_use = next_box_to_use(
                    sorted_boxes,
                    congruency_group,
                    sorted_congruency_groups[congruency_group_idx+1:],
                    empty_space_ratio,
                )
                used_boxes.append(box_to_use)
                space_to_use = Space.from_box(box_to_use, len(used_boxes)-1)

            cg_names = ",".join([item_group.item.name for item_group in congruency_group.item_groups])
            print(f"Packing CG [{cg_names}] ({congruency_group.dimensions.width}x{congruency_group.dimensions.height}x{congruency_group.dimensions.depth})")
            print(f" Spaces to use: {len(usable_spaces)}")
            for space in usable_spaces:
                print(f"  Space ({space.box_idx}): {space.dimensions.width}x{space.dimensions.height}x{space.dimensions.depth}")
            print(f"Using space ({space_to_use.box_idx}): {space_to_use.dimensions.width}x{space_to_use.dimensions.height}x{space_to_use.dimensions.depth}")
            print()

            potential_packed_items = get_potential_packed_items(congruency_group, space_to_use)
            packed_items, new_spaces = select_packed_items_and_negative_space(potential_packed_items, space_to_use)

            all_packed_items.append(packed_items)
            update_congruency_group(congruency_group, packed_items)
            print(f"Just packed: {packed_items} with qty {packed_items.quantity}")
            print(f"Updated CG: {congruency_group}")

            for new_space in new_spaces:
                if new_space.dimensions.volume >= smallest_item_volume:
                    usable_spaces.append(new_space)
            usable_spaces.sort(key=lambda x: x.dimensions.volume)

    packed_boxes = []
    for box in used_boxes:
        packed_boxes.append(PackedBox(box, []))

    for packed_items in all_packed_items:
        packed_boxes[packed_items.box_idx].packed_items.append(packed_items)

    return packed_boxes


def gather_congruency_groups(item_groups: list[ItemGroup]) -> list[CongruencyGroup]:
    congruency_groups = []
    for item_group in item_groups:
        found_congruency_group = False
        for congruency_group in congruency_groups:
            orientation_for_congruency = congruency_group.dimensions.orientation_to_be_same(item_group.item.dimensions)
            if orientation_for_congruency:
                congruency_group.item_groups.append(item_group)
                found_congruency_group = True
                break
        if not found_congruency_group:
            congruency_groups.append(CongruencyGroup(item_group.item.dimensions, [item_group]))

    return congruency_groups


def next_box_to_use(
    sorted_boxes: list[Box],
    congruency_group: CongruencyGroup,
    remaining_congruency_groups: list[CongruencyGroup],
    empty_space_ratio: float,
) -> Box:
    remaining_volume = empty_space_ratio * (
        sum(
            cg.dimensions.volume * cg.quantity
            for cg in remaining_congruency_groups
        ) + (
            congruency_group.dimensions.volume * congruency_group.quantity
        )
    )

    for box in sorted_boxes:
        if box.dimensions.volume < remaining_volume:
            continue

        if box.dimensions.fit_orientations(congruency_group.dimensions):
            return box

    # TODO this is potentially dangerous if we have a really realy big box
    return sorted_boxes[-1]


def get_potential_packed_items(
    congruency_group: CongruencyGroup,
    space: Space,
) -> list[PackedItems]:
    potential_packed_items = []
    for orientation in space.dimensions.fit_orientations(congruency_group.dimensions):
        rotated_dims = congruency_group.dimensions.rotate(orientation)
        # TODO can do packable dimensions in all orders to get better packing
        # TODO can also simplify when quantity is 1
        # TODO how should this be packed?
        # TODO should this instead first pack in the most-available dimensions? Comes with some assumptions
        packable_widths = min(space.dimensions.width // rotated_dims.width, congruency_group.quantity)
        packable_depths = min(space.dimensions.depth // rotated_dims.depth, congruency_group.quantity // packable_widths)
        packable_heights = min(space.dimensions.height // rotated_dims.height, congruency_group.quantity // (packable_widths * packable_depths))
        # packable_heights = min(space.dimensions.height // rotated_dims.height, item_group.quantity)
        # packable_depths = min(space.dimensions.depth // rotated_dims.depth, item_group.quantity // packable_heights)
        # packable_widths = min(space.dimensions.width // rotated_dims.width, item_group.quantity // (packable_heights * packable_depths))
        packable_quantity = packable_widths * packable_heights * packable_depths

        packed_items = PackedItems(
            box_idx=space.box_idx,
            item_groups=[],
            offset=space.offset,
            dimensions=Dimensions(
                rotated_dims.width * packable_widths,
                rotated_dims.height * packable_heights,
                rotated_dims.depth * packable_depths,
            ),
            pattern=Pattern(packable_widths, packable_heights, packable_depths),
        )
        for item_group in congruency_group.item_groups:
            if item_group.quantity + packed_items.quantity >= packable_quantity:
                parital_item_group = ItemGroup(item_group.item, packable_quantity - packed_items.quantity)
                packed_items.item_groups.append(parital_item_group)
                break
            packed_items.item_groups.append(item_group)

        potential_packed_items.append(packed_items)

    max_quantity = max(packed_items.quantity for packed_items in potential_packed_items)
    return [packed_items for packed_items in potential_packed_items if packed_items.quantity == max_quantity]


def select_packed_items_and_negative_space(
    potential_packed_items: list[PackedItems],
    space: Space,
) -> tuple[PackedItems, list[Space]]:
    best_packed_items = None
    best_negative_space_group = None
    best_negative_space_volume = -1
    for packed_items in potential_packed_items:
        # TODO This can be expanded to more negative spaces, but also simplified
        negative_space_groups = [
            [
                Space(
                    box_idx=space.box_idx,
                    dimensions=Dimensions(
                        space.dimensions.width - packed_items.dimensions.width,
                        space.dimensions.height,
                        space.dimensions.depth,
                    ),
                    offset=Point(
                        space.offset.x + packed_items.dimensions.width,
                        space.offset.y,
                        space.offset.z,
                    ),
                ),
                Space(
                    box_idx=space.box_idx,
                    dimensions=Dimensions(
                        packed_items.dimensions.width,
                        space.dimensions.height - packed_items.dimensions.height,
                        space.dimensions.depth,
                    ),
                    offset=Point(
                        space.offset.x,
                        space.offset.y + packed_items.dimensions.height,
                        space.offset.z,
                    ),
                ),
                Space(
                    box_idx=space.box_idx,
                    dimensions=Dimensions(
                        packed_items.dimensions.width,
                        packed_items.dimensions.height,
                        space.dimensions.depth - packed_items.dimensions.depth,
                    ),
                    offset=Point(
                        space.offset.x,
                        space.offset.y,
                        space.offset.z + packed_items.dimensions.depth,
                    ),
                ),
            ],
            [
                Space(
                    box_idx=space.box_idx,
                    dimensions=Dimensions(
                        space.dimensions.width,
                        space.dimensions.height - packed_items.dimensions.height,
                        space.dimensions.depth,
                    ),
                    offset=Point(
                        space.offset.x,
                        space.offset.y + packed_items.dimensions.height,
                        space.offset.z,
                    ),
                ),
                Space(
                    box_idx=space.box_idx,
                    dimensions=Dimensions(
                        space.dimensions.width,
                        packed_items.dimensions.height,
                        space.dimensions.depth - packed_items.dimensions.depth,
                    ),
                    offset=Point(
                        space.offset.x,
                        space.offset.y,
                        space.offset.z + packed_items.dimensions.depth,
                    ),
                ),
                Space(
                    box_idx=space.box_idx,
                    dimensions=Dimensions(
                        space.dimensions.width - packed_items.dimensions.width,
                        packed_items.dimensions.height,
                        packed_items.dimensions.depth,
                    ),
                    offset=Point(
                        space.offset.x + packed_items.dimensions.width,
                        space.offset.y,
                        space.offset.z,
                    ),
                ),
            ],
            [
                Space(
                    box_idx=space.box_idx,
                    dimensions=Dimensions(
                        space.dimensions.width,
                        space.dimensions.height,
                        space.dimensions.depth - packed_items.dimensions.depth,
                    ),
                    offset=Point(
                        space.offset.x,
                        space.offset.y,
                        space.offset.z + packed_items.dimensions.depth,
                    ),
                ),
                Space(
                    box_idx=space.box_idx,
                    dimensions=Dimensions(
                        space.dimensions.width - packed_items.dimensions.width,
                        space.dimensions.height,
                        packed_items.dimensions.depth,
                    ),
                    offset=Point(
                        space.offset.x + packed_items.dimensions.width,
                        space.offset.y,
                        space.offset.z,
                    ),
                ),
                Space(
                    box_idx=space.box_idx,
                    dimensions=Dimensions(
                        packed_items.dimensions.width,
                        space.dimensions.height - packed_items.dimensions.height,
                        packed_items.dimensions.depth,
                    ),
                    offset=Point(
                        space.offset.x,
                        space.offset.y + packed_items.dimensions.height,
                        space.offset.z,
                    ),
                ),
            ],
        ]
        group_with_largest_volume = list(sorted(
            negative_space_groups,
            key=lambda x: x[0].dimensions.width**2 + x[0].dimensions.height**2 + x[0].dimensions.depth**2,
            reverse=True,
        ))[0]
        if group_with_largest_volume[0].dimensions.volume > best_negative_space_volume:
            best_packed_items = packed_items
            best_negative_space_group = group_with_largest_volume
            best_negative_space_volume = best_negative_space_group[0].dimensions.volume

    return best_packed_items, best_negative_space_group


def update_congruency_group(congruency_group: CongruencyGroup, packed_items: PackedItems) -> None:
    packed_quantity = 0
    remaining_item_groups = []
    for item_group in congruency_group.item_groups:
        if packed_quantity == packed_items.quantity:
            remaining_item_groups.append(item_group)
            break
        elif packed_quantity + item_group.quantity > packed_items.quantity:
            required_quantity = packed_items.quantity - packed_quantity
            remaining_quantity = item_group.quantity - required_quantity
            remaining_item_groups.append(ItemGroup(item_group.item, remaining_quantity))
            packed_quantity += required_quantity
            break
        else:
            packed_quantity += item_group.quantity

    congruency_group.item_groups = remaining_item_groups


if __name__ == '__main__':
    boxes = [
        Box("Box 1", "Box 1", Dimensions(500.0, 500.0, 300.0)),
        Box("Box 2", "Box 2", Dimensions(300.0, 300.0, 300.0)),
    ]
    item_groups = [
        ItemGroup(Item("Item 1", "Item 1", Dimensions(500.0, 300.0, 100.0)), 1),
        ItemGroup(Item("Item 2", "Item 2", Dimensions(400.0, 300.0, 200.0)), 1),
        ItemGroup(Item("Item 3", "Item 3", Dimensions(400.0, 400.0, 100.0)), 1),
        ItemGroup(Item("Item 4", "Item 4", Dimensions(200.0, 200.0, 200.0)), 2),
        ItemGroup(Item("Item 6", "Item 6", Dimensions(200.0, 100.0, 100.0)), 1),
        ItemGroup(Item("Item 7", "Item 7", Dimensions(200.0, 100.0, 100.0)), 1),
        ItemGroup(Item("Item 8", "Item 8", Dimensions(300.0, 300.0, 300.0)), 1),
    ]
    # item_groups = [
    #     ItemGroup(Item("Item 1", "Item 1", Dimensions(150.0, 200.0, 350.0)), 4),
    #     ItemGroup(Item("Item 2", "Item 2", Dimensions(150.0, 200.0, 350.0)), 3),
    # ]
    packed_boxes = pack(boxes, item_groups, empty_space_ratio=1.1)
    for packed_box in packed_boxes:
        print(f"Packed box: {packed_box.box.name}")
        for packed_items in packed_box.packed_items:
            packed_item_names = ",".join([item_group.item.name for item_group in packed_items.item_groups])
            print(f"Packed items ({packed_item_names}): x {packed_items.quantity}")
            print(f" Offset: {packed_items.offset}")
            print(f" Packed dimensions: {packed_items.dimensions}")
        print()
