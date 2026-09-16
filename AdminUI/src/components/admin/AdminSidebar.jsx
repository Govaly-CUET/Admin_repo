import { useState } from "react";

import "./AdminSidebar.css";

/*
 * Icons live in public/icons/ as white SVGs — one per nav item,
 * named after the item's key.
 */
const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "/icons/dashboard.svg",
  },
  {
    key: "media",
    label: "Media",
    icon: "/icons/media.svg",
  },
  {
    key: "pages",
    label: "Pages",
    icon: "/icons/pages.svg",
  },
  {
    key: "order",
    label: "Order",
    icon: "/icons/order.svg",
    children: [
      {
        key: "orderList",
        label: "Orders",
      },
    ],
  },
  {
    key: "products",
    label: "Products",
    icon: "/icons/products.svg",
    children: [
      {
        key: "products",
        label: "Products",
      },
      {
        key: "addProduct",
        label: "Add Product",
      },
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
    icon: "/icons/customers.svg",
  },
  {
    key: "sellers",
    label: "Sellers",
    icon: "/icons/sellers.svg",
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
  /*
   * The wordmark lives in public/logo.png. Until that file exists
   * (or if it ever fails to load) fall back to the plain text
   * logo rather than showing a broken image.
   */
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        {logoFailed ? (
          "govaly"
        ) : (
          <img
            src="/logo.png"
            alt="govaly"
            className="admin-sidebar-logo-img"
            onError={() => setLogoFailed(true)}
          />
        )}
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
                (!item.children && activeKey === item.key
                  ? " is-active"
                  : "")
              }
              onClick={() => {
                if (item.children) {
                  onNavigate(item.children[0].key);
                } else {
                  onNavigate(item.key);
                }
              }}
            >
              <span className="admin-nav-icon">
                <img
                  src={item.icon}
                  alt=""
                  className="admin-nav-icon-img"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
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
