export const roles = [
  { id: "staff", label: "Warehouse Staff", icon: "bi-box-seam", desc: "Pick, receive, and log stock", defaultName: "V. Devera" },
  { id: "admin", label: "System Admin", icon: "bi-shield-lock", desc: "Manage users and settings", defaultName: "A. Reyes" },
  { id: "manager", label: "Purchasing Manager", icon: "bi-graph-up", desc: "Purchase orders, alerts, reports", defaultName: "J. Dela Cruz" },
  { id: "products", label: "Inventory Clerk", icon: "bi-clipboard-data", desc: "Browse and manage products", defaultName: "M. Dalmacio" },
];

export const initialUsers = [
  { name: "V. Devera", role: "Warehouse Staff", lastActive: "Today, 9:14 AM", status: "Active" },
  { name: "M. Dalmacio", role: "Inventory Clerk", lastActive: "Today, 8:40 AM", status: "Active" },
  { name: "J. Dela Cruz", role: "Purchasing Manager", lastActive: "Yesterday", status: "Active" },
  { name: "R. De Gracia", role: "Warehouse Staff", lastActive: "3 days ago", status: "Inactive" },
  { name: "A. Reyes", role: "System Admin", lastActive: "Today, 7:58 AM", status: "Active" },
];

export const auditLog = [
  { user: "A. Reyes", action: "Updated reorder threshold for Portable AC 9K", time: "Today, 8:02 AM" },
  { user: "J. Dela Cruz", action: "Approved PO-1042", time: "Yesterday, 4:15 PM" },
  { user: "System", action: "Auto-flagged stock mismatch on Smart Thermostat X1", time: "Yesterday, 9:00 AM" },
];

export const roleOptions = ["Warehouse Staff", "Inventory Clerk", "Purchasing Manager", "System Admin"];
