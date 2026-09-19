import { useEffect, useState } from "react";

import { adminOrderService } from "../../services/adminOrderService";
import {
  COURIER_OPTIONS,
  MODE_LABELS,
  SELLER_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS,
  TRACK_LABELS,
  formatEventTime,
  historyLabel,
  statusBadgeClass,
} from "./shipmentStatus";

const PANEL_WIDTH = 340;
const EDGE_GAP = 12;

const toForm = (shipment) => ({
  status: shipment.status,
  note: "",
});

const SELLER_STAGES = Object.keys(SELLER_STATUS_LABELS);

export default function ShipmentEditor({ order, anchor, courier, onClose, onOrderUpdated }) {
  const { shipment } = order;
  const [simEvent, setSimEvent] = useState("");

  const [form, setForm] = useState(() => toForm(shipment));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const runAction = async (action, failMessage) => {
    setBusy(true);
    setError("");

    try {
      const res = await action();
      onOrderUpdated(res.data);
    } catch (err) {
      setError(err.message || failMessage);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = () =>
    runAction(
      () => adminOrderService.updateShipment(order._id, { status: form.status, note: form.note }),
      "Failed to update shipment."
    );

  const handleCreate = () =>
    runAction(() => adminOrderService.createShipment(order._id), "Failed to create the courier shipment.");

  const handleSync = () =>
    runAction(() => adminOrderService.syncShipment(order._id), "Failed to sync with the courier.");

  const handleSimulate = () =>
    runAction(
      () => adminOrderService.simulateShipment(order._id, simEvent),
      "Failed to simulate the event."
    );

  // Judged on the saved shipment, not the unsaved form.
  const orderFinished = ["delivered", "canceled"].includes(order.financialStatus);
  const accepted = SELLER_STAGES.indexOf(shipment.sellerStatus) >= SELLER_STAGES.indexOf("accepted");

  let createBlockedReason = "";
  if (!courier) createBlockedReason = "Courier settings are still loading.";
  else if (!courier.configured) createBlockedReason = "Pathao is not configured on the server (keys missing in .env).";
  else if (orderFinished) createBlockedReason = "This order is already finished.";
  else if (shipment.status === "pending") createBlockedReason = "Set the status to Processing first, so the seller can accept the order.";
  else if (!accepted) createBlockedReason = "Waiting for the seller to accept the order.";

  const isMock = shipment.mode === "mock";
  // Set once, together with Processing; after that only the status changes.
  const courierLocked = Boolean(shipment.consignmentId);
  const shownMode = shipment.mode || courier?.mode;

  const left = Math.max(
    EDGE_GAP,
    Math.min(anchor.left, window.innerWidth - PANEL_WIDTH - EDGE_GAP)
  );
  const top = anchor.bottom + 6;

  const timeline = [...shipment.history].reverse();

  return (
    <>
      <div className="addr-backdrop" onClick={onClose} />

      <div
        className="addr-panel ship-panel"
        style={{
          top,
          left,
          width: PANEL_WIDTH,
          maxHeight: window.innerHeight - top - EDGE_GAP,
        }}
        role="dialog"
        aria-label="Update shipment"
      >
        <h4 className="addr-heading">Shipment · {order.orderCode}</h4>

        <div className="addr-fields">
          <div className="addr-field">
            <span>Agent:</span>
            <span>{shipment.courier ? COURIER_OPTIONS[0].label : "Not assigned yet"}</span>
          </div>

          <div className="addr-field">
            <span>Consignment:</span>
            <span>{shipment.consignmentId || "Issued by Pathao"}</span>
          </div>

          <div className="addr-field">
            <span>Seller:</span>
            <span>
              <span className={"admin-badge " + statusBadgeClass(shipment.sellerStatus)}>
                {SELLER_STATUS_LABELS[shipment.sellerStatus]}
              </span>
              <span className="ship-track"> set by the seller</span>
            </span>
          </div>

          <label className="addr-field">
            <span>Shipment:</span>
            <select value={form.status} onChange={setField("status")} disabled={busy}>
              {Object.entries(SHIPMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="addr-field">
            <span>Note:</span>
            <input
              type="text"
              value={form.note}
              onChange={setField("note")}
              disabled={busy}
              placeholder="Optional"
            />
          </label>
        </div>

        <p className="ship-hint">
          {courierLocked
            ? "The agent and tracking ID were issued by Pathao and are locked."
            : "Set Processing first. The agent and tracking ID come from Create Pathao Shipment once the seller accepts."}
        </p>

        <div className="addr-actions">
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

        <div className="ship-courier">
          <h4 className="addr-heading">
            Courier · {COURIER_OPTIONS[0].label}
            {shownMode && (
              <span className={"ship-mode ship-mode-" + shownMode}>{MODE_LABELS[shownMode]}</span>
            )}
          </h4>

          {!shipment.consignmentId ? (
            <>
              <button
                type="button"
                className="addr-btn addr-btn-dark"
                onClick={handleCreate}
                disabled={busy || Boolean(createBlockedReason)}
              >
                Create Pathao Shipment
              </button>
              {createBlockedReason && <p className="ship-hint">{createBlockedReason}</p>}
            </>
          ) : isMock ? (
            <div className="ship-sim">
              <select value={simEvent} onChange={(e) => setSimEvent(e.target.value)} disabled={busy}>
                <option value="">Simulate courier event…</option>
                {(courier?.events || []).map((ev) => (
                  <option key={ev.value} value={ev.value}>
                    {ev.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="addr-btn addr-btn-outline"
                onClick={handleSimulate}
                disabled={busy || !simEvent || courier?.mode !== "mock"}
              >
                Simulate
              </button>
            </div>
          ) : !shipment.mode ? (
            <p className="ship-hint">
              This tracking ID was entered by hand, so Pathao has no record of it and there is
              nothing to sync. Update the status yourself. To get a real Pathao ID, use
              &quot;Create Pathao Shipment&quot; on an order that has no tracking ID yet.
            </p>
          ) : (
            <button
              type="button"
              className="addr-btn addr-btn-outline"
              onClick={handleSync}
              disabled={busy}
            >
              Sync from Pathao
            </button>
          )}

          {shipment.consignmentId && isMock && (
            <p className="ship-hint">
              Mock shipment: no real parcel exists. Simulated events go through the same
              status logic as real Pathao webhooks.
            </p>
          )}
        </div>

        <div className="ship-timeline">
          <h4 className="addr-heading">Timeline</h4>

          {timeline.length === 0 ? (
            <p className="ship-empty">No updates yet.</p>
          ) : (
            timeline.map((entry, index) => (
              <div key={`${entry.at}-${index}`} className="ship-event">
                <span className="ship-dot" />
                <div>
                  <div className="ship-event-title">
                    {entry.track === "delivery" ? (
                      historyLabel(entry)
                    ) : (
                      <span className={"admin-badge " + statusBadgeClass(entry.status)}>
                        {historyLabel(entry)}
                      </span>
                    )}
                    <span className="ship-track"> {TRACK_LABELS[entry.track]}</span>
                  </div>
                  {entry.note && <div className="ship-note">{entry.note}</div>}
                  <div className="ship-time">{formatEventTime(entry.at)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
