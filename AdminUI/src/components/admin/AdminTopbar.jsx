import { useState } from "react";
import "./AdminTopbar.css";

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23e5876b"/><circle cx="40" cy="32" r="14" fill="%23fff"/><path d="M14 72c4-16 18-24 26-24s22 8 26 24" fill="%23fff"/></svg>'
  );

export default function AdminTopbar({
  userName = "Admin",
  avatarUrl,
  onNavigate,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleProfileClick = () => {
    setMenuOpen(false);
    onNavigate("profile");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-spacer" />

      <div className="admin-topbar-search">
        <svg
          className="admin-topbar-search-icon"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input type="search" placeholder="Search" aria-label="Search" />
      </div>

      <button
        type="button"
        className="admin-topbar-icon-btn"
        aria-label="Notifications"
      >
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
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>

      <div className="admin-topbar-user">
        <span className="admin-topbar-username">{userName}</span>

        <button
          type="button"
          className="admin-topbar-avatar-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open profile menu"
        >
          <img
            src={avatarUrl || DEFAULT_AVATAR}
            alt="Admin profile"
            className="admin-topbar-avatar"
          />
        </button>

        {menuOpen && (
          <div className="admin-topbar-dropdown">
            <button
              type="button"
              className="admin-dropdown-item"
              onClick={handleProfileClick}
            >
              My Profile
            </button>

            <button
              type="button"
              className="admin-dropdown-item"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
