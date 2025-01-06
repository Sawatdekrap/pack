import { useAtom } from "jotai";
import { itemGroupsAtom } from "./atoms";
import { useState } from "react";
import { ItemGroupItf } from "./interfaces";
import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  NumberInput,
  Paper,
  Title,
} from "@mantine/core";
import {
  IconEdit,
  IconFileTypeCsv,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import CustomTable from "./components/CustomTable";
import { EMPTY_ITEM_GROUP } from "./data";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import ItemModal from "./components/ItemModal";
import CSVImportModal from "./components/CSVImportModal";

interface ItemInline {
  name: string;
  length: number;
  width: number;
  depth: number;
  quantity?: number;
}

const ItemSetup = () => {
  const [itemGroups, setItemGroups] = useAtom(itemGroupsAtom);
  const [refItemIdx, setRefItemIdx] = useState<number | undefined>();
  const [newItemOpened, setNewItemOpened] = useState(false);
  const [refDeleteItemIdx, setRefDeleteItemIdx] = useState<
    number | undefined
  >();
  const [itemImportOpened, setItemImportOpened] = useState(false);

  const onItemEdit = (itemIdx: number, ig: ItemGroupItf) => {
    const newItems = [...itemGroups];
    newItems[itemIdx] = { ...ig };
    setItemGroups(newItems);
  };

  const onItemCreate = (ig: ItemGroupItf) => {
    const newItemGroups = [...itemGroups, ig];
    setItemGroups(newItemGroups);
  };

  const onItemDelete = (igIdx: number) => {
    const newItemGroups = [...itemGroups];
    newItemGroups.splice(igIdx, 1);
    setItemGroups(newItemGroups);
  };

  const setItemQuantity = (itemIdx: number, quantity: number) => {
    const newItems = [...itemGroups];
    newItems[itemIdx] = { ...newItems[itemIdx], quantity };
    setItemGroups(newItems);
  };

  const bulkImportItems = (rows: ItemInline[]) => {
    setItemGroups(
      rows.map((r) => ({
        item: {
          name: r.name,
          dimensions: {
            length: r.length,
            width: r.width,
            depth: r.depth,
          },
        },
        quantity: r.quantity === undefined ? 1 : r.quantity,
      }))
    );
  };

  const itemData = itemGroups.map((i, igIdx) => ({
    name: i.item.name,
    length: i.item.dimensions.length,
    width: i.item.dimensions.width,
    depth: i.item.dimensions.depth,
    quantity: (
      <NumberInput
        value={i.quantity}
        onChange={(val) =>
          setItemQuantity(igIdx, typeof val === "string" ? 0 : val)
        }
        min={0}
      />
    ),
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
        <ActionIcon
          variant="subtle"
          onClick={() => setRefDeleteItemIdx(igIdx)}
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
          Items
        </Title>
        <Button
          variant="transparent"
          leftSection={<IconFileTypeCsv />}
          onClick={() => setItemImportOpened(true)}
        >
          Import CSV
        </Button>
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
        <DeleteConfirmationModal
          opened={refDeleteItemIdx !== undefined}
          onClose={() => setRefDeleteItemIdx(undefined)}
          onDelete={() => {
            if (refDeleteItemIdx === undefined) return;
            onItemDelete(refDeleteItemIdx);
            setRefDeleteItemIdx(undefined);
          }}
          title="Delete Item"
        >
          Are you sure you want to delete this item?
        </DeleteConfirmationModal>
        <CSVImportModal
          opened={itemImportOpened}
          onClose={() => setItemImportOpened(false)}
          title="Import Items"
          onSubmit={bulkImportItems}
        />
      </Paper>
    </>
  );
};

export default ItemSetup;
