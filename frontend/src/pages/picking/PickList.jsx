import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { api } from "../../services/api.js";

// ── Damage report modal ───────────────────────────────────────────────────────
function DamageReportModal({ batchLabel, onConfirm, close }) {
  const [note, setNote] = useState("");
  const submit = () => {
    if (!note.trim()) return;
    onConfirm(note);
    close();
  };
  return (
    <Modal title="Report damaged batch" onClose={close}>
      <div className="form-field mb-3">
        <label htmlFor="dmg-note">What's wrong with this batch?</label>
        <input
          id="dmg-note"
          className="search-input w-100"
          value={note}
          autoFocus
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Water damage on outer packaging"
        />
      </div>
      <div className="d-flex justify-content-end gap-2">
        <Button variant="outline" className="px-4 py-2" onClick={close}>Cancel</Button>
        <Button className="px-4 py-2" onClick={submit} disabled={!note.trim()}>Report damage</Button>
      </div>
    </Modal>
  );
}

// ── FIFO Override modal ───────────────────────────────────────────────────────
function FifoOverrideModal({ batches, onConfirm, close }) {
  const REASONS = ["Older batch is damaged", "Older batch not found", "Older batch is expired"];
  const [reason, setReason] = useState(REASONS[0]);
  const [remarks, setRemarks] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(batches[1]?.id ?? "");

  const confirm = () => {
    onConfirm({ reason: `${reason}${remarks ? ": " + remarks : ""}`, batchId: selectedBatch });
    close();
  };

  return (
    <Modal title="FIFO Override" onClose={close}>
      <div className="fw-semibold mb-2">Reason</div>
      {REASONS.map((r) => (
        <div
          key={r}
          className="radio-row"
          style={{ cursor: "pointer" }}
          tabIndex={0}
          role="button"
          aria-pressed={reason === r}
          onClick={() => setReason(r)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setReason(r); }}
        >
          <div className={"radio-dot " + (reason === r ? "selected" : "")} />
          <span>{r}</span>
        </div>
      ))}

      {batches.length > 1 && (
        <div className="form-field mt-3 mb-2">
          <label htmlFor="override-batch">Use batch instead</label>
          <select
            id="override-batch"
            className="search-input w-100"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            {batches.slice(1).map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} · {b.received} · qty {b.qty}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-field mt-2 mb-4">
        <label htmlFor="override-remarks">Additional remarks</label>
        <input
          id="override-remarks"
          className="search-input w-100"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end gap-2">
        <Button variant="outline" className="px-4 py-2" onClick={close}>Cancel</Button>
        <Button className="px-4 py-2" onClick={confirm}>Confirm override</Button>
      </div>
    </Modal>
  );
}

// ── Main PickList page ────────────────────────────────────────────────────────
export default function PickList() {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useToast();

  const [showDamage, setShowDamage] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Damage note and override state accumulated before final submit
  const [damageNote, setDamageNote] = useState(null);
  const [overrideInfo, setOverrideInfo] = useState(null); // { reason, batchId }

  // Order and FIFO data
  const [fifoBatches, setFifoBatches] = useState([]);
  const [loadingFifo, setLoadingFifo] = useState(false);

  const order = location.state ?? null;

  // Redirect back if opened without an order
  useEffect(() => {
    if (!order?.code) {
      navigate("/picking/orders", { replace: true });
    }
  }, [order, navigate]);

  // Load FIFO batches for the first product line
  useEffect(() => {
    if (!order?.lines?.length) return;
    const firstLine = order.lines[0];
    if (!firstLine?.product_id) return;

    setLoadingFifo(true);
    api.getBatches()
      .then((all) => {
        const relevant = all
          .filter((b) => b.product_id === firstLine.product_id && b.qty > 0)
          .sort((a, b) => new Date(a.received) - new Date(b.received));
        setFifoBatches(relevant);
      })
      .catch(() => {})
      .finally(() => setLoadingFifo(false));
  }, [order]);

  if (!order?.code) return null;

  const fifoBatch = overrideInfo ? fifoBatches.find((b) => String(b.id) === String(overrideInfo.batchId)) : fifoBatches[0];
  const firstLine = order.lines?.[0];

  const submitPick = async () => {
    setSubmitting(true);
    try {
      const payload = {};
      if (overrideInfo) {
        payload.override_reason = overrideInfo.reason;
        payload.batch_overrides = { [firstLine?.id]: overrideInfo.batchId };
      }
      if (damageNote) {
        payload.damage_note = damageNote;
      }

      await api.pickOrder(order.code, payload);
      notify(`Pick submitted for order ${order.code}.`, "success");
      navigate("/picking/orders", { replace: true });
    } catch (err) {
      notify(err.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-shell" style={{ position: "relative" }}>
      <div className="mobile-side">
        <button className="back-btn" onClick={() => navigate("/picking/orders")} aria-label="Back">
          <i className="bi bi-arrow-left" aria-hidden="true" />
        </button>
        <h5 className="fw-bold">FIFO PICKING</h5>
      </div>
      <div className="mobile-main">
        <div className="item-header-bar">Order: {order.code}</div>
        <div className="mobile-body">
          <div className="field-label">Customer</div>
          <div className="field-box">{order.customer}</div>

          {/* Line items summary */}
          <div className="field-label">Items to pick</div>
          {(order.lines ?? []).map((line, i) => (
            <div key={i} className="field-box mb-2" style={{ lineHeight: 1.9 }}>
              <strong>{line.product_label}</strong><br />
              Qty required: <strong>{line.qty} pcs</strong>
            </div>
          ))}

          {/* FIFO recommendation */}
          <div className="field-label">FIFO Recommendation</div>
          {loadingFifo ? (
            <div className="field-box text-muted">Loading batch info…</div>
          ) : fifoBatch ? (
            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="field-box text-center mb-0">
                  Recommended Batch:<br />
                  <strong>{fifoBatch.code}</strong>
                </div>
              </div>
              <div className="col-6">
                <div className="field-box text-center mb-0">
                  Available:<br />
                  <strong>{fifoBatch.qty} pcs</strong>
                </div>
              </div>
              {fifoBatch.expiry_date && (
                <div className="col-12">
                  <div className="field-box text-center mb-0">
                    Expiry: <strong>{fifoBatch.expiry_date}</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="field-box text-muted mb-3">No batch data available (stock may be tracked at product level).</div>
          )}

          {/* Override / damage status indicators */}
          {overrideInfo && (
            <div className="card-soft p-2 mb-2" style={{ background: "#F6EFD9", fontSize: ".85rem" }}>
              <i className="bi bi-exclamation-triangle me-1" aria-hidden="true" />
              Override set: {overrideInfo.reason}
            </div>
          )}
          {damageNote && (
            <div className="card-soft p-2 mb-2" style={{ background: "#F6EFD9", fontSize: ".85rem" }}>
              <i className="bi bi-bug me-1" aria-hidden="true" />
              Damage note saved: {damageNote}
            </div>
          )}

          {/* Problem reporting */}
          <div className="field-label">Report a Problem</div>
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div
                className="field-box text-center mb-0"
                style={{ cursor: "pointer" }}
                tabIndex={0}
                role="button"
                onClick={() => setShowDamage(true)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowDamage(true); }}
              >
                {damageNote ? "✓ Damage noted" : "Older Batch Damaged"}
              </div>
            </div>
            <div className="col-6">
              <div
                className="field-box text-center mb-0"
                style={{ cursor: "pointer" }}
                tabIndex={0}
                role="button"
                onClick={() => setShowOverride(true)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowOverride(true); }}
              >
                {overrideInfo ? "✓ Override set" : "FIFO Override"}
              </div>
            </div>
          </div>

          <button
            className="btn-tan w-100 py-2 fw-bold"
            onClick={submitPick}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>

      {showDamage && (
        <DamageReportModal
          batchLabel={fifoBatch?.code ?? "batch"}
          onConfirm={(note) => { setDamageNote(note); notify("Damage note saved — will be logged on submit.", "success"); }}
          close={() => setShowDamage(false)}
        />
      )}
      {showOverride && (
        <FifoOverrideModal
          batches={fifoBatches}
          onConfirm={(info) => { setOverrideInfo(info); notify("Override will be applied on submit.", "success"); }}
          close={() => setShowOverride(false)}
        />
      )}
    </div>
  );
}
