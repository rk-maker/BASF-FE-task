import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { themeAlpine } from "ag-grid-community";
import BaseGrid from "@/components/grid";
import type { Transaction } from "../types";

interface Props {
  rows: Transaction[];
}

export default function TransactionsGrid({ rows }: Props) {
  const columnDefs = useMemo<ColDef<Transaction>[]>(
    () => [
      { field: "id", headerName: "ID", width: 220 },
      { field: "timestamp", headerName: "Time", flex: 1 },
      {
        field: "amount",
        headerName: "Amount",
        sortable: false,
        width: 120,
      },
      { field: "items", headerName: "Items", width: 100 },
      {
        field: "paymentMethod",
        headerName: "Payment",
        width: 130,
        cellRenderer: (p: any) => {
          const colors: Record<string, string> = {
            card: "#2f54eb",
            mobile: "#08979c",
            cash: "#d48806",
          };
          return <span style={{ color: colors[p.value] }}>{p.value}</span>;
        },
      },
    ],
    [],
  );

  return (
    <BaseGrid<Transaction>
      rows={rows}
      columnDefs={columnDefs}
      theme={themeAlpine}
      height={420}
      defaultColDef={{ sortable: true, resizable: true }}
    />
  );
}
