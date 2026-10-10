import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Table from "../../components/common/Table.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getSuppliers().then(setSuppliers).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!suppliers) return <Loading />;

  const columns = [
    { key: "name", label: "Supplier", className: "fw-semibold py-3" },
    { key: "contact", label: "Contact" },
    { key: "leadTime", label: "Lead time" },
    { key: "rating", label: "Rating" },
  ];

  return (
    <div className="content-area">
      <PageHeader title="Suppliers" icon="bi-truck" />
      <Table columns={columns} rows={suppliers} emptyMessage="No suppliers on file." />
    </div>
  );
}
