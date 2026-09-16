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

const list = async ({
  status,
  seller,
  search,
  dateStart,
  dateEnd,
  amountMin,
  amountMax,
} = {}) => {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (seller) params.set("seller", seller);
  if (search) params.set("search", search);
  if (dateStart) params.set("dateStart", dateStart);
  if (dateEnd) params.set("dateEnd", dateEnd);
  if (amountMin) params.set("amountMin", amountMin);
  if (amountMax) params.set("amountMax", amountMax);

  const query = params.toString() ? `?${params.toString()}` : "";

  return request(`/admin/orders${query}`);
};

const updateStatus = async (id, status) => {
  return request(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const adminOrderService = { list, updateStatus };
