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

export const eventInputSchema = z.object({
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
  image: optionalImageSchema,
  category: z.string().trim().min(2, "Category is required."),
  registrationOpen: z.boolean().optional().default(false),
  registrationUrl: optionalUrlSchema,
  published: z.boolean().optional().default(false),
})

export const eventUpdateSchema = eventInputSchema.partial().refine((data) => Object.keys(data).length > 0, {
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
