import { useState } from "react";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import "./AdminLayout.css";

import Profile from "../../pages/Profile/Profile";
import Verification from "../../pages/Verification/Verification";

export default function AdminLayout({
  onLogout,
}) {
  /*
   * Dashboard will eventually be the default page.
   *
   * For now, Profile is the default because Dashboard
   * has not been created yet.
   */
  const [activeKey, setActiveKey] = useState("profile");

  const handleNavigate = (key) => {
    setActiveKey(key);
  };

  const renderPage = () => {
    switch (activeKey) {
      case "profile":
        return <Profile />;

      /*
      case "dashboard":
        return <Dashboard />;
      */
     /*case "media":
      return <Media />;
    */
      case "media":
        return (
          <div>
            <h1>Media</h1>
          </div>
        );

      case "pages":
        return (
          <div>
            <h1>Pages</h1>
          </div>
        );

      case "order":
        return (
          <div>
            <h1>Order</h1>
          </div>
        );

      case "products":
        return (
          <div>
            <h1>Products</h1>
          </div>
        );

      case "category":
        return (
          <div>
            <h1>Category</h1>
          </div>
        );

      case "productReview":
        return (
          <div>
            <h1>Product Review</h1>
          </div>
        );

      case "customers":
        return (
          <div>
            <h1>Customers</h1>
          </div>
        );

      case "sellers":
        return (
          <div>
            <h1>Sellers</h1>
          </div>
        );

      case "commission":
        return (
          <div>
            <h1>Commission</h1>
          </div>
        );

      case "verification":
        return <Verification />;

      default:
        return <Profile />;
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
          userName="User Name"
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