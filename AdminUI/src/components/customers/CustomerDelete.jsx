const CustomerDelete = ({ customer, onCancel, onConfirm }) => {
  if (!customer) return null;

  return (
    <div className="customer-modal">
      <div className="customer-delete-box">
        <h3>Delete Customer</h3>

        <p>
          Are you sure you want to delete <strong>{customer.name}</strong>?
        </p>

        <div className="customer-delete-actions">
          <button onClick={onCancel}>Cancel</button>
          <button className="confirm-delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDelete;