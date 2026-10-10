import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Modal from "../../components/common/Modal.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { api } from "../../services/api.js";

const TABS = ["Received", "Sold", "Transferred", "Adjusted", "Returned"];

function ProductPickerModal({ products, close, onSelect }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const visible = products.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q)
  );

  return (
    <Modal title="Choose product" onClose={close}>
      <input
        className="search-input w-100 mb-3"
        placeholder="Search products…"
        value={search}
        autoFocus
        onChange={(e) => setSearch(e.target.value)}
      />
      <div style={{ maxHeight: 320, overflowY: "auto" }}>
        {visible.map((p) => (
          <div
            key={p.id}
            className="d-flex align-items-center gap-3 p-2 mb-2"
            style={{ background: "#fff", borderRadius: 10, cursor: "pointer" }}
            tabIndex={0}
            role="button"
            onClick={() => { onSelect(p); close(); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { onSelect(p); close(); } }}
          >
            <div className="placeholder-icon" style={{ width: 40, height: 40, fontSize: "1.1rem" }}>
              <i className="bi bi-box-seam" aria-hidden="true" />
            </div>
            <div>
              <div className="fw-bold">{p.name}</div>
              <div className="text-muted" style={{ fontSize: ".8rem" }}>
                {p.sku ? `SKU ${p.sku} · ` : ""}qty {p.qty}
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="text-center text-muted py-3">No products found.</div>
        )}
      </div>
      <div className="d-flex justify-content-end mt-2">
        <button className="btn-outline-tan px-4 py-2" onClick={close}>Cancel</button>
      </div>
    </Modal>
  );
}

