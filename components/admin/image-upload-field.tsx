"use client"

import { type ChangeEvent, useRef, useState } from "react"
import { CheckCircle2, Link, Upload, X } from "lucide-react"
import { uploadImageToStorage } from "@/lib/firebase/storage-upload"
import { Spinner } from "@/components/ui/spinner"

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  folder: "campaigns" | "news" | "media" | "general"
  placeholder?: string
}

export function ImageUploadField({ label, value, onChange, folder, placeholder }: Props) {
  const [mode, setMode] = useState<"upload" | "url">("upload")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are allowed.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be under 10MB.")
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      const url = await uploadImageToStorage(file, folder, setUploadProgress)
      onChange(url)
      setUploadProgress(100)
    } catch {
      setUploadError("Upload failed. Check your connection and try again.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="text-sm">
      <span className="font-medium text-card-foreground">{label}</span>

      <div className="mt-1.5 inline-flex rounded-md border border-border text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1.5 transition ${mode === "upload" ? "rounded-l-md bg-tsa-green-deep text-white" : "rounded-l-md text-foreground hover:bg-secondary"}`}
        >
          <Upload className="mr-1 inline h-3.5 w-3.5" />
          Upload from device
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`px-3 py-1.5 transition ${mode === "url" ? "rounded-r-md bg-tsa-green-deep text-white" : "rounded-r-md text-foreground hover:bg-secondary"}`}
        >
          <Link className="mr-1 inline h-3.5 w-3.5" />
          Paste URL
        </button>
      </div>

      {mode === "upload" ? (
        <div className="mt-2">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-tsa-green-deep/30 bg-tsa-green-deep/5 px-4 py-6 text-center transition hover:border-tsa-green-deep hover:bg-tsa-green-deep/10"
          >
            {uploading ? (
              <>
                <Spinner size="md" color="#1e3a2f" />
                <p className="mt-2 text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                <div className="mt-2 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-tsa-gold transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </>
            ) : value && value.startsWith("http") ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-tsa-green-deep" />
                <p className="mt-1 text-xs font-semibold text-tsa-green-deep">Image uploaded</p>
                <img src={value} alt="" className="mt-2 h-20 w-auto rounded-lg object-cover shadow" />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onChange("")
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-tsa-green-deep/40" />
                <p className="mt-2 text-sm font-medium text-foreground">Click to select an image</p>
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP - Max 10MB</p>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="mt-2">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder || "https://..."}
            className="admin-input"
          />
          {value ? (
            <img
              src={value}
              alt=""
              className="mt-2 h-16 w-auto rounded-lg object-cover shadow"
              onError={(event) => {
                event.currentTarget.style.display = "none"
              }}
            />
          ) : null}
        </div>
      )}

      {uploadError ? <p className="mt-1.5 text-xs text-destructive">{uploadError}</p> : null}
    </div>
  )
}
