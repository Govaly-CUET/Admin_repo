/*
 * Small, dependency-free formatters for the Media detail view.
 */

const MIME_TO_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

export const formatFileType = (mime) => {
  if (!mime) return "—";
  return MIME_TO_EXT[mime] || `.${mime.split("/").pop()}`;
};

export const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined) return "—";
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
};

export const formatDimension = (width, height) => {
  if (!width || !height) return "—";
  return `${width} × ${height} pixels`;
};

/*
 * "15 July, 2025 | 10.30PM" — day, month name, year, then a dotted
 * 12-hour time with no space before AM/PM, matching the reference.
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return "—";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day} ${month}, ${year} | ${hours}.${minutes}${period}`;
};

export const uploaderName = (item) => {
  if (!item?.uploadedById) return item?.uploadedByType === "admin" ? "Admin" : "—";
  return item.uploadedById.name || item.uploadedById.shopName || "—";
};
