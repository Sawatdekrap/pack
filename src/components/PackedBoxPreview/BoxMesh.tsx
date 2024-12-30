import { BoxItf } from "../../interfaces";

interface BoxMeshProps {
  box: BoxItf;
}

const BoxMesh = ({ box }: BoxMeshProps) => {
  const dims = box.dimensions;

  return (
    <group>
      <mesh position={[0, -dims.width / 2 + 2, 0]}>
        <boxGeometry args={[dims.length, 5, dims.depth]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <group>
        <mesh position={[0, -dims.width / 2 + 25, dims.depth / 2 + 2]}>
          <boxGeometry args={[dims.length, 50, 5]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        <mesh position={[-dims.length / 2 + 25, 0, dims.depth / 2 + 2]}>
          <boxGeometry args={[50, dims.width, 5]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        <mesh position={[dims.length / 2 - 25, 0, dims.depth / 2 + 2]}>
          <boxGeometry args={[50, dims.width, 5]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </group>
      <group>
        <mesh position={[0, -dims.width / 2 + 25, -dims.depth / 2 + 2]}>
          <boxGeometry args={[dims.length, 50, 5]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        <mesh position={[-dims.length / 2 + 25, 0, -dims.depth / 2 + 2]}>
          <boxGeometry args={[50, dims.width, 5]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        <mesh position={[dims.length / 2 - 25, 0, -dims.depth / 2 + 2]}>
          <boxGeometry args={[50, dims.width, 5]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </group>
      <group>
        <mesh position={[dims.length / 2 + 2, -dims.width / 2 + 25, 0]}>
          <boxGeometry args={[5, 50, dims.depth]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        <mesh position={[dims.length / 2 + 2, 0, -dims.depth / 2 + 25]}>
          <boxGeometry args={[5, dims.width, 50]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        <mesh position={[dims.length / 2 + 2, 0, dims.depth / 2 - 25]}>
          <boxGeometry args={[5, dims.width, 50]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </group>
      <group>
        <mesh position={[-dims.length / 2 + 2, -dims.width / 2 + 25, 0]}>
          <boxGeometry args={[5, 50, dims.depth]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        <mesh position={[-dims.length / 2 + 2, 0, -dims.depth / 2 + 25]}>
          <boxGeometry args={[5, dims.width, 50]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        <mesh position={[-dims.length / 2 + 2, 0, dims.depth / 2 - 25]}>
          <boxGeometry args={[5, dims.width, 50]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </group>
    </group>
  );
};

export default BoxMesh;
