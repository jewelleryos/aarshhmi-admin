"use client"

import { useState } from "react"
import { ChevronDown, Download, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { downloadTemplate, downloadReference } from "@/redux/slices/diamondPricingSlice"
import { toast } from "sonner"
import { DiamondPricingUploadDialog } from "./diamond-pricing-upload-dialog"

export function DiamondPricingBulkCreateMenu() {
  const dispatch = useAppDispatch()
  const { bulk } = useAppSelector((state) => state.diamondPricing)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const handleDownloadTemplate = async () => {
    try {
      await dispatch(downloadTemplate()).unwrap()
      toast.success("Template downloaded successfully")
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to download template"
      toast.error(message)
    }
  }

  const handleDownloadReference = async () => {
    try {
      await dispatch(downloadReference()).unwrap()
      toast.success("Reference data downloaded successfully")
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to download reference data"
      toast.error(message)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={bulk.isDownloading}>
            {bulk.isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Bulk Create
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadReference}>
            <Download className="mr-2 h-4 w-4" />
            Download Reference Data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DiamondPricingUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        type="create"
      />
    </>
  )
}
