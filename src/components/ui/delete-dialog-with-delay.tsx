"use client"

import { useState, useEffect, useCallback } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import appConfig from "@/configs/app-config"

interface DeleteDialogWithDelayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => Promise<void>
}

export function DeleteDialogWithDelay({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: DeleteDialogWithDelayProps) {
  const [countdown, setCountdown] = useState(appConfig.deleteConfirmation.buttonEnableDelay)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset countdown when dialog opens
  useEffect(() => {
    if (open) {
      setCountdown(appConfig.deleteConfirmation.buttonEnableDelay)
    }
  }, [open])

  // Countdown timer
  useEffect(() => {
    if (!open || countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [open, countdown])

  // Handle delete confirmation
  const handleConfirm = useCallback(async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error("Delete error:", error)
    } finally {
      setIsDeleting(false)
    }
  }, [onConfirm, onOpenChange])

  const isButtonDisabled = countdown > 0 || isDeleting

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isButtonDisabled}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : countdown > 0 ? (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({countdown})
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
