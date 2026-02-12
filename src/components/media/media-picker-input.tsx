"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MediaPickerModal } from "./media-picker-modal"
import { X } from "lucide-react"
import { getCdnUrl } from "@/utils/cdn"

interface MediaPickerInputProps {
  label: string
  value: string | null // Path only (not full URL)
  onChange: (path: string | null) => void
  rootPath: string
  required?: boolean
  error?: string
  disabled?: boolean
  accept?: string[] // Allowed file extensions (e.g., ["png", "jpg", "jpeg"])
}

// Extract filename from path
function getFilename(path: string): string {
  const segments = path.split("/")
  return segments[segments.length - 1] || path
}

export function MediaPickerInput({
  label,
  value,
  onChange,
  rootPath,
  required = false,
  error,
  disabled = false,
  accept,
}: MediaPickerInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Handle image selection from modal
  const handleSelect = (path: string) => {
    onChange(path)
  }

  // Handle clear selection
  const handleClear = () => {
    onChange(null)
  }

  // Get full CDN URL for preview
  const previewUrl = getCdnUrl(value)

  return (
    <div className="space-y-2">
      {/* Label */}
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Input area */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
        >
          Select
        </Button>

        {/* Selected image display */}
        {value ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Thumbnail preview */}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Selected"
                className="h-9 w-9 rounded object-cover border shrink-0"
              />
            )}
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded truncate flex-1">
              {getFilename(value)}
            </span>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No image selected</span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive pl-[5px]">{error}</p>
      )}

      {/* Modal */}
      <MediaPickerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        rootPath={rootPath}
        onSelect={handleSelect}
        accept={accept}
      />
    </div>
  )
}
