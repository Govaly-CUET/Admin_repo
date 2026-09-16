const API_BASE_URL = "http://localhost:5000/api/v1";

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

const list = async () => {
  return request("/admin/products");
};

export const adminProductService = {
  create,
  list,
};
