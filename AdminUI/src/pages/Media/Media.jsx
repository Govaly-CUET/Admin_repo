import { useCallback, useEffect, useRef, useState } from "react";

import { mediaService } from "../../services/mediaService";
import MediaDetail from "./MediaDetail";
import { uploaderName } from "./mediaFormat";
import "./Media.css";

/*
 * "Uploaded By" selection is encoded as a single string so one
 * <select> can carry both which bucket (admin/seller) and, for a
 * specific shop, which seller _id — e.g. "admin", "seller", or
 * "seller:64f...". Shop entries are populated from the real seller
 * list, so their labels are actual shopNames, not placeholders.
 */
const parseUploaderValue = (value) => {
  if (!value) return {};

  const [type, id] = value.split(":");
  return id ? { uploadedByType: type, uploadedById: id } : { uploadedByType: type };
};

export default function Media() {
  const fileInputRef = useRef(null);

  const [media, setMedia] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [shops, setShops] = useState([]);

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [uploaderValue, setUploaderValue] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    mediaService
      .listShops()
      .then((res) => setShops(res.data || []))
      .catch(() => {
        // The shop list is a nice-to-have for the filter dropdown —
        // if it fails, the dropdown just falls back to Admin/Seller.
      });
  }, []);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await mediaService.list({
        dateStart,
        dateEnd,
        ...parseUploaderValue(uploaderValue),
      });

      setMedia(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load media.");
    } finally {
      setIsLoading(false);
    }
  }, [dateStart, dateEnd, uploaderValue]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      await mediaService.uploadFile(file);
      await fetchMedia();
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const selectedItem = media.find((item) => item._id === selectedId) || null;

  const handleUpdated = (updatedItem) => {
    setMedia((prev) =>
      prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
  };

  const visibleMedia = media.filter((item) => {
    if (!search.trim()) return true;

    const term = search.trim().toLowerCase();
    return (
      item.publicId?.toLowerCase().includes(term) ||
      item.folder?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="media-page">
      <div
        className={
          "admin-page-header" + (selectedItem ? " media-detail-header" : "")
        }
      >
        {selectedItem ? (
          <>
            <button
              type="button"
              className="media-detail-back"
              onClick={() => setSelectedId(null)}
              aria-label="Back to Media"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <h1 className="admin-page-title media-title">
              {uploaderName(selectedItem)}
            </h1>
          </>
        ) : (
          <h1 className="admin-page-title media-title">Media</h1>
        )}
      </div>

      <div className="media-toolbar">
        <span className="media-toolbar-label">Date:</span>
        <input
          type="date"
          className="media-date-input"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
        />
        <span className="media-toolbar-sep">–</span>
        <input
          type="date"
          className="media-date-input"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
        />

        <span className="media-toolbar-label">Uploaded By:</span>
        <select
          className="media-select"
          value={uploaderValue}
          onChange={(e) => setUploaderValue(e.target.value)}
        >
          <option value="">All</option>
          <option value="admin">Admin</option>
          {shops.map((shop) => (
            <option key={shop._id} value={`seller:${shop._id}`}>
              {shop.shopName}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="media-filter-btn"
          onClick={fetchMedia}
        >
          Filter
        </button>

        <div className="media-toolbar-spacer" />

        <div className="media-search">
          <svg
            className="media-search-icon"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button type="button" className="media-search-btn">
          Search
        </button>
      </div>

      {error && <p className="admin-error-text">{error}</p>}

      {selectedItem ? (
        <MediaDetail item={selectedItem} onUpdated={handleUpdated} />
      ) : isLoading ? (
        <p className="admin-status-text">Loading media...</p>
      ) : (
        <div className="media-grid">
          <button
            type="button"
            className="media-tile media-tile-upload"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{isUploading ? "Uploading..." : "Upload"}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="media-file-input"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          {visibleMedia.length === 0 ? (
            <p className="admin-status-text media-empty">
              No media uploaded yet.
            </p>
          ) : (
            visibleMedia.map((item) => (
              <button
                key={item._id}
                type="button"
                className="media-tile"
                title={item.title || item.publicId}
                onClick={() => setSelectedId(item._id)}
              >
                <img src={item.url} alt={item.altText || ""} className="media-tile-img" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
