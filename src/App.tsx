import React, { useState } from "react";
import {
  AppShell,
  Button,
  ColorSwatch,
  Container,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Space,
  Stack,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconMilk,
  IconPackage,
  IconPackages,
  IconPercentage70,
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import CustomTable from "./components/CustomTable";
import { useAtom } from "jotai";
import { boxesAtom, itemGroupsAtom, packedBoxesAtom } from "./atoms";
import { pack } from "./algo/pack";
import { PackedBoxItf, PackedStats } from "./interfaces";
import { PackedBoxProvider, usePackedBox } from "./contexts/PackedBoxContext";
import PackedBoxPreview from "./components/PackedBoxPreview";
import { colorFromString } from "./components/PackedBoxPreview/helpers";
import logo from "./boxPackerLogo.png";
import PackedBoxModal from "./components/PackedBoxModal";
import BoxSetup from "./BoxSetup";
import ItemSetup from "./ItemSetup";
import { getStats } from "./contexts/PackedBoxContext/helper";
import InfoModal from "./components/InfoModal";

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
    <Stack gap={"xs"} mt={"md"}>
      <Title order={2} flex={"auto"}>
        {packedBox.box.name}
      </Title>
      <Paper shadow="sm">
        <Stack>
          <PackedBoxPreview size="sm" />
          <PackedBoxModal />
          <CustomTable
            columns={[
              { key: "color", title: "", width: "43px" },
              { key: "name", title: "Name" },
              { key: "quantity", title: "Qty", width: "70px" },
            ]}
            data={tableData}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

const App = () => {
  const [boxes] = useAtom(boxesAtom);
  const [itemGroups] = useAtom(itemGroupsAtom);
  const [packedBoxes, setPackedBoxes] = useAtom(packedBoxesAtom);
  const [packedStats, setPackedStats] = useState<PackedStats | undefined>();
  const [infoOpen, setInfoOpen] = useState(false);

  const mobile = useMediaQuery("(max-width: 375px)");

  const onPack = () => {
    if (boxes.length === 0 || itemGroups.length === 0) return;
    const packedBoxes = pack(
      boxes.filter((b) => b.enabled),
      itemGroups,
      1.1
    );
    setPackedBoxes(packedBoxes);
    setPackedStats(getStats(packedBoxes));
  };

  return (
    <AppShell header={{ height: 60 }} mih={"100vh"} padding={"md"}>
      <AppShell.Header>
        <Group
          display={"flex"}
          align="center"
          h={"100%"}
          justify="space-between"
        >
          <Image
            src={logo}
            alt="logo"
            w={mobile ? "130px" : "200px"}
            ml={"md"}
          />
          <Button
            leftSection={<IconInfoCircle />}
            variant="transparent"
            onClick={() => setInfoOpen(true)}
          >
            What is this?
          </Button>
          <InfoModal opened={infoOpen} onClose={() => setInfoOpen(false)} />
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
          {packedBoxes.length > 0 && (
            <>
              {packedStats && (
                <SimpleGrid
                  type="container"
                  cols={{ base: 1, "700px": 3 }}
                  spacing={{ base: 10, "300px": "xl" }}
                  mt={"md"}
                >
                  <Paper shadow="sm" p="sm" w={"200px"} m={"auto"}>
                    <Title order={4}>Boxes used</Title>
                    <Title order={1} ta={"center"}>
                      <ThemeIcon variant="white" size={"xl"}>
                        <IconPackage />
                      </ThemeIcon>
                      {packedStats.totalBoxes}
                    </Title>
                  </Paper>
                  <Paper shadow="sm" p="sm" w={"200px"} m={"auto"}>
                    <Title order={4}>Most Items per Box</Title>
                    <Title order={1} ta={"center"}>
                      <ThemeIcon variant="white" size={"xl"}>
                        <IconMilk />
                      </ThemeIcon>
                      {packedStats.mostItemsPerBox}
                    </Title>
                  </Paper>
                  <Paper shadow="sm" p="sm" w={"200px"} m={"auto"}>
                    <Title order={4}>Space used</Title>
                    <Title order={1} ta={"center"}>
                      <ThemeIcon variant="white" size={"xl"}>
                        <IconPercentage70 />
                      </ThemeIcon>
                      {packedStats.spaceUsed}
                      {" %"}
                    </Title>
                  </Paper>
                </SimpleGrid>
              )}

              {packedBoxes.map((pb, pbIdx) => (
                <PackedBoxProvider key={pbIdx} packedBox={pb}>
                  <PackedBox packedBox={pb} />
                </PackedBoxProvider>
              ))}
              <Space h={"30vh"} />
            </>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
