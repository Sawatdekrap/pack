import { Edges } from "@react-three/drei";
import { ItemGroupItf } from "../../interfaces";
import { colorFromString } from "./helpers";

interface ItemMeshProps {
  position: [number, number, number];
  dimensions: [number, number, number];
  itemGroups: ItemGroupItf[];
  segments?: [number, number, number];
}

const ItemMesh = ({
  position,
  dimensions,
  itemGroups,
  segments,
}: ItemMeshProps) => {
  const actualSegments = segments || [1, 1, 1];
  const subItemDimensions = [
    dimensions[0] / actualSegments[0],
    dimensions[1] / actualSegments[1],
    dimensions[2] / actualSegments[2],
  ] as [number, number, number];
  const startX = position[0] - dimensions[0] / 2 + subItemDimensions[0] / 2;
  const startY = position[1] - dimensions[1] / 2 + subItemDimensions[1] / 2;
  const startZ = position[2] - dimensions[2] / 2 + subItemDimensions[2] / 2;

  const colors = itemGroups.reduce((acc, ig) => {
    return acc.concat(
      ...Array(ig.quantity).fill(colorFromString(ig.item.name))
    );
  }, []);

  const subItemMeshes = [];
  for (let x = 0; x < actualSegments[0]; x++) {
    for (let y = 0; y < actualSegments[1]; y++) {
      for (let z = 0; z < actualSegments[2]; z++) {
        const subItemPosition = [
          startX + x * subItemDimensions[0],
          startY + y * subItemDimensions[1],
          startZ + z * subItemDimensions[2],
        ] as [number, number, number];
        const color = colors.shift() || "white";

        subItemMeshes.push(
          <mesh
            key={`${x}-${y}-${z}`}
            position={subItemPosition}
            castShadow
            receiveShadow
          >
            <boxGeometry args={subItemDimensions} />
            <meshStandardMaterial color={color} />
            <Edges lineWidth={1} color={"black"} />
          </mesh>
        );
      }
    }
  }

  return <group>{subItemMeshes}</group>;
};

export default ItemMesh;
