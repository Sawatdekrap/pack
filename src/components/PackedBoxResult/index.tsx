import { PackedBoxItf } from "../../interfaces";
import PackedBoxPreview from "../PackedBoxPreview";
import PackedBoxModal from "../PackedBoxModal";
import CustomTable from "../CustomTable";
import { ColorSwatch, Stack, Title, Paper, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { usePackedBox } from "../../contexts/PackedBoxContext";
import { colorFromString } from "../PackedBoxPreview/helpers";
import { useMemo } from "react";

interface PackedBoxProps {
  packedBox: PackedBoxItf;
}

const PackedBoxResult = ({ packedBox }: PackedBoxProps) => {
  const mobile = useMediaQuery("(max-width: 375px)");

  const { currentItemGroups, stepItemGroups } = usePackedBox();
  const tableData = useMemo(() => {
    const newTableData = currentItemGroups.map((ig) => {
      const matchingIg = stepItemGroups.find(
        (sig) => ig.item.name === sig.item.name,
      );
      const fw = matchingIg ? "bold" : "normal";
      const qtyLabel = matchingIg
        ? `${ig.quantity} (+${matchingIg.quantity})`
        : ig.quantity;
      return {
        sortKey: `${matchingIg ? "0" : "1"}${ig.item.name}`,
        color: <ColorSwatch color={colorFromString(ig.item.name)} />,
        name: <Text fw={fw}>{ig.item.name}</Text>,
        quantity: <Text fw={fw}>{qtyLabel}</Text>,
      };
    });
    newTableData.sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1));
    return newTableData;
  }, [currentItemGroups, stepItemGroups]);

  return (
    <Stack gap={"xs"} mt={"md"}>
      <Title order={2} flex={"auto"}>
        {packedBox.box.name}
      </Title>
      <Paper shadow="sm">
        <Stack gap={"xs"}>
          <PackedBoxPreview size={mobile ? "sm" : "md"} />
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

export default PackedBoxResult;
