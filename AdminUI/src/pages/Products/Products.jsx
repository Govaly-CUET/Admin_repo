import { useCallback, useEffect, useState } from "react";

import { adminProductService } from "../../services/adminProductService";
import { sellerService } from "../../services/sellerService";
import { categoryService } from "../../services/categoryService";
import "./Products.css";

const STATUS_TABS = ["all", "in_stock", "out_of_stock"];

const STATUS_LABELS = {
  all: "All",
  in_stock: "In Stock",
  out_of_stock: "Out of Stock",
};

const formatAmount = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [status, setStatus] = useState("");
  const [seller, setSeller] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    sellerService
      .listApproved()
      .then((res) => setSellers(res.data || []))
      .catch(() => {});

    categoryService
      .list()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await adminProductService.list({
        search: search || undefined,
        seller: seller || undefined,
        category: category || undefined,
        status: status || undefined,
        rating: rating || undefined,
        sortBy: sortBy || undefined,
      });

      setProducts(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }, [search, seller, category, status, rating, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const counts = {
    all: products.length,
    in_stock: products.filter((p) => p.status === "in_stock").length,
    out_of_stock: products.filter((p) => p.status === "out_of_stock").length,
  };

  const visibleProducts =
    status === "" ? products : products.filter((p) => p.status === status);

  return (
    <div className="products-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">
            Browse and manage every product across all shops.
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

        <div className="admin-toolbar-spacer" />

        <div className="admin-search">
          <input
            type="search"
            className="admin-input"
            placeholder="Search product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
          />
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={fetchProducts}
        >
          Search
        </button>
      </div>

      <div className="admin-filter-panel">
        <label>
          Vendor:
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

        <label>
          Price:
          <select
            className="admin-select"
            value={sortBy.startsWith("price") ? sortBy : ""}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Default</option>
            <option value="price_asc">Low to High</option>
            <option value="price_desc">High to Low</option>
          </select>
        </label>

        <label>
          Sold:
          <select
            className="admin-select"
            value={sortBy.startsWith("sold") ? sortBy : ""}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Default</option>
            <option value="sold_asc">Low to High</option>
            <option value="sold_desc">High to Low</option>
          </select>
        </label>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={fetchProducts}
        >
          Filter
        </button>
      </div>

      {error && <p className="admin-error-text">{error}</p>}

      {isLoading ? (
        <p className="admin-status-text">Loading products...</p>
      ) : visibleProducts.length === 0 ? (
        <p className="admin-status-text">No products found.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Review</th>
                <th>Sold Item</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.image}
                      alt=""
                      className="products-thumb"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.seller?.shopName || "—"}</td>
                  <td>{product.category?.name || "—"}</td>
                  <td>{formatAmount(product.sale_price)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span
                      className={
                        "admin-badge " +
                        (product.status === "in_stock"
                          ? "admin-badge-success"
                          : "admin-badge-danger")
                      }
                    >
                      {STATUS_LABELS[product.status]}
                    </span>
                  </td>
                  <td>
                    {product.rating?.count > 0
                      ? `${product.rating.average} ★ (${product.rating.count})`
                      : "—"}
                  </td>
                  <td>{product.sold_items ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
