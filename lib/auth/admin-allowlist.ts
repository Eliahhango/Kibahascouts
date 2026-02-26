const EMPTY_ALLOWLIST_WARNING =
  "ADMIN_EMAILS is empty. No admin users are allowlisted. Set ADMIN_EMAILS before enabling admin access."

function parseAdminAllowlistValue(value: string | undefined) {
  if (!value) {
    return []
  }

  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

export function getAdminAllowlist() {
  return new Set(parseAdminAllowlistValue(process.env.ADMIN_EMAILS))
}

export function hasAdminAllowlist() {
  return getAdminAllowlist().size > 0
}

export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false
  }

  return getAdminAllowlist().has(email.toLowerCase())
}

export function getAdminAllowlistWarning() {
  return EMPTY_ALLOWLIST_WARNING
}
