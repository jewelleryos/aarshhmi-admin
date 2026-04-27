"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchOrders } from "@/redux/slices/orderSlice"
import { OrdersTable } from "./orders-table"
import { PAYMENT_STATUS_STYLES, STAGE_LABELS } from "./shared/order.constants"

export function OrdersContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.order)

  const [paymentFilter, setPaymentFilter] = useState("all")
  const [orderStatusFilter, setOrderStatusFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (paymentFilter !== "all" && item.payment_status !== paymentFilter) return false
      if (orderStatusFilter !== "all") {
        const stage = parseInt(orderStatusFilter)
        const stages = item.item_stages || []
        if (!stages.some((s) => s.stage === stage)) return false
      }
      return true
    })
  }, [items, paymentFilter, orderStatusFilter])

  const hasCustomFilter = paymentFilter !== "all" || orderStatusFilter !== "all"

  const handleResetFilters = () => {
    setPaymentFilter("all")
    setOrderStatusFilter("all")
  }

  const filterComponent = (
    <>
      <Select value={paymentFilter} onValueChange={setPaymentFilter}>
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="Payment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          {Object.entries(PAYMENT_STATUS_STYLES).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Order Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {Object.entries(STAGE_LABELS).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )

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
            <OrdersTable
              items={filteredItems}
              filterComponent={filterComponent}
              hasCustomFilter={hasCustomFilter}
              onResetFilters={handleResetFilters}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
