import { useRef, useState } from "react";

import { mediaService } from "../../services/mediaService";
import {
  formatFileType,
  formatFileSize,
  formatDimension,
  formatDateTime,
  uploaderName,
} from "./mediaFormat";

export default function MediaDetail({ item, onUpdated }) {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState(item.title || "");
  const [altText, setAltText] = useState(item.altText || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy URL to clipboard");
  const [error, setError] = useState("");

  const handleApply = async () => {
    setIsSaving(true);
    setError("");

    try {
      const res = await mediaService.update(item._id, { title, altText });
      onUpdated(res.data);
    } catch (err) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReplacing(true);
    setError("");

    try {
      const res = await mediaService.replaceFile(item._id, file);
      onUpdated(res.data);
    } catch (err) {
      setError(err.message || "Failed to replace image.");
    } finally {
      setIsReplacing(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = item.publicId?.split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(objectUrl);
    } catch {
      // Cross-origin fetch can fail depending on Cloudinary's CORS
      // config — falling back to opening the file directly still
      // lets the admin save it manually.
      window.open(item.url, "_blank", "noreferrer");
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy URL to clipboard"), 1500);
    } catch {
      setCopyLabel("Couldn't copy");
      setTimeout(() => setCopyLabel("Copy URL to clipboard"), 1500);
    }
  };

  return (
    <div className="media-detail">
      {error && <p className="admin-error-text">{error}</p>}

      <div className="media-detail-body">
        <div className="media-detail-preview">
          <div className="media-detail-image-box">
            <img src={item.url} alt={item.altText || ""} />
          </div>

          <div className="media-detail-preview-actions">
            <button
              type="button"
              className="media-detail-btn-change"
              onClick={handleChangeImageClick}
              disabled={isReplacing}
            >
              {isReplacing ? "Uploading..." : "Change Image"}
            </button>

            <button
              type="button"
              className="media-detail-btn-download"
              onClick={handleDownload}
            >
              Download
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="media-file-input"
              onChange={handleFileChange}
              disabled={isReplacing}
            />
          </div>
        </div>

        <div className="media-detail-info">
          <div className="media-detail-row">
            <span className="media-detail-label">Uploaded:</span>
            <span className="media-detail-value">
              {formatDateTime(item.createdAt)}
              <br />
              By {uploaderName(item)}
            </span>
          </div>

          <div className="media-detail-row">
            <span className="media-detail-label">Last Updated:</span>
            <span className="media-detail-value">
              {formatDateTime(item.updatedAt)}
              <br />
              By {uploaderName(item)}
            </span>
          </div>

          <div className="media-detail-row">
            <span className="media-detail-label">File Type:</span>
            <span className="media-detail-value">
              {formatFileType(item.fileType)}
            </span>
          </div>

          <div className="media-detail-row">
            <span className="media-detail-label">File Size:</span>
            <span className="media-detail-value">
              {formatFileSize(item.size)}
            </span>
          </div>

          <div className="media-detail-row">
            <span className="media-detail-label">Dimension:</span>
            <span className="media-detail-value">
              {formatDimension(item.width, item.height)}
            </span>
          </div>

          <div className="media-detail-row">
            <span className="media-detail-label">Title:</span>
            <input
              type="text"
              className="media-detail-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="media-detail-row">
            <span className="media-detail-label">Alternative Text:</span>
            <input
              type="text"
              className="media-detail-input"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </div>

          <div className="media-detail-row">
            <span className="media-detail-label">File URL:</span>
            <div className="media-detail-url-row">
              <input
                type="text"
                className="media-detail-input"
                value={item.url}
                readOnly
              />
              <button
                type="button"
                className="media-detail-copy-btn"
                onClick={handleCopyUrl}
              >
                {copyLabel}
              </button>
            </div>
          </div>

          <button
            type="button"
            className="media-detail-apply-btn"
            onClick={handleApply}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
