import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

const ROWS = [
  ["lowStockAlerts",   "Low stock alerts",               "Notify when items fall below reorder point"],
  ["expiryAlerts",     "Expiry alerts",                  "Notify about batches nearing expiry"],
  ["smsNotifications", "SMS notifications",               "Send urgent alerts via SMS"],
  ["autoGeneratePO",   "Auto-generate purchase orders",   "Create draft POs automatically at reorder point"],
];

const DEFAULTS = {
  lowStockAlerts:   true,
  expiryAlerts:     true,
  smsNotifications: false,
  autoGeneratePO:   false,
};

export default function Settings() {
  const notify = useToast();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api
      .getSettings()
      .then(setSettings)
      .catch(() => {
        // Fall back to defaults if the endpoint errors (e.g. first run)
        setSettings(DEFAULTS);
      });
  };

  useEffect(load, []);

  if (!settings && !error) return <Loading />;
  if (error) return <ApiError message={error} onRetry={load} />;

  const toggle = (k) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  const save = async () => {
    setSaving(true);
    try {
      await api.saveSettings(settings);
      notify("Settings saved.", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-area">
      <PageHeader title="Settings" icon="bi-gear" />
      <div className="card-soft p-4 mb-3">
        {ROWS.map(([key, label, desc]) => (
          <div className="toggle-row" key={key}>
            <div>
              <div className="fw-semibold">{label}</div>
              <div className="text-muted" style={{ fontSize: ".82rem" }}>{desc}</div>
            </div>
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                id={`setting-${key}`}
                checked={!!settings[key]}
                onChange={() => toggle(key)}
                style={{ cursor: "pointer" }}
                aria-label={label}
              />
            </div>
          </div>
        ))}
      </div>
      <Button className="px-4 py-2" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </Button>
    </div>
  );
}
