/**
 * Currency Configuration
 * Change these values when deploying for different regions
 */
export const CURRENCY_CONFIG = {
  code: 'INR' as const,       // 'INR' | 'USD'
  locale: 'en-IN' as const,   // 'en-IN' | 'en-US'
  subunits: 100,              // 100 paise = 1 rupee, 100 cents = 1 dollar
  includeTax: true,           // Whether prices include tax
  taxRatePercent: 3,          // Tax rate percentage (e.g., 3% GST for jewelry)
}

/**
 * Calculate tax amount from a price without tax
 * @param amountWithoutTax - Amount in smallest unit (paise)
 * @returns Tax amount in smallest unit (paise)
 */
export function calculateTax(amountWithoutTax: number): number {
  return Math.round(amountWithoutTax * (CURRENCY_CONFIG.taxRatePercent / 100))
}

/**
 * Add tax to an amount
 * @param amountWithoutTax - Amount in smallest unit (paise)
 * @returns Amount with tax in smallest unit (paise)
 */
export function addTax(amountWithoutTax: number): number {
  if (!CURRENCY_CONFIG.includeTax) return amountWithoutTax
  return amountWithoutTax + calculateTax(amountWithoutTax)
}

/**
 * Remove tax from an amount (get base amount)
 * @param amountWithTax - Amount in smallest unit (paise)
 * @returns Amount without tax in smallest unit (paise)
 */
export function removeTax(amountWithTax: number): number {
  if (!CURRENCY_CONFIG.includeTax) return amountWithTax
  return Math.round(amountWithTax / (1 + CURRENCY_CONFIG.taxRatePercent / 100))
}
