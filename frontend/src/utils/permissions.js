// Maps each login role to the home URL it lands on after login.
export const ROLE_HOME = {
  staff:    "/warehouse",
  admin:    "/admin",
  manager:  "/purchasing",
  products: "/inventory",
};

// Human-readable label for each role key returned by the API.
export const ROLE_LABEL = {
  staff:    "Warehouse Staff",
  admin:    "System Admin",
  manager:  "Purchasing Manager",
  products: "Inventory Clerk",
};

// URL path prefixes a role is allowed to visit.
// Warehouse Staff owns both /warehouse and /picking.
export const ROLE_ALLOWED_PREFIX = {
  staff:    ["/warehouse", "/picking"],
  admin:    ["/admin"],
  manager:  ["/purchasing"],
  products: ["/inventory"],
};

/**
 * Returns true when `role` is allowed to access `prefixOrPath`.
 *
 * `prefixOrPath` can be:
 *   • A single path prefix:  "/admin"
 *   • A pipe-joined list:    "/warehouse|/picking"   (used in MainLayout)
 *   • A real pathname:       "/warehouse/receiving"
 *
 * The check passes if the role's allowed-prefix list intersects with any
 * of the given candidates.
 */
export function canAccess(role, prefixOrPath) {
  if (!role) return false;
  const allowed = ROLE_ALLOWED_PREFIX[role] || [];

  // support "/warehouse|/picking" strings
  const candidates = prefixOrPath.split("|");

  // A role has access if any allowed prefix is equal to, or is an ancestor
  // of, any candidate — and vice-versa (handles both directions: the caller
  // may pass a prefix or a full pathname).
  return candidates.some((candidate) =>
    allowed.some(
      (prefix) =>
        prefix === candidate ||
        candidate.startsWith(prefix + "/") ||
        prefix.startsWith(candidate + "/")
    )
  );
}

export function homeFor(role) {
  return ROLE_HOME[role] || "/login";
}
