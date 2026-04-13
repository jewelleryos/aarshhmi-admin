"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Loader2,
  Package,
  Clock,
  ChevronRight,
  ImageIcon,
  FileDown,
} from "lucide-react"
import orderService from "@/redux/services/orderService"
import { getCdnUrl } from "@/utils/cdn"
import {
  STAGE_LABELS,
  STAGE_TRANSITION_INPUTS,
  formatPrice,
  formatDate,
  formatDateTime,
  getStageLabel,
  getStageClassName,
  getValidNextStages,
} from "./shared/order.constants"

interface SuborderDetailViewProps {
  orderId: string
  itemId: string
}

export function SuborderDetailView({ orderId, itemId }: SuborderDetailViewProps) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Stage change state
  const [selectedStage, setSelectedStage] = useState<string>("")
  const [stageNote, setStageNote] = useState("")
  const [refundId, setRefundId] = useState("")
  const [isUpdatingStage, setIsUpdatingStage] = useState(false)

  // Shipping form state (7 → 10)
  const [isWeightSame, setIsWeightSame] = useState(true)
  const [actualMetalWeight, setActualMetalWeight] = useState("")
  const [trackingId, setTrackingId] = useState("")
  const [courierName, setCourierName] = useState("")

  // QC Accepted form state (22 → 23)
  const [isFullRefund, setIsFullRefund] = useState(true)
  const [returnRefundAmount, setReturnRefundAmount] = useState("")

  // Invoice generation state
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await orderService.getById(orderId)
      const orderData = response.data
      setOrder(orderData)

      const foundItem = orderData.items?.find((i: any) => i.id === itemId)
      if (!foundItem) {
        setError("Sub-order not found")
        return
      }
      setItem(foundItem)
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch order"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [orderId, itemId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleStageUpdate = async () => {
    if (!selectedStage) return
    try {
      setIsUpdatingStage(true)

      const data: any = {
        stage: Number(selectedStage),
        note: stageNote.trim() || undefined,
        refund_id: refundId.trim() || undefined,
      }

      // Add shipping data for 7 → 10
      if (inputType === "shipping") {
        data.is_weight_same = isWeightSame
        if (!isWeightSame) {
          data.actual_metal_weight = parseFloat(actualMetalWeight)
        }
        if (trackingId.trim()) data.tracking_id = trackingId.trim()
        if (courierName.trim()) data.courier_name = courierName.trim()
      }

      // Add QC accepted data for 22 → 23
      if (inputType === "qc_accepted") {
        data.is_full_refund = isFullRefund
        if (!isFullRefund) {
          data.return_refund_amount = Math.round(parseFloat(returnRefundAmount) * 100) // INR to paise
        }
      }

      await orderService.updateItemStage(orderId, itemId, data)
      setSelectedStage("")
      setStageNote("")
      setRefundId("")
      setIsWeightSame(true)
      setActualMetalWeight("")
      setTrackingId("")
      setCourierName("")
      setIsFullRefund(true)
      setReturnRefundAmount("")
      await fetchOrder()
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update stage"
      setError(message)
    } finally {
      setIsUpdatingStage(false)
    }
  }

  const handleGenerateInvoice = async () => {
    try {
      setIsGeneratingInvoice(true)
      const response = await orderService.generateInvoice(orderId, itemId)
      const invoiceUrl = response.data?.invoiceUrl
      if (invoiceUrl) {
        setItem((prev: any) => ({ ...prev, invoice_url: invoiceUrl }))
        window.open(invoiceUrl, '_blank')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to generate invoice"
      setError(message)
    } finally {
      setIsGeneratingInvoice(false)
    }
  }

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

  if (!item || !order) return null

  const snapshot = item.product_snapshot || {}
  const stageInfo = STAGE_LABELS[item.stage]
  const productImage = getProductImage(snapshot)
  const validNextStages = getValidNextStages(item.stage)
  const transitionKey = selectedStage ? `${item.stage}-${selectedStage}` : ""
  const inputType = transitionKey ? (STAGE_TRANSITION_INPUTS[transitionKey] || "none") : "none"

  return (
    <div className="space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/orders/${orderId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="hover:text-foreground transition-colors"
          >
            {order.order_number}
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{item.suborder_number}</span>
        </div>
      </div>

      {/* Sub-order Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{item.suborder_number}</h1>
            <Badge variant="outline" className={stageInfo?.className || "bg-gray-50 text-gray-500 border-gray-200"}>
              {stageInfo?.label || `Stage ${item.stage}`}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {snapshot.productName}{snapshot.variantName ? ` — ${snapshot.variantName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {item.order_sheet_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={item.order_sheet_url} target="_blank" rel="noopener noreferrer">
                <FileDown className="mr-2 h-4 w-4" />
                Order Sheet
              </a>
            </Button>
          )}
          {item.invoice_url ? (
            <Button variant="outline" size="sm" asChild>
              <a href={item.invoice_url} target="_blank" rel="noopener noreferrer">
                <FileDown className="mr-2 h-4 w-4" />
                Invoice
              </a>
            </Button>
          ) : item.stage >= 10 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInvoice}
              disabled={isGeneratingInvoice}
            >
              {isGeneratingInvoice ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              {isGeneratingInvoice ? "Generating..." : "Generate Invoice"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Product + Pricing & Status */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-5">
                {/* Product Image */}
                <div className="w-24 h-24 rounded-lg border overflow-hidden shrink-0 bg-muted">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={snapshot.productName || "Product"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-1">
                  <InfoRow label="Product" value={snapshot.productName || "—"} />
                  {snapshot.variantName && <InfoRow label="Variant" value={snapshot.variantName} />}
                  {snapshot.productSku && <InfoRow label="Product SKU" value={snapshot.productSku.toUpperCase()} />}
                  {snapshot.sku && <InfoRow label="Variant SKU" value={snapshot.sku.toUpperCase()} />}
                  <InfoRow label="Quantity" value={String(item.quantity)} />
                  {snapshot.sizeChartValueName && (
                    <InfoRow label="Size" value={snapshot.sizeChartValueName} />
                  )}
                  {snapshot.engravingText && (
                    <InfoRow label="Engraving" value={snapshot.engravingText} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown + Status (side by side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pricing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 text-sm">
                  {item.metal_price > 0 && <PriceRow label="Metal" amount={item.metal_price} />}
                  {item.making_charge > 0 && <PriceRow label="Making" amount={item.making_charge} />}
                  {item.diamond_price > 0 && <PriceRow label="Diamond" amount={item.diamond_price} />}
                  {item.gemstone_price > 0 && <PriceRow label="Gemstone" amount={item.gemstone_price} />}
                  {item.pearl_price > 0 && <PriceRow label="Pearl" amount={item.pearl_price} />}
                  <Separator className="my-1.5" />
                  <PriceRow label="Excl. Tax" amount={item.price_without_tax} />
                  <PriceRow label="Tax" amount={item.tax_amount} />
                  <PriceRow label="Unit Price" amount={item.unit_price} bold />
                  {item.coupon_discount > 0 && (
                    <PriceRow label="Coupon" amount={-item.coupon_discount} className="text-green-600" />
                  )}
                  <Separator className="my-1.5" />
                  <PriceRow label="Paid" amount={item.paid_amount} bold />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stage</span>
                    <Badge variant="outline" className={stageInfo?.className}>
                      {stageInfo?.label || `Stage ${item.stage}`}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cancellable</span>
                    <span>{item.is_cancellable ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Returnable</span>
                    <span>{item.is_returnable ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  {item.updated_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Updated</span>
                      <span>{formatDate(item.updated_at)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Return Media (from customer) */}
          {item.metadata?.returnMedia?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  Return Media ({item.metadata.returnMedia.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {item.metadata.returnMedia.map((media: any, index: number) => (
                    <a
                      key={index}
                      href={media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg border overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
                    >
                      {media.type === "video" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <svg className="h-8 w-8 text-muted-foreground/60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          <span className="text-[10px] text-muted-foreground truncate max-w-full px-1">{media.filename}</span>
                        </div>
                      ) : (
                        <img
                          src={media.url}
                          alt={media.filename || `Return media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </a>
                  ))}
                </div>
                {item.return_reason && (
                  <div className="mt-3 p-2.5 rounded-md bg-muted text-sm">
                    <span className="text-muted-foreground font-medium">Reason: </span>
                    {item.return_reason}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column — Update Stage + Stage History */}
        <div className="space-y-4">
          {/* Update Stage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Stage</CardTitle>
            </CardHeader>
            <CardContent>
              {validNextStages.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Move to</label>
                    <Select value={selectedStage} onValueChange={setSelectedStage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select next stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {validNextStages.map((stage) => (
                          <SelectItem key={stage} value={String(stage)}>
                            {getStageLabel(stage)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditional inputs based on transition */}
                  {selectedStage && (inputType === "note" || inputType === "reason") && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {inputType === "reason" ? "Reason" : "Note"}
                        {inputType === "reason" && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <Textarea
                        placeholder={inputType === "reason" ? "Enter reason (required)..." : "Add a note (optional)..."}
                        value={stageNote}
                        onChange={(e) => setStageNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  {selectedStage && inputType === "refund_id" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Razorpay Refund ID
                        <span className="text-destructive ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="rfnd_xxxxxxxxxx"
                        value={refundId}
                        onChange={(e) => setRefundId(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Shipping form (7 → 10) */}
                  {selectedStage && inputType === "shipping" && (
                    <div className="space-y-4">
                      <Separator />

                      {/* Weight verification */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Weight Verification</Label>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="weight-same"
                            checked={isWeightSame}
                            onCheckedChange={(checked) => {
                              setIsWeightSame(checked === true)
                              if (checked) setActualMetalWeight("")
                            }}
                          />
                          <Label htmlFor="weight-same" className="text-sm font-normal cursor-pointer">
                            Metal weight is same as quoted
                            {item.product_snapshot?.variantMetadata?.metalWeight && (
                              <span className="text-muted-foreground ml-1">
                                ({item.product_snapshot.variantMetadata.metalWeight}g)
                              </span>
                            )}
                          </Label>
                        </div>

                        {!isWeightSame && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Actual Metal Weight (g)
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              type="number"
                              step="0.0001"
                              min="0"
                              placeholder="Enter actual weight in grams"
                              value={actualMetalWeight}
                              onChange={(e) => setActualMetalWeight(e.target.value)}
                            />
                            {actualMetalWeight && item.product_snapshot?.variantMetadata?.metalWeight && (
                              <WeightDiffPreview
                                quotedWeight={item.product_snapshot.variantMetadata.metalWeight}
                                actualWeight={parseFloat(actualMetalWeight)}
                                metalPrice={item.metal_price}
                                priceWithoutTax={item.price_without_tax}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Shipping details */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Shipping Details</Label>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Tracking ID</Label>
                          <Input
                            type="text"
                            placeholder="Enter tracking ID (optional)"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Courier Name</Label>
                          <Input
                            type="text"
                            placeholder="Enter courier name (optional)"
                            value={courierName}
                            onChange={(e) => setCourierName(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QC Accepted form (22 → 23) */}
                  {selectedStage && inputType === "qc_accepted" && (() => {
                    const maxRefundable = (item.paid_amount || 0) - (item.refund_amount || 0)
                    const maxRefundableInr = maxRefundable / 100
                    return (
                      <div className="space-y-4">
                        <Separator />
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Refund Amount</Label>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="full-refund"
                              checked={isFullRefund}
                              onCheckedChange={(checked) => {
                                setIsFullRefund(checked === true)
                                if (checked) setReturnRefundAmount("")
                              }}
                            />
                            <Label htmlFor="full-refund" className="text-sm font-normal cursor-pointer">
                              Refund 100%
                              <span className="text-muted-foreground ml-1">
                                ({formatPrice(maxRefundable)})
                              </span>
                            </Label>
                          </div>

                          {!isFullRefund && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Custom Refund Amount (₹)
                                <span className="text-destructive ml-1">*</span>
                              </Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={maxRefundableInr}
                                placeholder={`Max: ₹${maxRefundableInr.toFixed(2)}`}
                                value={returnRefundAmount}
                                onChange={(e) => setReturnRefundAmount(e.target.value)}
                              />
                              {parseFloat(returnRefundAmount) > maxRefundableInr && (
                                <p className="text-xs text-destructive">
                                  Cannot exceed {formatPrice(maxRefundable)}
                                </p>
                              )}
                              {item.refund_amount > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Prior refund: {formatPrice(item.refund_amount)} (weight adjustment)
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Optional note */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Note</Label>
                          <Textarea
                            placeholder="Add a note (optional)..."
                            value={stageNote}
                            onChange={(e) => setStageNote(e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    )
                  })()}

                  <Button
                    className="w-full"
                    onClick={handleStageUpdate}
                    disabled={
                      isUpdatingStage ||
                      !selectedStage ||
                      (inputType === "reason" && !stageNote.trim()) ||
                      (inputType === "refund_id" && !refundId.trim()) ||
                      (inputType === "shipping" && !isWeightSame && (!actualMetalWeight || parseFloat(actualMetalWeight) <= 0)) ||
                      (inputType === "qc_accepted" && !isFullRefund && (!returnRefundAmount || parseFloat(returnRefundAmount) <= 0 || parseFloat(returnRefundAmount) > ((item.paid_amount - (item.refund_amount || 0)) / 100)))
                    }
                  >
                    {isUpdatingStage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Stage
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No stage transitions available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Stage History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Stage History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.logs && item.logs.length > 0 ? (
                <div className="space-y-4">
                  {[...item.logs].reverse().map((log: any, index: number) => (
                    <div key={log.id} className="flex gap-3">
                      {/* Timeline dot & line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          index === 0 ? "bg-primary" : "bg-muted-foreground/30"
                        }`} />
                        {index < item.logs.length - 1 && (
                          <div className="w-px flex-1 bg-muted-foreground/20 mt-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStageClassName(log.stage)}`}
                          >
                            {getStageLabel(log.stage)}
                          </Badge>
                        </div>
                        {log.note && (
                          <p className="text-xs text-muted-foreground mt-1">{log.note}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(log.created_at)}
                          {log.actor_type && <span> · {log.actor_type}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No stage history</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Helper components
// ============================================

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

function PriceRow({
  label,
  amount,
  bold,
  className,
}: {
  label: string
  amount: number
  bold?: boolean
  className?: string
}) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""} ${className || ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{amount < 0 ? `-${formatPrice(Math.abs(amount))}` : formatPrice(amount)}</span>
    </div>
  )
}

// ============================================
// Weight difference preview for shipping form
// ============================================

function WeightDiffPreview({
  quotedWeight,
  actualWeight,
  metalPrice,
  priceWithoutTax,
}: {
  quotedWeight: number
  actualWeight: number
  metalPrice: number
  priceWithoutTax: number
}) {
  if (!actualWeight || actualWeight <= 0 || !quotedWeight || quotedWeight <= 0) return null

  const diff = actualWeight - quotedWeight
  if (diff === 0) return null

  const metalRatePerGram = metalPrice / quotedWeight
  const newMetalPrice = Math.round(actualWeight * metalRatePerGram)
  const metalPriceDiff = newMetalPrice - metalPrice
  const newPriceWithoutTax = priceWithoutTax + metalPriceDiff
  const taxRate = 3 / 100 // 3% GST
  const newTax = Math.round(newPriceWithoutTax * taxRate)
  const newFinalPrice = newPriceWithoutTax + newTax

  const originalFinalPrice = priceWithoutTax + Math.round(priceWithoutTax * taxRate)
  const adjustmentAmount = Math.abs(originalFinalPrice - newFinalPrice)

  const isLess = diff < 0

  return (
    <div className={`rounded-md border p-3 text-xs space-y-1 ${
      isLess ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"
    }`}>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Weight diff</span>
        <span className="font-medium">{diff > 0 ? "+" : ""}{diff.toFixed(4)}g</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Metal price</span>
        <span>{formatPrice(metalPrice)} → {formatPrice(newMetalPrice)}</span>
      </div>
      <Separator className="my-1" />
      <div className="flex justify-between font-medium">
        <span>{isLess ? "Refund amount" : "Complimentary discount"}</span>
        <span>{formatPrice(adjustmentAmount)}</span>
      </div>
    </div>
  )
}

// ============================================
// Extract first product image from snapshot media
// ============================================

function getProductImage(snapshot: any): string | null {
  const media = snapshot?.media
  if (!media?.colorMedia || media.colorMedia.length === 0) return null

  const metalColorId = snapshot?.options?.metalColor

  // Try to find media matching the variant's metal color
  if (metalColorId) {
    const colorMatch = media.colorMedia.find((cm: any) => cm.metalColorId === metalColorId)
    if (colorMatch?.items?.length > 0) {
      const firstImage = colorMatch.items.find((item: any) => item.type?.startsWith("image"))
      if (firstImage?.path) return getCdnUrl(firstImage.path)
    }
  }

  // Fallback: first image from any color
  for (const cm of media.colorMedia) {
    if (cm.items?.length > 0) {
      const firstImage = cm.items.find((item: any) => item.type?.startsWith("image"))
      if (firstImage?.path) return getCdnUrl(firstImage.path)
    }
  }

  return null
}
