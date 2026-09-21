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
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const verifyAdminToken = async () => {
      const token = localStorage.getItem(
        "govaly_admin_token"
      );

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
          localStorage.removeItem(
            "govaly_admin_token"
          );

          setIsAuthenticated(false);
          setAdmin(null);
          return;
        }

        const result = await response.json();

        console.log(
          "Admin session verified:",
          result
        );

        /*
         * Your getMe() currently returns:
         *
         * {
         *   success: true,
         *   data: req.admin
         * }
         */

        setAdmin(result.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error(
          "Authentication verification failed:",
          error
        );

        localStorage.removeItem(
          "govaly_admin_token"
        );

        setIsAuthenticated(false);
        setAdmin(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAdminToken();
  }, []);

  /*
   * Called after successful login.
   */
  const handleLoginSuccess = (data) => {
    if (data?.token) {
      localStorage.setItem(
        "govaly_admin_token",
        data.token
      );
    }

    /*
     * Login response already contains
     * admin information in data.data.
     */
    if (data?.data) {
      setAdmin(data.data);
    }

    setIsAuthenticated(true);
  };

  /*
   * Logout
   */
  const handleLogout = () => {
    localStorage.removeItem(
      "govaly_admin_token"
    );

    setAdmin(null);
    setIsAuthenticated(false);
  };

  if (isCheckingAuth) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <AdminLayout
      admin={admin}
      onLogout={handleLogout}
    />
  );
}

export default App;
