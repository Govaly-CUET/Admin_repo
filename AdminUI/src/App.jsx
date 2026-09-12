import { useEffect, useState } from "react";

import Login from "./pages/Login/Login";
import AdminLayout from "./components/admin/AdminLayout";

import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  /*
   * Check whether the stored JWT is still valid.
   */
  useEffect(() => {
    const verifyAdminToken = async () => {
      const token = localStorage.getItem("govaly_admin_token");

      // No token → show Login
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          // Token is invalid/expired
          localStorage.removeItem("govaly_admin_token");
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();

        console.log("Admin session verified:", data);

        setIsAuthenticated(true);
      } catch (error) {
        console.error(
          "Authentication verification failed:",
          error
        );

        localStorage.removeItem("govaly_admin_token");
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAdminToken();
  }, []);

  /*
   * Called by Login after successful login.
   */
  const handleLoginSuccess = (data) => {
    if (data?.token) {
      localStorage.setItem(
        "govaly_admin_token",
        data.token
      );
    }

    setIsAuthenticated(true);
  };

  /*
   * Called when admin logs out.
   */
  const handleLogout = () => {
    localStorage.removeItem("govaly_admin_token");
    setIsAuthenticated(false);
  };

  /*
   * While checking an existing JWT, don't show either
   * Login or Admin UI yet.
   */
  if (isCheckingAuth) {
    return null;
  }

  /*
   * Not authenticated → Login page
   */
  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  /*
   * Authenticated → Admin UI
   *
   * AdminLayout currently opens Profile by default.
   * Later, when Dashboard is created, change the
   * default page inside AdminLayout to Dashboard.
   */
  return (
    <AdminLayout
      onLogout={handleLogout}
    />
  );
}

export default App;