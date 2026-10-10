export const initialPurchaseOrders = [
  { id: "PO-1040", supplier: "CoolAir Distribution", items: 6, total: 128400, status: "Pending" },
  { id: "PO-1041", supplier: "Manila Thermo Supply", items: 3, total: 42900, status: "Approved" },
  { id: "PO-1042", supplier: "Breeze Components Co.", items: 10, total: 215600, status: "Approved" },
];

export const initialAlerts = [
  { icon: "bell", type: "LOW STOCK", text: "Low stock — Portable AC Unit 8000 BTU", meta: "Sent to: inventory manager, purchasing manager · via dashboard + email", ack: false },
  { icon: "clock-history", type: "EXPIRY", text: "Batch nearing expiry — Carbon Filter Cartridge (B-2201)", meta: "Sent to: inventory manager · via dashboard + SMS", ack: false },
  { icon: "check-square", type: "MISMATCH", text: "Stock mismatch flagged — Smart Thermostat X1", meta: "Sent to: inventory manager, admin · awaiting recount confirmation", ack: false },
  { icon: "thermometer-half", type: "OVERSTOCK", text: "Overstock — Air Purifier HEPA Pro", meta: "Sent to: inventory manager, purchasing manager · 210 units vs. optimal 130", ack: false },
  { icon: "thermometer-half", type: "LOW STOCK", text: "Low stock — Portable AC Unit 12000 BTU", meta: "Sent to: inventory manager, purchasing manager · via dashboard", ack: false },
  { icon: "clock-history", type: "EXPIRY", text: "Batch nearing expiry — Carbon Filter Cartridge (B-2214)", meta: "Sent to: inventory manager · via dashboard + SMS", ack: false },
];

export const reports = [
  { icon: "bar-chart", label: "Stock levels", desc: "Current on-hand quantities by SKU and location" },
  { icon: "arrow-repeat", label: "Inventory turnover", desc: "Turnover rate by category, last 90 days" },
  { icon: "send", label: "Stock movements", desc: "All receives, sales, transfers, and adjustments" },
  { icon: "clock", label: "Expired inventory", desc: "Write-offs with batch ID and disposal reason" },
  { icon: "bag", label: "Purchasing history", desc: "Purchase orders raised, fulfilled, and pending" },
  { icon: "graph-up-arrow", label: "Analytics summary", desc: "Warehouse utilization and inventory loss overview" },
];

export const purchaseRequests = [
  { id: "PR-330", requestedBy: "M. Dalmacio", item: "Carbon Filter Cartridge", qty: 100, status: "Pending review" },
  { id: "PR-331", requestedBy: "V. Devera", item: "Portable AC 9k", qty: 25, status: "Pending review" },
  { id: "PR-329", requestedBy: "J. Dela Cruz", item: "Smart Thermostat", qty: 40, status: "Converted to PO" },
];
