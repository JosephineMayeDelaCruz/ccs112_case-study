import React from "react";

/**
 * Shown when an API call fails — surfaces the error message with a Retry
 * button so the user doesn't see a blank screen.
 *
 * Usage:
 *   if (error) return <ApiError message={error} onRetry={loadData} />;
 */
export default function ApiError({ message, onRetry }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <i className="bi bi-wifi-off fs-2 mb-3" style={{ color: "var(--accent-dark)" }} aria-hidden="true" />
      <div className="fw-semibold mb-1">Could not load data</div>
      <div className="text-muted mb-3" style={{ fontSize: ".88rem", maxWidth: 340 }}>
        {message || "The server is unreachable. Make sure the Laravel API is running and VITE_API_URL is correct."}
      </div>
      {onRetry && (
        <button className="btn-outline-tan px-4 py-2" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise me-2" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
