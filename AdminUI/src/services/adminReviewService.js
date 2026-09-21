const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

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

const list = async ({ product, rating, search } = {}) => {
  const params = new URLSearchParams();

  if (product) params.set("product", product);
  if (rating) params.set("rating", rating);
  if (search) params.set("search", search);

  const query = params.toString() ? `?${params.toString()}` : "";

  return request(`/admin/reviews${query}`);
};

const stats = async () => {
  return request(`/admin/reviews/stats`);
};

export const adminReviewService = { list, stats };
