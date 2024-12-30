import { Edges } from "@react-three/drei";
import { Vector3 } from "three";
import ItemMesh from "./ItemMesh";
import { ItemGroupItf } from "../../interfaces";

interface PreviewItemMeshProps {
  position: [number, number, number];
  dimensions: [number, number, number];
  itemGroups: ItemGroupItf[];
  boxHeight: number;
  segments?: [number, number, number];
}

const PreviewItemMesh = ({
  position,
  dimensions,
  itemGroups,
  boxHeight,
  segments,
}: PreviewItemMeshProps) => {
  const floatPosition = [
    position[0],
    boxHeight * 1.1 + dimensions[1] / 2,
    position[2],
  ] as [number, number, number];

  return (
    <group>
      <ItemMesh
        position={floatPosition}
        dimensions={dimensions}
        itemGroups={itemGroups}
        segments={segments}
      />
      <arrowHelper
        args={[
          new Vector3(0, -1, 0),
          new Vector3(...floatPosition),
          floatPosition[1] - position[1] / 2,
          "black",
        ]}
      />
      <mesh position={position}>
        <boxGeometry args={dimensions} />
        <meshStandardMaterial color={"white"} transparent opacity={0.4} />
        <Edges lineWidth={1} color={"black"} />
      </mesh>
    </group>
  );
};

export default PreviewItemMesh;
