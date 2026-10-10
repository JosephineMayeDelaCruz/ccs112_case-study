import React from "react";

export default function StatCard({ label, value, fontSize }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className="value" style={fontSize ? { fontSize } : undefined}>
        {value}
      </div>
    </div>
  );
}
