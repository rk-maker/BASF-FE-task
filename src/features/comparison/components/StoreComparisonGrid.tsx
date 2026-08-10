import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { GridReadyEvent } from "ag-grid-community";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
} from "ag-grid-community";
import type { ComparisonRow } from "../types";
import "../comparison.scss";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  rows: ComparisonRow[];
  onGridReady: (event: GridReadyEvent) => void;
}

export default function StoreComparisonGrid({ rows, onGridReady }: Props) {
  const columnDefs = useMemo(
    () => [
      { field: "storeName", headerName: "Store", flex: 1, minWidth: 200 },
      { field: "region", headerName: "Region", width: 120 },
      {
        field: "totalRevenue",
        headerName: "Revenue",
        width: 140,
        valueFormatter: (params: any) => `€${params.value.toFixed(2)}`,
      },
      { field: "totalTransactions", headerName: "Transactions", width: 130 },
      {
        field: "avgBasket",
        headerName: "Avg basket",
        width: 140,
        valueFormatter: (params: any) => `€${params.value.toFixed(2)}`,
      },
      {
        field: "changePct",
        headerName: "% change",
        width: 140,
        valueGetter: (params: any) => params.data.changePct,
        valueFormatter: (params: any) => {
          if (params.value === undefined || params.value === null) return "N/A";
          return `${params.value >= 0 ? "+" : ""}${params.value.toFixed(1)}%`;
        },
        cellRenderer: (params: any) => {
          if (params.value === undefined || params.value === null) return "N/A";
          const arrow = params.value >= 0 ? "↑" : "↓";
          const color = params.value >= 0 ? "#389e0d" : "#cf1322";
          return (
            <span style={{ color, fontWeight: 600 }}>
              {arrow} {Math.abs(params.value).toFixed(1)}%
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <AgGridReact<ComparisonRow>
        rowData={rows}
        theme={themeQuartz}
        columnDefs={columnDefs}
        domLayout="autoHeight"
        defaultColDef={{
          sortable: true,
          filter: true,
          flex: 1,
          // resizable: true,
          // minWidth: 100,
        }}
        onGridReady={onGridReady}
      />
    </div>
  );
}
