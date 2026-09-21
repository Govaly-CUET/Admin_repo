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
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const customerService = {
  getCustomers: (filters = {}) => {
    const query = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) {
        query.set(key, value.trim());
      }
    });

    const queryString = query.toString();

    return request(
      `/admin/customers${queryString ? `?${queryString}` : ""}`
    );
  },

  deleteCustomer: (id) => {
    return request(`/admin/customers/${id}`, {
      method: "DELETE",
    });
  },
};

export default customerService;