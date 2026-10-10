import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { LOW_STOCK_THRESHOLD } from "../../data/products.js";

export default function InventoryDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getProducts().then(setProducts).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!products) return <Loading />;

  const lowStockCount = products.filter((p) => p.qty < LOW_STOCK_THRESHOLD).length;
  const totalValue = products.reduce((s, p) => s + p.qty * p.price, 0);

  return (
    <div className="content-area">
      <PageHeader title="Dashboard" />

      {/* KPI stats */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <StatCard label="Total products" value={products.length} />
        </div>
        <div className="col-4">
          <StatCard label="Low stock" value={lowStockCount} />
        </div>
        <div className="col-4">
          <StatCard label="Total value" value={formatCurrency(totalValue)} fontSize="1.3rem" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="row g-3">
        <div className="col-6">
          <button
            className="btn-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/inventory/products")}
          >
            <i className="bi bi-box-seam me-2" aria-hidden="true" />
            Products
          </button>
        </div>
        <div className="col-6">
          <button
            className="btn-outline-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/inventory/adjustments")}
          >
            <i className="bi bi-sliders me-2" aria-hidden="true" />
            Stock Adjustments
          </button>
        </div>
        <div className="col-6">
          <button
            className="btn-outline-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/inventory/movements")}
          >
            <i className="bi bi-arrow-left-right me-2" aria-hidden="true" />
            Stock Movements
          </button>
        </div>
        <div className="col-6">
          <button
            className="btn-outline-tan w-100 py-3 fw-bold"
            style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/inventory/reports")}
          >
            <i className="bi bi-graph-up me-2" aria-hidden="true" />
            Reports
          </button>
        </div>
      </div>
    </div>
  );
}
