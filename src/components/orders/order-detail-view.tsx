"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, Loader2, MoreVertical, Eye, User, MapPin, CreditCard, Package, FileDown } from "lucide-react"
import orderService from "@/redux/services/orderService"
import {
  STAGE_LABELS,
  PAYMENT_STATUS_STYLES,
  formatPrice,
  formatDate,
  formatDateTime,
} from "./shared/order.constants"

interface OrderDetailViewProps {
  orderId: string
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await orderService.getById(orderId)
      setOrder(response.data)
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch order"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={fetchOrder}>Retry</Button>
      </div>
    )
  }

  if (!order) return null

  const stageInfo = STAGE_LABELS[order.stage]
  const paymentInfo = PAYMENT_STATUS_STYLES[order.payment_status]
  const shippingAddress = order.shipping_address
  const billingAddress = order.billing_address

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{order.order_number}</h1>
            <Badge variant="outline" className={stageInfo?.className || "bg-gray-50 text-gray-500 border-gray-200"}>
              {stageInfo?.label || `Stage ${order.stage}`}
            </Badge>
            <Badge variant="outline" className={paymentInfo?.className || "bg-gray-50 text-gray-500 border-gray-200"}>
              {paymentInfo?.label || order.payment_status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {formatDateTime(order.created_at)}
            {order.receipt_number && (
              <span className="ml-3">Receipt: {order.receipt_number}</span>
            )}
          </p>
        </div>
        {order.receipt_url && (
          <Button variant="outline" size="sm" asChild>
            <a href={order.receipt_url} target="_blank" rel="noopener noreferrer">
              <FileDown className="mr-2 h-4 w-4" />
              Payment Receipt
            </a>
          </Button>
        )}
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm font-medium">{order.customer_name}</p>
            {order.customer_email && (
              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
            )}
            {order.customer_phone && (
              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(order.tax_amount)}</span>
            </div>
            {order.coupon_discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Coupon {order.coupon_code && <span className="text-xs">({order.coupon_code})</span>}
                </span>
                <span className="text-green-600">-{formatPrice(order.coupon_discount)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              via {order.payment_gateway}
            </p>
          </CardContent>
        </Card>

        {/* Order Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Order Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span>{order.total_quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            {order.cancellation_window_ends_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cancel window</span>
                <span>{formatDate(order.cancellation_window_ends_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shippingAddress && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddressBlock address={shippingAddress} />
            </CardContent>
          </Card>
        )}
        {billingAddress && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddressBlock address={billingAddress} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sub-orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sub-orders ({order.items?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {order.items && order.items.length > 0 ? (
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Sub-order #</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Product</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Qty</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Amount</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Stage</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any) => {
                    const itemStage = STAGE_LABELS[item.stage]
                    const snapshot = item.product_snapshot || {}
                    return (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3">
                          <span className="text-sm font-medium">{item.suborder_number}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{snapshot.productName || "—"}</span>
                            {snapshot.variantName && (
                              <span className="text-xs text-muted-foreground">{snapshot.variantName}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-sm">{item.quantity}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm font-medium">{formatPrice(item.paid_amount)}</span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className={itemStage?.className || "bg-gray-50 text-gray-500 border-gray-200"}
                          >
                            {itemStage?.label || `Stage ${item.stage}`}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/orders/${orderId}/items/${item.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No sub-orders found</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Transactions */}
      {order.payments && order.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Gateway</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Transaction ID</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Amount</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {order.payments.map((payment: any) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="p-3">
                        <span className="text-sm capitalize">{payment.type}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{payment.gateway_name}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm font-mono text-xs">
                          {payment.gateway_transaction_id || "—"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-sm font-medium">{formatPrice(payment.amount)}</span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          className={
                            PAYMENT_STATUS_STYLES[payment.status]?.className ||
                            "bg-gray-50 text-gray-500 border-gray-200"
                          }
                        >
                          {PAYMENT_STATUS_STYLES[payment.status]?.label || payment.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(payment.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Address display block
// ============================================

function AddressBlock({ address }: { address: any }) {
  return (
    <div className="text-sm space-y-1">
      <p className="font-medium">{address.first_name} {address.last_name}</p>
      <p className="text-muted-foreground">{address.address_line_1}</p>
      {address.address_line_2 && (
        <p className="text-muted-foreground">{address.address_line_2}</p>
      )}
      <p className="text-muted-foreground">
        {address.city_name}, {address.state_name} — {address.pincode}
      </p>
      {address.phone && (
        <p className="text-muted-foreground">Phone: {address.phone}</p>
      )}
    </div>
  )
}
