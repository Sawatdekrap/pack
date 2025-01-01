import {
  Button,
  Grid,
  Group,
  Modal,
  NumberInput,
  TextInput,
} from "@mantine/core";
import { ItemGroupItf } from "../../interfaces";
import { useForm } from "@mantine/form";
import { EMPTY_ITEM_GROUP } from "../../data";
import { useEffect } from "react";

interface ItemModalProps {
  ig: ItemGroupItf | undefined;
  opened: boolean;
  onClose: () => void;
  onSubmit: (ig: ItemGroupItf) => void;
  title: string;
}

const valuesFromItemGroup = (ig: ItemGroupItf) => ({
  name: ig.item.name,
  length: ig.item.dimensions.length,
  width: ig.item.dimensions.width,
  depth: ig.item.dimensions.depth,
  quantity: ig.quantity,
});

const ItemModal = ({
  ig,
  opened,
  onClose,
  onSubmit,
  title,
}: ItemModalProps) => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: valuesFromItemGroup(EMPTY_ITEM_GROUP),
    validate: {
      name: (value) => (value.length === 0 ? "Must have a name" : null),
      length: (value) => (value <= 0 ? "Must be a positive number" : null),
      width: (value) => (value <= 0 ? "Must be a positive number" : null),
      depth: (value) => (value <= 0 ? "Must be a positive number" : null),
      quantity: (value) => (value < 0 ? "Must be greater than 0" : null),
    },
  });

  const onFormSubmit = (values: any) => {
    const newIg: ItemGroupItf = {
      item: {
        name: values.name,
        dimensions: {
          length: values.length,
          width: values.width,
          depth: values.depth,
        },
      },
      quantity: values.quantity,
    };
    onSubmit(newIg);
  };

  useEffect(() => {
    const values = ig
      ? valuesFromItemGroup(ig)
      : valuesFromItemGroup(EMPTY_ITEM_GROUP);
    form.setValues(values);
  }, [ig]);

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <form onSubmit={form.onSubmit(onFormSubmit)}>
        <TextInput
          label="Name"
          key={form.key("name")}
          placeholder="Item Name"
          {...form.getInputProps("name")}
        />
        <Grid mt={"0.25rem"}>
          <Grid.Col span={4}>
            <NumberInput
              key={form.key("length")}
              label="Length"
              {...form.getInputProps("length")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              key={form.key("width")}
              label="Width"
              {...form.getInputProps("width")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              key={form.key("depth")}
              label="Depth"
              {...form.getInputProps("depth")}
            />
          </Grid.Col>
        </Grid>
        <NumberInput
          label="Quantity"
          key={form.key("quantity")}
          {...form.getInputProps("quantity")}
          mt={"0.25rem"}
        />
        <Group display={"flex"} justify="flex-end" mt={"1rem"}>
          <Button variant="transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Modal>
  );
};

export default ItemModal;
