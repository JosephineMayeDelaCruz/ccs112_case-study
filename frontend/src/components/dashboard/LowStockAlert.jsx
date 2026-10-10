import React from "react";
import { Pill } from "../common/StatusBadge.jsx";
import { LOW_STOCK_THRESHOLD } from "../../data/products.js";

export default function LowStockAlert({ products, onRestock }) {
  const lowStock = products.filter((p) => p.qty < LOW_STOCK_THRESHOLD);

  if (lowStock.length === 0) {
    return <div className="card-soft p-4 text-center text-muted">Nothing needs reordering right now.</div>;
  }

  return (
    <>
      {lowStock.map((p) => (
        <div className="po-row" key={p.id ?? p.name}>
          <div>
            <div className="fw-bold mb-1">{p.name}</div>
            <Pill tone="pink">low stock</Pill>
          </div>
          <div className="po-stats">
            <div>
              <div className="n">{p.qty}</div>
              <div className="l">On hand</div>
            </div>
          </div>
          {onRestock && (
            <button className="btn-tan px-3 py-2" onClick={() => onRestock(p.name)}>
              Generate PO
            </button>
          )}
        </div>
      ))}
    </>
  );
}
