import React from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";

const ROLES = [
  {
    key: "admin",
    label: "System Admin",
    icon: "bi-shield-lock",
    desc: "Full access: manage users, view audit logs, configure settings, and access all modules.",
    permissions: ["User Management", "Audit Logs", "Settings", "All Modules (read)"],
  },
  {
    key: "staff",
    label: "Warehouse Staff",
    icon: "bi-box-seam",
    desc: "Handles physical stock: receiving, picking orders, stock transfers, and adjustments.",
    permissions: ["Warehouse Dashboard", "Receiving", "Movement Log", "Picking Orders", "Pick List", "Fulfillment"],
  },
  {
    key: "manager",
    label: "Purchasing Manager",
    icon: "bi-cart",
    desc: "Manages procurement: create/approve purchase orders and handle supplier relationships.",
    permissions: ["Purchasing Dashboard", "Purchase Orders", "Purchase Requests", "Suppliers"],
  },
  {
    key: "products",
    label: "Inventory Clerk",
    icon: "bi-clipboard-data",
    desc: "Maintains product catalog and stock accuracy: batch adjustments and inventory reports.",
    permissions: ["Inventory Dashboard", "Products", "Stock Adjustments", "Stock Movements", "Reports"],
  },
];

export default function RolesPermissions() {
  return (
    <div className="content-area">
      <PageHeader title="Roles & Permissions" icon="bi-shield-lock" />
      <div className="row g-3 mb-4">
        {ROLES.map((r) => (
          <div className="col-12 col-md-6" key={r.key}>
            <div className="card-soft p-3 h-100">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className={"bi " + r.icon} style={{ color: "var(--accent-dark)", fontSize: "1.1rem" }} aria-hidden="true" />
                <div className="fw-bold">{r.label}</div>
              </div>
              <div className="text-muted mb-2" style={{ fontSize: ".85rem" }}>{r.desc}</div>
              <div style={{ fontSize: ".8rem" }}>
                {r.permissions.map((p) => (
                  <span
                    key={p}
                    className="me-1 mb-1 d-inline-block px-2 py-1"
                    style={{ background: "var(--pill-tan)", borderRadius: 8 }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card-soft p-3">
        <div className="fw-semibold mb-2" style={{ fontSize: ".88rem", color: "var(--text-muted)" }}>
          <i className="bi bi-info-circle me-1" aria-hidden="true" />
          Role assignment is managed in User Management. Permissions are enforced on both the frontend (route guards)
          and the backend (per-endpoint role checks).
        </div>
      </div>
    </div>
  );
}
