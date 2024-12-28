import { Table } from "@mantine/core";

interface ColumnItf {
  key: string;
  title: string;
  width?: string;
}

interface CustomTableProps {
  columns: ColumnItf[];
  data: any[];
  emptyElement?: React.ReactNode;
}

const CustomTable = ({ columns, data, emptyElement }: CustomTableProps) => {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          {columns.map((c) => (
            <Table.Th key={c.key} w={c.width}>
              {c.title}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((row) => (
          <Table.Tr>
            {columns.map((c) => (
              <Table.Th>{row[c.key]}</Table.Th>
            ))}
          </Table.Tr>
        ))}
        {data.length === 0 && emptyElement}
      </Table.Tbody>
    </Table>
  );
};

export default CustomTable;
