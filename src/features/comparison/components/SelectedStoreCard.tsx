import { CloseOutlined, EnvironmentOutlined } from "@ant-design/icons";
import type { Store } from "@/types";

interface SelectedStoreCardProps {
  store: Store;
  onRemove: (storeId: string) => void;
  canRemove: boolean;
}

export default function SelectedStoreCard({
  store,
  onRemove,
  canRemove,
}: SelectedStoreCardProps) {
  return (
    <div className="selected-store-card">
      <button
        type="button"
        className="store-card-close"
        onClick={() => onRemove(store.id)}
        aria-label={canRemove ? `Remove ${store.name}` : undefined}
        disabled={!canRemove}
        title={!canRemove ? "At least 2 stores required" : undefined}
      >
        {/* antd icon components take a `style`, not a `size` prop — the
            original `size={16}` on these two icons was silently ignored. */}
        <CloseOutlined style={{ fontSize: 16 }} />
      </button>

      <h3 className="store-card-name">{store.name}</h3>

      <div className="store-card-location">
        <EnvironmentOutlined style={{ fontSize: 16 }} />
        <div>
          <div className="store-card-city">{store.city}</div>
          <div className="store-card-region">{store.region} Region</div>
        </div>
      </div>

      <div className="store-card-opened">
        <span>Opened at</span>
        <strong>
          {store.openedAt ? new Date(store.openedAt).toLocaleDateString() : "—"}
        </strong>
      </div>
    </div>
  );
}
