const CustomerFilters = ({
  customerId,
  setCustomerId,
  district,
  setDistrict,
  ordersOrder,
  setOrdersOrder,
  spendOrder,
  setSpendOrder,
}) => {
  return (
    <div className="admin-filter-panel">
      <label>
        ID:
        <input
          type="text"
          className="admin-input"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          placeholder="Customer ID"
        />
      </label>

      <label>
        District:
        <input
          type="text"
          className="admin-input"
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          placeholder="Address / district"
        />
      </label>

      <label>
        Orders:
        <select
          className="admin-select"
          value={ordersOrder}
          onChange={(event) => setOrdersOrder(event.target.value)}
        >
          <option value="none">Any</option>
          <option value="orders-asc">Low to High</option>
          <option value="orders-desc">High to Low</option>
        </select>
      </label>

      <label>
        Total Spend:
        <select
          className="admin-select"
          value={spendOrder}
          onChange={(event) => setSpendOrder(event.target.value)}
        >
          <option value="none">Any</option>
          <option value="spend-asc">Low to High</option>
          <option value="spend-desc">High to Low</option>
        </select>
      </label>
    </div>
  );
};

export default CustomerFilters;