export default function Receiving() {
  const { user } = useAuth();
  const notify = useToast();

  const [tab, setTab] = useState("Received");
  const [products, setProducts] = useState(null);
  const [batches, setBatches] = useState([]);
  const [product, setProduct] = useState(null);
  const [batchId, setBatchId] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [qty, setQty] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load products on mount
  useEffect(() => {
    api.getProducts()
      .then((prods) => {
        setProducts(prods);
        if (prods.length > 0) setProduct(prods[0]);
      })
      .catch((err) => setError(err.message));
  }, []);

  // When product changes, load its batches (ordered by received_date)
  useEffect(() => {
    if (!product) return;
    api.getBatches()
      .then((all) => {
        const filtered = all.filter((b) => b.product_id === product.id && b.qty > 0);
        setBatches(filtered);
        setBatchId(filtered.length > 0 ? String(filtered[0].id) : "");
      })
      .catch(() => {});
  }, [product]);

  if (error) return <ApiError message={error} onRetry={() => window.location.reload()} />;
  if (!products) return <Loading />;

  const selectedBatch = batches.find((b) => String(b.id) === batchId);
  // The FIFO batch is the first (oldest) one in the list
  const fifoBatch = batches[0];
  const isNonFifo = selectedBatch && fifoBatch && selectedBatch.id !== fifoBatch.id;

  // For "Received" tab, we also allow creating a batch inline (no existing batch needed)
  const isInbound = tab === "Received" || tab === "Returned";

  const typeMap = {
    Received:    "received",
    Sold:        "transferred",
    Transferred: "transferred",
    Adjusted:    "adjusted",
    Returned:    "returned",
  };
  // Sold maps to "sold"
  const movementType = tab === "Sold" ? "sold" : typeMap[tab];

  const confirm = async () => {
    const parsedQty = parseInt(qty, 10);
    if (!parsedQty || parsedQty < 1) {
      notify("Enter a whole number quantity greater than 0.", "error");
      return;
    }
    if (!isInbound && !product) {
      notify("Select a product.", "error");
      return;
    }
    if (!isInbound && batches.length > 0 && !batchId) {
      notify("Select a batch.", "error");
      return;
    }
    if (isNonFifo && !overrideReason.trim()) {
      notify("Override reason is required for a non-FIFO batch.", "error");
      return;
    }
    // Stock check for outbound
    if (!isInbound && selectedBatch && parsedQty > selectedBatch.qty) {
      notify(`Only ${selectedBatch.qty} units available in batch ${selectedBatch.code}.`, "error");
      return;
    }
    if (!isInbound && !selectedBatch && product && parsedQty > product.qty) {
      notify(`Only ${product.qty} units available for ${product.name}.`, "error");
      return;
    }

    setSubmitting(true);
    try {
      await api.addStockMovement({
        product_id:      product?.id ?? null,
        batch_id:        batchId ? parseInt(batchId, 10) : null,
        product_label:   product?.name ?? "Unknown",
        type:            movementType,
        qty:             parsedQty,
        status:          isNonFifo ? "flag" : "ok",
        override_reason: isNonFifo ? overrideReason : null,
        reference:       selectedBatch ? selectedBatch.code : null,
      });

      notify(
        `${tab} recorded: ${parsedQty} unit(s) of ${product?.name}` +
          (selectedBatch ? ` (${selectedBatch.code})` : "") +
          ".",
        "success"
      );

      // Refresh product qty
      const updated = await api.getProducts();
      const refreshed = updated.find((p) => p.id === product?.id);
      if (refreshed) setProduct(refreshed);

      // Refresh batches for this product
      const allBatches = await api.getBatches();
      const filtered = allBatches.filter((b) => b.product_id === product?.id && b.qty > 0);
      setBatches(filtered);
      setBatchId(filtered.length > 0 ? String(filtered[0].id) : "");

      setQty("");
      setUnitPrice("");
      setOverrideReason("");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content-area">
      <PageHeader title="New stock transaction" />

      {/* Tab pills */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            className={"filter-pill " + (tab === t ? "active" : "")}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Selected product */}
      <div className="card-soft p-3 d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="placeholder-icon" style={{ width: 46, height: 46, fontSize: "1.2rem" }}>
            <i className="bi bi-box-seam" aria-hidden="true" />
          </div>
          <div>
            <div className="fw-bold">{product?.name ?? "No product selected"}</div>
            <div className="text-muted" style={{ fontSize: ".85rem" }}>
              {product?.sku ? `SKU ${product.sku}` : "No SKU"} · qty {product?.qty ?? 0}
            </div>
          </div>
        </div>
        <button className="btn-outline-tan px-3 py-1" onClick={() => setShowPicker(true)}>
          Change
        </button>
      </div>

      {/* Batch selector (outbound operations) */}
      {!isInbound && batches.length > 0 && (
        <>
          <div className="fw-semibold mb-2">Select batch</div>
          {batches.map((b, idx) => (
            <div
              key={b.id}
              className="d-flex justify-content-between align-items-center px-3 py-2 mb-2"
              style={{
                background: String(b.id) === batchId ? "var(--pill-tan)" : "#fff",
                borderRadius: 12,
                cursor: "pointer",
                boxShadow: "var(--shadow)",
              }}
              tabIndex={0}
              role="button"
              aria-pressed={String(b.id) === batchId}
              onClick={() => setBatchId(String(b.id))}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setBatchId(String(b.id)); }}
            >
              <span>
                {b.code} · {b.received} · qty {b.qty}
                {b.expiry_date ? ` · exp ${b.expiry_date}` : ""}
              </span>
              {idx === 0 ? (
                <span className="fw-bold" style={{ fontSize: ".8rem" }}>FIFO</span>
              ) : (
                <span className="text-muted" style={{ fontSize: ".8rem" }}>select</span>
              )}
            </div>
          ))}

          {/* FIFO override warning */}
          {isNonFifo && (
            <div className="card-soft p-3 mb-3" style={{ background: "#F6EFD9" }}>
              <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                <i className="bi bi-exclamation-triangle" aria-hidden="true" />
                <span>Override reason required — this isn't the oldest batch</span>
              </div>
              <input
                className="search-input w-100"
                placeholder="Reason for overriding FIFO"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </div>
          )}

          {batches.length === 0 && !isInbound && (
            <div className="text-muted mb-3" style={{ fontSize: ".88rem" }}>
              No batches with stock available for this product.
            </div>
          )}
        </>
      )}

      {/* Qty / price */}
      <div className="row g-2 mb-3">
        <div className="col-6 form-field">
          <label htmlFor="rcv-qty">Quantity</label>
          <input
            id="rcv-qty"
            type="number"
            min="1"
            step="1"
            className="search-input w-100"
            placeholder="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
        <div className="col-6 form-field">
          <label htmlFor="rcv-price">Unit price (optional)</label>
          <input
            id="rcv-price"
            type="number"
            min="0"
            className="search-input w-100"
            placeholder="0.00"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <span>By <strong>{user?.name ?? "—"}</strong></span>
        <span className="text-muted">Time: <strong>Auto</strong></span>
      </div>

      <button
        className="btn-tan w-100 py-2 fw-bold mt-3"
        onClick={confirm}
        disabled={submitting}
      >
        {submitting ? "Saving…" : "Confirm"}
      </button>

      {showPicker && (
        <ProductPickerModal
          products={products}
          close={() => setShowPicker(false)}
          onSelect={(p) => { setProduct(p); setBatchId(""); }}
        />
      )}
    </div>
  );
}
