import "server-only"

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }

  return request.headers.get("x-real-ip") || "unknown"
}

export function getRequestUserAgent(request: Request) {
  return request.headers.get("user-agent") || "unknown"
}

export function getRequestPath(request: Request) {
  try {
    return new URL(request.url).pathname
  } catch {
    return request.url
  }
}
