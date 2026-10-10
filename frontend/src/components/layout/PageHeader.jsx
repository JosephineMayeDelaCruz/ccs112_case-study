import React from "react";

export default function PageHeader({ title, icon, action }) {
  return (
    <div className="page-header">
      <div className="d-flex align-items-center gap-2">
        {icon && <i className={"bi " + icon + " fs-4"} style={{ color: "var(--accent-dark)" }}></i>}
        <h4 className="fw-bold mb-0">{title}</h4>
      </div>
      {action}
    </div>
  );
}
