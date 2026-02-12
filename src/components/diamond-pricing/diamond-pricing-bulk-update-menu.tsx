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
import { exportPrices } from "@/redux/slices/diamondPricingSlice"
import { toast } from "sonner"
import { DiamondPricingUploadDialog } from "./diamond-pricing-upload-dialog"

export function DiamondPricingBulkUpdateMenu() {
  const dispatch = useAppDispatch()
  const { bulk, filters } = useAppSelector((state) => state.diamondPricing)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const handleExportPrices = async () => {
    try {
      await dispatch(exportPrices(filters)).unwrap()
      toast.success("Prices exported successfully")
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to export prices"
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
            Bulk Update
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportPrices}>
            <Download className="mr-2 h-4 w-4" />
            Export Current Prices
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
        type="update"
      />
    </>
  )
}
