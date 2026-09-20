import { useCallback, useEffect, useRef, useState } from "react";

import { adminOrderService } from "../../services/adminOrderService";
import { sellerService } from "../../services/sellerService";
import ShippingAddressEditor from "./ShippingAddressEditor";
import ShipmentEditor from "./ShipmentEditor";
import {
  COURIER_LABELS,
  SELLER_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS,
  formatEventTime,
  statusBadgeClass,
} from "./shipmentStatus";
import "./Orders.css";

const PAYMENT_LABELS = {
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
};

const PAYMENT_BADGE = {
  pending: "admin-badge-danger",
  paid: "admin-badge-success",
  cancelled: "orders-pay-cancelled",
};

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatAmount = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [addressEditor, setAddressEditor] = useState(null);
  const [shipmentEditor, setShipmentEditor] = useState(null);
  const [courierConfig, setCourierConfig] = useState(null);
  const [paymentBusyId, setPaymentBusyId] = useState(null);

  const [sellers, setSellers] = useState([]);

  const [shipmentFilter, setShipmentFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [seller, setSeller] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [search, setSearch] = useState("");

  const activeRequestRef = useRef(0);

  useEffect(() => {
    adminOrderService
      .courierConfig()
      .then((res) => setCourierConfig(res.data?.pathao || null))
      .catch(() => {
        // Without it the shipment popup just disables "Create shipment".
      });
  }, []);

  useEffect(() => {
    sellerService
      .listApproved()
      .then((res) => setSellers(res.data || []))
      .catch(() => {
        // The Seller filter is a nice-to-have — if it fails, the
        // dropdown just falls back to no options.
      });
  }, []);

  const fetchOrders = useCallback(async () => {
    const requestId = ++activeRequestRef.current;

    setIsLoading(true);
    setError("");

    try {
      const res = await adminOrderService.list({
        shipment: shipmentFilter || undefined,
        payment: paymentFilter || undefined,
        seller: seller || undefined,
        dateStart: dateStart || undefined,
        dateEnd: dateEnd || undefined,
        amountMin: amountMin || undefined,
        amountMax: amountMax || undefined,
        search: search || undefined,
      });

      if (requestId !== activeRequestRef.current) return;

      setOrders(res.data || []);
    } catch (err) {
      if (requestId !== activeRequestRef.current) return;
      setError(err.message || "Failed to load orders.");
    } finally {
      if (requestId === activeRequestRef.current) {
        setIsLoading(false);
      }
    }
  }, [shipmentFilter, paymentFilter, seller, dateStart, dateEnd, amountMin, amountMax, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderUpdated = (updated) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
  };

  const editingOrder = addressEditor
    ? orders.find((o) => o._id === addressEditor.orderId)
    : null;

  const shipmentEditingOrder = shipmentEditor
    ? orders.find((o) => o._id === shipmentEditor.orderId)
    : null;

  const handlePaymentChange = async (orderId, status) => {
    setPaymentBusyId(orderId);
    setError("");

    try {
      const res = await adminOrderService.updatePayment(orderId, status);
      handleOrderUpdated(res.data);
    } catch (err) {
      setError(err.message || "Failed to update the seller payment.");
    } finally {
      setPaymentBusyId(null);
    }
  };

  return (
    <div className="orders-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">
            Track and update every order across all shops.
          </p>
        </div>
      </div>

      <div className="admin-filter-panel">
        <label>
          Shipment:
          <select
            className="admin-select"
            value={shipmentFilter}
            onChange={(e) => setShipmentFilter(e.target.value)}
          >
            <option value="">All</option>
            {Object.entries(SHIPMENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Seller Payment:
          <select
            className="admin-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="not_delivered">Not delivered yet</option>
            {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Seller:
          <select
            className="admin-select"
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
          >
            <option value="">All</option>
            {sellers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.shopName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date:
          <input
            type="date"
            className="admin-input"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
        </label>
        <span className="orders-filter-sep">–</span>
        <input
          type="date"
          className="admin-input"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
        />

        <label>
          Payable:
          <input
            type="number"
            min="0"
            className="admin-input orders-amount-input"
            placeholder="From"
            value={amountMin}
            onChange={(e) => setAmountMin(e.target.value)}
          />
        </label>
        <span className="orders-filter-sep">–</span>
        <input
          type="number"
          min="0"
          className="admin-input orders-amount-input"
          placeholder="To"
          value={amountMax}
          onChange={(e) => setAmountMax(e.target.value)}
        />

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={fetchOrders}
        >
          Filter
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-spacer" />

        <div className="admin-search">
          <input
            type="search"
            className="admin-input"
            placeholder="Search order code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
          />
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={fetchOrders}
        >
          Search
        </button>
      </div>

      {error && <p className="admin-error-text">{error}</p>}

      {isLoading ? (
        <p className="admin-status-text">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="admin-status-text">No orders in this category.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Time</th>
                <th>Seller</th>
                <th>Customer</th>
                <th>Shipping Address</th>
                <th>Products</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>Seller Shipment</th>
                <th>Shipment</th>
                <th>Seller Earning</th>
                <th>Govaly Earning</th>
                <th>Seller Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderCode}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>{order.seller?.shopName || "—"}</td>
                  <td>
                    <div className="orders-customer-name">
                      {order.customer?.name || "—"}
                    </div>
                    <div className="orders-customer-detail">
                      {order.shippingAddress?.phone}
                    </div>
                  </td>
                  <td className="orders-address-cell">
                    <div className="orders-address-wrap">
                      <div>
                        <div className="orders-customer-name">
                          {order.shippingAddress?.name}
                        </div>
                        <div>{order.shippingAddress?.phone}</div>
                        <div>
                          {order.shippingAddress?.address}, {order.shippingAddress?.area},{" "}
                          {order.shippingAddress?.district}, {order.shippingAddress?.division}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="orders-address-edit"
                        title="Edit shipping address"
                        aria-label="Edit shipping address"
                        onClick={(e) =>
                          setAddressEditor({
                            orderId: order._id,
                            anchor: e.currentTarget.getBoundingClientRect(),
                          })
                        }
                      >
                        ✎
                      </button>
                    </div>
                  </td>
                  <td>
                    {order.items?.map((item) => (
                      <div key={item._id} className="orders-item-line">
                        {item.productName} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td>{formatAmount(order.amount)}</td>
                  <td>
                    {order.shipment.courier ? (
                      <div className="orders-stack">
                        <div>
                          Agent: {COURIER_LABELS[order.shipment.courier]}
                        </div>
                        <div>Cons: {order.shipment.consignmentId || "—"}</div>
                        <div>
                          <span
                            className={"admin-badge " + statusBadgeClass(order.shipment.status)}
                          >
                            {SHIPMENT_STATUS_LABELS[order.shipment.status]}
                          </span>
                        </div>
                        {order.shipment.updatedAt && (
                          <div className="orders-muted">
                            {formatEventTime(order.shipment.updatedAt)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="orders-muted">Not assigned</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={"admin-badge " + statusBadgeClass(order.shipment.sellerStatus)}
                    >
                      {SELLER_STATUS_LABELS[order.shipment.sellerStatus]}
                    </span>
                  </td>
                  <td>
                    <div className="orders-shipment-cell">
                      <span className={"admin-badge " + statusBadgeClass(order.shipment.status)}>
                        {SHIPMENT_STATUS_LABELS[order.shipment.status]}
                      </span>
                      <button
                        type="button"
                        className="orders-cell-edit"
                        title="Update shipment"
                        aria-label="Update shipment"
                        onClick={(e) =>
                          setShipmentEditor({
                            orderId: order._id,
                            anchor: e.currentTarget.getBoundingClientRect(),
                          })
                        }
                      >
                        ✎
                      </button>
                    </div>
                  </td>
                  <td>{formatAmount(order.sellerEarning)}</td>
                  <td>{formatAmount(order.govalyEarning)}</td>
                  <td>
                    {order.shipment.status !== "delivered" ? (
                      <span className="orders-muted">Not delivered yet</span>
                    ) : (
                      <div className="orders-status-cell">
                        <span className={"admin-badge " + PAYMENT_BADGE[order.sellerPayment]}>
                          {PAYMENT_LABELS[order.sellerPayment]}
                        </span>

                        <select
                          className="admin-select orders-status-select"
                          value={order.sellerPayment}
                          disabled={paymentBusyId === order._id}
                          onChange={(e) => handlePaymentChange(order._id, e.target.value)}
                        >
                          {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>

                        {order.sellerPaymentAt && (
                          <span className="orders-muted">{formatEventTime(order.sellerPaymentAt)}</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shipmentEditingOrder && (
        <ShipmentEditor
          key={JSON.stringify(shipmentEditingOrder.shipment)}
          order={shipmentEditingOrder}
          courier={courierConfig}
          anchor={shipmentEditor.anchor}
          onClose={() => setShipmentEditor(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}

      {editingOrder && (
        <ShippingAddressEditor
          key={JSON.stringify([editingOrder.shippingAddress, editingOrder.addressBook])}
          order={editingOrder}
          anchor={addressEditor.anchor}
          onClose={() => setAddressEditor(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
}
