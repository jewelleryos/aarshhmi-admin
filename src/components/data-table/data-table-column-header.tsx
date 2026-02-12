"use client"

import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  sortable?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  sortable = false,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!sortable) {
    return <div className={cn(className)}>{title}</div>
  }

  const handleSort = () => {
    const currentSort = column.getIsSorted()
    if (currentSort === false) {
      // No sort -> Ascending
      column.toggleSorting(false)
    } else if (currentSort === "asc") {
      // Ascending -> Descending
      column.toggleSorting(true)
    } else {
      // Descending -> Clear sort
      column.clearSorting()
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSort}
      className={cn("-ml-3 h-8", className)}
    >
      <span>{title}</span>
      {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
      {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
      {column.getIsSorted() === false && (
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  )
}
