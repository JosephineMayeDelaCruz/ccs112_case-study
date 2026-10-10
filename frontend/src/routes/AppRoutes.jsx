import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout.jsx";
import Login from "../pages/auth/Login.jsx";

import AdminDashboard      from "../pages/admin/AdminDashboard.jsx";
import Users               from "../pages/admin/Users.jsx";
import RolesPermissions    from "../pages/admin/RolesPermissions.jsx";
import AuditLogs           from "../pages/admin/AuditLogs.jsx";
import Settings            from "../pages/admin/Settings.jsx";

import InventoryDashboard  from "../pages/inventory/InventoryDashboard.jsx";
import Products            from "../pages/inventory/Products.jsx";
import StockAdjustments    from "../pages/inventory/StockAdjustments.jsx";
import StockMovements      from "../pages/inventory/StockMovements.jsx";
import InventoryReports    from "../pages/inventory/InventoryReports.jsx";

import WarehouseDashboard  from "../pages/warehouse/WarehouseDashboard.jsx";
import Receiving           from "../pages/warehouse/Receiving.jsx";
import StockMovement       from "../pages/warehouse/StockMovement.jsx";
import WarehouseOrders     from "../pages/warehouse/WarehouseOrders.jsx";

import PickingDashboard    from "../pages/picking/PickingDashboard.jsx";
import PickingOrders       from "../pages/picking/PickingOrders.jsx";
import PickList            from "../pages/picking/PickList.jsx";
import Fulfillment         from "../pages/picking/Fulfillment.jsx";

import PurchasingDashboard from "../pages/purchasing/PurchasingDashboard.jsx";
import PurchaseOrders      from "../pages/purchasing/PurchaseOrders.jsx";
import Suppliers           from "../pages/purchasing/Suppliers.jsx";
import PurchaseRequests    from "../pages/purchasing/PurchaseRequests.jsx";

// ─── Role-based nav definitions ──────────────────────────────────────────────
//
// `end: true`  — NavLink only highlights on an exact path match, so the
//                Dashboard item is not active when you are on a sub-page.
// `label`      — also used by Header to derive the current page title.
//
// Every page a role can reach must appear in that role's nav so the sidebar
// never changes when you click a button on any page.

// ── System Admin ── role key: "admin"
export const ADMIN_NAV = [
  { to: "/admin",            icon: "bi-grid",          label: "Dashboard",          end: true },
  { to: "/admin/users",      icon: "bi-people",        label: "User Management" },
  { to: "/admin/roles",      icon: "bi-shield-lock",   label: "Roles & Permissions" },
  { to: "/admin/audit-logs", icon: "bi-clock-history", label: "Audit Logs" },
  { to: "/admin/settings",   icon: "bi-gear",          label: "Settings" },
];

// ── Inventory Clerk ── role key: "products"
export const INVENTORY_NAV = [
  { to: "/inventory",             icon: "bi-grid",              label: "Dashboard",        end: true },
  { to: "/inventory/products",    icon: "bi-box-seam",          label: "Products" },
  { to: "/inventory/adjustments", icon: "bi-sliders",           label: "Stock Adjustments" },
  { to: "/inventory/movements",   icon: "bi-arrow-left-right",  label: "Stock Movements" },
  { to: "/inventory/reports",     icon: "bi-graph-up",          label: "Reports" },
];

// ── Warehouse Staff ── role key: "staff"
// Warehouse and Picking are merged into ONE nav so the sidebar never
// changes when a warehouse staff member navigates between the two sections.
export const WAREHOUSE_NAV = [
  // — Warehouse —
  { to: "/warehouse",            icon: "bi-grid",              label: "Dashboard",       end: true },
  { to: "/warehouse/receiving",  icon: "bi-box-arrow-in-down", label: "Receiving" },
  { to: "/warehouse/movements",  icon: "bi-arrow-left-right",  label: "Movement Log" },
  { to: "/warehouse/orders",     icon: "bi-truck",             label: "Incoming Orders" },
  // — Picking —
  { to: "/picking",              icon: "bi-clipboard-check",   label: "Picking",         end: true },
  { to: "/picking/orders",       icon: "bi-list-ul",           label: "Picking Orders" },
  { to: "/picking/list",         icon: "bi-box-seam",          label: "Pick List" },
  { to: "/picking/fulfillment",  icon: "bi-check2-square",     label: "Fulfillment" },
];

// ── Purchasing Manager ── role key: "manager"
export const PURCHASING_NAV = [
  { to: "/purchasing",           icon: "bi-grid",               label: "Dashboard",        end: true },
  { to: "/purchasing/orders",    icon: "bi-cart",               label: "Purchase Orders" },
  { to: "/purchasing/requests",  icon: "bi-file-earmark-text",  label: "Purchase Requests" },
  { to: "/purchasing/suppliers", icon: "bi-truck",              label: "Suppliers" },
];

// ─── Root redirect ────────────────────────────────────────────────────────────
// Guests → /login.  Logged-in users → their role home (handled by MainLayout
// redirecting unauthenticated visitors, and by Login navigating on success).
function RootRedirect() {
  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/"      element={<RootRedirect />} />

      {/* ── System Admin ── */}
      <Route element={<MainLayout navItems={ADMIN_NAV} requiredRolePrefix="/admin" />}>
        <Route path="/admin"            element={<AdminDashboard />} />
        <Route path="/admin/users"      element={<Users />} />
        <Route path="/admin/roles"      element={<RolesPermissions />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
        <Route path="/admin/settings"   element={<Settings />} />
      </Route>

      {/* ── Inventory Clerk ── */}
      <Route element={<MainLayout navItems={INVENTORY_NAV} requiredRolePrefix="/inventory" />}>
        <Route path="/inventory"               element={<InventoryDashboard />} />
        <Route path="/inventory/products"      element={<Products />} />
        <Route path="/inventory/adjustments"   element={<StockAdjustments />} />
        <Route path="/inventory/movements"     element={<StockMovements />} />
        <Route path="/inventory/reports"       element={<InventoryReports />} />
      </Route>

      {/* ── Warehouse Staff (warehouse + picking unified under one sidebar) ── */}
      <Route element={<MainLayout navItems={WAREHOUSE_NAV} requiredRolePrefix="/warehouse|/picking" />}>
        <Route path="/warehouse"           element={<WarehouseDashboard />} />
        <Route path="/warehouse/receiving" element={<Receiving />} />
        <Route path="/warehouse/movements" element={<StockMovement />} />
        <Route path="/warehouse/orders"    element={<WarehouseOrders />} />

        <Route path="/picking"             element={<PickingDashboard />} />
        <Route path="/picking/orders"      element={<PickingOrders />} />
        <Route path="/picking/list"        element={<PickList />} />
        <Route path="/picking/fulfillment" element={<Fulfillment />} />
      </Route>

      {/* ── Purchasing Manager ── */}
      <Route element={<MainLayout navItems={PURCHASING_NAV} requiredRolePrefix="/purchasing" />}>
        <Route path="/purchasing"           element={<PurchasingDashboard />} />
        <Route path="/purchasing/orders"    element={<PurchaseOrders />} />
        <Route path="/purchasing/requests"  element={<PurchaseRequests />} />
        <Route path="/purchasing/suppliers" element={<Suppliers />} />
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
