import sanitizeHtml from "sanitize-html"

const allowedTags = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "a",
  "span",
  "font",
] as const

const allowedAttributes: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel"],
  span: ["style"],
  font: ["size"],
}

const allowedSchemes = ["http", "https", "mailto"]

const richTextSanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [...allowedTags],
  allowedAttributes,
  allowedSchemes,
  disallowedTagsMode: "discard",
  allowedStyles: {
    span: {
      "font-size": [/^(?:10|11|12|13|14|15|16|18|20|24|28|32)px$/],
      "text-decoration": [/^underline$/],
    },
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noreferrer noopener",
      target: "_blank",
    }),
  },
}

export function sanitizeRichTextHtml(value: string | null | undefined) {
  const raw = (value || "").trim()
  if (!raw) {
    return ""
  }

  return sanitizeHtml(raw, richTextSanitizeOptions)
}

export function richTextToPlainText(value: string | null | undefined) {
  const raw = (value || "").trim()
  if (!raw) {
    return ""
  }

  return sanitizeHtml(raw, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  })
    .replace(/\s+/g, " ")
    .trim()
}

export function hasRichTextMarkup(value: string | null | undefined) {
  return /<[^>]+>/.test((value || "").trim())
}
