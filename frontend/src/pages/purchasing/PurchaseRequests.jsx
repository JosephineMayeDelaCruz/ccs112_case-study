import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Table from "../../components/common/Table.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

function NewRequestModal({ close, onAdd }) {
  const notify = useToast();
  const [form, setForm] = useState({ item: "", qty: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const qty = parseInt(form.qty, 10);
    if (!form.item.trim() || !qty || qty < 1) {
      notify("Enter an item name and a whole number quantity.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({ item: form.item, qty, notes: form.notes });
      close();
    } catch (err) {
      notify(err.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New purchase request" onClose={close}>
      <form onSubmit={submit}>
        <div className="form-field mb-2">
          <label htmlFor="pr-item">Item / product name</label>
          <input id="pr-item" className="search-input w-100" value={form.item} onChange={set("item")}
            placeholder="e.g. Carbon Filter Cartridge" autoFocus />
        </div>
        <div className="form-field mb-2">
          <label htmlFor="pr-qty">Quantity needed</label>
          <input id="pr-qty" type="number" min="1" step="1" className="search-input w-100"
            value={form.qty} onChange={set("qty")} placeholder="0" />
        </div>
        <div className="form-field mb-3">
          <label htmlFor="pr-notes">Notes (optional)</label>
          <input id="pr-notes" className="search-input w-100" value={form.notes} onChange={set("notes")}
            placeholder="Any additional details…" />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline" className="px-4 py-2" onClick={close} disabled={submitting}>Cancel</Button>
          <Button type="submit" className="px-4 py-2" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function PurchaseRequests() {
  const notify = useToast();
  const [requests, setRequests] = useState(null);
  const [convertingId, setConvertingId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getPurchaseRequests().then(setRequests).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!requests) return <Loading />;

  const addRequest = async (form) => {
    const newReq = await api.createPurchaseRequest(form);
    setRequests((rs) => [newReq, ...rs]);
    notify(`${newReq.id} submitted for ${form.item}.`, "success");
  };

  const convert = async (id) => {
    setConvertingId(id);
    try {
      const updated = await api.convertPurchaseRequest(id);
      setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status: updated.status } : r)));
      notify(`${id} converted to ${updated.convertedPoCode}.`, "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setConvertingId(null);
    }
  };

  const columns = [
    { key: "id",          label: "Request #",    className: "fw-semibold py-3" },
    { key: "requestedBy", label: "Requested by" },
    { key: "item",        label: "Item" },
    { key: "qty",         label: "Qty" },
    { key: "status",      label: "Status",        render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "action",
      label: "",
      render: (row) =>
        row.status === "Pending review" ? (
          <Button
            className="px-3 py-1"
            style={{ fontSize: ".78rem" }}
            disabled={convertingId === row.id}
            onClick={() => convert(row.id)}
          >
            {convertingId === row.id ? "Converting…" : "Convert to PO"}
          </Button>
        ) : row.convertedPoCode ? (
          <span className="text-muted" style={{ fontSize: ".8rem" }}>→ {row.convertedPoCode}</span>
        ) : (
          <span className="text-muted" style={{ fontSize: ".8rem" }}>—</span>
        ),
    },
  ];

  return (
    <div className="content-area">
      <PageHeader
        title="Purchase Requests"
        icon="bi-file-earmark-text"
        action={
          <Button className="px-3 py-2" onClick={() => setShowNew(true)}>
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />New request
          </Button>
        }
      />
      <Table columns={columns} rows={requests} emptyMessage="No purchase requests." />
      {showNew && <NewRequestModal close={() => setShowNew(false)} onAdd={addRequest} />}
    </div>
  );
}
