import React, { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import Loading from "../common/Loading.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { canAccess, homeFor } from "../../utils/permissions.js";

export default function MainLayout({ navItems, requiredRolePrefix }) {
  const { user, role, checkingSession } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on every navigation
  React.useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Keyboard escape closes the mobile drawer
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (checkingSession) return <Loading label="Checking session..." />;
  if (!user) return <Navigate to="/login" replace />;

  // Logged-in but wrong role → send to their actual home (not back to /login)
  if (requiredRolePrefix && !canAccess(role, requiredRolePrefix)) {
    return <Navigate to={homeFor(role)} replace />;
  }

  return (
    <div className="app-shell">
      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-button"
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <i className="bi bi-list" />
        </button>
        <span className="mobile-brand">WalangBrownout</span>
        <span className="mobile-topbar-mark" aria-hidden="true">W</span>
      </div>

      {/* Scrim behind open drawer */}
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="device-frame d-flex">
        {/* ── Sidebar ── */}
        <div className={"sidebar-container" + (mobileOpen ? " is-open" : "")}>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <i className="bi bi-x-lg" />
          </button>
          <Sidebar items={navItems} />
        </div>

        {/* ── Main workspace ── */}
        <div className="workspace d-flex flex-column flex-fill">
          {/* Header receives navItems so it can derive the current page title */}
          <Header navItems={navItems} />
          <main className="workspace-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
