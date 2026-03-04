import type { CSSProperties, ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

type SpinnerSize = "xs" | "sm" | "md" | "lg"

type SpinnerProps = ComponentPropsWithoutRef<"svg"> & {
  size?: SpinnerSize
  color?: string
}

const sizeClassMap: Record<SpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
}

function Spinner({ className, size = "md", color = "currentColor", style, ...props }: SpinnerProps) {
  const mergedStyle: CSSProperties = {
    color,
    ...style,
  }

  return (
    <svg
      role="status"
      aria-label="Loading"
      viewBox="0 0 24 24"
      className={cn("animate-spin", sizeClassMap[size], className)}
      style={mergedStyle}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export { Spinner }
