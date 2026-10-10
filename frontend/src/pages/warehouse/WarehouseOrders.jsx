import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Table from "../../components/common/Table.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function WarehouseOrders() {
  const notify = useToast();
  const [orders, setOrders] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getPurchaseOrders().then(setOrders).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!orders) return <Loading />;

  const receive = async (id) => {
    setActionId(id);
    try {
      const updated = await api.receivePurchaseOrder(id);
      setOrders((os) => os.map((o) => (o.id === id ? updated : o)));
      notify(`${id} marked as Received.`, "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setActionId(null);
    }
  };

  const columns = [
    { key: "id",       label: "PO #",      className: "fw-semibold py-3" },
    { key: "supplier", label: "Supplier" },
    { key: "items",    label: "Items" },
    { key: "total",    label: "Total",     render: (row) => formatCurrency(row.total) },
    { key: "status",   label: "Status",    render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "action",
      label: "",
      render: (row) =>
        row.status === "Approved" ? (
          <Button
            className="px-3 py-1"
            style={{ fontSize: ".78rem" }}
            disabled={actionId === row.id}
            onClick={() => receive(row.id)}
          >
            {actionId === row.id ? "…" : "Mark received"}
          </Button>
        ) : (
          <span className="text-muted" style={{ fontSize: ".8rem" }}>
            {row.status === "Received" ? "✓ Received" : row.status}
          </span>
        ),
    },
  ];

  return (
    <div className="content-area">
      <PageHeader title="Incoming orders" icon="bi-truck" />
      <Table columns={columns} rows={orders} emptyMessage="No incoming orders." />
    </div>
  );
}
