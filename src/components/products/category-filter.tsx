"use client"

import * as React from "react"
import { Check, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface CategoryFilterOption {
  value: string
  label: string
}

export interface CategoryFilterProps {
  options: CategoryFilterOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CategoryFilter({
  options,
  value,
  onChange,
  placeholder = "Category...",
}: CategoryFilterProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  return (
    <Select value={value} onValueChange={onChange} open={open} onOpenChange={setOpen}>
      <SelectTrigger className="w-[200px] h-9">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="w-[200px]">
        {/* Search Input */}
        <div className="p-2 border-b">
          <div className="relative">
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 h-9"
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  setSearchTerm("")
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Options List */}
        <ScrollArea className="h-[200px]">
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No categories found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="flex items-center pr-8"
                >
                  <div className="flex items-center gap-2">
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </div>
        </ScrollArea>
      </SelectContent>
    </Select>
  )
}
