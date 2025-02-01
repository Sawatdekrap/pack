import { CameraControls, Grid } from "@react-three/drei";
import { usePackedBox } from "../../contexts/PackedBoxContext";
import { useMemo, useRef } from "react";
import BoxMesh from "./BoxMesh";
import ItemMesh from "./ItemMesh";
import { offsetDimensionsInBox } from "./helpers";
import { Canvas } from "@react-three/fiber";
import PreviewItemMesh from "./PreviewItemMesh";
import {
  ActionIcon,
  Button,
  Flex,
  Group,
  Slider,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconCameraRotate,
  IconCaretLeft,
  IconCaretRight,
  IconEye,
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";

interface PackedBoxPreviewProps {
  size: "sm" | "md" | "lg";
}

const PackedBoxPreview = ({ size = "sm" }: PackedBoxPreviewProps) => {
  const {
    packedBox,
    step,
    setStep,
    totalSteps,
    fullscreen,
    setFullscreen,
    activatePreview,
    previewActive,
  } = usePackedBox();

  const cameraRef = useRef<CameraControls>(null);

  const resetCamera = () => {
    cameraRef?.current?.setLookAt(3, 4, 3, 0, 0, 0, true);
  };

  const renderedDisplay = useMemo(() => {
    const boxDims = packedBox.box.dimensions;
    const scale =
      (1 / Math.max(1, boxDims.length, boxDims.width, boxDims.depth)) * 2;

    if (!previewActive) return <></>;

    return (
      <>
        <ambientLight intensity={0.7} />
        <pointLight
          position={[4, 8, 4]}
          intensity={80}
          color={"white"}
          castShadow
        />
        <group scale={scale} position={[0, (boxDims.depth * scale) / 2, 0]}>
          <BoxMesh box={packedBox.box} />
          {packedBox.packedItems.map((packedItem, idx) => {
            if (idx >= step) {
              return null;
            }

            const itemDims = [
              packedItem.dimensions.length,
              packedItem.dimensions.depth,
              packedItem.dimensions.width,
            ] as [number, number, number];
            const position = offsetDimensionsInBox(
              [packedItem.offset.x, packedItem.offset.z, packedItem.offset.y],
              itemDims,
              [boxDims.length, boxDims.depth, boxDims.width]
            );
            const segments = [
              packedItem.pattern.long,
              packedItem.pattern.deep,
              packedItem.pattern.wide,
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
  }, [packedBox, step, previewActive]);

  if (!previewActive) {
    return (
      <Button
        h={size === "sm" ? "250px" : "450px"}
        variant="subtle"
        onClick={activatePreview}
        size="xl"
      >
        <Stack ta="center" gap={0}>
          <Text>
            <IconEye />
          </Text>
          <Text fw="bold">Click to Activate Preview</Text>
        </Stack>
      </Button>
    );
  }

  return (
    <Flex h={size === "lg" ? "100%" : undefined} direction="column">
      <Group pos="relative" w="100%" display="flex" justify="flex-end" flex={0}>
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
      <Flex direction="column" h="100%">
        <Canvas
          style={{
            flex: size === "sm" ? "250px" : size === "md" ? "450px" : "80vh",
          }}
          shadows
          onCreated={resetCamera}
        >
          <CameraControls ref={cameraRef} />
          {renderedDisplay}
        </Canvas>
        <Group display={"flex"} gap={"xs"} px={"xs"} flex={1}>
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
      </Flex>
    </Flex>
  );
};

export default PackedBoxPreview;
