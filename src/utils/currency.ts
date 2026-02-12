import { CURRENCY_CONFIG } from '@/configs/currency'

/**
 * Convert smallest unit to display amount
 * Example: 650050 → 6500.50
 */
export function fromSmallestUnit(amount: number): number {
  return amount / CURRENCY_CONFIG.subunits
}

/**
 * Convert display amount to smallest unit (for API requests)
 * Example: 6500.50 → 650050
 */
export function toSmallestUnit(amount: number): number {
  return Math.round(amount * CURRENCY_CONFIG.subunits)
}

/**
 * Format price from smallest unit to display string with currency symbol
 * Example: 650050 → "₹6,500.50"
 */
export function formatCurrency(amountInSmallestUnit: number): string {
  const amount = fromSmallestUnit(amountInSmallestUnit)
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format price from smallest unit without currency symbol
 * Example: 650050 → "6,500.50"
 */
export function formatNumber(amountInSmallestUnit: number): string {
  const amount = fromSmallestUnit(amountInSmallestUnit)
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
