const API_BASE_URL = "http://localhost:5000/api/v1";

const getToken = () => {
  return localStorage.getItem("govaly_admin_token");
};

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// ===============================
// MEDIA API
// ===============================

const list = async ({ dateStart, dateEnd, uploadedByType, uploadedById } = {}) => {
  const params = new URLSearchParams();

  if (dateStart) params.set("dateStart", dateStart);
  if (dateEnd) params.set("dateEnd", dateEnd);
  if (uploadedByType) params.set("uploadedByType", uploadedByType);
  if (uploadedById) params.set("uploadedById", uploadedById);

  const query = params.toString() ? `?${params.toString()}` : "";

  return request(`/admin/media${query}`);
};

/*
 * Real shop list for the "Uploaded By" filter — reuses the same
 * endpoint the Verification page already calls, so "Shop 1" /
 * "Shop 2" in the dropdown are actual seller shopNames, not
 * hardcoded labels.
 */
const listShops = async () => {
  return request("/admin/sellers/verification/all");
};

// Title / Alternative Text only — url, uploader etc. never change here.
const update = async (id, { title, altText }) => {
  return request(`/admin/media/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title, altText }),
  });
};

// "Change Image" — swaps the underlying file on an existing row.
const replaceFile = async (id, file, folder = "govaly/media") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  return request(`/admin/media/${id}/file`, {
    method: "PATCH",
    body: formData,
  });
};

// ===============================
// CLOUDINARY UPLOAD
// ===============================

const uploadFile = async (file, folder = "govaly/media") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  return request("/upload", {
    method: "POST",
    body: formData,
  });
};

export const mediaService = {
  list,
  listShops,
  update,
  replaceFile,
  uploadFile,
};
