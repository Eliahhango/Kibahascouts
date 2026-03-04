"use client"

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { Bold, Eraser, Heading1, Heading2, Italic, Link2, List, ListOrdered, Pilcrow, Underline } from "lucide-react"

type RichTextEditorProps = {
  label: string
  value: string
  onChange: (nextValue: string) => void
  placeholder?: string
  minHeight?: number
}

type ToolbarButtonProps = {
  label: string
  onClick: () => void
  icon: ReactNode
}

function ToolbarButton({ label, onClick, icon }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center justify-center rounded-md border border-border px-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  )
}

function normalizeEditorHtml(html: string) {
  const trimmed = html.trim()
  if (!trimmed || trimmed === "<br>" || trimmed === "<div><br></div>" || trimmed === "<p><br></p>") {
    return ""
  }
  return html
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = 220,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [isEmpty, setIsEmpty] = useState(!value.trim())

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    if (editor.innerHTML !== value) {
      editor.innerHTML = value
    }
    setIsEmpty(!editor.textContent?.trim())
  }, [value])

  function emitChange() {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    const normalizedHtml = normalizeEditorHtml(editor.innerHTML)
    onChange(normalizedHtml)
    setIsEmpty(!editor.textContent?.trim())
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    emitChange()
  }

  function applyFontSize(px: string) {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return
    }

    const range = selection.getRangeAt(0)
    const wrapper = document.createElement("span")
    wrapper.style.fontSize = `${px}px`

    try {
      range.surroundContents(wrapper)
    } catch {
      const extracted = range.extractContents()
      wrapper.appendChild(extracted)
      range.insertNode(wrapper)
    }

    emitChange()
  }

  function insertLink() {
    const url = window.prompt("Enter link URL (https://...)")
    if (!url) {
      return
    }

    const normalized = url.trim()
    if (!/^https?:\/\//i.test(normalized) && !/^mailto:/i.test(normalized)) {
      window.alert("Please enter a valid http(s) URL.")
      return
    }

    runCommand("createLink", normalized)
  }

  const toolbar = useMemo(
    () => [
      {
        label: "Bold",
        onClick: () => runCommand("bold"),
        icon: <Bold className="h-3.5 w-3.5" />,
      },
      {
        label: "Italic",
        onClick: () => runCommand("italic"),
        icon: <Italic className="h-3.5 w-3.5" />,
      },
      {
        label: "Underline",
        onClick: () => runCommand("underline"),
        icon: <Underline className="h-3.5 w-3.5" />,
      },
      {
        label: "Bulleted List",
        onClick: () => runCommand("insertUnorderedList"),
        icon: <List className="h-3.5 w-3.5" />,
      },
      {
        label: "Numbered List",
        onClick: () => runCommand("insertOrderedList"),
        icon: <ListOrdered className="h-3.5 w-3.5" />,
      },
      {
        label: "Heading 1",
        onClick: () => runCommand("formatBlock", "<h1>"),
        icon: <Heading1 className="h-3.5 w-3.5" />,
      },
      {
        label: "Heading 2",
        onClick: () => runCommand("formatBlock", "<h2>"),
        icon: <Heading2 className="h-3.5 w-3.5" />,
      },
      {
        label: "Paragraph",
        onClick: () => runCommand("formatBlock", "<p>"),
        icon: <Pilcrow className="h-3.5 w-3.5" />,
      },
      {
        label: "Link",
        onClick: insertLink,
        icon: <Link2 className="h-3.5 w-3.5" />,
      },
      {
        label: "Clear Formatting",
        onClick: () => runCommand("removeFormat"),
        icon: <Eraser className="h-3.5 w-3.5" />,
      },
    ],
    [],
  )

  return (
    <div className="text-sm">
      <span className="font-medium text-card-foreground">{label}</span>

      <div className="mt-1 rounded-md border border-input bg-background p-2">
        <div className="mb-2 flex flex-wrap items-center gap-1">
          {toolbar.map((button) => (
            <ToolbarButton key={button.label} label={button.label} onClick={button.onClick} icon={button.icon} />
          ))}

          <div className="ml-1 flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground">Size</span>
            <select
              defaultValue="16"
              onChange={(event) => {
                const size = event.target.value
                if (size) {
                  applyFontSize(size)
                }
              }}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            >
              <option value="12">Small</option>
              <option value="14">Medium</option>
              <option value="16">Normal</option>
              <option value="20">Large</option>
              <option value="24">XL</option>
              <option value="32">2XL</option>
            </select>
          </div>
        </div>

        <div className="relative rounded-md border border-border bg-card">
          {isEmpty ? (
            <p className="pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground">
              {placeholder}
            </p>
          ) : null}

          <div
            ref={editorRef}
            className="prose prose-sm max-w-none px-3 py-3 text-foreground focus:outline-none"
            style={{ minHeight }}
            contentEditable
            suppressContentEditableWarning
            onInput={emitChange}
            onBlur={emitChange}
          />
        </div>
      </div>
    </div>
  )
}
