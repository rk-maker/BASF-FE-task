import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Input,
  List,
  Modal,
  Row,
  Col,
  Spin,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EnvironmentOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs, { Dayjs } from "dayjs";
import { fetchDailyRevenue } from "@/features/overview/api";
import type { DailyRevenuePoint } from "@/features/overview/types";
import type { AppDispatch, RootState } from "@/store";
import { loadStores } from "@/features/overview/store/storesSlice";
import StoreRevenueChart from "./components/StoreRevenueChart";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./comparison.scss";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
const PRESETS: Array<{ label: string; value: [Dayjs, Dayjs] }> = [
  { label: "Last 7 days", value: [dayjs().subtract(6, "day"), dayjs()] },
  { label: "Last 30 days", value: [dayjs().subtract(29, "day"), dayjs()] },
  { label: "Last 90 days", value: [dayjs().subtract(89, "day"), dayjs()] },
];

const DEFAULT_RANGE: [Dayjs, Dayjs] = [dayjs().subtract(29, "day"), dayjs()];

function normalizeRange(
  from: string | null,
  to: string | null,
): [Dayjs, Dayjs] {
  const parsedFrom = from ? dayjs(from) : null;
  const parsedTo = to ? dayjs(to) : null;

  if (
    parsedFrom?.isValid() &&
    parsedTo?.isValid() &&
    parsedFrom.isSameOrBefore(parsedTo)
  ) {
    return [parsedFrom, parsedTo];
  }

  return DEFAULT_RANGE;
}

function buildDateRange(from: Dayjs, to: Dayjs) {
  const dates: string[] = [];
  let current = from.startOf("day");
  while (current.isSameOrBefore(to, "day")) {
    dates.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }
  return dates;
}

function getPreviousRange([from, to]: [Dayjs, Dayjs]): [Dayjs, Dayjs] {
  const days = to.diff(from, "day") + 1;
  return [from.subtract(days, "day"), from.subtract(1, "day")];
}

