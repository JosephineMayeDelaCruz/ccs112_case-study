import React from "react";

export default function RecentActivity({ title = "Recent activity", items }) {
  return (
    <div className="card-soft p-3 mb-3">
      <div className="fw-semibold mb-2">{title}</div>
      {items.map((r, i) => (
        <div key={i} className="d-flex justify-content-between py-1" style={{ fontSize: ".92rem" }}>
          <span>{r.text}</span>
          <span className="text-muted">{r.meta}</span>
        </div>
      ))}
      {items.length === 0 && <div className="text-muted" style={{ fontSize: ".9rem" }}>Nothing to show yet.</div>}
    </div>
  );
}
