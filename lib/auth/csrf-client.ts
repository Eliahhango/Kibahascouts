export const ADMIN_CSRF_COOKIE_NAME = "kibaha_admin_csrf"

export function getCsrfTokenFromCookie() {
  if (typeof document === "undefined") {
    return null
  }

  const cookies = document.cookie.split(";").map((value) => value.trim())

  for (const entry of cookies) {
    if (!entry.startsWith(`${ADMIN_CSRF_COOKIE_NAME}=`)) {
      continue
    }

    const [, value] = entry.split("=")
    return value ? decodeURIComponent(value) : null
  }

  return null
}
