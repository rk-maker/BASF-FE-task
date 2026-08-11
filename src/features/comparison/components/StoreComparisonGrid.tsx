import { useMemo } from "react";
import type { GridReadyEvent, ColDef } from "ag-grid-community";
import { themeQuartz } from "ag-grid-community";
import BaseGrid from "@/components/grid";
import type { ComparisonRow } from "../types";
import "../comparison.scss";

interface Props {
  rows: ComparisonRow[];
  onGridReady: (event: GridReadyEvent) => void;
}

export default function StoreComparisonGrid({ rows, onGridReady }: Props) {
  const columnDefs = useMemo<ColDef<ComparisonRow>[]>(
    () => [
      {
        field: "storeName",
        headerName: "Store",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "region",
        headerName: "Region",
        width: 120,
      },
      {
        field: "totalRevenue",
        headerName: "Revenue",
        width: 140,
        valueFormatter: (params) => `€${params.value?.toFixed(2) ?? "0.00"}`,
      },
      {
        field: "totalTransactions",
        headerName: "Transactions",
        width: 130,
      },
      {
        field: "avgBasket",
        headerName: "Avg basket",
        width: 140,
        valueFormatter: (params) => `€${params.value?.toFixed(2) ?? "0.00"}`,
      },
      {
        field: "changePct",
        headerName: "% change",
        width: 140,
        valueFormatter: (params) => {
          if (params.value == null) return "N/A";
          return `${params.value >= 0 ? "+" : ""}${params.value.toFixed(1)}%`;
        },
        cellRenderer: (params: any) => {
          if (params.value == null) return "N/A";
          const isPositive = params.value >= 0;
          return (
            <span
              style={{
                color: isPositive ? "#389e0d" : "#cf1322",
                fontWeight: 600,
              }}
            >
              {isPositive ? "↑" : "↓"} {Math.abs(params.value).toFixed(1)}%
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <BaseGrid<ComparisonRow>
      rows={rows}
      columnDefs={columnDefs}
      // theme={themeQuartz}
      domLayout="autoHeight"
      defaultColDef={{ sortable: true, filter: true, flex: 1 }}
      onGridReady={onGridReady}
    />
  );
}
