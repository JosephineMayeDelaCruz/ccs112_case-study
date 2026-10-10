import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Table from "../../components/common/Table.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { useToast } from "../../context/ToastContext.jsx";

function NewPOModal({ close, onAdd }) {
  const notify = useToast();
  const [form, setForm] = useState({ supplier: "", items: "", total: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const items = parseInt(form.items, 10);
    const total = parseFloat(form.total);
    if (!form.supplier.trim() || !items || isNaN(total)) {
      notify("Fill in supplier, items, and total.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({ supplier: form.supplier, items, total, notes: form.notes });
      close();
    } catch (err) {
      notify(err.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New purchase order" onClose={close}>
      <form onSubmit={submit}>
        <div className="form-field mb-2">
          <label htmlFor="po-supplier">Supplier</label>
          <input id="po-supplier" className="search-input w-100" value={form.supplier} onChange={set("supplier")}
            placeholder="e.g. CoolAir Distribution" />
        </div>
        <div className="row g-2 mb-2">
          <div className="col-6 form-field">
            <label htmlFor="po-items">Line items</label>
            <input id="po-items" type="number" min="1" step="1" className="search-input w-100"
              value={form.items} onChange={set("items")} placeholder="0" />
          </div>
          <div className="col-6 form-field">
            <label htmlFor="po-total">Estimated total (₱)</label>
            <input id="po-total" type="number" min="0" className="search-input w-100"
              value={form.total} onChange={set("total")} placeholder="0.00" />
          </div>
        </div>
        <div className="form-field mb-3">
          <label htmlFor="po-notes">Notes (optional)</label>
          <input id="po-notes" className="search-input w-100" value={form.notes} onChange={set("notes")}
            placeholder="Any special instructions…" />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline" className="px-4 py-2" onClick={close} disabled={submitting}>Cancel</Button>
          <Button type="submit" className="px-4 py-2" disabled={submitting}>
            {submitting ? "Creating…" : "Create PO"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function PurchaseOrders() {
  const notify = useToast();
  const [orders, setOrders] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [actionId, setActionId] = useState(null); // id of the PO being approved/received
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getPurchaseOrders().then(setOrders).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!orders) return <Loading />;

  const addPO = async (form) => {
    const newOrder = await api.addPurchaseOrder(form);
    setOrders((os) => os.concat([newOrder]));
    notify(`${newOrder.id} created for ${form.supplier}.`, "success");
  };

  const approve = async (id) => {
    setActionId(id);
    try {
      const updated = await api.approvePurchaseOrder(id);
      setOrders((os) => os.map((o) => (o.id === id ? updated : o)));
      notify(`${id} approved.`, "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setActionId(null);
    }
  };

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
      render: (row) => {
        if (row.status === "Pending") {
          return (
            <button
              className="btn-outline-tan px-3 py-1"
              style={{ fontSize: ".78rem" }}
              disabled={actionId === row.id}
              onClick={() => approve(row.id)}
            >
              {actionId === row.id ? "…" : "Approve"}
            </button>
          );
        }
        if (row.status === "Approved") {
          return (
            <button
              className="btn-outline-tan px-3 py-1"
              style={{ fontSize: ".78rem" }}
              disabled={actionId === row.id}
              onClick={() => receive(row.id)}
            >
              {actionId === row.id ? "…" : "Mark received"}
            </button>
          );
        }
        return <span className="text-muted" style={{ fontSize: ".8rem" }}>✓ Received</span>;
      },
    },
  ];

  return (
    <div className="content-area">
      <PageHeader
        title="Purchase Orders"
        icon="bi-cart"
        action={
          <Button className="px-3 py-2" onClick={() => setShowNew(true)}>
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />New PO
          </Button>
        }
      />
      <Table columns={columns} rows={orders} emptyMessage="No purchase orders yet." />
      {showNew && <NewPOModal close={() => setShowNew(false)} onAdd={addPO} />}
    </div>
  );
}
