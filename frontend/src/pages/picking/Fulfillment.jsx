import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Table from "../../components/common/Table.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { api } from "../../services/api.js";

export default function Fulfillment() {
  const notify = useToast();
  const [orders, setOrders] = useState(null);
  const [shippingId, setShippingId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    // Show Fulfilled and Shipped orders only
    api
      .getPickingOrders()
      .then((all) => setOrders(all.filter((o) => ["Fulfilled", "Shipped"].includes(o.status))))
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!orders) return <Loading />;

  const markShipped = async (code) => {
    setShippingId(code);
    try {
      const updated = await api.shipOrder(code);
      setOrders((os) => os.map((o) => (o.id === code ? { ...o, status: updated.status } : o)));
      notify(`${code} marked as shipped.`, "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setShippingId(null);
    }
  };

  const columns = [
    { key: "id",           label: "Order #",   className: "fw-semibold py-3" },
    { key: "customer",     label: "Customer" },
    { key: "fulfilled_at", label: "Fulfilled",  className: "text-muted" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "action",
      label: "",
      render: (row) =>
        row.status === "Fulfilled" ? (
          <Button
            className="px-3 py-1"
            style={{ fontSize: ".78rem" }}
            disabled={shippingId === row.id}
            onClick={() => markShipped(row.id)}
          >
            {shippingId === row.id ? "Shipping…" : "Mark shipped"}
          </Button>
        ) : (
          <span className="text-muted" style={{ fontSize: ".8rem" }}>—</span>
        ),
    },
  ];

  return (
    <div className="content-area">
      <PageHeader title="Fulfillment" icon="bi-truck" />
      <Table columns={columns} rows={orders} emptyMessage="No fulfilled orders yet." />
    </div>
  );
}
