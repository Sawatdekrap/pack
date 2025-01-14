import { Edges } from "@react-three/drei";
import { BoxItf } from "../../interfaces";

interface BoxMeshProps {
  box: BoxItf;
}

const BoxMesh = ({ box }: BoxMeshProps) => {
  const dims = box.dimensions;

  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry
        args={[dims.length * 1.01, dims.depth * 1.01, dims.width * 1.01]}
      />
      <meshStandardMaterial
        color={"white"}
        transparent
        opacity={0.1}
      ></meshStandardMaterial>
      <Edges lineWidth={2} color={"black"} />
    </mesh>
  );
};

export default BoxMesh;
