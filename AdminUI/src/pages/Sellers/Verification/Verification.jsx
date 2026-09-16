import { useCallback, useEffect, useRef, useState } from "react";
import "./Verification.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const STATUS_TABS = ["all", "pending", "approved", "suspended"];

// Maps each tab directly to its own dedicated endpoint path.
const STATUS_ENDPOINTS = {
  all: "/admin/sellers/verification/all",
  pending: "/admin/sellers/verification/pending",
  approved: "/admin/sellers/verification/approved",
  suspended: "/admin/sellers/verification/suspended",
};

const COMMISSION_RANGES = [
  { value: "", label: "Any" },
  { value: "0-10", label: "0% - 10%" },
  { value: "10-25", label: "10% - 25%" },
  { value: "25-50", label: "25% - 50%" },
  { value: "50-100", label: "50% - 100%" },
];

export default function Verification() {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [storeName, setStoreName] = useState("");
  const [owner, setOwner] = useState("");
  const [commissionRange, setCommissionRange] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    suspended: 0,
  });

  const token = localStorage.getItem("govaly_admin_token");

  const activeRequestRef = useRef(0);

  const fetchSellers = useCallback(
    async (tab) => {
      const requestId = ++activeRequestRef.current;

      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE_URL}${STATUS_ENDPOINTS[tab]}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (requestId !== activeRequestRef.current) return;

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load sellers.");
        }

        setSellers(data.data || []);
      } catch (err) {
        if (requestId !== activeRequestRef.current) return;
        setError(err.message || "Something went wrong while loading sellers.");
      } finally {
        if (requestId === activeRequestRef.current) {
          setIsLoading(false);
        }
      }
    },
    [token]
  );

  // Counts always come from the "all" endpoint, independent of the active tab.
  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${STATUS_ENDPOINTS.all}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;

      const all = data.data || [];
      setCounts({
        all: all.length,
        pending: all.filter((s) => s.status === "pending").length,
        approved: all.filter((s) => s.status === "approved").length,
        suspended: all.filter((s) => s.status === "suspended").length,
      });
    } catch {
      // Counts are non-critical — fail silently
    }
  }, [token]);

  useEffect(() => {
    fetchSellers(activeTab);
    fetchCounts();
  }, [activeTab, fetchSellers, fetchCounts]);

  const storeNameOptions = [...new Set(sellers.map((s) => s.shopName).filter(Boolean))];
  const ownerOptions = [...new Set(sellers.map((s) => s.ownerName).filter(Boolean))];

  const visibleSellers = sellers.filter((seller) => {
    if (storeName && seller.shopName !== storeName) return false;
    if (owner && seller.ownerName !== owner) return false;
    if (statusFilter && seller.status !== statusFilter) return false;

    if (commissionRange) {
      const [min, max] = commissionRange.split("-").map(Number);
      if (seller.commission < min || seller.commission > max) return false;
    }

    return true;
  });

  const handleStatusChange = async (sellerId, status) => {
    setActionError("");
    setActionLoadingId(sellerId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/sellers/${sellerId}/verification`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update seller status.");
      }

      await Promise.all([fetchSellers(activeTab), fetchCounts()]);
    } catch (err) {
      setActionError(err.message || "Something went wrong.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="admin-verification-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Verification</h1>
          <p className="admin-page-subtitle">
            Review seller documents and approve or suspend accounts.
          </p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-tab-group">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={
                "admin-tab" + (activeTab === tab ? " is-active" : "")
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all"
                ? "All"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
              ({counts[tab]})
            </button>
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
          Owner:
          <select
            className="admin-select"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="">All</option>
            {ownerOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Commission:
          <select
            className="admin-select"
            value={commissionRange}
            onChange={(e) => setCommissionRange(e.target.value)}
          >
            {COMMISSION_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status:
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </div>

      {isLoading && (
        <p className="admin-status-text">Loading sellers...</p>
      )}

      {!isLoading && error && (
        <div>
          <p className="admin-error-text">{error}</p>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => fetchSellers(activeTab)}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {actionError && (
            <p className="admin-error-text">{actionError}</p>
          )}

          {visibleSellers.length === 0 ? (
            <p className="admin-status-text">
              No sellers in this category.
            </p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Commission</th>
                    <th>Owner NID</th>
                    <th>Trade License</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSellers.map((seller) => {
                    const hasDocuments =
                      seller.nidDocument && seller.tradeLicenseDocument;
                    const isActing = actionLoadingId === seller._id;

                    return (
                      <tr key={seller._id}>
                        <td>{seller.shopName}</td>
                        <td>
                          <div className="admin-verification-owner-name">
                            {seller.ownerName}
                          </div>
                          <div className="admin-verification-owner-detail">
                            Call: {seller.phone}
                          </div>
                          <div className="admin-verification-owner-detail">
                            {seller.address}
                          </div>
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
                        <td>
                          {seller.nidDocument ? (
                            <a
                              href={seller.nidDocument}
                              target="_blank"
                              rel="noreferrer"
                            >
                              nid.pdf
                            </a>
                          ) : (
                            <span className="admin-verification-missing-doc">
                              Not submitted
                            </span>
                          )}
                        </td>

                        <td>
                          {seller.tradeLicenseDocument ? (
                            <a
                              href={seller.tradeLicenseDocument}
                              target="_blank"
                              rel="noreferrer"
                            >
                              licence.pdf
                            </a>
                          ) : (
                            <span className="admin-verification-missing-doc">
                              Not submitted
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="admin-verification-actions">
                            {seller.status !== "approved" && (
                              <button
                                type="button"
                                className="admin-btn admin-btn-primary"
                                disabled={!hasDocuments || isActing}
                                title={
                                  !hasDocuments
                                    ? "Both documents must be submitted first"
                                    : ""
                                }
                                onClick={() =>
                                  handleStatusChange(seller._id, "approved")
                                }
                              >
                                {isActing ? "..." : "Approve"}
                              </button>
                            )}
                            {seller.status !== "suspended" && (
                              <button
                                type="button"
                                className="admin-btn admin-btn-danger"
                                disabled={isActing}
                                onClick={() =>
                                  handleStatusChange(seller._id, "suspended")
                                }
                              >
                                {isActing ? "..." : "Suspend"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}