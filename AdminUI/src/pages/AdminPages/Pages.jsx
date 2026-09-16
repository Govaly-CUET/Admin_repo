import { useEffect, useRef, useState } from "react";
import "./Pages.css";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";
  
const authHeaders = () => {
  const token = localStorage.getItem("govaly_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const DEFAULT_TOP_BANNER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="375" height="120"><rect width="375" height="120" fill="%23e2e2e2"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" fill="%23999" text-anchor="middle" dy=".3em">Default Top Banner</text></svg>'
  );

const DEFAULT_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="%23e2e2e2"/><text x="50%" y="50%" font-family="sans-serif" font-size="12" fill="%23999" text-anchor="middle" dy=".3em">Default Logo</text></svg>'
  );

const CATEGORY_PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" rx="4" fill="%23dcdcdc"/></svg>'
  );

/* ------------------------------------------------------------------ */
/*  One header row: Top Banner or Logo                                 */
/* ------------------------------------------------------------------ */

function HeaderImageRow({ label, title, media, defaultImage, hint, onApply, onRemove }) {
  const fileInputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentSrc = pendingFile ? URL.createObjectURL(pendingFile) : media?.url || defaultImage;
  const hasRealMedia = Boolean(media);

  const handlePick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
  };

  const handleApply = async () => {
    if (!pendingFile) return;
    setIsSubmitting(true);
    try {
      await onApply(title, pendingFile);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!media?._id) return;
    setIsSubmitting(true);
    try {
      await onRemove(media._id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pg-header-row">
      <img src={currentSrc} alt={label} className="pg-header-thumb" />

      <div>
        <p className="pg-header-label">{label}</p>
        <p className="pg-header-hint">{hint}</p>
      </div>

      <button type="button" className="pg-btn pg-btn-outline" onClick={handlePick} disabled={isSubmitting}>
        Upload/Add Icon
      </button>

      <input ref={fileInputRef} type="file" accept="image/*" className="pg-file-input" onChange={handleFileChange} />

      <div className="pg-header-actions">
        <button
          type="button"
          className="pg-btn pg-btn-dark"
          onClick={handleApply}
          disabled={!pendingFile || isSubmitting}
        >
          Apply
        </button>

        {hasRealMedia && (
          <button
            type="button"
            className="pg-btn pg-btn-remove"
            onClick={handleRemove}
            disabled={isSubmitting}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  One carousal panel (Category carousal - 1 or 2)                    */
/* ------------------------------------------------------------------ */

function CarousalPanel({ index, items, categoryOptions, onAdd, onRemove }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!selectedCategoryId) return;
    setIsSubmitting(true);
    try {
      await onAdd(selectedCategoryId, index, titleInput);
      setSelectedCategoryId("");
      setTitleInput("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pg-carousal-panel">
      <h3 className="pg-carousal-title">Category Carousal - {index}</h3>

      <div className="pg-carousal-table">
        <div className="pg-carousal-table-head">
          <span>Image</span>
          <span>Category</span>
          <span>Title Name</span>
          <span>Action</span>
        </div>

        {items.map((item) => (
          <div className="pg-carousal-row" key={item._id}>
            <span className="pg-drag-handle" aria-hidden="true">⠿</span>
            <img src={item.image || CATEGORY_PLACEHOLDER_IMG} alt="" className="pg-row-thumb" />
            <span className="pg-row-text">{item.name}</span>
            <span className="pg-row-text">{item.carousalTitle || item.name}</span>
            <span className="pg-row-actions">
              <button type="button" className="pg-chip pg-chip-remove" onClick={() => onRemove(item._id)}>
                Remove
              </button>
            </span>
          </div>
        ))}
      </div>

      <div className="pg-carousal-add-row">
        <span className="pg-add-label">Category:</span>
        <select
          className="pg-select"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <option value="">Select</option>
          {categoryOptions.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <span className="pg-add-label">Title Name:</span>
        <input
          type="text"
          className="pg-text-input"
          placeholder="Write Title"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
        />

        <button
          type="button"
          className="pg-btn pg-btn-dark pg-add-btn"
          onClick={handleAdd}
          disabled={!selectedCategoryId || isSubmitting}
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pages — the full "App Home Page" admin screen                      */
/* ------------------------------------------------------------------ */

export default function Pages() {
  const [header, setHeader] = useState({ topBanner: null, logo: null });
  const [carousal1, setcarousal1] = useState([]);
  const [carousal2, setcarousal2] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [homeRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/pages/home`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/admin/categories`, { headers: authHeaders() }),
      ]);

      const homeData = await homeRes.json();
      const categoriesData = await categoriesRes.json();

      if (!homeRes.ok) throw new Error(homeData?.message || "Failed to load page data.");
      if (!categoriesRes.ok) throw new Error(categoriesData?.message || "Failed to load categories.");

      setHeader(homeData.data.header);
      setcarousal1(homeData.data.body.carousal1 || []);
      setcarousal2(homeData.data.body.carousal2 || []);
      setCategoryOptions(categoriesData.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyHeaderImage = async (title, file) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);

    const res = await fetch(`${API_BASE_URL}/admin/pages/media`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.message || "Upload failed.");
      return;
    }

    setHeader((prev) => ({
      ...prev,
      [title === "logo" ? "logo" : "topBanner"]: data.data,
    }));
  };

  const handleRemoveHeaderImage = async (mediaId) => {
    const res = await fetch(`${API_BASE_URL}/admin/pages/media/${mediaId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.message || "Remove failed.");
      return;
    }

    setHeader((prev) => ({
      topBanner: prev.topBanner?._id === mediaId ? null : prev.topBanner,
      logo: prev.logo?._id === mediaId ? null : prev.logo,
    }));
  };

  const handleAddTocarousal = async (categoryId, carousalIndex, title) => {
    const res = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/carousal`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ carousal: carousalIndex, title }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.message || "Could not add to carousal.");
      return;
    }

    if (carousalIndex === 1) {
      setcarousal1((prev) => [...prev, data.data]);
    } else {
      setcarousal2((prev) => [...prev, data.data]);
    }
  };

const handleRemoveFromcarousal = async (categoryId) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/pages/categories/${categoryId}/carousal`,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data?.message || "Could not remove from carousal.");
      return;
    }

    setcarousal1((prev) =>
      prev.filter((item) => item._id !== categoryId)
    );

    setcarousal2((prev) =>
      prev.filter((item) => item._id !== categoryId)
    );
  } catch (error) {
    setError("Could not remove from carousal.");
  }
};

  return (
    <div className="pg-page">
      <h1 className="pg-title">Pages</h1>

      <div className="pg-subheader-row">
        <span className="pg-subtitle">App Home Page</span>
      </div>

      {error && <p className="pg-error">{error}</p>}
      {isLoading ? (
        <p className="pg-loading">Loading...</p>
      ) : (
        <>
          <section className="pg-section">
            <h2 className="pg-section-title">Header Section</h2>
            <div className="pg-section-body">
              <HeaderImageRow
                label="Top Banner"
                title="top banner"
                media={header.topBanner}
                defaultImage={DEFAULT_TOP_BANNER}
                // hint="Size: 375 x 120px | Max: 300KB"
                onApply={handleApplyHeaderImage}
                onRemove={handleRemoveHeaderImage}
              />
              <HeaderImageRow
                label="Logo"
                title="logo"
                media={header.logo}
                defaultImage={DEFAULT_LOGO}
                onApply={handleApplyHeaderImage}
                onRemove={handleRemoveHeaderImage}
              />
            </div>
          </section>

          <section className="pg-section">
            <h2 className="pg-section-title">Body Section</h2>
            <div className="pg-carousal-grid">
              <CarousalPanel
                index={1}
                items={carousal1}
                categoryOptions={categoryOptions}
                onAdd={handleAddTocarousal}
                onRemove={handleRemoveFromcarousal}
              />
              <CarousalPanel
                index={2}
                items={carousal2}
                categoryOptions={categoryOptions}
                onAdd={handleAddTocarousal}
                onRemove={handleRemoveFromcarousal}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
