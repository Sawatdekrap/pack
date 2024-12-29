import React from "react";
import {
  ActionIcon,
  AppShell,
  Button,
  Container,
  Grid,
  GridCol,
  Group,
  Paper,
  Slider,
  Stack,
  Switch,
  Title,
} from "@mantine/core";
import {
  IconCaretLeft,
  IconCaretRight,
  IconChevronLeftPipe,
  IconChevronRightPipe,
  IconEdit,
  IconPackages,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import CustomTable from "./components/CustomTable";
import { useAtom } from "jotai";
import { boxesAtom, itemGroupsAtom, packedBoxesAtom } from "./atoms";
import { pack } from "./algo/pack";
import { ItemGroupItf, PackedBoxItf } from "./interfaces";
import { PackedBoxProvider, usePackedBox } from "./contexts/PackedBoxContext";

interface PackedBoxProps {
  packedBox: PackedBoxItf;
}

const PackedBox = ({ packedBox }: PackedBoxProps) => {
  const { currentItemGroups, step, setStep } = usePackedBox();
  const tableData = currentItemGroups.map((ig) => ({
    name: ig.item.name,
    quantity: ig.quantity,
  }));

  return (
    <Paper mt={"sm"}>
      <Stack>
        <div>Preview...</div>

        <Group display={"flex"}>
          <ActionIcon onClick={() => setStep(step - 1)} variant="transparent">
            <IconCaretLeft />
          </ActionIcon>
          <Slider
            flex={"auto"}
            min={0}
            max={packedBox.packedItems.length}
            value={step}
            onChange={setStep}
          />
          <ActionIcon onClick={() => setStep(step + 1)} variant="transparent">
            <IconCaretRight />
          </ActionIcon>
        </Group>
        <CustomTable
          columns={[
            { key: "name", title: "Name" },
            { key: "quantity", title: "quantity" },
          ]}
          data={tableData}
        />
      </Stack>
    </Paper>
  );
};

const App = () => {
  const [boxes, setBoxes] = useAtom(boxesAtom);
  const [itemGroups, setItemGroups] = useAtom(itemGroupsAtom);
  const [packedBoxes, setPackedBoxes] = useAtom(packedBoxesAtom);

  const onPack = () => {
    if (boxes.length === 0 || itemGroups.length === 0) return;
    setPackedBoxes(
      pack(
        boxes.filter((b) => b.enabled),
        itemGroups,
        1.1
      )
    );
  };

  const boxData = boxes.map((b) => ({
    name: b.name,
    length: b.dimensions.length,
    width: b.dimensions.width,
    depth: b.dimensions.depth,
    enabled: <Switch checked={b.enabled} />,
    actions: (
      <>
        <ActionIcon variant="subtle" onClick={() => {}}>
          <IconEdit />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => {}} color="red">
          <IconTrash />
        </ActionIcon>
      </>
    ),
  }));

  const itemData = itemGroups.map((i) => ({
    name: i.item.name,
    length: i.item.dimensions.length,
    width: i.item.dimensions.width,
    depth: i.item.dimensions.depth,
    quantity: i.quantity,
    actions: (
      <>
        <ActionIcon variant="subtle" onClick={() => {}}>
          <IconEdit />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => {}} color="red">
          <IconTrash />
        </ActionIcon>
      </>
    ),
  }));

  return (
    <AppShell header={{ height: 60 }} padding={"md"} bg={"#fff8f0"}>
      <AppShell.Header>
        <Title unselectable="on" ml={"sm"}>
          Pack
        </Title>
      </AppShell.Header>
      <AppShell.Main>
        <Container>
          <Title>Boxes</Title>
          <Paper mt={"sm"}>
            <CustomTable
              columns={[
                { key: "name", title: "Name" },
                { key: "length", title: "Length" },
                { key: "width", title: "Width" },
                { key: "depth", title: "Depth" },
                { key: "enabled", title: "Enabled", width: "80px" },
                { key: "actions", title: "", width: "100px" },
              ]}
              data={boxData}
            />
            <Button variant="subtle" size="small" leftSection={<IconPlus />}>
              New Box
            </Button>
          </Paper>
          <Title>Items</Title>
          <Paper mt={"sm"}>
            <CustomTable
              columns={[
                { key: "name", title: "Name" },
                { key: "length", title: "Length" },
                { key: "width", title: "Width" },
                { key: "depth", title: "Depth" },
                { key: "quantity", title: "Qty", width: "80px" },
                { key: "actions", title: "", width: "100px" },
              ]}
              data={itemData}
            />
            <Button variant="subtle" size="small" leftSection={<IconPlus />}>
              New Item
            </Button>
          </Paper>
          <Button
            size="xl"
            radius="xl"
            leftSection={<IconPackages />}
            onClick={onPack}
            my={"md"}
          >
            Pack
          </Button>
          <Grid>
            <GridCol span={6}>Boxes used</GridCol>
            <GridCol span={6}>% Space used</GridCol>
          </Grid>
          {!packedBoxes ? (
            <div>Awaiting preview...</div>
          ) : (
            packedBoxes.map((pb, pbIdx) => (
              <PackedBoxProvider packedBox={pb}>
                <PackedBox key={pbIdx} packedBox={pb} />
              </PackedBoxProvider>
            ))
          )}
        </Container>
      </AppShell.Main>
      <AppShell.Footer p="md">Footer...</AppShell.Footer>
    </AppShell>
  );
};

export default App;
