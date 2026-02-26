export type CmsRole = "Super Admin" | "Editor" | "Events Manager" | "Resource Manager"

export type WorkflowStage = "Draft" | "Review" | "Publish"

export const cmsRoles: Record<CmsRole, string[]> = {
  "Super Admin": [
    "Manage users and permissions",
    "Publish or unpublish any content type",
    "Configure integrations and environment settings",
    "Approve final content for release",
  ],
  Editor: [
    "Create and edit News, Units, and Leadership profiles",
    "Submit content for review",
    "Schedule content publication",
  ],
  "Events Manager": [
    "Create and manage event listings",
    "Track registrations and event status",
    "Submit event updates for review",
  ],
  "Resource Manager": [
    "Upload and update documents",
    "Maintain resource metadata and categories",
    "Archive outdated resources",
  ],
}

export const moderationWorkflow: WorkflowStage[] = ["Draft", "Review", "Publish"]

export const cmsCollections = [
  "News",
  "Events",
  "Resources",
  "Scout Units",
  "Leadership Profiles",
] as const
