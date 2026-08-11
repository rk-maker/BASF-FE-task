import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Row,
  Col,
  Spin,
  Typography,
} from "antd";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { loadStores } from "@/features/overview/store/storesSlice";
import StoreRevenueChart from "./components/StoreRevenueChart";
import StoreComparisonGrid from "./components/StoreComparisonGrid";
import SelectedStoreCard from "./components/SelectedStoreCard";
import AddStoreModal from "./components/AddStoreModal";
import {
  RANGE_PRESETS,
  buildDateRange,
  getPreviousRange,
} from "./utils/dateRange";
import {
  buildComparisonRows,
  indexByStoreAndDate,
} from "./utils/buildComparisonRows";
import { useComparisonParams } from "./hooks/useComparisonParams";
import { useComparisonData } from "./hooks/useComparisonData";
import "./comparison.scss";

const { RangePicker } = DatePicker;
const MAX_STORES = 5;
const MIN_STORES = 2;

export default function StoreComparisonPage() {
  const dispatch = useDispatch<AppDispatch>();
  const stores = useSelector((s: RootState) => s.stores.items);
  const [gridApi, setGridApi] = useState<any>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectionError, setSelectionError] = useState<string | undefined>();

  const {
    selectedStoreIds,
    selectedRange,
    validSelection,
    setStoreIds,
    setRange,
  } = useComparisonParams(stores);

  const { revenueData, previousRevenueData, loading, error } =
    useComparisonData(selectedStoreIds, selectedRange, validSelection);

  useEffect(() => {
    dispatch(loadStores());
  }, [dispatch]);

  const dates = useMemo(
    () => buildDateRange(...selectedRange),
    [selectedRange],
  );
  const previousRange = useMemo(
    () => getPreviousRange(selectedRange),
    [selectedRange],
  );
  const previousDates = useMemo(
    () => buildDateRange(...previousRange),
    [previousRange],
  );
  const revenueMap = useMemo(
    () => indexByStoreAndDate(revenueData),
    [revenueData],
  );

  const chartSeries = useMemo(
    () =>
      selectedStoreIds.map((storeId) => {
        const store = stores.find((item) => item.id === storeId);
        return {
          storeId,
          storeName: store?.name ?? storeId,
          points: dates.map((date) => ({
            date,
            revenue: revenueMap.get(`${storeId}|${date}`)?.revenue ?? 0,
          })),
        };
      }),
    [dates, revenueMap, selectedStoreIds, stores],
  );

  const summaryRows = useMemo(
    () =>
      buildComparisonRows({
        storeIds: selectedStoreIds,
        stores,
        dates,
        revenueData,
        previousDates,
        previousRevenueData,
      }),
    [
      selectedStoreIds,
      stores,
      dates,
      revenueData,
      previousDates,
      previousRevenueData,
    ],
  );

  // Resolved Store objects for the selected ids, in selection order, with
  // any not-yet-loaded ids dropped (rather than rendering a card with
  // undefined fields).
  const selectedStores = selectedStoreIds
    .map((id) => stores.find((store) => store.id === id))
    .filter((store): store is NonNullable<typeof store> => Boolean(store));
  const canRemoveStore = selectedStoreIds.length > MIN_STORES;
  const handleAddStore = (storeId: string) => {
    if (selectedStoreIds.length >= MAX_STORES) {
      setSelectionError(`You can compare up to ${MAX_STORES} stores at once.`);
      return;
    }
    setSelectionError(undefined);
    setStoreIds(Array.from(new Set([...selectedStoreIds, storeId])));
    setIsStoreModalOpen(false);
  };

  const handleRemoveStore = (storeId: string) => {
    if (selectedStoreIds.length <= MIN_STORES) return;
    setStoreIds(selectedStoreIds.filter((id) => id !== storeId));
  };

  const downloadCsv = () => {
    gridApi?.exportDataAsCsv({ fileName: "store-comparison.csv" });
  };

  const isReady = validSelection && !loading && !error;
  const displayError = selectionError ?? error;

  return (
    <div className="comparison">
      <div className="comparison-header-row">
        <div className="comparison-header-left">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            className="add-store-button"
            onClick={() => {
              setSelectionError(undefined);
              setIsStoreModalOpen(true);
            }}
          />

          <div className="heading-block">
            <div className="heading-block-title">
              <div className="page-title">Store Comparison</div>
              <div className="comparison-header-right">
                <RangePicker
                  value={selectedRange}
                  allowClear={false}
                  presets={RANGE_PRESETS}
                  onChange={setRange}
                  style={{ minWidth: 320 }}
                />
              </div>
            </div>
            <div className="selected-stores-row">
              {selectedStores.length ? (
                selectedStores.map((store) => (
                  <SelectedStoreCard
                    key={store.id}
                    store={store}
                    onRemove={handleRemoveStore}
                    canRemove={canRemoveStore}
                  />
                ))
              ) : (
                <Typography.Text type="secondary">
                  No stores selected yet. Tap + to add stores.
                </Typography.Text>
              )}
            </div>
          </div>
        </div>
      </div>

      {displayError && (
        <Alert
          type="error"
          showIcon
          message={displayError}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} className="comparison-actions">
        <Col flex="auto">
          <Typography.Text type="secondary">
            Compare daily revenue for selected stores over the chosen period.
          </Typography.Text>
        </Col>
      </Row>

      <AddStoreModal
        open={isStoreModalOpen}
        stores={stores}
        selectedStoreIds={selectedStoreIds}
        onAdd={handleAddStore}
        onClose={() => setIsStoreModalOpen(false)}
      />

      {!validSelection ? (
        <Card className="empty-state">
          <Typography.Title level={5}>
            Select 2 to 5 stores to compare
          </Typography.Title>
        </Card>
      ) : loading ? (
        <div className="loading-state">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Card title="Revenue comparison" className="chart-card">
            {revenueData.length ? (
              <StoreRevenueChart series={chartSeries} dates={dates} />
            ) : (
              <div className="empty-state">
                <Typography.Text type="secondary">
                  No revenue data available for the selected range.
                </Typography.Text>
              </div>
            )}
          </Card>

          <Card
            title="Store summary"
            className="summary-card"
            extra={
              <Col
                className="download-button-col"
                style={{ justifyContent: "flex-end" }}
              >
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={downloadCsv}
                  disabled={!gridApi || !isReady}
                >
                  Download CSV
                </Button>
              </Col>
            }
          >
            <StoreComparisonGrid
              rows={summaryRows}
              onGridReady={(params) => setGridApi(params.api)}
            />
          </Card>
        </>
      )}
    </div>
  );
}
