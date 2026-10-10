import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { Pill } from "../../components/common/StatusBadge.jsx";
import { api } from "../../services/api.js";

export default function PickingDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api
      .getPickingDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!data) return <Loading />;

  return (
    <div className="content-area">
      <PageHeader title="Picking" icon="bi-box-seam" />
      <div className="row g-3 mb-3">
        <div className="col-6">
          <div className="card-soft p-3">
            <div className="fw-semibold">Orders to pick</div>
            <div className="fs-3 fw-bold my-1">{data.ordersToPick}</div>
            <Pill>pending</Pill>
          </div>
        </div>
        <div className="col-6">
          <div className="card-soft p-3">
            <div className="fw-semibold">Fulfilled today</div>
            <div className="fs-3 fw-bold my-1">{data.fulfilledToday}</div>
            <Pill tone="green">complete</Pill>
          </div>
        </div>
      </div>
      <button
        className="btn-tan w-100 py-3 fw-bold"
        style={{ fontSize: "1.05rem" }}
        onClick={() => navigate("/picking/orders")}
      >
        View picking orders
      </button>
    </div>
  );
}
