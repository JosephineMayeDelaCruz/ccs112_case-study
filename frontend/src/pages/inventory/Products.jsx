import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Loading from "../../components/common/Loading.jsx";
import ApiError from "../../components/common/ApiError.jsx";
import { api } from "../../services/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { LOW_STOCK_THRESHOLD } from "../../data/products.js";
import { useToast } from "../../context/ToastContext.jsx";

const FILTERS = ["Active", "Category", "Quantity", "Price"];
const CATEGORIES = ["Air Conditioner", "Air Purifier", "Electric Fan", "Humidifier", "Thermostat", "Other"];

function ProductFormModal({ product, close, onSave }) {
  const notify = useToast();
  const isEdit = !!product;
  const [form, setForm] = useState({
    name:     product?.name     ?? "",
    sku:      product?.sku      ?? "",
    category: product?.category ?? CATEGORIES[0],
    qty:      product?.qty      ?? "",
    price:    product?.price    ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const qty   = parseInt(form.qty, 10);
    const price = parseFloat(form.price);
    if (!form.name.trim() || !form.category || isNaN(qty) || qty < 0 || isNaN(price) || price < 0) {
      notify("Fill in all fields. Qty and price must be valid non-negative numbers.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await onSave({ ...form, qty, price });
      close();
    } catch (err) {
      notify(err.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? `Edit — ${product.name}` : "Add product"} onClose={close}>
      <form onSubmit={submit}>
        <div className="row g-2 mb-2">
          <div className="col-8 form-field">
            <label htmlFor="pf-name">Product name</label>
            <input id="pf-name" className="search-input w-100" value={form.name} onChange={set("name")}
              placeholder="e.g. Smart Thermostat" autoFocus />
          </div>
          <div className="col-4 form-field">
            <label htmlFor="pf-sku">SKU</label>
            <input id="pf-sku" className="search-input w-100" value={form.sku} onChange={set("sku")}
              placeholder="THM-S1" />
          </div>
        </div>
        <div className="form-field mb-2">
          <label htmlFor="pf-cat">Category</label>
          <select id="pf-cat" className="search-input w-100" value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="row g-2 mb-3">
          <div className="col-6 form-field">
            <label htmlFor="pf-qty">Quantity</label>
            <input id="pf-qty" type="number" min="0" step="1" className="search-input w-100"
              value={form.qty} onChange={set("qty")} placeholder="0" />
          </div>
          <div className="col-6 form-field">
            <label htmlFor="pf-price">Price (₱)</label>
            <input id="pf-price" type="number" min="0" className="search-input w-100"
              value={form.price} onChange={set("price")} placeholder="0.00" />
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline" className="px-4 py-2" onClick={close} disabled={submitting}>Cancel</Button>
          <Button type="submit" className="px-4 py-2" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Products() {
  const notify = useToast();
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Active");
  const [restockingId, setRestockingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api.getProducts().then(setProducts).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <ApiError message={error} onRetry={load} />;
  if (!products) return <Loading />;

  const restock = async (product) => {
    setRestockingId(product.id);
    try {
      const updated = await api.restockProduct(product.id, 20);
      setProducts((ps) => ps.map((p) => (p.id === product.id ? { ...p, qty: updated.qty } : p)));
      notify(`${product.name} restocked. New quantity: ${updated.qty}.`, "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setRestockingId(null);
    }
  };

  const saveProduct = async (form) => {
    if (editingProduct) {
      const updated = await api.updateProduct(editingProduct.id, form);
      setProducts((ps) => ps.map((p) => (p.id === editingProduct.id ? updated : p)));
      notify(`${updated.name} updated.`, "success");
    } else {
      const created = await api.createProduct(form);
      setProducts((ps) => [...ps, created]);
      notify(`${created.name} added.`, "success");
    }
  };

  const q = search.trim().toLowerCase();
  let visible = products.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
  if (filter === "Category") visible = visible.slice().sort((a, b) => a.category.localeCompare(b.category));
  else if (filter === "Quantity") visible = visible.slice().sort((a, b) => a.qty - b.qty);
  else if (filter === "Price") visible = visible.slice().sort((a, b) => b.price - a.price);

  return (
    <div className="content-area">
      <PageHeader
        title="Products List"
        action={
          <Button className="px-3 py-2" onClick={() => { setEditingProduct(null); setShowAdd(true); }}>
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />Add product
          </Button>
        }
      />
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search products" style={{ width: 240 }} />
        <div className="d-flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} className={"filter-chip " + (filter === f ? "active" : "")} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <table className="table mb-0">
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border-tan)" }}>
            <th className="pb-2" style={{ color: "var(--accent-dark)" }}>Product Name</th>
            <th className="pb-2" style={{ color: "var(--accent-dark)" }}>SKU</th>
            <th className="pb-2" style={{ color: "var(--accent-dark)" }}>Category</th>
            <th className="pb-2" style={{ color: "var(--accent-dark)" }}>Quantity</th>
            <th className="pb-2" style={{ color: "var(--accent-dark)" }}>Price</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {visible.map((p) => (
            <tr
              key={p.id}
              style={{ borderBottom: "1px solid #EAE0C4", cursor: "pointer" }}
              tabIndex={0}
              aria-label={`Edit ${p.name}`}
              onClick={() => { setEditingProduct(p); setShowAdd(true); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setEditingProduct(p); setShowAdd(true); } }}
            >
              <td className="py-3">{p.name}</td>
              <td className="text-muted">{p.sku ?? "—"}</td>
              <td className="text-muted">{p.category}</td>
              <td className={p.qty < LOW_STOCK_THRESHOLD ? "status-flag" : "text-muted"}>
                {p.qty}{p.qty < LOW_STOCK_THRESHOLD ? " (low)" : ""}
              </td>
              <td className="text-muted">{formatCurrency(p.price)}</td>
              <td onClick={(e) => e.stopPropagation()}>
                {p.qty < LOW_STOCK_THRESHOLD && (
                  <button
                    className="btn-outline-tan px-2 py-1"
                    style={{ fontSize: ".78rem" }}
                    disabled={restockingId === p.id}
                    onClick={() => restock(p)}
                    aria-label={`Restock ${p.name}`}
                  >
                    {restockingId === p.id ? "Restocking…" : "Restock +20"}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted py-4">No products match your search.</td>
            </tr>
          )}
        </tbody>
      </table>

      {showAdd && (
        <ProductFormModal
          product={editingProduct}
          close={() => { setShowAdd(false); setEditingProduct(null); }}
          onSave={saveProduct}
        />
      )}
    </div>
  );
}
