import React from "react";

export default function Loading({ label = "Loading..." }) {
  return (
    <div className="d-flex align-items-center justify-content-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
      <span>{label}</span>
    </div>
  );
}
