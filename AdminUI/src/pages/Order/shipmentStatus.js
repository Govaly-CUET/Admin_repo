export const COURIER_OPTIONS = [{ value: "pathao", label: "Pathao" }];

export const COURIER_LABELS = Object.fromEntries(
  COURIER_OPTIONS.map(({ value, label }) => [value, label])
);

export const SELLER_STATUS_LABELS = {
  waiting: "Waiting",
  accepted: "Accepted",
  packed: "Packed",
  handed_over: "Handed Over",
};

export const SHIPMENT_STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  picked_from_seller: "Picked from Seller",
  in_transit: "In Transit",
  at_delivery_hub: "At Delivery Hub",
  delivered: "Delivered",
  hold: "Hold",
  cancelled: "Cancelled",
};

const BADGE_BY_STATUS = {
  waiting: "admin-badge-warning",
  pending: "admin-badge-warning",
  hold: "admin-badge-warning",
  handed_over: "admin-badge-success",
  picked_from_seller: "admin-badge-success",
  delivered: "admin-badge-success",
  cancelled: "admin-badge-danger",
};

// Anything not listed above is an in-between step — the same calm blue
// the "In Progress" order badge uses.
export const statusBadgeClass = (status) =>
  BADGE_BY_STATUS[status] || "order-badge-progress";

export const formatEventTime = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

// Timeline entries store a status key for seller/shipment events and
// free text for delivery (agent) events.
export const historyLabel = (entry) => {
  if (entry.track === "seller") return SELLER_STATUS_LABELS[entry.status] || entry.status;
  if (entry.track === "shipment") return SHIPMENT_STATUS_LABELS[entry.status] || entry.status;
  return entry.status;
};

export const TRACK_LABELS = {
  seller: "Seller",
  shipment: "Shipment",
  delivery: "Delivery",
};

// "mock" and "sandbox" shipments are never real parcels — say so wherever
// the agent is shown.
export const MODE_LABELS = { mock: "MOCK", sandbox: "SANDBOX" };
