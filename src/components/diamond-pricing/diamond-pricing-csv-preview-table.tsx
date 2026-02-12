"use client"

import { useState, Fragment } from "react"
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ParsedRow } from "@/utils/csv-validation"
import { CURRENCY_CONFIG } from "@/configs/currency"

interface DiamondPricingCSVPreviewTableProps {
  rows: ParsedRow[]
  type: "create" | "update"
  rowsPerPage?: number
}

export function DiamondPricingCSVPreviewTable({
  rows,
  type,
  rowsPerPage = 10,
}: DiamondPricingCSVPreviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(rows.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentRows = rows.slice(startIndex, endIndex)

  // Format price for display
  const formatPrice = (value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return value
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
      style: "currency",
      currency: CURRENCY_CONFIG.code,
    }).format(numValue)
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Row</TableHead>
              <TableHead className="w-[60px]">Status</TableHead>
              {type === "update" && <TableHead>ID</TableHead>}
              <TableHead>Shape</TableHead>
              <TableHead>Clarity/Color</TableHead>
              <TableHead className="text-right">From</TableHead>
              <TableHead className="text-right">To</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map((row) => (
              <Fragment key={row.rowNumber}>
                <TableRow
                  className={cn(!row.isValid && "bg-destructive/5")}
                >
                  <TableCell className="font-mono text-sm">
                    {row.rowNumber}
                  </TableCell>
                  <TableCell>
                    {row.isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </TableCell>
                  {type === "update" && (
                    <TableCell className="font-mono text-xs">
                      {row.data["id"] ? (
                        row.data["id"].length > 15
                          ? `${row.data["id"].substring(0, 15)}...`
                          : row.data["id"]
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>{row.data["shape"] || "-"}</TableCell>
                  <TableCell>{row.data["clarity/color"] || "-"}</TableCell>
                  <TableCell className="text-right">
                    {row.data["from"] || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.data["to"] || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.data["price"] ? formatPrice(row.data["price"]) : "-"}
                  </TableCell>
                </TableRow>
                {!row.isValid && row.errors.length > 0 && (
                  <TableRow className="bg-destructive/5 hover:bg-destructive/5">
                    <TableCell colSpan={type === "update" ? 8 : 7} className="py-2">
                      <div className="flex flex-col gap-1 pl-8">
                        {row.errors.map((error, idx) => (
                          <span
                            key={idx}
                            className="text-xs text-destructive flex items-center gap-1"
                          >
                            <span className="text-destructive">!</span> {error}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, rows.length)} of{" "}
            {rows.length} rows
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
