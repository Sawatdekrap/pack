import { CameraControls, Grid } from "@react-three/drei";
import { usePackedBox } from "../../contexts/PackedBoxContext";
import { useMemo, useRef } from "react";
import BoxMesh from "./BoxMesh";
import ItemMesh from "./ItemMesh";
import { offsetDimensionsInBox } from "./helpers";
import { Canvas } from "@react-three/fiber";
import PreviewItemMesh from "./PreviewItemMesh";

const PackedBoxPreview = () => {
  const { packedBox, step, setStep } = usePackedBox();

  const cameraRef = useRef<CameraControls>(null);

  const renderedDisplay = useMemo(() => {
    const boxDims = packedBox.box.dimensions;
    const scale =
      (1 / Math.max(1, boxDims.length, boxDims.width, boxDims.depth)) * 2;

    return (
      <>
        <ambientLight intensity={0.5} />
        <pointLight
          position={[4, 8, 4]}
          intensity={70}
          color={"white"}
          castShadow
        />
        <group scale={scale} position={[0, 1, 0]}>
          <BoxMesh box={packedBox.box} />
          {packedBox.packedItems.map((packedItem, idx) => {
            if (idx >= step) {
              return null;
            }

            const itemDims = [
              packedItem.dimensions.length,
              packedItem.dimensions.width,
              packedItem.dimensions.depth,
            ] as [number, number, number];
            const position = offsetDimensionsInBox(
              [packedItem.offset.x, packedItem.offset.y, packedItem.offset.z],
              itemDims,
              [boxDims.length, boxDims.width, boxDims.depth]
            );
            const segments = [
              packedItem.pattern.long,
              packedItem.pattern.wide,
              packedItem.pattern.deep,
            ] as [number, number, number];
            return idx === step - 1 ? (
              <PreviewItemMesh
                key={idx}
                position={position}
                dimensions={itemDims}
                itemGroups={packedItem.itemGroups}
                segments={segments}
                boxHeight={boxDims.depth}
              />
            ) : (
              <ItemMesh
                key={idx}
                position={position}
                dimensions={itemDims}
                itemGroups={packedItem.itemGroups}
                segments={segments}
              />
            );
          })}
        </group>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.1, 0]}
          receiveShadow
        >
          <planeGeometry args={[boxDims.width * 3, boxDims.depth * 3]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
        <Grid
          args={[boxDims.length, boxDims.width]}
          cellColor={"grey"}
          sectionColor={"black"}
          fadeDistance={20}
          fadeStrength={2}
          infiniteGrid
        />
      </>
    );
  }, [packedBox, step]);

  return (
    <Canvas style={{ height: "450px" }} shadows>
      <CameraControls ref={cameraRef} />
      {renderedDisplay}
    </Canvas>
  );
};

export default PackedBoxPreview;
