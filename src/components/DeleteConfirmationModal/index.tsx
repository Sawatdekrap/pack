import { Button, Group, Modal } from "@mantine/core";

interface DeleteConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
  children: React.ReactNode;
}

const DeleteConfirmationModal = ({
  opened,
  onClose,
  onDelete,
  title,
  children,
}: DeleteConfirmationModalProps) => {
  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      {children}
      <Group display={"flex"} justify="flex-end">
        <Button variant="transparent" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red" onClick={onDelete}>
          Cancel
        </Button>
      </Group>
    </Modal>
  );
};

export default DeleteConfirmationModal;
