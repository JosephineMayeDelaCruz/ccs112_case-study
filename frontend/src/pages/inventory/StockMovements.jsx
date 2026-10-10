import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import Table from "../../components/common/Table.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { downloadCSV } from "../../utils/formatCurrency.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function StockMovements() {
  const notify = useToast();
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getMovementRows().then(setRows).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) => !q || r.product.toLowerCase().includes(q));

  const exportCSV = () => {
    downloadCSV("movement-log.csv", [["Product", "Type", "Qty", "Status"]].concat(visible.map((r) => [r.product, r.type, r.qty, r.status])));
    notify("Movement log exported to CSV.", "success");
  };

  const columns = [
    { key: "product", label: "Product", className: "fw-semibold py-3" },
    { key: "type", label: "Type" },
    { key: "qty", label: "Qty" },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="content-area">
      <PageHeader
        title="Movement log"
        action={
          <Button variant="outline" className="px-3 py-2" onClick={exportCSV}>
            <i className="bi bi-download me-2"></i>Export
          </Button>
        }
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or SKU" className="w-100 mb-3" />
      <Table columns={columns} rows={visible} emptyMessage="No matching movements." />
    </div>
  );
}
