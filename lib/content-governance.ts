export const contentGovernance = {
  homepageMode: "sample",
  homepageBadge: "Sample / Draft",
  homepageMessage:
    "This page currently shows draft content. Replace placeholders with verified district data before publication.",
} as const

export const districtSnapshotPlaceholders = [
  { label: "Active Units", value: "[INSERT REAL STATS]" },
  { label: "Youth Members", value: "[INSERT REAL STATS]" },
  { label: "Adult Volunteers", value: "[INSERT REAL STATS]" },
  { label: "Service Hours", value: "[INSERT REAL STATS]" },
] as const
