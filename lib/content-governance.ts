const sampleModeEnabled = process.env.SAMPLE_MODE === "true"

export const contentGovernance = {
  homepageMode: sampleModeEnabled ? "sample" : "live",
  homepageBadge: "Sample / Draft",
  homepageMessage: sampleModeEnabled
    ? "This page is displaying draft content while verified district records are being finalized."
    : "",
} as const

export const districtSnapshotPlaceholders = [
  { label: "Active Units", value: "Coming soon" },
  { label: "Youth Members", value: "Coming soon" },
  { label: "Adult Volunteers", value: "Coming soon" },
  { label: "Service Hours", value: "Coming soon" },
] as const
