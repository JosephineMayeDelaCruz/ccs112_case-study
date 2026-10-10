import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

function AdjustCountModal({ batch, close, onAdjusted }) {
  const notify = useToast();
  const [newCount, setNewCount] = useState(String(batch.qty));
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const count = parseInt(newCount, 10);
    if (isNaN(count) || count < 0) {
      notify("Enter a valid whole number.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await api.adjustBatch(batch.id, count, reason);
      onAdjusted(updated);
      notify(`Count adjusted for ${batch.code} to ${updated.qty} units.`, "success");
      close();
    } catch (err) {
      notify(err.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Adjust count — ${batch.code}`} onClose={close}>
      <form onSubmit={submit}>
        <div className="form-field mb-2">
          <label>Product</label>
          <input className="search-input w-100" value={batch.product} disabled />
        </div>
        <div className="form-field mb-2">
          <label htmlFor="adj-count">New count (whole number)</label>
          <input
            id="adj-count"
            type="number"
            min="0"
            step="1"
            className="search-input w-100"
            value={newCount}
            onChange={(e) => setNewCount(e.target.value)}
            placeholder="0"
            autoFocus
          />
        </div>
        <div className="form-field mb-3">
          <label htmlFor="adj-reason">Reason</label>
          <input
            id="adj-reason"
            className="search-input w-100"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. physical recount"
          />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline" className="px-4 py-2" onClick={close} disabled={submitting}>Cancel</Button>
          <Button type="submit" className="px-4 py-2" disabled={submitting}>
            {submitting ? "Saving…" : "Save adjustment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function StockAdjustments() {
  const [batches, setBatches] = useState(null);
  const [adjustingBatch, setAdjustingBatch] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getBatches().then(setBatches).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!batches) return <Loading />;

  const handleAdjusted = (updated) => {
    setBatches((bs) => bs.map((b) => (b.id === updated.id ? { ...b, qty: updated.qty } : b)));
  };

  return (
    <div className="content-area">
      <PageHeader title="Stock Adjustments / Batches" />
      <table className="table table-soft mb-0">
        <thead>
          <tr>
            <th>Batch</th>
            <th>Product</th>
            <th>Received</th>
            <th>Expiry</th>
            <th>Qty</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr
              className="rowbox"
              key={b.id}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") setAdjustingBatch(b); }}
            >
              <td className="fw-semibold py-3">{b.code}</td>
              <td>{b.product}</td>
              <td>{b.received}</td>
              <td className="text-muted">{b.expiry_date ?? "—"}</td>
              <td>{b.qty}</td>
              <td>
                <button
                  className="btn-outline-tan px-3 py-1"
                  style={{ fontSize: ".78rem" }}
                  aria-label={`Adjust ${b.code}`}
                  onClick={() => setAdjustingBatch(b)}
                >
                  Adjust
                </button>
              </td>
            </tr>
          ))}
          {batches.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted py-4">No batches found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {adjustingBatch && (
        <AdjustCountModal
          batch={adjustingBatch}
          close={() => setAdjustingBatch(null)}
          onAdjusted={handleAdjusted}
        />
      )}
    </div>
  );
}
