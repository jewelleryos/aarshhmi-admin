// ============================================
// Stage Labels & Styling (all 27 for display)
// ============================================

export const STAGE_LABELS: Record<number, { label: string; className: string }> = {
  1: { label: "Payment Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  2: { label: "Payment Failed", className: "bg-red-50 text-red-700 border-red-200" },
  3: { label: "Order Placed", className: "bg-green-50 text-green-700 border-green-200" },
  4: { label: "On Hold", className: "bg-amber-50 text-amber-700 border-amber-200" },
  5: { label: "Order Confirmed", className: "bg-green-50 text-green-700 border-green-200" },
  6: { label: "Order Rejected", className: "bg-red-50 text-red-700 border-red-200" },
  7: { label: "In Process", className: "bg-purple-50 text-purple-700 border-purple-200" },
  8: { label: "Weight Verification", className: "bg-purple-50 text-purple-700 border-purple-200" },
  9: { label: "Certification", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  10: { label: "Shipped", className: "bg-blue-50 text-blue-700 border-blue-200" },
  11: { label: "Delivered", className: "bg-green-50 text-green-700 border-green-200" },
  12: { label: "Cancel Requested", className: "bg-orange-50 text-orange-700 border-orange-200" },
  13: { label: "Cancel Approved", className: "bg-red-50 text-red-700 border-red-200" },
  14: { label: "Cancel Rejected", className: "bg-gray-50 text-gray-700 border-gray-200" },
  15: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" },
  16: { label: "Return Requested", className: "bg-orange-50 text-orange-700 border-orange-200" },
  17: { label: "Return Accepted", className: "bg-teal-50 text-teal-700 border-teal-200" },
  18: { label: "Return Rejected", className: "bg-gray-50 text-gray-700 border-gray-200" },
  19: { label: "Pickup Scheduled", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  20: { label: "Return In Transit", className: "bg-blue-50 text-blue-700 border-blue-200" },
  21: { label: "Return Received", className: "bg-teal-50 text-teal-700 border-teal-200" },
  22: { label: "QC Check", className: "bg-amber-50 text-amber-700 border-amber-200" },
  23: { label: "QC Accepted", className: "bg-green-50 text-green-700 border-green-200" },
  24: { label: "QC Rejected", className: "bg-red-50 text-red-700 border-red-200" },
  25: { label: "Refund Initiated", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  26: { label: "Refund Completed", className: "bg-green-50 text-green-700 border-green-200" },
  27: { label: "Partially Refunded", className: "bg-amber-50 text-amber-700 border-amber-200" },
  28: { label: "Refund Failed", className: "bg-red-50 text-red-700 border-red-200" },
  29: { label: "Manual Refund Done", className: "bg-green-50 text-green-700 border-green-200" },
}

export const PAYMENT_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  captured: { label: "Captured", className: "bg-green-50 text-green-700 border-green-200" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
}

// ============================================
// Valid Stage Transitions (only active stages)
// More stages will be added incrementally
// ============================================

export const VALID_STAGE_TRANSITIONS: Record<number, number[]> = {
  4: [5, 6],      // On Hold → Order Confirmed or Order Rejected
  5: [7],         // Order Confirmed → In Process (admin manual)
  7: [10],        // In Process → Shipped (with weight verification)
  10: [11],       // Shipped → Delivered
  12: [13, 14],   // Cancel Requested → Cancel Approved or Cancel Rejected
  16: [17, 18],   // Return Requested → Return Accepted or Return Rejected
  17: [19],       // Return Accepted → Pickup Scheduled
  19: [20],       // Pickup Scheduled → Return In Transit
  20: [21],       // Return In Transit → Return Received
  21: [22],       // Return Received → QC Check
  22: [23, 24],   // QC Check → QC Accepted or QC Rejected
  28: [25, 29],   // Refund Failed → Retry refund or Manual Refund Done
}

// ============================================
// Stage transition input requirements
// "none" = no extra input, "note" = optional note, "reason" = required reason
// ============================================

export const STAGE_TRANSITION_INPUTS: Record<string, "none" | "note" | "reason" | "refund_id" | "shipping" | "qc_accepted"> = {
  "4-5": "note",      // Confirm from hold — optional note
  "4-6": "reason",    // Reject from hold — reason required
  "5-7": "none",      // Move to In Process — no input needed
  "7-10": "shipping", // Ship order — weight verification + tracking
  "10-11": "note",    // Delivered — optional note
  "12-13": "note",    // Approve cancellation — optional note
  "12-14": "reason",  // Reject cancellation — reason required
  "16-17": "note",    // Accept return — optional note
  "16-18": "reason",  // Reject return — reason required
  "17-19": "note",    // Pickup scheduled — optional note
  "19-20": "note",    // Return in transit — optional note
  "20-21": "note",    // Return received — optional note
  "21-22": "note",    // QC check — optional note
  "22-23": "qc_accepted",  // QC accepted — refund amount
  "22-24": "reason",  // QC rejected — reason required
  "28-25": "none",    // Retry refund — no input needed
  "28-29": "refund_id",  // Manual refund — refund ID required
}

// ============================================
// Helpers
// ============================================

export function getStageLabel(stage: number): string {
  return STAGE_LABELS[stage]?.label || `Stage ${stage}`
}

export function getStageClassName(stage: number): string {
  return STAGE_LABELS[stage]?.className || "bg-gray-50 text-gray-500 border-gray-200"
}

export function getValidNextStages(currentStage: number): number[] {
  return VALID_STAGE_TRANSITIONS[currentStage] || []
}

export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
