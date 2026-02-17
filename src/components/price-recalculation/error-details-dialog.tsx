"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { RecalculationJob } from "@/redux/services/priceRecalculationService"

interface ErrorDetailsDialogProps {
  job: RecalculationJob | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ErrorDetailsDialog({ job, open, onOpenChange }: ErrorDetailsDialogProps) {
  const errors = job?.error_details || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Error Details</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {errors.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No errors recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((err, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{err.productId}</TableCell>
                    <TableCell className="text-sm">{err.productName}</TableCell>
                    <TableCell className="text-sm text-red-600">{err.error}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
