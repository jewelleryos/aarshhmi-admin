"use client"

import { useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { SizeChartValue } from "@/redux/services/sizeChartValueService"

interface SizeChartValueDeleteDialogProps {
  open: boolean
  item: SizeChartValue | null
  countdown: number
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  setCountdown: (countdown: number) => void
}

export function SizeChartValueDeleteDialog({
  open,
  item,
  countdown,
  onOpenChange,
  onConfirm,
  setCountdown,
}: SizeChartValueDeleteDialogProps) {
  // Countdown effect
  useEffect(() => {
    if (open && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [open, countdown, setCountdown])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Size Chart Value</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{item?.name}&quot;? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={countdown > 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {countdown > 0 ? `Delete (${countdown})` : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
