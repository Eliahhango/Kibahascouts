export const DEFAULT_ADMIN_SESSION_COOKIE_NAME = "kibaha_admin_session"
export const DEFAULT_ADMIN_SESSION_MAX_AGE_DAYS = 5

export function getAdminSessionCookieName() {
  return process.env.ADMIN_SESSION_COOKIE_NAME?.trim() || DEFAULT_ADMIN_SESSION_COOKIE_NAME
}

export function getAdminSessionMaxAgeDays() {
  const parsed = Number.parseInt(process.env.ADMIN_SESSION_MAX_AGE_DAYS || "", 10)
  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_ADMIN_SESSION_MAX_AGE_DAYS
  }

  return Math.min(parsed, 14)
}

export function getAdminSessionMaxAgeSeconds() {
  return getAdminSessionMaxAgeDays() * 24 * 60 * 60
}

export function getAdminSessionExpiresInMs() {
  return getAdminSessionMaxAgeSeconds() * 1000
}
