export const DEFAULT_ADMIN_SESSION_COOKIE_NAME = "kibaha_admin_session"
export const DEFAULT_ADMIN_SESSION_MAX_AGE_HOURS = 8

export function getAdminSessionCookieName() {
  return process.env.ADMIN_SESSION_COOKIE_NAME?.trim() || DEFAULT_ADMIN_SESSION_COOKIE_NAME
}

export function getAdminSessionMaxAgeSeconds() {
  // Check for env override in days first (backward compat), then hours.
  const daysParsed = Number.parseInt(process.env.ADMIN_SESSION_MAX_AGE_DAYS || "", 10)
  if (!Number.isNaN(daysParsed) && daysParsed >= 1) {
    return Math.min(daysParsed, 14) * 24 * 60 * 60
  }

  const hoursParsed = Number.parseInt(process.env.ADMIN_SESSION_MAX_AGE_HOURS || "", 10)
  if (!Number.isNaN(hoursParsed) && hoursParsed >= 1) {
    return Math.min(hoursParsed, 14 * 24) * 60 * 60
  }

  return DEFAULT_ADMIN_SESSION_MAX_AGE_HOURS * 60 * 60
}

export function getAdminSessionExpiresInMs() {
  return getAdminSessionMaxAgeSeconds() * 1000
}
