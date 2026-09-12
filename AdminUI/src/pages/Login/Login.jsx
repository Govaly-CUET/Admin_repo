// Login.jsx

import { useState } from "react";
import "./Login.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.govaly.com/bd/api/v1";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Invalid email or password.");
      }

      if (data?.token) {
        localStorage.setItem("govaly_admin_token", data.token);
      }

      onLoginSuccess?.(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-brand">
          <h1>Govaly</h1>
          <p>Bangladesh's Favourite Online Fashion Mall</p>
        </div>

        <div className="admin-login-heading">
          <h2>Login</h2>
          <p>Govaly Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="email"
            className="admin-login-input"
            placeholder="Email / Phone Number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            disabled={isSubmitting}
          />

          <input
            type="password"
            className="admin-login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

      </div>
    </div>
  );
}