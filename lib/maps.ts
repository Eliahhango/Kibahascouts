export const KIBAHA_DEFAULT_COORDINATES = {
  latitude: -6.7667,
  longitude: 38.9167,
} as const

export const EVENT_MAP_MIN_ZOOM = 3
export const EVENT_MAP_MAX_ZOOM = 19
export const EVENT_MAP_DEFAULT_ZOOM = 14

export function hasValidCoordinates(latitude: unknown, longitude: unknown) {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  )
}

export function normalizeCoordinate(value: unknown) {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN
  if (!Number.isFinite(numeric)) {
    return undefined
  }
  return numeric
}

export function normalizeMapZoom(value: unknown, fallback = EVENT_MAP_DEFAULT_ZOOM) {
  const numeric = normalizeCoordinate(value)
  if (typeof numeric !== "number") {
    return fallback
  }

  const rounded = Math.round(numeric)
  return Math.min(EVENT_MAP_MAX_ZOOM, Math.max(EVENT_MAP_MIN_ZOOM, rounded))
}

export function buildOpenStreetMapPlaceUrl(latitude: number, longitude: number, zoom = EVENT_MAP_DEFAULT_ZOOM) {
  const normalizedZoom = normalizeMapZoom(zoom)
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${normalizedZoom}/${latitude}/${longitude}`
}

export function buildGoogleEmbedByCoordinates(latitude: number, longitude: number, title?: string) {
  const query = title ? `${title} @ ${latitude},${longitude}` : `${latitude},${longitude}`
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
}
