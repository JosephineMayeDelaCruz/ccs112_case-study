import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLE_LABEL } from "../../utils/permissions.js";

/**
 * Derives the page title for the current URL by matching `navItems`.
 *
 * Matching strategy:
 *  1. Exact match (e.g. "/admin" → "Dashboard")
 *  2. Longest prefix match (e.g. "/warehouse/receiving" → "Receiving")
 * Falls back to the role name if nothing matches.
 */
function usePageTitle(navItems, roleFallback) {
  const { pathname } = useLocation();
  if (!navItems || navItems.length === 0) return roleFallback;

  // Try exact first, then longest-prefix
  const exact = navItems.find((item) => item.to === pathname);
  if (exact) return exact.label;

  let best = null;
  let bestLen = 0;
  for (const item of navItems) {
    if (
      pathname.startsWith(item.to + "/") &&
      item.to.length > bestLen
    ) {
      best = item;
      bestLen = item.to.length;
    }
  }
  return best ? best.label : roleFallback;
}

export default function Header({ navItems }) {
  const { user, role } = useAuth();
  const roleLabel = ROLE_LABEL[role] || role || "";
  const pageTitle = usePageTitle(navItems, roleLabel);

  return (
    <header className="workspace-header">
      <div>
        <div className="workspace-eyebrow">
          INVENTORY MANAGEMENT / {roleLabel}
        </div>
        <div className="workspace-title">{pageTitle}</div>
      </div>
      <div className="workspace-user">
        <span className="workspace-user-info">
          <strong>{user?.name || "Team member"}</strong>
          <small>{roleLabel}</small>
        </span>
        <span className="workspace-avatar" aria-hidden="true">
          {(user?.name || "W").charAt(0).toUpperCase()}
        </span>
      </div>
    </header>
  );
}
