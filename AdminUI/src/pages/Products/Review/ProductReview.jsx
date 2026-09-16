import { useEffect, useState } from "react";

import { adminReviewService } from "../../../services/adminReviewService";
import "./ProductReview.css";

const STARS = [5, 4, 3, 2, 1];

const formatDate = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const StarRow = ({ rating }) => (
  <span className="review-stars">
    {STARS.slice()
      .reverse()
      .map((n) => (
        <span key={n} className={n <= rating ? "review-star review-star-on" : "review-star"}>
          ★
        </span>
      ))}
  </span>
);

export default function ProductReview() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [reviewsRes, statsRes] = await Promise.all([
          adminReviewService.list({ rating: rating || undefined, search: search || undefined }),
          adminReviewService.stats(),
        ]);

        if (cancelled) return;

        setReviews(reviewsRes.data || []);
        setStats(statsRes.data || null);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load reviews.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [rating, search]);

  return (
    <div className="review-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Product Review</h1>
          <p className="admin-page-subtitle">
            See what customers are saying about every product.
          </p>
        </div>
      </div>

      {stats && (
        <div className="review-summary-card">
          <div className="review-summary-average">
            <span className="review-summary-number">{stats.average}</span>
            <StarRow rating={Math.round(stats.average)} />
            <span className="review-summary-count">{stats.total} reviews</span>
          </div>

          <div className="review-summary-breakdown">
            {STARS.map((star) => (
              <div key={star} className="review-breakdown-row">
                <span className="review-breakdown-label">{star} star</span>
                <div className="review-breakdown-bar">
                  <div
                    className="review-breakdown-fill"
                    style={{ width: `${stats.percentages[star]}%` }}
                  />
                </div>
                <span className="review-breakdown-pct">{stats.percentages[star]}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-filter-panel">
        <label>
          Rating:
          <select
            className="admin-select"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="">All</option>
            {STARS.map((star) => (
              <option key={star} value={star}>
                {star} star
              </option>
            ))}
          </select>
        </label>

        <div className="admin-search">
          <input
            type="search"
            className="admin-input"
            placeholder="Search product or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="admin-error-text">{error}</p>}

      {isLoading ? (
        <p className="admin-status-text">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="admin-status-text">No reviews yet.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Order</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.product?.name || "—"}</td>
                  <td>{review.order?.seller?.shopName || "—"}</td>
                  <td>
                    {review.customer?.name || "—"}
                    <span className="admin-badge admin-badge-success review-verified-badge">
                      Verified Buyer
                    </span>
                  </td>
                  <td>
                    <StarRow rating={review.rating} />
                  </td>
                  <td className="review-comment-cell">{review.comment || "—"}</td>
                  <td>{review.order?.orderCode || "—"}</td>
                  <td>{formatDate(review.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
