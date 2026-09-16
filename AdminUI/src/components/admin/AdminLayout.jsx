import { useState } from "react";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import "./AdminLayout.css";

import Profile from "../../pages/Profile/Profile";
import Media from "../../pages/Media/Media";
import Verification from "../../pages/Sellers/Verification/Verification";
import Commission from "../../pages/Sellers/Commission/Commission";

import Categories from "../../pages/Products/Category/Categories";
import Customers from "../../pages/Users/Customers";
import AddProduct from "../../pages/Products/AddProduct/AddProduct";
import Orders from "../../pages/Order/Orders";
import ProductReview from "../../pages/Products/Review/ProductReview";
import Pages from "../../pages/AdminPages/Pages";
import Dashboard from "../../pages/Dashboard/Dashboard";

export default function AdminLayout({
  admin,
  onLogout,
}) {
  /*
   * Keep a local copy of the currently displayed admin.
   * This allows the Topbar to update immediately after
   * the profile is saved.
   */
  const [currentAdmin, setCurrentAdmin] = useState(admin);

  const [activeKey, setActiveKey] = useState("dashboard");

  const handleNavigate = (key) => {
    setActiveKey(key);
  };

  /*
   * Called by Profile after a successful profile update.
   */
  const handleProfileUpdated = (updatedAdmin) => {
    setCurrentAdmin((prev) => ({
      ...prev,
      ...updatedAdmin,
    }));
  };

  const renderPage = () => {
    switch (activeKey) {
      case "profile":
        return (
          <Profile
            onProfileUpdated={handleProfileUpdated}
          />
        );

      case "dashboard":
        return <Dashboard />;

      case "media":
        return <Media />;

      case "pages":
        return (
          <Pages />
        );

      case "order":
      case "orderList":
        return <Orders />;

      case "products":
        return (
          <div>
            <h1>Products</h1>
          </div>
        );

      case "addProduct":
        return <AddProduct />;

      case "category":
        return (
         <Categories />
        );

      case "productReview":
        return <ProductReview />;

      case "customers":
        return (
          <Customers />
        );

      case "sellers":
        return (
          <div>
            <h1>Sellers</h1>
          </div>
        );

      case "commission":
        return <Commission />;

      case "verification":
        return <Verification />;

      default:
        return (
          <Profile
            onProfileUpdated={handleProfileUpdated}
          />
        );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("govaly_admin_token");

    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="admin-shell">
      <AdminSidebar
        activeKey={activeKey}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className="admin-main">
        <AdminTopbar
          userName={currentAdmin?.name || "Admin"}
          avatarUrl={currentAdmin?.image || undefined}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        <main className="admin-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}