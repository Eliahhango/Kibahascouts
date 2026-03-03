const BRACKET_PLACEHOLDER_REGEX = /\[[^\]]+\]/
const SAMPLE_PREFIX_REGEX = /^\[SAMPLE\]\s*/i
const DRAFT_COPY_REGEX = /\b(replace this|placeholder|pending upload|pending confirmation|under review)\b/i

export const DEFAULT_COMING_SOON_MESSAGE = "Details will be shared soon."

export function hasMeaningfulText(value: string | null | undefined) {
  const trimmed = (value || "").trim()
  if (!trimmed) {
    return false
  }

  const withoutSamplePrefix = trimmed.replace(SAMPLE_PREFIX_REGEX, "").trim()
  if (!withoutSamplePrefix) {
    return false
  }

  if (BRACKET_PLACEHOLDER_REGEX.test(withoutSamplePrefix)) {
    return false
  }

  if (DRAFT_COPY_REGEX.test(withoutSamplePrefix)) {
    return false
  }

  return true
}

export function normalizePublicText(
  value: string | null | undefined,
  fallback = DEFAULT_COMING_SOON_MESSAGE,
) {
  if (!hasMeaningfulText(value)) {
    return fallback
  }

  return (value || "").replace(SAMPLE_PREFIX_REGEX, "").trim()
}
