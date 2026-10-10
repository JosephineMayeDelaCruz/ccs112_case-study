export const initialProducts = [
  { id: 1, name: "Smart Thermostat", category: "Thermostat", qty: 24, price: 8499 },
  { id: 2, name: "Air Purifier Filter", category: "Air Purifier", qty: 32, price: 9479 },
  { id: 3, name: "Portable AC 9k", category: "Air Conditioner", qty: 13, price: 13479 },
  { id: 4, name: "Portable AC 12k", category: "Air Conditioner", qty: 3, price: 23479 },
  { id: 5, name: "Ceiling Fan 52-inch", category: "Electric Fan", qty: 18, price: 2999 },
  { id: 6, name: "Humidifier L2", category: "Humidifier", qty: 12, price: 5999 },
];

export const categories = [
  { name: "Air Conditioners", skus: 42 },
  { name: "Air Purifiers", skus: 38 },
  { name: "Thermostats", skus: 24 },
  { name: "Filters", skus: 56 },
  { name: "Fans", skus: 18 },
  { name: "Humidifiers", skus: 8 },
];

export const batches = [
  { id: "B-101", product: "Replacement filter", received: "Apr 02", qty: 12 },
  { id: "B-108", product: "Replacement filter", received: "May 20", qty: 24 },
  { id: "B-114", product: "Replacement filter", received: "Jun 30", qty: 20 },
];

export const movementLog = [
  { date: "July 15", item: "Smart Thermostat", action: "Stock Count", qty: "45" },
  { date: "July 14", item: "Air Purifier Filter", action: "Received", qty: "+20" },
  { date: "July 13", item: "Portable AC 9K", action: "Sold", qty: "-4" },
  { date: "July 13", item: "Portable AC 12K", action: "Sold", qty: "-3" },
  { date: "July 12", item: 'Ceiling Fan 52"', action: "Received", qty: "+30" },
  { date: "July 11", item: "Humidifier L2", action: "Adjusted", qty: "39" },
];

export const movementRows = [
  { product: "FR-220 filter", type: "received", qty: "+48", status: "ok" },
  { product: "AC-Port-12k", type: "sold", qty: "-2", status: "ok" },
  { product: "Thermo-S1", type: "adjusted", qty: "-1", status: "flag" },
  { product: "FR-220 filter", type: "transferred", qty: "-10", status: "ok" },
  { product: "Purifier P-4", type: "returned", qty: "+1", status: "ok" },
];

export const LOW_STOCK_THRESHOLD = 15;
