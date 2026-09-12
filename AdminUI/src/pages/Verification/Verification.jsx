import { useEffect, useState } from "react";
import "./Verification.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const STATUS_TABS = ["all", "pending", "approved", "suspended"];

export default function Verification() {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const token = localStorage.getItem("govaly_admin_token");

  const fetchSellers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/sellers/verification`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load sellers.");
      }

      setSellers(data.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong while loading sellers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

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

      setSellers((prev) =>
        prev.map((s) => (s._id === sellerId ? data.data : s))
      );
    } catch (err) {
      setActionError(err.message || "Something went wrong.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredSellers =
    activeTab === "all"
      ? sellers
      : sellers.filter((s) => s.status === activeTab);

  const counts = {
    all: sellers.length,
    pending: sellers.filter((s) => s.status === "pending").length,
    approved: sellers.filter((s) => s.status === "approved").length,
    suspended: sellers.filter((s) => s.status === "suspended").length,
  };

  return (
    <div className="admin-verification-page">
      <h1 className="admin-verification-title">Verification</h1>

      <div className="admin-verification-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={
              "admin-verification-tab" +
              (activeTab === tab ? " is-active" : "")
            }
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
            ({counts[tab]})
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="admin-verification-status-text">Loading sellers...</p>
      )}

      {!isLoading && error && (
        <div>
          <p className="admin-verification-error">{error}</p>
          <button
            type="button"
            className="admin-verification-retry-btn"
            onClick={fetchSellers}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {actionError && (
            <p className="admin-verification-error">{actionError}</p>
          )}

          {filteredSellers.length === 0 ? (
            <p className="admin-verification-status-text">
              No sellers in this category.
            </p>
          ) : (
            <div className="admin-verification-table-wrapper">
              <table className="admin-verification-table">
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
                  {filteredSellers.map((seller) => {
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
                              "admin-verification-status-badge " +
                              seller.status
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
                                className="admin-verification-btn admin-verification-btn-approve"
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
                                className="admin-verification-btn admin-verification-btn-suspend"
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