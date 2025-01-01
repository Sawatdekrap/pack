import React, { useState } from "react";
import {
  ActionIcon,
  AppShell,
  Button,
  ColorSwatch,
  Container,
  FileButton,
  Grid,
  GridCol,
  Group,
  NumberInput,
  Paper,
  Slider,
  Stack,
  Switch,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconCaretLeft,
  IconCaretRight,
  IconEdit,
  IconFileTypeCsv,
  IconPackage,
  IconPackages,
  IconPercentage70,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import CustomTable from "./components/CustomTable";
import { useAtom } from "jotai";
import { boxesAtom, itemGroupsAtom, packedBoxesAtom } from "./atoms";
import { pack } from "./algo/pack";
import { BoxItf, ItemGroupItf, PackedBoxItf } from "./interfaces";
import { PackedBoxProvider, usePackedBox } from "./contexts/PackedBoxContext";
import PackedBoxPreview from "./components/PackedBoxPreview";
import { colorFromString } from "./components/PackedBoxPreview/helpers";
import BoxModal from "./components/BoxModal";
import ItemModal from "./components/ItemModal";
import { EMPTY_BOX, EMPTY_ITEM_GROUP } from "./data";

interface PackedBoxProps {
  packedBox: PackedBoxItf;
}

const PackedBox = ({ packedBox }: PackedBoxProps) => {
  const { currentItemGroups, step, totalSteps, setStep } = usePackedBox();
  const tableData = currentItemGroups.map((ig) => ({
    color: <ColorSwatch color={colorFromString(ig.item.name)} />,
    name: ig.item.name,
    quantity: ig.quantity,
  }));

  return (
    <Paper mt={"md"} shadow="sm">
      <Stack>
        <PackedBoxPreview />

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
        <CustomTable
          columns={[
            { key: "color", title: "" },
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
  const [refBoxIdx, setRefBoxIdx] = useState<number | undefined>();
  const [refItemIdx, setRefItemIdx] = useState<number | undefined>();
  const [newBoxOpened, setNewBoxOpened] = useState(false);
  const [newItemOpened, setNewItemOpened] = useState(false);

  const onBoxEdit = (boxIdx: number, box: BoxItf) => {
    const newBoxes = [...boxes];
    newBoxes[boxIdx] = { ...box };
    setBoxes(newBoxes);
  };

  const onBoxCreate = (box: BoxItf) => {
    const newBoxes = [...boxes, box];
    setBoxes(newBoxes);
  };

  const onItemEdit = (itemIdx: number, ig: ItemGroupItf) => {
    const newItems = [...itemGroups];
    newItems[itemIdx] = { ...ig };
    setItemGroups(newItems);
  };

  const onItemCreate = (ig: ItemGroupItf) => {
    const newItemGroups = [...itemGroups, ig];
    setItemGroups(newItemGroups);
  };

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

  const onBoxesFileChange = (f: File | null) => {};

  const onItemsFileChange = (f: File | null) => {};

  const boxData = boxes.map((b, bIdx) => ({
    name: b.name,
    length: b.dimensions.length,
    width: b.dimensions.width,
    depth: b.dimensions.depth,
    enabled: <Switch checked={b.enabled} />,
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
        <ActionIcon variant="subtle" onClick={() => {}} color="red">
          <IconTrash />
        </ActionIcon>
      </>
    ),
  }));

  const itemData = itemGroups.map((i, igIdx) => ({
    name: i.item.name,
    length: i.item.dimensions.length,
    width: i.item.dimensions.width,
    depth: i.item.dimensions.depth,
    quantity: <NumberInput value={i.quantity} onChange={() => {}} />,
    actions: (
      <>
        <ActionIcon
          variant="subtle"
          onClick={() => {
            setRefItemIdx(igIdx);
          }}
        >
          <IconEdit />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => {}} color="red">
          <IconTrash />
        </ActionIcon>
      </>
    ),
  }));

  return (
    <AppShell header={{ height: 60 }} mih={"100vh"} padding={"md"}>
      <AppShell.Header>
        <Title unselectable="on" ml={"lg"}>
          Pack
        </Title>
      </AppShell.Header>
      <AppShell.Main>
        <Container>
          <Group display={"flex"} align="flex-end" mt={"md"}>
            <Title flex={"auto"}>Boxes</Title>
            <FileButton onChange={onBoxesFileChange}>
              {(props) => (
                <Button
                  {...props}
                  variant="transparent"
                  leftSection={<IconFileTypeCsv />}
                >
                  Upload CSV
                </Button>
              )}
            </FileButton>
          </Group>

          <Paper shadow="sm">
            <CustomTable
              columns={[
                { key: "name", title: "Name" },
                { key: "length", title: "Length", width: "100px" },
                { key: "width", title: "Width", width: "100px" },
                { key: "depth", title: "Depth", width: "100px" },
                { key: "enabled", title: "Enabled", width: "80px" },
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
          </Paper>
          <Group display={"flex"} align="flex-end" mt={"md"}>
            <Title flex={"auto"}>Items</Title>
            <FileButton onChange={onItemsFileChange}>
              {(props) => (
                <Button
                  {...props}
                  variant="transparent"
                  leftSection={<IconFileTypeCsv />}
                >
                  Upload CSV
                </Button>
              )}
            </FileButton>
          </Group>

          <Paper shadow="sm">
            <CustomTable
              columns={[
                { key: "name", title: "Name" },
                { key: "length", title: "Length", width: "100px" },
                { key: "width", title: "Width", width: "100px" },
                { key: "depth", title: "Depth", width: "100px" },
                { key: "quantity", title: "Qty", width: "100px" },
                { key: "actions", title: "", width: "80px" },
              ]}
              data={itemData}
            />
            <Button
              variant="subtle"
              size="small"
              leftSection={<IconPlus />}
              onClick={() => setNewItemOpened(true)}
            >
              New Item
            </Button>
            <ItemModal
              ig={refItemIdx === undefined ? undefined : itemGroups[refItemIdx]}
              opened={refItemIdx !== undefined}
              onClose={() => setRefItemIdx(undefined)}
              onSubmit={(ig) => {
                if (refItemIdx === undefined) return;
                onItemEdit(refItemIdx, ig);
                setRefItemIdx(undefined);
              }}
              title="Edit Item"
            />
            <ItemModal
              ig={newItemOpened ? EMPTY_ITEM_GROUP : undefined}
              opened={newItemOpened}
              onClose={() => setNewItemOpened(false)}
              onSubmit={(ig) => {
                onItemCreate(ig);
                setNewItemOpened(false);
              }}
              title="Create Item"
            />
          </Paper>
          <Group display={"flex"} justify="center">
            <Button
              size="xl"
              radius="xl"
              leftSection={<IconPackages />}
              onClick={onPack}
              my={"md"}
            >
              Pack
            </Button>
          </Group>
          {packedBoxes.length === 0 ? (
            <div>Awaiting preview...</div>
          ) : (
            <>
              <Grid mt={"md"}>
                <GridCol span={6}>
                  <Paper shadow="sm" p="sm" maw={"200px"} m={"auto"}>
                    <Title order={4}>Boxes used</Title>
                    <Title order={1} ta={"center"}>
                      <ThemeIcon variant="white" size={"xl"}>
                        <IconPackage />
                      </ThemeIcon>
                      {packedBoxes.length}
                    </Title>
                  </Paper>
                </GridCol>
                <GridCol span={6}>
                  <Paper shadow="sm" p="sm" maw={"200px"} m={"auto"}>
                    <Title order={4}>Space used</Title>
                    <Title order={1} ta={"center"}>
                      <ThemeIcon variant="white" size={"xl"}>
                        <IconPercentage70 />
                      </ThemeIcon>
                      70%
                    </Title>
                  </Paper>
                </GridCol>
              </Grid>
              {packedBoxes.map((pb, pbIdx) => (
                <PackedBoxProvider packedBox={pb}>
                  <PackedBox key={pbIdx} packedBox={pb} />
                </PackedBoxProvider>
              ))}
            </>
          )}
        </Container>
      </AppShell.Main>
      <AppShell.Footer p="md">Footer...</AppShell.Footer>
    </AppShell>
  );
};

export default App;