export default function StoreComparisonPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const stores = useSelector((s: RootState) => s.stores.items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [revenueData, setRevenueData] = useState<DailyRevenuePoint[]>([]);
  const [previousRevenueData, setPreviousRevenueData] = useState<
    DailyRevenuePoint[]
  >([]);
  const [gridApi, setGridApi] = useState<any>(null);
  const [quickFilter, setQuickFilter] = useState("");
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const queryStoreIds = useMemo(() => {
    const ids = searchParams.get("stores")?.split(",").filter(Boolean) ?? [];
    return Array.from(new Set(ids));
  }, [searchParams]);
  const queryFrom = searchParams.get("from");
  const queryTo = searchParams.get("to");
  const selectedRange = useMemo(
    () => normalizeRange(queryFrom, queryTo),
    [queryFrom, queryTo],
  );
  const selectedStoreIds = useMemo(() => {
    if (!stores.length) return queryStoreIds.slice(0, 5);
    const validStoreIds = queryStoreIds.filter((id) =>
      stores.some((store) => store.id === id),
    );
    if (validStoreIds.length >= 2) {
      return validStoreIds.slice(0, 5);
    }
    return stores.slice(0, 2).map((store) => store.id);
  }, [queryStoreIds, stores]);

  const validSelection =
    selectedStoreIds.length >= 2 && selectedStoreIds.length <= 5;

  useEffect(() => {
    dispatch(loadStores());
  }, [dispatch]);

  useEffect(() => {
    if (!stores.length) return;

    const fixedStoreIds =
      selectedStoreIds.length >= 2
        ? selectedStoreIds
        : stores.slice(0, 2).map((store) => store.id);
    const from = selectedRange[0].format("YYYY-MM-DD");
    const to = selectedRange[1].format("YYYY-MM-DD");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("stores", fixedStoreIds.join(","));
    nextParams.set("from", from);
    nextParams.set("to", to);

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams);
    }
  }, [stores, selectedRange, selectedStoreIds, searchParams, setSearchParams]);

  useEffect(() => {
    if (!validSelection) return;

    setLoading(true);
    setError(undefined);
    const from = selectedRange[0].format("YYYY-MM-DD");
    const to = selectedRange[1].format("YYYY-MM-DD");
    const [prevFrom, prevTo] = getPreviousRange(selectedRange);

    Promise.all([
      fetchDailyRevenue({ storeIds: selectedStoreIds, from, to }),
      fetchDailyRevenue({
        storeIds: selectedStoreIds,
        from: prevFrom.format("YYYY-MM-DD"),
        to: prevTo.format("YYYY-MM-DD"),
      }),
    ])
      .then(([current, previous]) => {
        setRevenueData(current as DailyRevenuePoint[]);
        setPreviousRevenueData(previous as DailyRevenuePoint[]);
      })
      .catch((err) => {
        setError(
          err?.message ||
            "Unable to load store comparison data. Please try again or refresh the page.",
        );
      })
      .finally(() => setLoading(false));
  }, [selectedStoreIds, selectedRange, validSelection]);

  const dates = useMemo(
    () => buildDateRange(selectedRange[0], selectedRange[1]),
    [selectedRange],
  );

  const revenueMap = useMemo(() => {
    const map = new Map<string, DailyRevenuePoint>();
    revenueData.forEach((item) =>
      map.set(`${item.storeId}|${item.date}`, item),
    );
    return map;
  }, [revenueData]);

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

  const handleStoreChange = (value: string[]) => {
    if (value.length > 5) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("stores", value.join(","));
    setSearchParams(nextParams);
  };

  const handleOpenStoreModal = () => {
    setIsStoreModalOpen(true);
  };

  const handleCloseStoreModal = () => {
    setIsStoreModalOpen(false);
  };

  const handleAddStoreFromModal = (storeId: string) => {
    const uniqueIds = Array.from(new Set([...selectedStoreIds, storeId]));
    handleStoreChange(uniqueIds.slice(0, 5));
    setIsStoreModalOpen(false);
  };

  const handleRangeChange = (range: null | [Dayjs, Dayjs]) => {
    if (!range || !range[0] || !range[1]) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("from", range[0].format("YYYY-MM-DD"));
    nextParams.set("to", range[1].format("YYYY-MM-DD"));
    setSearchParams(nextParams);
  };

  const handleQuickFilter = (value: string) => {
    setQuickFilter(value);
    if (gridApi) gridApi.setQuickFilter(value);
  };

  const isReady = validSelection && !loading && !error;

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
            onClick={handleOpenStoreModal}
          />

          <div className="heading-block">
            <div className="heading-block-title">
              <div className="page-title">Store Comparison</div>
              <div className="comparison-header-right">
                <RangePicker
                  value={selectedRange}
                  allowClear={false}
                  presets={PRESETS}
                  onChange={handleRangeChange}
                  style={{ minWidth: 320 }}
                />
              </div>
            </div>
            <div className="selected-stores-row">
              {selectedStoreIds.length ? (
                selectedStoreIds.map((storeId) => {
                  const store = stores.find((item) => item.id === storeId);
                  return (
                    // <div key={storeId} className="selected-store-card">
                    //   {store?.name ?? storeId}
                    //   {"  "}
                    //   {store?.city ?? "North"}
                    // </div>
                    <div className="selected-store-card">
                      {/* Close button */}
                      <button
                        type="button"
                        className="store-card-close"
                        // onClick={() => onRemove(store?.storeId)}
                        aria-label={`Remove ${store?.name}`}
                      >
                        <CloseOutlined size={16} />
                      </button>

                      {/* Store name */}
                      <h3 className="store-card-name">{store?.name}</h3>

                      {/* Location */}
                      <div className="store-card-location">
                        <EnvironmentOutlined size={16} />

                        <div>
                          <div className="store-card-city">{store?.city}</div>

                          <div className="store-card-region">
                            {store?.region} Region
                          </div>
                        </div>
                      </div>

                      {/* Opened at */}
                      <div className="store-card-opened">
                        <span>Opened at</span>

                        <strong>
                          {new Date(store?.openedAt).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>
                  );
                })
              ) : (
                <Typography.Text type="secondary">
                  No stores selected yet. Tap + to add stores.
                </Typography.Text>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
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

      <Modal
        title="Add a store"
        open={isStoreModalOpen}
        onCancel={handleCloseStoreModal}
        footer={null}
        width={520}
      >
        <List
          className="store-modal-list"
          dataSource={stores}
          renderItem={(store) => {
            const isSelected = selectedStoreIds.includes(store.id);
            return (
              <List.Item
                key={store.id}
                className="store-modal-item"
                onClick={() => !isSelected && handleAddStoreFromModal(store.id)}
              >
                <List.Item.Meta
                  title={store.name}
                  description={`${store.city} • ${store.region}`}
                />
                <Button
                  type={isSelected ? "default" : "primary"}
                  disabled={isSelected}
                >
                  {isSelected ? "Selected" : "Add"}
                </Button>
              </List.Item>
            );
          }}
        />
      </Modal>

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
              <Input
                placeholder="Filter table"
                value={quickFilter}
                onChange={(e) => handleQuickFilter(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />
            }
          ></Card>
        </>
      )}
    </div>
  );
}
