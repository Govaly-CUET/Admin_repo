const CustomerTable = ({ customers, onDelete }) => {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Customer</th>
            <th>Contacts</th>
            <th>Address</th>
            <th>Total Orders</th>
            <th>Total Spends</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan="7" className="admin-table-empty">
                No customers found
              </td>
            </tr>
          ) : (
            customers.map((customer, index) => (
              <tr key={customer.id}>
                <td>{index + 1}</td>

                <td>
                  <div className="customer-info">
                    <div className="customer-image">
                      {customer.image ? (
                        <img src={customer.image} alt="" />
                      ) : (
                        customer.name?.charAt(0)?.toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="customer-name">
                        {customer.name || "-"}
                      </div>
                      <div className="customer-id">
                        {customer.id}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="customer-contacts">
                    <span>{customer.email || "-"}</span>
                    <span>{customer.phone || "-"}</span>
                  </div>
                </td>

                <td>{customer.address || "-"}</td>
                <td>{customer.totalOrder ?? 0}</td>
                <td>
                  {`৳${Number(customer.totalSpend || 0).toLocaleString("en-BD")}`}
                </td>

                <td>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => onDelete(customer)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;