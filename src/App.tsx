import React from "react";
import {
  AppShell,
  Button,
  ColorSwatch,
  Container,
  Grid,
  GridCol,
  Group,
  Image,
  Paper,
  Stack,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconMilk,
  IconPackage,
  IconPackages,
  IconPercentage70,
} from "@tabler/icons-react";
import CustomTable from "./components/CustomTable";
import { useAtom } from "jotai";
import { boxesAtom, itemGroupsAtom, packedBoxesAtom } from "./atoms";
import { pack } from "./algo/pack";
import { PackedBoxItf } from "./interfaces";
import { PackedBoxProvider, usePackedBox } from "./contexts/PackedBoxContext";
import PackedBoxPreview from "./components/PackedBoxPreview";
import { colorFromString } from "./components/PackedBoxPreview/helpers";
import logo from "./boxPackerLogo.svg";
import PackedBoxModal from "./components/PackedBoxModal";
import BoxSetup from "./BoxSetup";
import ItemSetup from "./ItemSetup";

interface PackedBoxProps {
  packedBox: PackedBoxItf;
}

const PackedBox = ({ packedBox }: PackedBoxProps) => {
  const { currentItemGroups } = usePackedBox();
  const tableData = currentItemGroups.map((ig) => ({
    color: <ColorSwatch color={colorFromString(ig.item.name)} />,
    name: ig.item.name,
    quantity: ig.quantity,
  }));

  return (
    <Paper mt={"md"} shadow="sm">
      <Stack>
        <PackedBoxPreview size="sm" />
        <PackedBoxModal />
        <CustomTable
          columns={[
            { key: "color", title: "", width: "43px" },
            { key: "name", title: "Name" },
            { key: "quantity", title: "Quantity", width: "80px" },
          ]}
          data={tableData}
        />
      </Stack>
    </Paper>
  );
};

const App = () => {
  const [boxes, _setBoxes] = useAtom(boxesAtom);
  const [itemGroups, _setItemGroups] = useAtom(itemGroupsAtom);
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

  return (
    <AppShell header={{ height: 60 }} mih={"100vh"} padding={"md"}>
      <AppShell.Header>
        <Group display={"flex"} align="center" h={"100%"}>
          <Image src={logo} alt="logo" w={"200px"} ml={"md"} />
        </Group>
      </AppShell.Header>
      <AppShell.Main bg={"#fdfdfd"}>
        <Container>
          <BoxSetup />
          <ItemSetup />
          <Group display={"flex"} justify="center">
            <Button
              size="xl"
              radius="xl"
              leftSection={<IconPackages />}
              variant="gradient"
              gradient={{ from: "blue", to: "teal", deg: 165 }}
              onClick={onPack}
              mt={"md"}
            >
              Pack
            </Button>
          </Group>
          {packedBoxes.length === 0 ? (
            <div>Awaiting preview...</div>
          ) : (
            <>
              <Grid mt={"md"}>
                <GridCol span={4}>
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
                <GridCol span={4}>
                  <Paper shadow="sm" p="sm" maw={"200px"} m={"auto"}>
                    <Title order={4}>Most Items per Box</Title>
                    <Title order={1} ta={"center"}>
                      <ThemeIcon variant="white" size={"xl"}>
                        <IconMilk />
                      </ThemeIcon>
                      12
                    </Title>
                  </Paper>
                </GridCol>
                <GridCol span={4}>
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
                <PackedBoxProvider key={pbIdx} packedBox={pb}>
                  <PackedBox packedBox={pb} />
                </PackedBoxProvider>
              ))}
            </>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
