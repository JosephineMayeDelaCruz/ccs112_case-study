import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { downloadCSV } from "../../utils/formatCurrency.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function InventoryReports() {
  const notify = useToast();
  const [products, setProducts] = useState(null);
  const [movements, setMovements] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    Promise.all([api.getProducts(), api.getMovementRows()])
      .then(([p, m]) => { setProducts(p); setMovements(m); })
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!products || !movements) return <Loading />;

  const reportTypes = [
    {
      icon: "bar-chart",
      label: "Stock levels",
      desc: "Current on-hand quantities by product",
      download: () => downloadCSV(
        "stock-levels.csv",
        [["Product", "Category", "Qty", "Price (Php)"]].concat(
          products.map((p) => [p.name, p.category, p.qty, p.price])
        )
      ),
    },
    {
      icon: "graph-up-arrow",
      label: "Sales summary",
      desc: "Sold stock movements",
      download: () => downloadCSV(
        "sales-summary.csv",
        [["Product", "Type", "Qty", "Status"]].concat(
          movements.filter((m) => m.type === "sold")
            .map((m) => [m.product, m.type, m.qty, m.status])
        )
      ),
    },
    {
      icon: "bag",
      label: "Stock movements",
      desc: "All receives, sales, transfers, and adjustments",
      download: () => downloadCSV(
        "stock-movements.csv",
        [["Product", "Type", "Qty", "Status"]].concat(
          movements.map((m) => [m.product, m.type, m.qty, m.status])
        )
      ),
    },
  ];

  return (
    <div className="content-area">
      <PageHeader title="Reports" />
      <div className="row g-3">
        {reportTypes.map((r) => (
          <div className="col-4" key={r.label}>
            <div className="report-card">
              <div className="icon-badge"><i className={"bi bi-" + r.icon} aria-hidden="true"></i></div>
              <div className="fw-bold mb-1">{r.label}</div>
              <div className="text-muted mb-3" style={{ fontSize: ".8rem" }}>{r.desc}</div>
              <button
                className="btn-outline-tan px-3 py-1"
                style={{ fontSize: ".8rem" }}
                onClick={() => { r.download(); notify(r.label + " downloaded.", "success"); }}
              >
                Download CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
