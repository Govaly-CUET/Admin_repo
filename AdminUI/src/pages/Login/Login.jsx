import { useState } from "react";
import "./Login.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

export default function Login({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("password");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetAuthState = (nextMode) => {
    setMode(nextMode);
    setError("");
    setOtpSent(false);
    setOtp("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const requestOtp = async () => {
    if (!identifier.trim() || !identifier.includes("@")) {
      throw new Error("Enter your admin email address first.");
    }

    const res = await fetch(`${API_BASE_URL}/admin/auth/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier.trim(), purpose: "forgot-password" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Could not send OTP.");
    setOtpSent(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "password" && (!identifier.trim() || !password)) {
      setError("Enter your email/phone number and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "forgot") {
        if (!otpSent) {
          await requestOtp();
          return;
        }

        if (!resetToken) {
          const res = await fetch(`${API_BASE_URL}/admin/auth/forgot-password/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: identifier.trim(), otp }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.message || "Invalid OTP.");
          setResetToken(data.data.resetToken);
          return;
        }

        if (!newPassword || newPassword !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const res = await fetch(`${API_BASE_URL}/admin/auth/forgot-password/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: identifier.trim(), resetToken, password: newPassword, confirmPassword }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Could not reset password.");
        resetAuthState("password");
        setError("Password reset successfully. You can log in now.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: identifier.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message || "Invalid email/phone number or password."
        );
      }

      if (data?.token) {
        localStorage.setItem("govaly_admin_token", data.token);
      }

      onLoginSuccess?.(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">

      {/* Left — branded artwork panel */}
      <div className="login-visual">
        <div className="login-brand">
          <h1 className="login-brand-name">Govaly</h1>
          <p className="login-brand-tagline">
            Bangladesh&apos;s Favorite Online Fashion Mall
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="login-panel">
        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2 className="login-title">{mode === "forgot" ? "Reset Password" : "Log In"}</h2>

          <p className="login-subtitle">Govaly Admin Dashboard</p>

          <input
            type="text"
            className="login-input"
            placeholder="Email / Phone Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            disabled={isSubmitting || (mode === "forgot" && Boolean(resetToken))}
          />

          {mode === "password" && <div className="login-password-field">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            <button
              type="button"
              className="login-eye-btn"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              disabled={isSubmitting}
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>}

          {mode === "forgot" && otpSent && !resetToken && (
            <input className="login-input login-extra-input" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" disabled={isSubmitting} />
          )}

          {mode === "forgot" && resetToken && <>
            <input className="login-input login-extra-input" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSubmitting} />
            <input className="login-input login-extra-input" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting} />
          </>}

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait..." : mode === "forgot" ? (!otpSent ? "Send OTP" : !resetToken ? "Verify OTP" : "Reset Password") : "Log In"}
          </button>

          {mode === "password" && <button type="button" className="login-forgot" onClick={() => resetAuthState("forgot")}>Forgot Password?</button>}
          {mode !== "password" && <button type="button" className="login-forgot" onClick={() => resetAuthState("password")}>Back to password login</button>}
        </form>
      </div>

    </div>
  );
}
