import {
  Button,
  Grid,
  Group,
  Modal,
  NumberInput,
  Switch,
  TextInput,
} from "@mantine/core";
import { BoxItf } from "../../interfaces";
import { useForm } from "@mantine/form";
import { EMPTY_BOX } from "../../data";
import { useEffect } from "react";

interface BoxModalProps {
  box: BoxItf | undefined;
  opened: boolean;
  onClose: () => void;
  onSubmit: (box: BoxItf) => void;
  title: string;
}

const valuesFromBox = (box: BoxItf) => ({
  name: box.name,
  length: box.dimensions.length,
  width: box.dimensions.width,
  depth: box.dimensions.depth,
  enabled: box.enabled,
});

const BoxModal = ({ box, opened, onClose, onSubmit, title }: BoxModalProps) => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: valuesFromBox(EMPTY_BOX),
    validate: {
      name: (value) => (value.length === 0 ? "Must have a name" : null),
      length: (value) => (value <= 0 ? "Must be a positive number" : null),
      width: (value) => (value <= 0 ? "Must be a positive number" : null),
      depth: (value) => (value <= 0 ? "Must be a positive number" : null),
    },
  });

  const onFormSubmit = (values: any) => {
    const newBox: BoxItf = {
      name: values.name,
      dimensions: {
        length: values.length,
        width: values.width,
        depth: values.depth,
      },
      enabled: values.enabled,
    };
    onSubmit(newBox);
  };

  useEffect(() => {
    const values = box ? valuesFromBox(box) : valuesFromBox(EMPTY_BOX);
    form.setValues(values);
  }, [box]);

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <form onSubmit={form.onSubmit(onFormSubmit)}>
        <TextInput
          label="Name"
          key={form.key("name")}
          placeholder="Box Name"
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
        <Switch
          mt={"1rem"}
          key={form.key("enabled")}
          label="Enabled for packing?"
          {...form.getInputProps("enabled", { type: "checkbox" })}
        />
        <Group display={"flex"} justify="flex-end" mt={"md"}>
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Modal>
  );
};

export default BoxModal;
