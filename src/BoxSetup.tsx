import { useAtom } from "jotai";
import { boxesAtom } from "./atoms";
import { useState } from "react";
import { BoxItf } from "./interfaces";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import {
  IconEdit,
  IconFileTypeCsv,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import CustomTable from "./components/CustomTable";
import BoxModal from "./components/BoxModal";
import { EMPTY_BOX } from "./data";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import CSVImportModal from "./components/CSVImportModal";

const BOX_COLUMNS = ["name", "length", "width", "depth"];

const validateBoxData = (data: any[]): [any[], string] => {
  const missingColumns = BOX_COLUMNS.filter((c) => !(c in data[0]));
  if (missingColumns.length > 0) {
    console.log(missingColumns);
    return [data, `Columns must include ${BOX_COLUMNS.join(", ")}`];
  }
  let error = "";
  const validatedData = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (typeof row["name"] != "string") {
      error = `Row ${i}: name must be a string`;
    }
    const length = parseFloat(row["length"]);
    const width = parseFloat(row["width"]);
    const depth = parseFloat(row["depth"]);
    if (length <= 0 || width <= 0 || depth <= 0) {
      error = `Row ${i}: dimensinos must be a number and greater than 0`;
    }

    if (error) break;
    validatedData.push({
      name: row["name"],
      length: length,
      width: width,
      depth: depth,
    });
  }

  return [validatedData, error];
};

interface BoxInline {
  name: string;
  length: number;
  width: number;
  depth: number;
  enabled?: boolean;
}

const BoxSetup = () => {
  const [boxes, setBoxes] = useAtom(boxesAtom);
  const [refBoxIdx, setRefBoxIdx] = useState<number | undefined>();
  const [newBoxOpened, setNewBoxOpened] = useState(false);
  const [refDeleteBoxIdx, setRefDeleteBoxIdx] = useState<number | undefined>();
  const [boxImportOpened, setBoxImportOpened] = useState(false);

  const onBoxEdit = (boxIdx: number, box: BoxItf) => {
    const newBoxes = [...boxes];
    newBoxes[boxIdx] = { ...box };
    setBoxes(newBoxes);
  };

  const onBoxCreate = (box: BoxItf) => {
    const newBoxes = [...boxes, box];
    setBoxes(newBoxes);
  };

  const onBoxDelete = (boxIdx: number) => {
    const newBoxes = [...boxes];
    newBoxes.splice(boxIdx, 1);
    setBoxes(newBoxes);
  };

  const setBoxEnabled = (boxIdx: number, enabled: boolean) => {
    const newBoxes = [...boxes];
    newBoxes[boxIdx] = { ...newBoxes[boxIdx], enabled };
    setBoxes(newBoxes);
  };

  const bulkImportBoxes = (rows: BoxInline[]) => {
    setBoxes(
      rows.map((r) => ({
        name: r.name,
        dimensions: {
          length: r.length,
          width: r.width,
          depth: r.depth,
        },
        enabled: true,
      }))
    );
  };

  const boxData = boxes.map((b, bIdx) => ({
    name: (
      <Box>
        <Text>{b.name}</Text>
        <Text size={"0.5rem"} c="dimmed" hiddenFrom="sm">
          {b.dimensions.length} x {b.dimensions.width} x {b.dimensions.depth}
        </Text>
      </Box>
    ),
    length: b.dimensions.length,
    width: b.dimensions.width,
    depth: b.dimensions.depth,
    enabled: (
      <Switch
        checked={b.enabled}
        onChange={() => setBoxEnabled(bIdx, !b.enabled)}
        size="xs"
      />
    ),
    actions: (
      <>
        <ActionIcon
          variant="subtle"
          onClick={() => {
            setRefBoxIdx(bIdx);
          }}
        >
          <IconEdit />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          onClick={() => setRefDeleteBoxIdx(bIdx)}
          color="red"
        >
          <IconTrash />
        </ActionIcon>
      </>
    ),
  }));

  return (
    <>
      <Group display={"flex"} align="flex-end" mt={"md"}>
        <Title order={2} flex={"auto"}>
          Boxes
        </Title>
        <Button
          variant="transparent"
          leftSection={<IconFileTypeCsv />}
          onClick={() => setBoxImportOpened(true)}
        >
          Import CSV
        </Button>
      </Group>

      <Paper shadow="sm">
        <CustomTable
          columns={[
            { key: "name", title: "Name" },
            {
              key: "length",
              title: "Length",
              width: "100px",
              hideMobile: true,
            },
            { key: "width", title: "Width", width: "100px", hideMobile: true },
            { key: "depth", title: "Depth", width: "100px", hideMobile: true },
            { key: "enabled", title: "Use?", width: "50px" },
            { key: "actions", title: "", width: "80px" },
          ]}
          data={boxData}
        />
        <Button
          variant="subtle"
          size="small"
          leftSection={<IconPlus />}
          onClick={() => setNewBoxOpened(true)}
        >
          New Box
        </Button>
        <BoxModal
          box={refBoxIdx === undefined ? undefined : boxes[refBoxIdx]}
          opened={refBoxIdx !== undefined}
          onClose={() => setRefBoxIdx(undefined)}
          onSubmit={(box) => {
            if (refBoxIdx === undefined) return;
            onBoxEdit(refBoxIdx, box);
            setRefBoxIdx(undefined);
          }}
          title="Edit Box"
        />
        <BoxModal
          box={newBoxOpened ? EMPTY_BOX : undefined}
          opened={newBoxOpened}
          onClose={() => setNewBoxOpened(false)}
          onSubmit={(box) => {
            onBoxCreate(box);
            setNewBoxOpened(false);
          }}
          title="Create Box"
        />
        <DeleteConfirmationModal
          opened={refDeleteBoxIdx !== undefined}
          onClose={() => setRefDeleteBoxIdx(undefined)}
          onDelete={() => {
            if (refDeleteBoxIdx === undefined) return;
            onBoxDelete(refDeleteBoxIdx);
            setRefDeleteBoxIdx(undefined);
          }}
          title="Delete Box"
        >
          Are you sure you want to delete this box?
        </DeleteConfirmationModal>
        <CSVImportModal
          opened={boxImportOpened}
          onClose={() => setBoxImportOpened(false)}
          title="Import Boxes"
          onSubmit={bulkImportBoxes}
          onValidate={validateBoxData}
        />
      </Paper>
    </>
  );
};

export default BoxSetup;
