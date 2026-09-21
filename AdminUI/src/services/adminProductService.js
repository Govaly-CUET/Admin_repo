const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const getToken = () => {
  return localStorage.getItem("govaly_admin_token");
};

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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

const create = async (product) => {
  return request("/admin/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
};

const list = async ({ search, seller, category, status, rating, sortBy } = {}) => {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (seller) params.set("seller", seller);
  if (category) params.set("category", category);
  if (status) params.set("status", status);
  if (rating) params.set("rating", rating);
  if (sortBy) params.set("sortBy", sortBy);

  const query = params.toString() ? `?${params.toString()}` : "";

  return request(`/admin/products${query}`);
};

export const adminProductService = {
  create,
  list,
};
