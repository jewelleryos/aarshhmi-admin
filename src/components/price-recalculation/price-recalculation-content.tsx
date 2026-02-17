"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchJobs, triggerRecalculation } from "@/redux/slices/priceRecalculationSlice"
import { PriceRecalculationTable } from "./price-recalculation-table"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import { toast } from "sonner"

export function PriceRecalculationContent() {
  const dispatch = useAppDispatch()
  const { jobs, isLoading, isTriggering } = useAppSelector(
    (state) => state.priceRecalculation
  )

  const { has } = usePermissions()
  const canView = has(PERMISSIONS.PRICE_RECALCULATION.READ)

  useEffect(() => {
    if (canView) {
      dispatch(fetchJobs())
    }
  }, [dispatch, canView])

  const handleTrigger = async () => {
    try {
      await dispatch(triggerRecalculation()).unwrap()
      toast.success("Recalculation triggered")
    } catch (err) {
      toast.error(err as string)
    }
  }

  if (!canView) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Price Recalculation</h1>
          <p className="text-muted-foreground">
            Monitor and manage product price recalculation jobs
          </p>
        </div>
        <Button onClick={handleTrigger} disabled={isTriggering}>
          {isTriggering ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Recalculate
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading && jobs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PriceRecalculationTable jobs={jobs} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
