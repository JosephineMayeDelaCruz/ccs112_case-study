import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Table from "../../components/common/Table.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";

export default function PickingOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getPickingOrders().then(setOrders).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!orders) return <Loading />;

  const columns = [
    { key: "id",       label: "Order #",    className: "fw-semibold py-3" },
    { key: "customer", label: "Customer" },
    { key: "items",    label: "Line items" },
    { key: "qty",      label: "Total qty" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "action",
      label: "",
      render: (row) =>
        row.status === "Pending" ? (
          <button
            className="btn-outline-tan px-3 py-1"
            style={{ fontSize: ".78rem" }}
            tabIndex={0}
            onClick={() =>
              navigate("/picking/list", {
                state: { code: row.id, customer: row.customer, lines: row.lines },
              })
            }
          >
            Pick
          </button>
        ) : (
          <span className="text-muted" style={{ fontSize: ".8rem" }}>
            {row.status === "Fulfilled" ? "✓ Done" : row.status}
          </span>
        ),
    },
  ];

  return (
    <div className="content-area">
      <PageHeader title="Picking orders" icon="bi-list-ul" />
      <Table columns={columns} rows={orders} emptyMessage="No orders to pick." />
    </div>
  );
}
