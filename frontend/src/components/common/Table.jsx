import React from "react";

/**
 * columns: [{ key, label, render?(row) }]
 * rows: array of data objects
 * emptyMessage: shown when rows is empty
 */
export default function Table({ columns, rows, emptyMessage = "No records found." }) {
  return (
    <table className="table table-soft mb-0">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr className="rowbox" key={row.id ?? i}>
            {columns.map((col) => (
              <td key={col.key} className={col.className}>
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="text-center text-muted py-4">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
