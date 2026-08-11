import { List, Modal, Button } from "antd";
const MAX_STORES = 5;
import type { Store } from "@/types";
interface AddStoreModalProps {
  open: boolean;
  stores: Store[];
  selectedStoreIds: string[];
  onAdd: (storeId: string) => void;
  onClose: () => void;
}

export default function AddStoreModal({
  open,
  stores,
  selectedStoreIds,
  onAdd,
  onClose,
}: AddStoreModalProps) {
  const atLimit = selectedStoreIds.length >= MAX_STORES;

  return (
    <Modal
      title="Add a store"
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
    >
      <List
        className="store-modal-list"
        dataSource={stores}
        renderItem={(store) => {
          const isSelected = selectedStoreIds.includes(store.id);
          const disabled = isSelected || atLimit;

          return (
            <List.Item
              key={store.id}
              className="store-modal-item"
              onClick={() => !disabled && onAdd(store.id)}
            >
              <List.Item.Meta
                title={store.name}
                description={`${store.city} • ${store.region}`}
              />
              <Button
                type={isSelected ? "default" : "primary"}
                disabled={disabled}
              >
                {isSelected ? "Selected" : atLimit ? "Max 5" : "Add"}
              </Button>
            </List.Item>
          );
        }}
      />
    </Modal>
  );
}
