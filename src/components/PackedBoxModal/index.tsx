import { Modal } from "@mantine/core";
import { usePackedBox } from "../../contexts/PackedBoxContext";
import PackedBoxPreview from "../PackedBoxPreview";

const PackedBoxModal = () => {
  const { fullscreen, setFullscreen } = usePackedBox();

  return (
    <Modal
      size={"90vw"}
      opened={fullscreen}
      onClose={() => setFullscreen(false)}
      withCloseButton={false}
      centered
    >
      <PackedBoxPreview size="lg" />
    </Modal>
  );
};

export default PackedBoxModal;
