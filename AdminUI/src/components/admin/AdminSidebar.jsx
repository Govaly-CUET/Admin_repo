import "./AdminSidebar.css";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "▦",
  },
  {
    key: "media",
    label: "Media",
    icon: "▧",
  },
  {
    key: "pages",
    label: "Pages",
    icon: "▤",
  },
  {
    key: "order",
    label: "Order",
    icon: "🛒",
  },
  {
    key: "products",
    label: "Products",
    icon: "▱",
    children: [
      {
        key: "category",
        label: "Category",
      },
      {
        key: "productReview",
        label: "Product Review",
      },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    icon: "♙",
  },
  {
    key: "sellers",
    label: "Sellers",
    icon: "♙",
    children: [
      {
        key: "commission",
        label: "Commission",
      },
      {
        key: "verification",
        label: "Verification",
      },
    ],
  },
];

export default function AdminSidebar({
  activeKey,
  onNavigate,
  onLogout,
}) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        govaly
      </div>

      <nav className="admin-nav">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.key}
            className="admin-nav-group"
          >
            <button
              type="button"
              className={
                "admin-nav-item" +
                (activeKey === item.key
                  ? " is-active"
                  : "")
              }
              onClick={() => {
                if (item.children) {
                  onNavigate(item.key);
                } else {
                  onNavigate(item.key);
                }
              }}
            >
              <span className="admin-nav-icon">
                {item.icon}
              </span>

              <span className="admin-nav-label">
                {item.label}
              </span>

              {item.children && (
                <span className="admin-nav-chevron">
                  ›
                </span>
              )}
            </button>

            {item.children &&
              (activeKey === item.key ||
                item.children.some(
                  (child) => child.key === activeKey
                )) && (
                <div className="admin-nav-children">
                  {item.children.map((child) => (
                    <button
                      key={child.key}
                      type="button"
                      className={
                        "admin-nav-subitem" +
                        (activeKey === child.key
                          ? " is-active"
                          : "")
                      }
                      onClick={() =>
                        onNavigate(child.key)
                      }
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}

        <button
          type="button"
          className="admin-nav-item admin-nav-logout"
          onClick={onLogout}
        >
          <span className="admin-nav-icon">
            ⇥
          </span>

          <span className="admin-nav-label">
            Logout
          </span>
        </button>
      </nav>
    </aside>
  );
}