import React from "react";

export function Pill({ children, tone }) {
  return <span className={"pill " + (tone || "")}>{children}</span>;
}

// Status values that render in green ("ok") style.
const OK_VALUES = new Set([
  "active", "ok", "approved", "fulfilled", "shipped",
  "converted to po", "complete", "completed",
]);

export default function StatusBadge({ status }) {
  const isOk = OK_VALUES.has(String(status ?? "").toLowerCase());
  return <span className={isOk ? "status-ok" : "status-flag"}>{status}</span>;
}
