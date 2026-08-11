import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent } from "ag-grid-community";
import { themeQuartz, type Theme } from "ag-grid-community";

interface BaseGridProps<T> {
  rows: T[];
  columnDefs: ColDef<T>[];
  defaultColDef?: ColDef<T>;
  theme?: Theme;
  domLayout?: "autoHeight" | "normal" | "print";
  height?: number | string;
  className?: string;
  onGridReady?: (event: GridReadyEvent) => void;
}

export default function BaseGrid<T>({
  rows,
  columnDefs,
  defaultColDef = { sortable: true, resizable: true, filter: true, flex: 1 },
  theme = themeQuartz,
  domLayout,
  height = "100%",
  className,
  onGridReady,
}: BaseGridProps<T>) {
  return (
    <div className={className} style={{ width: "100%", height }}>
      <AgGridReact<T>
        rowData={rows}
        theme={theme}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout={domLayout}
        onGridReady={onGridReady}
      />
    </div>
  );
}
