import { useCallback, useEffect, useRef, useState } from "react";

import { adminOrderService } from "../../services/adminOrderService";
import { sellerService } from "../../services/sellerService";
import "./Orders.css";

const STATUS_TABS = ["all", "pending", "in_progress", "delivered", "canceled"];

const STATUS_LABELS = {
  all: "All",
  pending: "Pending",
  in_progress: "In Progress",
  delivered: "Delivered",
  canceled: "Canceled",
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
  const [updatingId, setUpdatingId] = useState(null);

  const [sellers, setSellers] = useState([]);

  const [status, setStatus] = useState("");
  const [seller, setSeller] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [search, setSearch] = useState("");

  const activeRequestRef = useRef(0);

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
        status: status || undefined,
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
  }, [status, seller, dateStart, dateEnd, amountMin, amountMax, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError("");

    try {
      const res = await adminOrderService.updateStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data : o))
      );
    } catch (err) {
      setError(err.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const badgeClass = (status) => {
    if (status === "delivered") return "admin-badge-success";
    if (status === "canceled") return "admin-badge-danger";
    if (status === "pending") return "admin-badge-warning";
    return "order-badge-progress"; // in_progress
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
          Status:
          <select
            className="admin-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_TABS.map((tab) => (
              <option key={tab} value={tab === "all" ? "" : tab}>
                {STATUS_LABELS[tab]}
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
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Time</th>
                <th>Seller</th>
                <th>Customer</th>
                <th>Shipping Address</th>
                <th>Products</th>
                <th>Payment</th>
                <th>Financial Status</th>
                <th>Seller Earning</th>
                <th>Govaly Earning</th>
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
                    {order.shippingAddress?.address}, {order.shippingAddress?.area},{" "}
                    {order.shippingAddress?.district}, {order.shippingAddress?.division}
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
                    <div className="orders-status-cell">
                      <span className={"admin-badge " + badgeClass(order.financialStatus)}>
                        {STATUS_LABELS[order.financialStatus]}
                      </span>

                      <select
                        className="admin-select orders-status-select"
                        value={order.financialStatus}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {STATUS_TABS.filter((s) => s !== "all").map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td>{formatAmount(order.sellerEarning)}</td>
                  <td>{formatAmount(order.govalyEarning)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
