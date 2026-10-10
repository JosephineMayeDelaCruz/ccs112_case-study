// Real API layer — calls the Laravel backend.
// Base URL: set VITE_API_URL in .env (or .env.local)
//   VITE_API_URL=http://localhost:8000/api

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("wb_token");
}

async function request(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...(options.headers || {}),
      },
      body: options.body == null ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new Error(
      "Cannot connect to the server. Check that the Laravel API is running and VITE_API_URL is correct."
    );
  }

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const data = await res.json();
      if (data.errors) {
        message = Object.values(data.errors).flat().join(" ");
      } else if (data.message) {
        message = data.message;
      }
    } catch {
      // response wasn't JSON
    }
    const error = new Error(message);
    error.status = res.status;
    if (res.status === 401 && path !== "/login") {
      localStorage.removeItem("wb_token");
      window.dispatchEvent(new Event("wb:session-expired"));
    }
    throw error;
  }

  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Unexpected server response. Check the API endpoint.");
  }
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────
  async login(role, email, password) {
    const data = await request("/login", {
      method: "POST",
      body: { role, email, password },
    });
    const token = data.token || data.access_token;
    if (!token || !data.user) throw new Error("Login response is missing a token or user.");
    localStorage.setItem("wb_token", token);
    return data.user; // { id, name, email, role, must_change_password }
  },

  async logout() {
    try {
      await request("/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("wb_token");
    }
  },

  async me() {
    return request("/me");
  },

  // ── Products ─────────────────────────────────────────────────────────────
  async getProducts() {
    return request("/products");
  },

  async createProduct(form) {
    // form: { name, sku?, category, qty, price }
    return request("/products", { method: "POST", body: form });
  },

  async updateProduct(id, form) {
    return request(`/products/${id}`, { method: "PUT", body: form });
  },

  async restockProduct(id, amount = 20) {
    return request(`/products/${id}/restock`, { method: "PATCH", body: { amount } });
  },

  // ── Batches ──────────────────────────────────────────────────────────────
  async getBatches() {
    return request("/batches");
  },

  async createBatch(form) {
    // form: { code, product_id, received_date, expiry_date?, qty }
    return request("/batches", { method: "POST", body: form });
  },

  async adjustBatch(id, newCount, reason) {
    return request(`/batches/${id}/adjust`, {
      method: "PATCH",
      body: { new_count: newCount, reason },
    });
  },

  async getFifoBatch(productId) {
    return request(`/batches/fifo/${productId}`);
  },

  // ── Stock Movements ──────────────────────────────────────────────────────
  async getMovementRows() {
    return request("/stock-movements");
  },

  async addStockMovement(payload) {
    // payload: { product_id?, batch_id?, product_label, type, qty (int), status?,
    //            override_reason?, reference? }
    return request("/stock-movements", { method: "POST", body: payload });
  },

  // ── Users ────────────────────────────────────────────────────────────────
  async getUsers() {
    return request("/users");
  },

  async addUser(form) {
    // form: { name, email, role (human label), temp_password }
    return request("/users", { method: "POST", body: form });
  },

  async updateUser(id, form) {
    return request(`/users/${id}`, { method: "PATCH", body: form });
  },

  // ── Audit Logs ───────────────────────────────────────────────────────────
  async getAuditLog() {
    return request("/audit-logs");
  },

  // ── Settings ─────────────────────────────────────────────────────────────
  async getSettings() {
    return request("/settings");
  },

  async saveSettings(settings) {
    return request("/settings", { method: "PUT", body: settings });
  },

  // ── Suppliers ────────────────────────────────────────────────────────────
  async getSuppliers() {
    return request("/suppliers");
  },

  // ── Purchase Orders ──────────────────────────────────────────────────────
  async getPurchaseOrders() {
    return request("/purchase-orders");
  },

  async addPurchaseOrder(form) {
    // form: { supplier, items, total, notes? }
    return request("/purchase-orders", { method: "POST", body: form });
  },

  async approvePurchaseOrder(code) {
    return request(`/purchase-orders/${code}/approve`, { method: "PATCH" });
  },

  async receivePurchaseOrder(code) {
    return request(`/purchase-orders/${code}/receive`, { method: "PATCH" });
  },

  // ── Purchase Requests ────────────────────────────────────────────────────
  async getPurchaseRequests() {
    return request("/purchase-requests");
  },

  async createPurchaseRequest(form) {
    // form: { item, qty, notes? }
    return request("/purchase-requests", { method: "POST", body: form });
  },

  async convertPurchaseRequest(code) {
    return request(`/purchase-requests/${code}/convert`, { method: "PATCH" });
  },

  // ── Picking Orders ───────────────────────────────────────────────────────
  async getPickingOrders() {
    return request("/picking-orders");
  },

  async createPickingOrder(form) {
    // form: { customer, lines: [{ product_id, qty }] }
    return request("/picking-orders", { method: "POST", body: form });
  },

  async pickOrder(code, payload = {}) {
    // payload: { override_reason?, damage_note?, batch_overrides? }
    return request(`/picking-orders/${code}/pick`, { method: "PATCH", body: payload });
  },

  async shipOrder(code) {
    return request(`/picking-orders/${code}/ship`, { method: "PATCH" });
  },

  // ── Dashboards ───────────────────────────────────────────────────────────
  async getAdminDashboard() {
    return request("/dashboard/admin");
  },

  async getWarehouseDashboard() {
    return request("/dashboard/warehouse");
  },

  async getPickingDashboard() {
    return request("/dashboard/picking");
  },

  async getPurchasingDashboard() {
    return request("/dashboard/purchasing");
  },
};
