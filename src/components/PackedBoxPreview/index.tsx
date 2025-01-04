import { CameraControls, Grid } from "@react-three/drei";
import { usePackedBox } from "../../contexts/PackedBoxContext";
import { useMemo, useRef } from "react";
import BoxMesh from "./BoxMesh";
import ItemMesh from "./ItemMesh";
import { offsetDimensionsInBox } from "./helpers";
import { Canvas } from "@react-three/fiber";
import PreviewItemMesh from "./PreviewItemMesh";
import { ActionIcon, Box, Group, Slider } from "@mantine/core";
import {
  IconCameraRotate,
  IconCaretLeft,
  IconCaretRight,
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";

interface PackedBoxPreviewProps {
  size: "sm" | "lg";
}

const PackedBoxPreview = ({ size = "sm" }: PackedBoxPreviewProps) => {
  const { packedBox, step, setStep, totalSteps, fullscreen, setFullscreen } =
    usePackedBox();

  const cameraRef = useRef<CameraControls>(null);

  const resetCamera = () => {
    cameraRef?.current?.setLookAt(-3, 4, 3, 0, 2, 0, true);
  };

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
    <Box h={size === "lg" ? "90vh" : undefined}>
      <Group pos="relative" w="100%" display="flex" justify="flex-end">
        <Group pos="absolute" top="0.5rem" right="0.5rem">
          <ActionIcon
            variant="transparent"
            style={{ zIndex: 50 }}
            onClick={() => resetCamera()}
          >
            <IconCameraRotate />
          </ActionIcon>
          <ActionIcon
            variant="transparent"
            style={{ zIndex: 50 }}
            onClick={() => setFullscreen(!fullscreen)}
          >
            {fullscreen ? <IconMinimize /> : <IconMaximize />}
          </ActionIcon>
        </Group>
      </Group>
      <Canvas
        style={{ height: size === "sm" ? "450px" : "85vh" }}
        shadows
        onCreated={resetCamera}
      >
        <CameraControls ref={cameraRef} />
        {renderedDisplay}
      </Canvas>
      <Group display={"flex"} gap={"xs"} px={"xs"}>
        <ActionIcon
          onClick={() => setStep(step - 1)}
          variant="transparent"
          disabled={step === 0}
        >
          <IconCaretLeft />
        </ActionIcon>
        <Slider
          flex={"auto"}
          min={0}
          max={totalSteps}
          value={step}
          onChange={setStep}
        />
        <ActionIcon
          onClick={() => setStep(step + 1)}
          variant="transparent"
          disabled={step === totalSteps}
        >
          <IconCaretRight />
        </ActionIcon>
      </Group>
    </Box>
  );
};

export default PackedBoxPreview;
