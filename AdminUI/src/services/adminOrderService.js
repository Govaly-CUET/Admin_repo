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
  shipment,
  payment,
  seller,
  search,
  dateStart,
  dateEnd,
  amountMin,
  amountMax,
} = {}) => {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (shipment) params.set("shipment", shipment);
  if (payment) params.set("payment", payment);
  if (seller) params.set("seller", seller);
  if (search) params.set("search", search);
  if (dateStart) params.set("dateStart", dateStart);
  if (dateEnd) params.set("dateEnd", dateEnd);
  if (amountMin) params.set("amountMin", amountMin);
  if (amountMax) params.set("amountMax", amountMax);

  const query = params.toString() ? `?${params.toString()}` : "";

  return request(`/admin/orders${query}`);
};

const updateAddress = async (id, address) => {
  return request(`/admin/orders/${id}/address`, {
    method: "PATCH",
    body: JSON.stringify(address),
  });
};

const addAddress = async (id, address) => {
  return request(`/admin/orders/${id}/addresses`, {
    method: "POST",
    body: JSON.stringify(address),
  });
};

const selectAddress = async (id, addressId) => {
  return request(`/admin/orders/${id}/address/select`, {
    method: "PATCH",
    body: JSON.stringify({ addressId }),
  });
};

const updateShipment = async (id, shipment) => {
  return request(`/admin/orders/${id}/shipment`, {
    method: "PATCH",
    body: JSON.stringify(shipment),
  });
};

const createShipment = async (id) => {
  return request(`/admin/orders/${id}/shipment/create`, { method: "POST" });
};

const syncShipment = async (id) => {
  return request(`/admin/orders/${id}/shipment/sync`, { method: "POST" });
};

const simulateShipment = async (id, event) => {
  return request(`/admin/orders/${id}/shipment/simulate`, {
    method: "POST",
    body: JSON.stringify({ event }),
  });
};

const courierConfig = async () => {
  return request(`/admin/orders/courier/config`);
};

const updatePayment = async (id, status) => {
  return request(`/admin/orders/${id}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const adminOrderService = {
  list,
  updateAddress,
  addAddress,
  selectAddress,
  updateShipment,
  createShipment,
  syncShipment,
  simulateShipment,
  courierConfig,
  updatePayment,
};
