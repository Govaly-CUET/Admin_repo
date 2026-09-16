import { useCallback, useEffect, useState } from "react";

import { adminSellerOverviewService } from "../../services/adminSellerOverviewService";
import { categoryService } from "../../services/categoryService";
import "./Sellers.css";

const STATUS_TABS = ["all", "approved", "pending", "suspended"];

const STATUS_LABELS = {
  all: "All",
  approved: "Approved",
  pending: "Pending",
  suspended: "Suspended",
};

const formatAmount = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);

export default function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("");
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    categoryService
      .list()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const fetchSellers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await adminSellerOverviewService.list({
        status: status || undefined,
        category: category || undefined,
        rating: rating || undefined,
      });

      setSellers(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load sellers.");
    } finally {
      setIsLoading(false);
    }
  }, [status, category, rating]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const counts = {
    all: sellers.length,
    approved: sellers.filter((s) => s.status === "approved").length,
    pending: sellers.filter((s) => s.status === "pending").length,
    suspended: sellers.filter((s) => s.status === "suspended").length,
  };

  const storeNameOptions = [...new Set(sellers.map((s) => s.shopName).filter(Boolean))];

  const visibleSellers = sellers.filter((seller) => {
    if (status && seller.status !== status) return false;
    if (storeName && seller.shopName !== storeName) return false;

    return true;
  });

  return (
    <div className="sellers-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Sellers</h1>
          <p className="admin-page-subtitle">
            Every shop on Govaly — products, orders and earnings at a glance.
          </p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-tab-group">
          {STATUS_TABS.map((tab) => (
            <span
              key={tab}
              className={
                "admin-tab" + ((status === "" ? "all" : status) === tab ? " is-active" : "")
              }
              onClick={() => setStatus(tab === "all" ? "" : tab)}
            >
              {STATUS_LABELS[tab]} ({counts[tab]})
            </span>
          ))}
        </div>
      </div>

      <div className="admin-filter-panel">
        <label>
          Store Name:
          <select
            className="admin-select"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          >
            <option value="">All</option>
            {storeNameOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status:
          <select
            className="admin-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>

        <label>
          Category:
          <select
            className="admin-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Rating:
          <select
            className="admin-select"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="">Any</option>
            {[4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r}+ stars
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={fetchSellers}
        >
          Filter
        </button>
      </div>

      {error && <p className="admin-error-text">{error}</p>}

      {isLoading ? (
        <p className="admin-status-text">Loading sellers...</p>
      ) : visibleSellers.length === 0 ? (
        <p className="admin-status-text">No sellers found.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Commission</th>
                <th>Product</th>
                <th>Category</th>
                <th>Order</th>
                <th>Performance</th>
                <th>Finance</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {visibleSellers.map((seller) => (
                <tr key={seller._id}>
                  <td>{seller.shopName}</td>
                  <td>
                    <div className="sellers-owner-name">{seller.ownerName}</div>
                    <div className="sellers-owner-detail">Call: {seller.phone}</div>
                  </td>
                  <td>
                    <span
                      className={
                        "admin-badge " +
                        (seller.status === "approved"
                          ? "admin-badge-success"
                          : seller.status === "suspended"
                          ? "admin-badge-danger"
                          : "admin-badge-warning")
                      }
                    >
                      {seller.status}
                    </span>
                  </td>
                  <td>{seller.commission}%</td>
                  <td className="sellers-breakdown">
                    <div>Listed ({seller.products.total})</div>
                    <div>In Stock ({seller.products.inStock})</div>
                    <div>Stock Out ({seller.products.outOfStock})</div>
                  </td>
                  <td className="sellers-breakdown">
                    {seller.products.categories.length > 0
                      ? seller.products.categories.map((c) => (
                          <div key={c.id || c.name}>
                            {c.name}: {c.count}
                          </div>
                        ))
                      : "—"}
                  </td>
                  <td className="sellers-breakdown">
                    <div>Total ({seller.orders.total})</div>
                    <div>Pending ({seller.orders.pending})</div>
                    <div>In Progress ({seller.orders.inProgress})</div>
                    <div>Delivered ({seller.orders.delivered})</div>
                    <div>Canceled ({seller.orders.canceled})</div>
                  </td>
                  <td className="sellers-breakdown">
                    <div>Delivery: {percent(seller.orders.delivered, seller.orders.total)}%</div>
                    <div>In Progress: {percent(seller.orders.inProgress, seller.orders.total)}%</div>
                    <div>Cancellation: {percent(seller.orders.canceled, seller.orders.total)}%</div>
                  </td>
                  <td className="sellers-breakdown">
                    <div>Sale: {formatAmount(seller.orders.sale)}</div>
                    <div>Earning: {formatAmount(seller.orders.earning)}</div>
                  </td>
                  <td>{seller.ratings > 0 ? `${seller.ratings} ★` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
