const API_BASE_URL =
  "http://localhost:5000/api/v1";


const getToken = () => {
  return localStorage.getItem(
    "govaly_admin_token"
  );
};


const request = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        ...(options.body instanceof FormData
          ? {}
          : {
              "Content-Type":
                "application/json",
            }),

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong"
    );
  }

  return data;
};


// ===============================
// CATEGORY API
// ===============================

const list = async (search = "") => {
  const query = search
    ? `?search=${encodeURIComponent(
        search
      )}`
    : "";

  return request(
    `/admin/categories${query}`
  );
};


const get = async (id) => {
  return request(
    `/admin/categories/${id}`
  );
};


const create = async (data) => {
  return request(
    "/admin/categories",
    {
      method: "POST",

      body: JSON.stringify(data),
    }
  );
};


const update = async (id, data) => {
  return request(
    `/admin/categories/${id}`,
    {
      method: "PATCH",

      body: JSON.stringify(data),
    }
  );
};


const remove = async (id) => {
  return request(
    `/admin/categories/${id}`,
    {
      method: "DELETE",
    }
  );
};


// ===============================
// CLOUDINARY UPLOAD
// ===============================

const uploadImage = async (file) => {
  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  return request(
    "/upload",
    {
      method: "POST",
      body: formData,
    }
  );
};


export const categoryService = {
  list,
  get,
  create,
  update,
  remove,
  uploadImage,
};