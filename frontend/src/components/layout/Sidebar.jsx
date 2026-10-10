import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLE_LABEL } from "../../utils/permissions.js";

export default function Sidebar({ items }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const roleLabel = ROLE_LABEL[role] || role || "User";

  const signOut = async () => {
    try { await logout(); } finally { navigate("/login", { replace: true }); }
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-monogram">W</span>
        <span>
          <strong>WalangBrownout</strong>
          <small>INVENTORY SYSTEM</small>
        </span>
      </div>

      <div className="sidebar-section-label">WORKSPACE</div>

      <nav aria-label="Main navigation" className="sidebar-navigation">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end ?? false}
            className={({ isActive }) => "sidebar-nav-link" + (isActive ? " active" : "")}
          >
            <i className={"bi " + it.icon} aria-hidden="true" />
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-account">
          <span className="sidebar-account-avatar">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </span>
          <span>
            <strong>{user?.name || "Team member"}</strong>
            <small>{roleLabel}</small>
          </span>
        </div>
        <button type="button" className="sidebar-signout" onClick={signOut}>
          <i className="bi bi-box-arrow-right" aria-hidden="true" /> Sign out
        </button>
      </div>
    </aside>
  );
}
