"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchCustomers } from "@/redux/slices/customerSlice"
import { CustomersTable } from "./customers-table"

export function CustomersContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.customer)

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [dispatch])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          View registered customers from the storefront
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CustomersTable items={items} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
