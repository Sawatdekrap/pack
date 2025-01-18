import public.mip as mip
from dataclasses import dataclass


@dataclass
class Box:
    name: str
    width_cm: float
    height_cm: float
    depth_cm: float

    def dim_from_axis(self, axis: int):
        return [self.width_cm, self.height_cm, self.depth_cm][axis]

    @property
    def volume(self):
        return self.width_cm * self.height_cm * self.depth_cm

@dataclass
class Item:
    name: str
    width_cm: float
    height_cm: float
    depth_cm: float

    def dim_from_axis(self, axis: int):
            return [self.width_cm, self.height_cm, self.depth_cm][axis]


class SolverService:
    def __init__(self, box: Box, items: list[Item]) -> None:
        self.box = box
        self.items = items
        self.n_items = len(items)

        self._reset_model()

    def optimise(self):
        self._reset_model()
        self._create_variables()
        self._create_constraints()
        self._create_objective()
        self._solve()
        self._output()

    def _reset_model(self):
        self.model = mip.Model()
        self.v_picked = {}
        self.v_item_box_axis = {}
        self.v_item_origin = {}

    def _create_variables(self):
        self._create_picked_variables()
        self._create_item_axis_variables()
        self._create_item_origin_variables()

    def _create_picked_variables(self):
        self.v_picked = {
            idx: self.model.add_var(var_type=mip.BINARY)
            for idx in range(self.n_items)
        }

    def _create_item_axis_variables(self):
        for idx in range(self.n_items):
            for item_axis in range(3):
                for box_axis in range(3):
                    key = f"{idx}_{item_axis}_{box_axis}"
                    self.v_item_box_axis[key] = self.model.add_var(var_type=mip.BINARY)

    def _create_item_origin_variables(self):
        for idx in range(self.n_items):
            for box_axis in range(3):
                key = f"{idx}_{box_axis}"
                self.v_item_origin[key] = self.model.add_var()

    def _create_constraints(self):
        self._create_orthogonality_constraints()
        self._create_domain_boundaries_constraints()
        self._create_non_intersection_constraints()

    def _create_orthogonality_constraints(self):
        # For each axis of an item, only one box axis can be selected
        for idx in range(self.n_items):
            for item_axis in range(3):
                box_axes_expr = [
                    self.v_item_box_axis[f"{idx}_{item_axis}_{box_axis}"]
                    for box_axis in range(3)
                ]
                self.model += mip.xsum(box_axes_expr) == self.v_picked[idx]

        # For each box axis, only one item axis can be selected
        for idx in range(self.n_items):
            for box_axis in range(3):
                self.model += mip.xsum(
                    self.v_item_box_axis[f"{idx}_{item_axis}_{box_axis}"]
                    for item_axis in range(3)
                ) == self.v_picked[idx]

    def _create_domain_boundaries_constraints(self):
        for idx in range(self.n_items):
            for box_axis in range(3):
                origin_key = f"{idx}_{box_axis}"
                origin_expr = self.v_item_origin[origin_key]
                max_point_expr = origin_expr + mip.xsum(
                    self.v_item_box_axis[f"{idx}_{item_axis}_{box_axis}"] * self.items[idx].dim_from_axis(item_axis)
                    for item_axis in range(3)
                )
                self.model += 0 <= origin_expr
                self.model += origin_expr <= max_point_expr
                self.model += max_point_expr <= self.v_picked[idx] * self.box.dim_from_axis(box_axis)

    def _create_non_intersection_constraints(self):
        # Vars to help indicate intersection between items a and b (a < b)
        v_non_intersection = {}
        for idx_a in range(self.n_items):
            for idx_b in range(idx_a + 1, self.n_items):
                for box_axis in range(3):
                    v_non_intersection[f"{idx_a}_{idx_b}_{box_axis}_+"] = self.model.add_var(var_type=mip.BINARY)
                    v_non_intersection[f"{idx_a}_{idx_b}_{box_axis}_-"] = self.model.add_var(var_type=mip.BINARY)

        # Generate expressions to represent that a lies outside of b
        # and vice versa.
        # Both expressions are negatable by the v_non_intersection_+/- vars
        for idx_a in range(self.n_items):
            for idx_b in range(idx_a + 1, self.n_items):
                for box_axis in range(3):
                    a_b_origin_distance = self.v_item_origin[f"{idx_a}_{box_axis}"] - self.v_item_origin[f"{idx_b}_{box_axis}"]
                    b_a_origin_distance = self.v_item_origin[f"{idx_b}_{box_axis}"] - self.v_item_origin[f"{idx_a}_{box_axis}"]
                    a_length_along_box_axis = mip.xsum(
                        self.v_item_box_axis[f"{idx_a}_{item_axis}_{box_axis}"] * self.items[idx_a].dim_from_axis(item_axis)
                        for item_axis in range(3)
                    )
                    b_length_along_box_axis = mip.xsum(
                        self.v_item_box_axis[f"{idx_b}_{item_axis}_{box_axis}"] * self.items[idx_b].dim_from_axis(item_axis)
                        for item_axis in range(3)
                    )
                    # v_non_intersection_+/- can be 1 to negate the condition
                    a_b_negate = self.box.dim_from_axis(box_axis) * (1 - v_non_intersection[f"{idx_a}_{idx_b}_{box_axis}_+"])
                    b_a_negate = self.box.dim_from_axis(box_axis) * (1 - v_non_intersection[f"{idx_a}_{idx_b}_{box_axis}_-"])

                    self.model += a_b_origin_distance >= b_length_along_box_axis - a_b_negate
                    self.model += b_a_origin_distance >= a_length_along_box_axis - b_a_negate

        # If a is picked, exactly one of the non-intersection vars must be 1
        for idx_a in range(self.n_items):
            for idx_b in range(idx_a + 1, self.n_items):
                non_intersection_expr = mip.xsum(
                    v_non_intersection[f"{idx_a}_{idx_b}_{box_axis}_+"] + v_non_intersection[f"{idx_a}_{idx_b}_{box_axis}_-"]
                    for box_axis in range(3)
                )
                self.model += non_intersection_expr >= self.v_picked[idx_a] + self.v_picked[idx_b] - 1

    def _create_objective(self):
        self.model.objective = mip.maximize(mip.xsum(self.v_picked.values()))

    def _solve(self) -> mip.OptimizationStatus:
        self.model.optimize()

    def _output(self):
        status = self.model.status
        objective = self.model.objective_value

        if status == mip.OptimizationStatus.OPTIMAL:
            print(f"Optimal solution found: {objective}")
        else:
            print(f"Optimal solution not found: {status}")

        if status == mip.OptimizationStatus.OPTIMAL or status == mip.OptimizationStatus.FEASIBLE:
            print(f"Solution for box: {self.box}")
            for idx in range(self.n_items):
                print(f"Item {idx} picked: {self.v_picked[idx].x}")

                dim = []
                for box_axis in range(3):
                    for item_axis in range(3):
                        key = f"{idx}_{item_axis}_{box_axis}"
                        if self.v_item_box_axis[key].x:
                            dim.append(self.items[idx].dim_from_axis(item_axis))

                origin = []
                for box_axis in range(3):
                    origin_key = f"{idx}_{box_axis}"
                    origin.append(self.v_item_origin[origin_key].x)

                print(f"Origin: {origin}, Dims: {dim}")
