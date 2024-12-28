import React, { useState } from "react";
import {
  AppShell,
  Button,
  Container,
  Grid,
  GridCol,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { IconPackages } from "@tabler/icons-react";
import CustomTable from "./components/CustomTable";
import { BoxItf, ItemGroupItf, PackedBoxItf } from "./interfaces";

function App() {
  const [boxes, setBoxes] = useState<BoxItf[]>([]);
  const [itemGroups, setItemGroups] = useState<ItemGroupItf[]>([]);
  const [packedBoxes, setPackedBoxes] = useState<PackedBoxItf[]>([]);

  const boxData = boxes.map((b) => ({
    name: b.name,
    length: b.dimensions.length,
    width: b.dimensions.width,
    depth: b.dimensions.depth,
    enabled: b.enabled,
    actions: <>Actions</>,
  }));

  const itemData = itemGroups.map((i) => ({
    name: i.item.name,
    length: i.item.dimensions.length,
    width: i.item.dimensions.width,
    depth: i.item.dimensions.depth,
    quantity: i.quantity,
    actions: <>Actions</>,
  }));

  return (
    <AppShell header={{ height: 60 }} padding={"md"}>
      <AppShell.Header>
        <Title unselectable="on">Pack</Title>
      </AppShell.Header>
      <AppShell.Main>
        <Container>
          <Title>Boxes</Title>
          <Paper>
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
          </Paper>
          <Title>Items</Title>
          <Paper>
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
          </Paper>
          <Button size="xl" radius="xl" leftSection={<IconPackages />}>
            Pack
          </Button>
          <Grid>
            <GridCol span={6}>Boxes used</GridCol>
            <GridCol span={6}>% Space used</GridCol>
          </Grid>
          {!packedBoxes ? (
            <div>Awaiting preview...</div>
          ) : (
            <Paper>
              <Stack>
                <div>Preview...</div>
                <CustomTable columns={[]} data={[]} />
              </Stack>
            </Paper>
          )}
        </Container>
      </AppShell.Main>
      <AppShell.Footer p="md">Footer...</AppShell.Footer>
    </AppShell>
  );
}

export default App;
