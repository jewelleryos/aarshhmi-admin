/**
 * Pricing Rule Calculator
 * Calculates new selling prices by applying markups to COST PRICE components
 *
 * IMPORTANT: When previewing a new rule, we calculate the ADDITIONAL markup
 * that the new rule would add to the current selling price.
 * This is because the current selling price already includes markups from
 * existing rules, and new rules are ADDITIVE (not replacing).
 */

import { CURRENCY_CONFIG } from '@/configs/currency'

// Cost price components from variant price_components
export interface CostPriceComponents {
  metalPrice: number      // In paise
  makingCharge: number    // In paise
  diamondPrice: number    // In paise
  gemstonePrice: number   // In paise
  pearlPrice: number      // In paise
}

// Pricing rule actions (markup percentages)
export interface PricingRuleMarkups {
  diamondMarkup: number
  makingChargeMarkup: number
  gemstoneMarkup: number
  pearlMarkup: number
}

/**
 * Calculate new selling price by adding the new rule's markup to current selling price
 *
 * IMPORTANT: The new rule's markup is calculated on COST PRICE, then ADDED to
 * the current selling price. This correctly shows what the price will be when
 * the new rule is saved (since rules are additive in the backend).
 *
 * Formula: New Price = Current Selling Price + (Cost × New Markup %)
 *
 * @param currentSellingPrice - The current selling price (variant.price) which already includes existing rules
 * @param costComponents - The COST price breakdown from variant.price_components.costPrice
 * @param markups - Markup percentages from the NEW pricing rule
 * @returns New selling price in paise
 */
export function calculateNewSellingPrice(
  currentSellingPrice: number,
  costComponents: CostPriceComponents,
  markups: PricingRuleMarkups
): number {
  // Step 1: Calculate ONLY the additional markup from the new rule
  // These are calculated on COST PRICE (not current selling price)
  // Metal has no markup in current rule structure

  const additionalMakingChargeMarkup = Math.round(
    costComponents.makingCharge * (markups.makingChargeMarkup / 100)
  )

  const additionalDiamondMarkup = Math.round(
    costComponents.diamondPrice * (markups.diamondMarkup / 100)
  )

  const additionalGemstoneMarkup = Math.round(
    costComponents.gemstonePrice * (markups.gemstoneMarkup / 100)
  )

  const additionalPearlMarkup = Math.round(
    costComponents.pearlPrice * (markups.pearlMarkup / 100)
  )

  // Step 2: Sum all additional markups (before tax)
  const totalAdditionalMarkup = additionalMakingChargeMarkup +
                                 additionalDiamondMarkup +
                                 additionalGemstoneMarkup +
                                 additionalPearlMarkup

  // Step 3: Add tax to the additional markup if configured
  const additionalMarkupWithTax = CURRENCY_CONFIG.includeTax
    ? Math.round(totalAdditionalMarkup * (1 + CURRENCY_CONFIG.taxRatePercent / 100))
    : totalAdditionalMarkup

  // Step 4: New selling price = current selling price + additional markup with tax
  return currentSellingPrice + additionalMarkupWithTax
}

/**
 * Calculate detailed breakdown of the ADDITIONAL markup from a new rule
 * Shows how much each component will increase by
 */
export function calculateAdditionalMarkupBreakdown(
  costComponents: CostPriceComponents,
  markups: PricingRuleMarkups
): {
  makingChargeMarkup: number
  diamondMarkup: number
  gemstoneMarkup: number
  pearlMarkup: number
  subtotal: number
  taxAmount: number
  total: number
} {
  // Calculate additional markup amounts (on cost price)
  const makingChargeMarkup = Math.round(costComponents.makingCharge * (markups.makingChargeMarkup / 100))
  const diamondMarkup = Math.round(costComponents.diamondPrice * (markups.diamondMarkup / 100))
  const gemstoneMarkup = Math.round(costComponents.gemstonePrice * (markups.gemstoneMarkup / 100))
  const pearlMarkup = Math.round(costComponents.pearlPrice * (markups.pearlMarkup / 100))

  const subtotal = makingChargeMarkup + diamondMarkup + gemstoneMarkup + pearlMarkup
  const taxAmount = CURRENCY_CONFIG.includeTax
    ? Math.round(subtotal * (CURRENCY_CONFIG.taxRatePercent / 100))
    : 0
  const total = subtotal + taxAmount

  return {
    makingChargeMarkup,
    diamondMarkup,
    gemstoneMarkup,
    pearlMarkup,
    subtotal,
    taxAmount,
    total
  }
}

/**
 * Extract cost price components from variant price_components
 * Handles the nested structure from the API
 */
export function extractCostComponents(priceComponents: Record<string, unknown>): CostPriceComponents | null {
  try {
    const costPrice = priceComponents?.costPrice as Record<string, unknown> | undefined
    if (!costPrice) return null

    return {
      metalPrice: (costPrice.metalPrice as number) || 0,
      makingCharge: (costPrice.makingCharge as number) || 0,
      diamondPrice: (costPrice.diamondPrice as number) || 0,
      gemstonePrice: (costPrice.gemstonePrice as number) || 0,
      pearlPrice: (costPrice.pearlPrice as number) || 0,
    }
  } catch {
    return null
  }
}
