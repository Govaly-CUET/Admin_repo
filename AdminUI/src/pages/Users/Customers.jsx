import { useCallback, useEffect, useMemo, useState } from "react";

import customerService from "../../services/customerService";

import CustomerTable from "../../components/customers/CustomerTable";
import CustomerFilters from "../../components/customers/CustomerFilters";
import CustomerDelete from "../../components/customers/CustomerDelete";

import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [district, setDistrict] = useState("");
  const [ordersOrder, setOrdersOrder] = useState("none");
  const [spendOrder, setSpendOrder] = useState("none");
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await customerService.getCustomers({
        search,
        id: customerId,
        district,
      });

      setCustomers(response.data || []);
    } catch (err) {
      console.error("Failed to load customers:", err);
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search, customerId, district]);

  useEffect(() => {
    const initializeCustomers = async () => {
      await loadCustomers();
    };

    initializeCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const result = [...customers];
    const direction = ordersOrder !== "none" ? ordersOrder : spendOrder;

    if (direction !== "none") {
      const field = ordersOrder !== "none" ? "totalOrder" : "totalSpend";

      result.sort((firstCustomer, secondCustomer) => {
        const firstValue = Number(firstCustomer[field]);
        const secondValue = Number(secondCustomer[field]);

        if (Number.isNaN(firstValue) || Number.isNaN(secondValue)) return 0;

        return direction.endsWith("asc")
          ? firstValue - secondValue
          : secondValue - firstValue;
      });
    }

    return result;
  }, [customers, ordersOrder, spendOrder]);

  const handleDelete = async () => {
    if (!deleteCustomer) return;

    try {
      await customerService.deleteCustomer(deleteCustomer.id);

      setCustomers((current) =>
        current.filter((customer) => customer.id !== deleteCustomer.id)
      );
      setDeleteCustomer(null);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      setError(err.message || "Failed to delete customer");
    }
  };

  return (
    <div className="customers-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-subtitle">
            Browse, search and manage registered customers.
          </p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-tab-group">
          <span className="admin-tab is-active">
            All ({customers.length})
          </span>
        </div>

        <div className="admin-toolbar-spacer" />

        <div className="admin-search customer-search">
          <input
            type="text"
            className="admin-input"
            placeholder="Search by name or ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search">
              x
            </button>
          )}
        </div>

      </div>

      <CustomerFilters
        customerId={customerId}
        setCustomerId={setCustomerId}
        district={district}
        setDistrict={setDistrict}
        ordersOrder={ordersOrder}
        setOrdersOrder={setOrdersOrder}
        spendOrder={spendOrder}
        setSpendOrder={setSpendOrder}
      />

      {error && <div className="admin-error-text customers-error">{error}</div>}

      {loading ? (
        <p className="admin-status-text">Loading...</p>
      ) : (
        <CustomerTable
          customers={filteredCustomers}
          onDelete={setDeleteCustomer}
        />
      )}

      <CustomerDelete
        customer={deleteCustomer}
        onCancel={() => setDeleteCustomer(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Customers;
