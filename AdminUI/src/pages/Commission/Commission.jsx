import { useEffect, useState } from "react";
import "./Commission.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export default function Commission() {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [rowError, setRowError] = useState("");

  const token = localStorage.getItem("govaly_admin_token");

  const fetchSellers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/sellers/commission`, {
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

  const handleEditToggle = (seller) => {
    setRowError("");

    if (editingId === seller._id) {
      // Same row clicked again — close it
      setEditingId(null);
      setEditValue("");
    } else {
      setEditingId(seller._id);
      setEditValue(String(seller.commission));
    }
  };

  const handleUpdate = async (sellerId) => {
    setRowError("");

    const commissionNumber = Number(editValue);

    if (Number.isNaN(commissionNumber) || commissionNumber < 0 || commissionNumber > 100) {
      setRowError("Commission must be a number between 0 and 100.");
      return;
    }

    setSavingId(sellerId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/sellers/${sellerId}/commission`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ commission: commissionNumber }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update commission.");
      }

      setSellers((prev) =>
        prev.map((s) => (s._id === sellerId ? data.data : s))
      );

      setEditingId(null);
      setEditValue("");
    } catch (err) {
      setRowError(err.message || "Something went wrong.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-commission-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Commission</h1>
          <p className="admin-page-subtitle">
            Set the commission percentage charged to each seller.
          </p>
        </div>
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
            onClick={fetchSellers}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Commission</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => {
                const isEditing = editingId === seller._id;
                const isSaving = savingId === seller._id;

                return (
                  <tr key={seller._id}>
                    <td>{seller.shopName}</td>
                    <td>
                      <div className="admin-commission-cell">
                        <span className="admin-commission-value">
                          {seller.commission}%
                        </span>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary admin-commission-edit-btn"
                          onClick={() => handleEditToggle(seller)}
                        >
                          Edit
                        </button>
                      </div>

                      {isEditing && (
                        <div className="admin-commission-edit-box">
                          <label className="admin-commission-edit-label">
                            Commission:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="admin-commission-edit-input"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            disabled={isSaving}
                          />
                          <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            onClick={() => handleUpdate(seller._id)}
                            disabled={isSaving}
                          >
                            {isSaving ? "..." : "Update"}
                          </button>
                          {rowError && (
                            <p className="admin-error-text admin-commission-row-error">
                              {rowError}
                            </p>
                          )}
                        </div>
                      )}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}