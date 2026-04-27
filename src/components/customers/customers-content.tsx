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
import { fetchCustomers } from "@/redux/slices/customerSlice"
import { CustomersTable } from "./customers-table"

const LOGIN_METHOD_OPTIONS = [
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
]

export function CustomersContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.customer)

  const [statusFilter, setStatusFilter] = useState("all")
  const [loginMethodFilter, setLoginMethodFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [dispatch])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === "active" && !item.is_active) return false
      if (statusFilter === "inactive" && item.is_active) return false
      if (loginMethodFilter !== "all" && item.last_login_method !== loginMethodFilter) return false
      return true
    })
  }, [items, statusFilter, loginMethodFilter])

  const hasCustomFilter = statusFilter !== "all" || loginMethodFilter !== "all"

  const handleResetFilters = () => {
    setStatusFilter("all")
    setLoginMethodFilter("all")
  }

  const filterComponent = (
    <>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Select value={loginMethodFilter} onValueChange={setLoginMethodFilter}>
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="Login Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Methods</SelectItem>
          {LOGIN_METHOD_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )

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
            <CustomersTable
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
