"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchOrders } from "@/redux/slices/orderSlice"
import { OrdersTable } from "./orders-table"

export function OrdersContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.order)

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          View and manage all customer orders
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <OrdersTable items={items} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
