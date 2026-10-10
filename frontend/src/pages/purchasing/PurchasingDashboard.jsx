import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function PurchasingDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api
      .getPurchasingDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!data) return <Loading />;

  const maxSpend = Math.max(...(data.monthlySpend?.map((m) => m.spend) ?? [1]), 1);

  return (
    <div className="content-area">
      <PageHeader title="Dashboard" />

      {/* KPI stats */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="kpi-pill-card">
            <div className="kpi-label">Open POs</div>
            <div className="kpi-value">{data.openPOs}</div>
          </div>
        </div>
        <div className="col-4">
          <div className="kpi-pill-card">
            <div className="kpi-label">Pending approval</div>
            <div className="kpi-value">{data.pendingCount}</div>
          </div>
        </div>
        <div className="col-4">
          <div className="kpi-pill-card">
            <div className="kpi-label">Total committed</div>
            <div className="kpi-value" style={{ fontSize: "1.2rem" }}>
              {formatCurrency(data.totalCommitted)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="row g-3 mb-4">
        <div className="col-6">
          <button
            className="btn-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/purchasing/orders")}
          >
            <i className="bi bi-cart me-2" aria-hidden="true" />
            Purchase Orders
          </button>
        </div>
        <div className="col-6">
          <button
            className="btn-outline-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/purchasing/requests")}
          >
            <i className="bi bi-file-earmark-text me-2" aria-hidden="true" />
            Purchase Requests
          </button>
        </div>
        <div className="col-6">
          <button
            className="btn-outline-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/purchasing/suppliers")}
          >
            <i className="bi bi-truck me-2" aria-hidden="true" />
            Suppliers
          </button>
        </div>
      </div>

      {/* Monthly spend chart — real data */}
      <div className="card-soft p-4">
        <div className="fw-bold mb-3">Monthly spend</div>
        {data.monthlySpend?.length > 0 ? (
          <div className="mini-bars" aria-label="Monthly spend bar chart">
            {data.monthlySpend.map((b, i) => (
              <div className="mini-bar-col" key={i}>
                <div
                  className="mini-bar"
                  style={{
                    height: Math.max((b.spend / maxSpend) * 80, b.spend > 0 ? 4 : 0),
                    background: b.spend > 0 ? "#C98A6B" : "#e0d5c0",
                  }}
                  title={`${b.month}: ${formatCurrency(b.spend)}`}
                />
                <div className="text-muted" style={{ fontSize: ".72rem", marginTop: 6 }}>
                  {b.month}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted" style={{ fontSize: ".88rem" }}>No spend data yet.</div>
        )}
      </div>
    </div>
  );
}
