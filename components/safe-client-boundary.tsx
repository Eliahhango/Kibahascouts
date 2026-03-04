"use client"

import { Component, type ReactNode } from "react"

type SafeClientBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

type SafeClientBoundaryState = {
  hasError: boolean
}

export class SafeClientBoundary extends Component<SafeClientBoundaryProps, SafeClientBoundaryState> {
  state: SafeClientBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // Keep diagnostics in the browser console while preventing full-page crash.
    console.error("SafeClientBoundary caught an error:", error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }

    return this.props.children
  }
}
