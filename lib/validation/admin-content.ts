import { z } from "zod"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "")
  .refine((value) => value === "" || /^https?:\/\/.+/i.test(value), {
    message: "Must be a valid http(s) URL.",
  })

const optionalImageSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "")

const optionalMediaHrefSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "")
  .refine((value) => value === "" || /^https?:\/\/.+/i.test(value) || value.startsWith("/"), {
    message: "Must be a valid http(s) URL or internal path starting with '/'.",
  })

const optionalExternalUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "")
  .refine((value) => value === "" || /^https?:\/\/.+/i.test(value), {
    message: "Must be a valid http(s) URL.",
  })

const optionalCoordinateSchema = z
  .union([z.number(), z.string().trim()])
  .optional()
  .transform((value) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : undefined
    }

    if (typeof value === "string") {
      if (!value) {
        return undefined
      }
      const numeric = Number(value)
      return Number.isFinite(numeric) ? numeric : undefined
    }

    return undefined
  })

export const newsInputSchema = z.object({
  title: z.string().trim().min(3, "Title is required."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required.")
    .regex(slugPattern, "Slug must be lowercase and use hyphens only."),
  summary: z.string().trim().min(10, "Summary is required."),
  body: z.string().trim().min(20, "Body is required."),
  category: z.enum(["Announcements", "Training", "Community Service", "Awards", "General"]),
  image: optionalImageSchema,
  date: z.string().trim().min(1, "Date is required."),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
})

export const newsUpdateSchema = newsInputSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required.",
})

const eventBaseSchema = z.object({
  title: z.string().trim().min(3, "Title is required."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required.")
    .regex(slugPattern, "Slug must be lowercase and use hyphens only."),
  description: z.string().trim().min(10, "Description is required."),
  date: z.string().trim().min(1, "Date is required."),
  time: z.string().trim().min(1, "Time is required."),
  location: z.string().trim().min(3, "Location is required."),
  latitude: optionalCoordinateSchema,
  longitude: optionalCoordinateSchema,
  mapZoom: z.coerce.number().int().min(3).max(19).optional().default(14),
  image: optionalImageSchema,
  category: z.string().trim().min(2, "Category is required."),
  registrationOpen: z.boolean().optional().default(false),
  registrationUrl: optionalUrlSchema,
  published: z.boolean().optional().default(false),
})

function assertEventCoordinates(
  data: {
    latitude?: number
    longitude?: number
  },
  context: z.RefinementCtx,
) {
  const hasLatitude = typeof data.latitude === "number"
  const hasLongitude = typeof data.longitude === "number"

  if (hasLatitude !== hasLongitude) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [hasLatitude ? "longitude" : "latitude"],
      message: "Both latitude and longitude are required when setting map coordinates.",
    })
    return
  }

  if (!hasLatitude || !hasLongitude) {
    return
  }

  if (data.latitude < -90 || data.latitude > 90) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["latitude"],
      message: "Latitude must be between -90 and 90.",
    })
  }

  if (data.longitude < -180 || data.longitude > 180) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["longitude"],
      message: "Longitude must be between -180 and 180.",
    })
  }
}

export const eventInputSchema = eventBaseSchema.superRefine((data, context) => {
  assertEventCoordinates(data, context)
})

export const eventUpdateSchema = eventBaseSchema
  .partial()
  .superRefine((data, context) => {
    assertEventCoordinates(data, context)
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
})

export const resourceInputSchema = z.object({
  title: z.string().trim().min(3, "Title is required."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required.")
    .regex(slugPattern, "Slug must be lowercase and use hyphens only."),
  description: z.string().trim().min(10, "Description is required."),
  category: z.enum(["Forms", "Training", "Policies", "Badges", "Reports", "General"]),
  fileType: z.enum(["PDF", "DOCX", "XLSX", "ZIP", "UNKNOWN"]),
  fileSize: z.string().trim().min(1, "File size is required."),
  publishDate: z.string().trim().min(1, "Publish date is required."),
  downloadUrl: optionalUrlSchema,
  published: z.boolean().optional().default(false),
})

export const resourceUpdateSchema = resourceInputSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required.",
})

const mediaBaseSchema = z.object({
  title: z.string().trim().min(3, "Title is required."),
  kind: z.enum(["video", "gallery"]),
  thumbnail: z.string().trim().optional().transform((value) => value || ""),
  href: optionalMediaHrefSchema,
  embedUrl: optionalExternalUrlSchema,
  sourceProvider: z.string().trim().optional().transform((value) => value || ""),
  description: z.string().trim().optional().transform((value) => value || ""),
  displayOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
  published: z.boolean().optional().default(false),
})

function assertMediaVideoLink(
  data: {
    kind?: "video" | "gallery"
    href?: string
    embedUrl?: string
  },
  context: z.RefinementCtx,
) {
  if (data.kind === "video" && data.href === "" && data.embedUrl === "") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["href"],
      message: "Video items require a video link URL or embed URL.",
    })
  }
}

export const mediaInputSchema = mediaBaseSchema.superRefine((data, context) => {
  assertMediaVideoLink(data, context)
})

export const mediaUpdateSchema = mediaBaseSchema
  .partial()
  .superRefine((data, context) => {
    assertMediaVideoLink(data, context)
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
})
