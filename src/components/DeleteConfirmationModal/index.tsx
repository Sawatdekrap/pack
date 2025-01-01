import { Button, Group, Modal } from "@mantine/core";

interface DeleteConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: React.ReactNode;
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
      <Group display={"flex"} justify="flex-end" mt={"1rem"}>
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red" onClick={onDelete}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
};

export default DeleteConfirmationModal;
