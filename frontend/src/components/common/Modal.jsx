import React, { useEffect } from "react";

export default function Modal({ title, onClose, children, width }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop-custom"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-tan"
        style={width ? { width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">{title}</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer", padding: "0 4px" }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
