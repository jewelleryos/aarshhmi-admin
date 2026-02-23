import type { DependencyGroup } from "@/components/ui/delete-dependency-dialog"

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
  size_chart_value: "Size Chart Values",
}

function formatType(type: string): string {
  return DEPENDENCY_LABELS[type] || type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function escapeCSV(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function exportAllDependenciesCSV(entityName: string, groups: DependencyGroup[]) {
  const lines: string[] = []

  groups.forEach((group, groupIndex) => {
    const hasSku = group.items.some((item) => item.sku)

    // Group header
    lines.push(formatType(group.type))

    // Column headers
    const headers = hasSku ? ["#", "Name", "SKU"] : ["#", "Name"]
    lines.push(headers.join(","))

    // Data rows
    group.items.forEach((item, index) => {
      const row = hasSku
        ? [String(index + 1), escapeCSV(item.name), escapeCSV(item.sku || "-")]
        : [String(index + 1), escapeCSV(item.name)]
      lines.push(row.join(","))
    })

    // 2 blank lines between groups (not after the last one)
    if (groupIndex < groups.length - 1) {
      lines.push("", "")
    }
  })

  const csvContent = lines.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${entityName.toLowerCase().replace(/\s+/g, "-")}-dependencies.csv`
  link.click()
  URL.revokeObjectURL(url)
}
