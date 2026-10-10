import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api
      .getAdminDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!data) return <Loading />;

  const stats = [
    { label: "Total users",       value: String(data.totalUsers) },
    { label: "Low Stock\nAlerts", value: String(data.lowStockAlerts) },
    { label: "Pending\nApprovals", value: String(data.pendingApprovals) },
    { label: "Active Today",      value: String(data.activeToday) },
  ];

  const maxCount = Math.max(...(data.weeklyMovements?.map((d) => d.count) ?? [1]), 1);

  return (
    <div className="content-area">
      <PageHeader title="Dashboard" />
      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-6 col-md-3" key={s.label}>
            <StatCard label={s.label} value={s.value} />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="row g-3 mb-4">
        <div className="col-6">
          <button
            className="btn-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/admin/users")}
          >
            <i className="bi bi-people me-2" aria-hidden="true" />User Management
          </button>
        </div>
        <div className="col-6">
          <button
            className="btn-outline-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/admin/audit-logs")}
          >
            <i className="bi bi-clock-history me-2" aria-hidden="true" />Audit Logs
          </button>
        </div>
        <div className="col-6">
          <button
            className="btn-outline-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/admin/roles")}
          >
            <i className="bi bi-shield-lock me-2" aria-hidden="true" />Roles &amp; Permissions
          </button>
        </div>
        <div className="col-6">
          <button
            className="btn-outline-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/admin/settings")}
          >
            <i className="bi bi-gear me-2" aria-hidden="true" />Settings
          </button>
        </div>
      </div>

      <div className="card-soft p-4">
        <div className="fw-bold mb-3">Weekly stock movements</div>
        <div className="bars-wrap" aria-label="Weekly movement bar chart">
          {(data.weeklyMovements ?? []).map((d, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div
                className="bar"
                style={{ height: Math.max((d.count / maxCount) * 144, 4) }}
                title={`${d.date}: ${d.count} movement(s)`}
              />
              <div style={{ fontSize: ".68rem", color: "var(--text-muted)", marginTop: 4 }}>{d.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
