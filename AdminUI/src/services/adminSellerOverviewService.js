const API_BASE_URL = "http://localhost:5000/api/v1";

const getToken = () => localStorage.getItem("govaly_admin_token");

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

const list = async ({ status, category, rating } = {}) => {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (category) params.set("category", category);
  if (rating) params.set("rating", rating);

  const query = params.toString() ? `?${params.toString()}` : "";

  return request(`/admin/sellers/overview${query}`);
};

export const adminSellerOverviewService = { list };
