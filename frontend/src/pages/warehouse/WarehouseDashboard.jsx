import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Pill } from "../../components/common/StatusBadge.jsx";
import RecentActivity from "../../components/dashboard/RecentActivity.jsx";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { api } from "../../services/api.js";

function TransferModal({ products, close, onDone }) {
  const notify = useToast();
  const [form, setForm] = useState({ product_id: "", from: "Bin A-07", to: "Bin B-03", qty: "" });
  const [submitting, setSubmitting] = useState(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const qty = parseInt(form.qty, 10);
    if (!form.product_id || !qty || qty < 1) {
      notify("Select a product and enter a valid quantity.", "error");
      return;
    }
    const product = products.find((p) => String(p.id) === String(form.product_id));
    if (product && qty > product.qty) {
      notify(`Only ${product.qty} units available for ${product.name}.`, "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.addStockMovement({
        product_id:    product?.id ?? null,
        product_label: product?.name ?? "Unknown",
        type:          "transferred",
        qty,
        status:        "ok",
        reference:     `${form.from} → ${form.to}`,
      });
      notify(`Transferred ${qty} unit(s) of ${product?.name} from ${form.from} to ${form.to}.`, "success");
      onDone();
      close();
    } catch (err) {
      notify(err.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Transfer stock" onClose={close}>
      <form onSubmit={submit}>
        <div className="form-field mb-2">
          <label htmlFor="tf-product">Product</label>
          <select id="tf-product" className="search-input w-100" value={form.product_id}
            onChange={(e) => update("product_id", e.target.value)}>
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (qty: {p.qty})</option>
            ))}
          </select>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-6 form-field">
            <label htmlFor="tf-from">From</label>
            <input id="tf-from" className="search-input w-100" value={form.from}
              onChange={(e) => update("from", e.target.value)} />
          </div>
          <div className="col-6 form-field">
            <label htmlFor="tf-to">To</label>
            <input id="tf-to" className="search-input w-100" value={form.to}
              onChange={(e) => update("to", e.target.value)} />
          </div>
        </div>
        <div className="form-field mb-3">
          <label htmlFor="tf-qty">Quantity</label>
          <input id="tf-qty" type="number" min="1" step="1" className="search-input w-100"
            value={form.qty} onChange={(e) => update("qty", e.target.value)} placeholder="0" />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline" className="px-4 py-2" onClick={close} disabled={submitting}>Cancel</Button>
          <Button type="submit" className="px-4 py-2" disabled={submitting}>{submitting ? "Saving…" : "Confirm transfer"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function WarehouseDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useToast();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [error, setError] = useState(null);

  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  const load = () => {
    setError(null);
    Promise.all([api.getWarehouseDashboard(), api.getProducts()])
      .then(([dash, prods]) => {
        setStats(dash);
        setProducts(prods);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!stats) return <Loading />;

  return (
    <div className="content-area">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="fw-bold mb-0">Good Day, {firstName}</h4>
          <div className="text-muted" style={{ color: "var(--text-muted)" }}>Warehouse Staff</div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6">
          <button className="btn-tan w-100 py-3 fw-bold" style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/warehouse/receiving")}>
            Receive stock
          </button>
        </div>
        <div className="col-6">
          <button className="btn-outline-tan w-100 py-3 fw-bold" style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/picking/orders")}>
            Pick order
          </button>
        </div>
        <div className="col-6">
          <button className="btn-outline-tan w-100 py-3 fw-bold" style={{ fontSize: "1.05rem" }}
            onClick={() => setShowTransfer(true)}>
            Transfer
          </button>
        </div>
        <div className="col-6">
          <button className="btn-outline-tan w-100 py-3 fw-bold" style={{ fontSize: "1.05rem" }}
            onClick={() => navigate("/inventory/adjustments")}>
            Adjust count
          </button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6">
          <div className="card-soft p-3">
            <div className="fw-semibold">Low stock</div>
            <div className="fs-3 fw-bold my-1">{stats.lowStock}</div>
            <Pill>review</Pill>
          </div>
        </div>
        <div className="col-6">
          <div className="card-soft p-3">
            <div className="fw-semibold">Expiring 30d</div>
            <div className="fs-3 fw-bold my-1">{stats.expiring30}</div>
            <Pill>batches</Pill>
          </div>
        </div>
        <div className="col-6">
          <div className="card-soft p-3">
            <div className="fw-semibold">Flagged</div>
            <div className="fs-3 fw-bold my-1">{stats.flagged}</div>
            <Pill tone="pink">mismatch</Pill>
          </div>
        </div>
        <div className="col-6">
          <div className="card-soft p-3">
            <div className="fw-semibold">Transfers</div>
            <div className="fs-3 fw-bold my-1">{stats.pendingTransfers}</div>
            <Pill>recent</Pill>
          </div>
        </div>
      </div>

      <RecentActivity items={stats.recentActivity ?? []} />

      {showTransfer && (
        <TransferModal
          products={products.filter((p) => p.qty > 0)}
          close={() => setShowTransfer(false)}
          onDone={load}
        />
      )}
    </div>
  );
}
