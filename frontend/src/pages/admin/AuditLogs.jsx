import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";

export default function AuditLogs() {
  const [log, setLog] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getAuditLog().then(setLog).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!log) return <Loading />;

  return (
    <div className="content-area">
      <PageHeader title="Audit Log" icon="bi-clock-history" />
      <div className="card-soft p-3">
        {log.map((a, i) => (
          <div key={i} className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid #EEE3C6" }}>
            <span>
              <strong>{a.user}</strong> — {a.action}
            </span>
            <span className="text-muted">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
