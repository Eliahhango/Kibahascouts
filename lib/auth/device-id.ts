const DEVICE_ID_STORAGE_KEY = "kibaha_admin_device_id"

function generateDeviceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `device_${Math.random().toString(36).slice(2)}_${Date.now()}`
}

export function getOrCreateAdminDeviceId() {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY)
    if (existing) {
      return existing
    }

    const created = generateDeviceId()
    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, created)
    return created
  } catch {
    return null
  }
}
