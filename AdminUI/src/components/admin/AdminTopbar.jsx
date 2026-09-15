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
