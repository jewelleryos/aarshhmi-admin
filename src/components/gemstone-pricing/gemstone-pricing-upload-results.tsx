"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  BulkCreateResponse,
  BulkCreateSuccessData,
  BulkCreateErrorData,
  BulkUpdateResponse,
} from "@/redux/services/gemstonePricingService"
import { CURRENCY_CONFIG } from "@/configs/currency"

interface GemstonePricingUploadResultsProps {
  result: BulkCreateResponse | BulkUpdateResponse
  type: "create" | "update"
}

// Type guard to check if it's a create success response
function isBulkCreateSuccess(
  data: BulkCreateSuccessData | BulkCreateErrorData
): data is BulkCreateSuccessData {
  return "created_count" in data
}

// Format price for display
function formatPrice(value: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: "currency",
    currency: CURRENCY_CONFIG.code,
  }).format(value / CURRENCY_CONFIG.subunits)
}

export function GemstonePricingUploadResults({
  result,
  type,
}: GemstonePricingUploadResultsProps) {
  const [isCreatedOpen, setIsCreatedOpen] = useState(true)
  const [isFailedOpen, setIsFailedOpen] = useState(true)
  const [isWarningsOpen, setIsWarningsOpen] = useState(false)

  if (type === "create") {
    const createResult = result as BulkCreateResponse

    // Success case
    if (createResult.success && isBulkCreateSuccess(createResult.data)) {
      const data = createResult.data
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">{result.message}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {data.created_count}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Entries Created
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Collapsible open={isCreatedOpen} onOpenChange={setIsCreatedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>Created Entries ({data.created_count})</span>
                {isCreatedOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border rounded-md mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Shape</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-right">From</TableHead>
                      <TableHead className="text-right">To</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.created.slice(0, 10).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.row}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.id.length > 15
                            ? `${item.id.substring(0, 15)}...`
                            : item.id}
                        </TableCell>
                        <TableCell>{item.gemstone_type}</TableCell>
                        <TableCell>{item.shape}</TableCell>
                        <TableCell>{item.quality}</TableCell>
                        <TableCell>{item.color}</TableCell>
                        <TableCell className="text-right">{item.from}</TableCell>
                        <TableCell className="text-right">{item.to}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {data.created.length > 10 && (
                  <div className="p-2 text-center text-sm text-muted-foreground border-t">
                    Showing 10 of {data.created.length} entries
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )
    }

    // Error case for create
    const errorData = createResult.data as BulkCreateErrorData
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">{createResult.message}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{errorData.total_rows}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">
                  {errorData.error_count}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Shape</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorData.errors.map((item, idx) => (
                <TableRow key={idx} className="bg-destructive/5">
                  <TableCell>{item.row}</TableCell>
                  <TableCell>{item.data?.gemstone_type || "-"}</TableCell>
                  <TableCell>{item.data?.shape || "-"}</TableCell>
                  <TableCell>{item.data?.quality || "-"}</TableCell>
                  <TableCell>{item.data?.color || "-"}</TableCell>
                  <TableCell>{item.data?.from ?? "-"}</TableCell>
                  <TableCell>{item.data?.to ?? "-"}</TableCell>
                  <TableCell>
                    {item.data?.price !== undefined
                      ? formatPrice(item.data.price)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-destructive">{item.error}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // Update result
  const updateResult = result as BulkUpdateResponse
  const { summary, failed, warnings } = updateResult.data

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {summary.failed === 0 ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-600">{updateResult.message}</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-600">{updateResult.message}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {summary.updated}
              </div>
              <div className="text-sm text-muted-foreground">Updated</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive">
                {summary.failed}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {failed.length > 0 && (
        <Collapsible open={isFailedOpen} onOpenChange={setIsFailedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-destructive">
              <span>Failed Rows ({failed.length})</span>
              {isFailedOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border border-destructive/20 rounded-md mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Shape</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failed.map((item, idx) => (
                    <TableRow key={idx} className="bg-destructive/5">
                      <TableCell>{item.row}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.data?.id
                          ? item.data.id.length > 15
                            ? `${item.data.id.substring(0, 15)}...`
                            : item.data.id
                          : "-"}
                      </TableCell>
                      <TableCell>{item.data?.gemstone_type || "-"}</TableCell>
                      <TableCell>{item.data?.shape || "-"}</TableCell>
                      <TableCell>{item.data?.quality || "-"}</TableCell>
                      <TableCell>{item.data?.color || "-"}</TableCell>
                      <TableCell>
                        {item.data?.price !== undefined
                          ? formatPrice(item.data.price)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-destructive">{item.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {warnings.length > 0 && (
        <Collapsible open={isWarningsOpen} onOpenChange={setIsWarningsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-yellow-600">
              <span>Warnings ({warnings.length})</span>
              {isWarningsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border border-yellow-200 rounded-md mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Shape</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Warning</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warnings.map((item, idx) => (
                    <TableRow key={idx} className="bg-yellow-50">
                      <TableCell>{item.row}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.data?.id
                          ? item.data.id.length > 15
                            ? `${item.data.id.substring(0, 15)}...`
                            : item.data.id
                          : "-"}
                      </TableCell>
                      <TableCell>{item.data?.gemstone_type || "-"}</TableCell>
                      <TableCell>{item.data?.shape || "-"}</TableCell>
                      <TableCell>{item.data?.quality || "-"}</TableCell>
                      <TableCell>{item.data?.color || "-"}</TableCell>
                      <TableCell className="text-yellow-600">{item.warning}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
