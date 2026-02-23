"use client"

import { useState, useEffect, Fragment } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, CheckCircle2, AlertTriangle, Download, Eye, ChevronUp } from "lucide-react"
import { exportAllDependenciesCSV } from "@/utils/export-dependency-csv"

// Types matching backend response
export interface DependencyItem {
  id: string
  name: string
  sku?: string
}

export interface DependencyGroup {
  type: string
  count: number
  items: DependencyItem[]
}

export interface DependencyCheckResult {
  can_delete: boolean
  dependencies: DependencyGroup[]
}

interface DeleteDependencyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: string
  entityName: string
  checkDependency: () => Promise<DependencyCheckResult>
  onDelete: () => Promise<void>
}

type DialogState = "loading" | "can_delete" | "has_dependencies" | "deleting" | "error"

const DEPENDENCY_LABELS: Record<string, string> = {
  product: "Products",
  metal_color: "Metal Colors",
  metal_purity: "Metal Purities",
  making_charge: "Making Charges",
  category: "Categories",
  badge: "Badges",
  diamond_clarity_color: "Diamond Clarity/Colors",
  gemstone_color: "Gemstone Colors",
  size_chart_group: "Size Chart Groups",
  tag: "Tags",
  tag_group: "Tag Groups",
  pricing_rule: "Pricing Rules",
  diamond_price: "Diamond Prices",
  gemstone_price: "Gemstone Prices",
}

function formatDependencyType(type: string): string {
  return DEPENDENCY_LABELS[type] || type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function DeleteDependencyDialog({
  open,
  onOpenChange,
  entityType,
  entityName,
  checkDependency,
  onDelete,
}: DeleteDependencyDialogProps) {
  const [state, setState] = useState<DialogState>("loading")
  const [dependencies, setDependencies] = useState<DependencyGroup[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [expandedType, setExpandedType] = useState<string | null>(null)

  // Check dependencies when dialog opens
  useEffect(() => {
    if (!open) return

    setState("loading")
    setDependencies([])
    setErrorMessage("")
    setExpandedType(null)

    let cancelled = false

    checkDependency()
      .then((result) => {
        if (cancelled) return
        setDependencies(result.dependencies)
        setState(result.can_delete ? "can_delete" : "has_dependencies")
      })
      .catch((err) => {
        if (cancelled) return
        const message =
          err?.response?.data?.message || err?.message || "Failed to check dependencies"
        setErrorMessage(message)
        setState("error")
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Handle delete
  const handleDelete = async () => {
    setState("deleting")
    try {
      await onDelete()
      onOpenChange(false)
    } catch {
      // Error is handled by the parent (toast) — keep modal open
      setState("can_delete")
    }
  }

  // Handle CSV export for all dependencies
  const handleExportAll = () => {
    exportAllDependenciesCSV(entityName, dependencies)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {entityType}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {state === "loading" && (
                <span>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">&quot;{entityName}&quot;</span>?
                </span>
              )}
              {state === "can_delete" && (
                <span>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">&quot;{entityName}&quot;</span>?
                </span>
              )}
              {state === "has_dependencies" && (
                <span>
                  <span className="font-semibold text-foreground">&quot;{entityName}&quot;</span>{" "}
                  cannot be deleted because it is in use.
                </span>
              )}
              {state === "deleting" && (
                <span>
                  Deleting{" "}
                  <span className="font-semibold text-foreground">&quot;{entityName}&quot;</span>
                  ...
                </span>
              )}
              {state === "error" && (
                <span>Something went wrong while checking dependencies.</span>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Content area */}
        <div className="py-2">
          {/* Loading state */}
          {state === "loading" && (
            <div className="flex items-center gap-3 rounded-md border border-muted bg-muted/30 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Checking for dependencies...
              </span>
            </div>
          )}

          {/* Can delete state */}
          {state === "can_delete" && (
            <div className="flex items-center gap-2 px-1 py-1">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              <span className="text-sm text-muted-foreground">
                No dependencies found. This item can be safely deleted.
              </span>
            </div>
          )}

          {/* Has dependencies state */}
          {state === "has_dependencies" && (
            <div className="space-y-2">
              {/* Export All button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleExportAll}
                >
                  <Download className="mr-1.5 h-3 w-3" />
                  Export CSV
                </Button>
              </div>
              {dependencies.map((dep) => {
                const isExpanded = expandedType === dep.type
                const hasSku = dep.items.some((item) => item.sku)

                return (
                  <Fragment key={dep.type}>
                    <div className="rounded-md border">
                      {/* Dependency row header */}
                      <div className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium">
                            {formatDependencyType(dep.type)}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                            {dep.count}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() =>
                              setExpandedType(isExpanded ? null : dep.type)
                            }
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="mr-1.5 h-3 w-3" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="mr-1.5 h-3 w-3" />
                                View
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded items list with transition */}
                      <div
                        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
                        style={{
                          gridTemplateRows: isExpanded ? "1fr" : "0fr",
                        }}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t">
                            <div className="max-h-48 overflow-y-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50 sticky top-0">
                                  <tr>
                                    <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground">
                                      #
                                    </th>
                                    <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground">
                                      Name
                                    </th>
                                    {hasSku && (
                                      <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground">
                                        SKU
                                      </th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {dep.items.map((item, index) => (
                                    <tr
                                      key={item.id}
                                      className="border-t border-muted/50"
                                    >
                                      <td className="px-3 py-1.5 text-xs text-muted-foreground">
                                        {index + 1}
                                      </td>
                                      <td className="px-3 py-1.5 text-xs">
                                        {item.name}
                                      </td>
                                      {hasSku && (
                                        <td className="px-3 py-1.5 text-xs text-muted-foreground font-mono">
                                          {item.sku || "-"}
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                )
              })}
            </div>
          )}

          {/* Deleting state */}
          {state === "deleting" && (
            <div className="flex items-center gap-3 rounded-md border border-muted bg-muted/30 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Deleting...</span>
            </div>
          )}

          {/* Error state */}
          {state === "error" && (
            <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {errorMessage}
              </span>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={state === "deleting"}
          >
            {state === "has_dependencies" ? "Close" : "Cancel"}
          </Button>
          {(state === "can_delete" || state === "deleting") && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={state === "deleting"}
            >
              {state === "deleting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
