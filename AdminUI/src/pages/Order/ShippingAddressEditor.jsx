import { useEffect, useState } from "react";

import { adminOrderService } from "../../services/adminOrderService";

const FIELDS = [
  ["name", "Name"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["division", "Division"],
  ["district", "District"],
  ["area", "Area"],
  ["address", "Address"],
];

const PANEL_WIDTH = 320;
const EDGE_GAP = 12;

const toForm = (source) =>
  FIELDS.reduce((form, [key]) => ({ ...form, [key]: source?.[key] || "" }), {});

const sameAddress = (a, b) =>
  FIELDS.every(([key]) => (a?.[key] || "") === (b?.[key] || ""));

export default function ShippingAddressEditor({
  order,
  anchor,
  onClose,
  onOrderUpdated,
}) {
  const active = order.shippingAddress;

  // Orders never edited have an empty address book — show the current
  // address as "Address 1" so there is always something to choose from.
  const list = order.addressBook?.length
    ? order.addressBook
    : [{ _id: "current", ...active }];

  const activeId = (list.find((entry) => sameAddress(entry, active)) || list[0])._id;

  const [form, setForm] = useState(() => toForm(active));
  const [newForm, setNewForm] = useState(() => toForm());
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(activeId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const run = async (action) => {
    setBusy(true);
    setError("");

    try {
      const res = await action();
      onOrderUpdated(res.data);
      return true;
    } catch (err) {
      setError(err.message || "Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = () =>
    run(() => adminOrderService.updateAddress(order._id, form));

  const handleAdd = async () => {
    const added = await run(() => adminOrderService.addAddress(order._id, newForm));

    if (added) {
      setNewForm(toForm());
      setShowAdd(false);
    }
  };

  const handleSelect = () => {
    if (selectedId === activeId || selectedId === "current") return;
    run(() => adminOrderService.selectAddress(order._id, selectedId));
  };

  const left = Math.max(
    EDGE_GAP,
    Math.min(anchor.left, window.innerWidth - PANEL_WIDTH - EDGE_GAP)
  );
  const top = anchor.bottom + 6;

  return (
    <>
      <div className="addr-backdrop" onClick={onClose} />

      <div
        className="addr-panel"
        style={{
          top,
          left,
          width: PANEL_WIDTH,
          maxHeight: window.innerHeight - top - EDGE_GAP,
        }}
        role="dialog"
        aria-label="Edit shipping address"
      >
        <AddressFields fields={form} onChange={setForm} disabled={busy} />

        <div className="addr-actions">
          <button
            type="button"
            className="addr-btn addr-btn-select"
            onClick={handleSelect}
            disabled={busy || selectedId === activeId}
          >
            Select
          </button>
          <button
            type="button"
            className="addr-btn addr-btn-outline"
            onClick={() => setShowAdd((open) => !open)}
            disabled={busy}
          >
            Add New Address
          </button>
          <button
            type="button"
            className="addr-btn addr-btn-dark"
            onClick={handleUpdate}
            disabled={busy}
          >
            Update
          </button>
        </div>

        {error && <p className="addr-error">{error}</p>}

        {showAdd && (
          <div className="addr-section">
            <h4 className="addr-heading">Add New Address</h4>
            <AddressFields fields={newForm} onChange={setNewForm} disabled={busy} />
            <div className="addr-add-row">
              <button
                type="button"
                className="addr-btn addr-btn-dark"
                onClick={handleAdd}
                disabled={busy}
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="addr-list">
          {list.map((entry, index) => (
            <label key={entry._id} className="addr-item">
              <input
                type="checkbox"
                checked={selectedId === entry._id}
                onChange={() => setSelectedId(entry._id)}
                disabled={busy}
              />
              <div>
                <div className="addr-item-title">
                  Address {index + 1}
                  {entry._id === activeId && (
                    <span className="addr-current"> · current</span>
                  )}
                </div>
                <div>{entry.name}</div>
                <div>Call: {entry.phone}</div>
                <div>
                  {entry.address}, {entry.area}, {entry.district}, {entry.division}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

function AddressFields({ fields, onChange, disabled }) {
  return (
    <div className="addr-fields">
      {FIELDS.map(([key, label]) => (
        <label key={key} className="addr-field">
          <span>{label}:</span>
          <input
            type="text"
            value={fields[key]}
            disabled={disabled}
            onChange={(e) => onChange({ ...fields, [key]: e.target.value })}
          />
        </label>
      ))}
    </div>
  );
}
