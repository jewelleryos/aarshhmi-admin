import { combineReducers } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import appSlice from './slices/appSlice'
import metalTypeSlice from './slices/metalTypeSlice'
import metalColorSlice from './slices/metalColorSlice'
import metalPuritySlice from './slices/metalPuritySlice'
import stoneShapeSlice from './slices/stoneShapeSlice'
import gemstoneTypeSlice from './slices/gemstoneTypeSlice'
import gemstoneQualitySlice from './slices/gemstoneQualitySlice'
import gemstoneColorSlice from './slices/gemstoneColorSlice'
import diamondClarityColorSlice from './slices/diamondClarityColorSlice'
import diamondPricingSlice from './slices/diamondPricingSlice'
import gemstonePricingSlice from './slices/gemstonePricingSlice'
import makingChargeSlice from './slices/makingChargeSlice'
import otherChargeSlice from './slices/otherChargeSlice'
import pearlTypeSlice from './slices/pearlTypeSlice'
import pearlQualitySlice from './slices/pearlQualitySlice'
import mrpMarkupSlice from './slices/mrpMarkupSlice'
import tagGroupSlice from './slices/tagGroupSlice'
import tagSlice from './slices/tagSlice'
import categorySlice from './slices/categorySlice'
import badgeSlice from './slices/badgeSlice'
import sizeChartGroupSlice from './slices/sizeChartGroupSlice'
import sizeChartValueSlice from './slices/sizeChartValueSlice'
import productSlice from './slices/productSlice'
import pricingRuleSlice from './slices/pricingRuleSlice'

const rootReducer = combineReducers({
  auth: authSlice,
  app: appSlice,
  metalType: metalTypeSlice,
  metalColor: metalColorSlice,
  metalPurity: metalPuritySlice,
  stoneShape: stoneShapeSlice,
  gemstoneType: gemstoneTypeSlice,
  gemstoneQuality: gemstoneQualitySlice,
  gemstoneColor: gemstoneColorSlice,
  diamondClarityColor: diamondClarityColorSlice,
  diamondPricing: diamondPricingSlice,
  gemstonePricing: gemstonePricingSlice,
  makingCharge: makingChargeSlice,
  otherCharge: otherChargeSlice,
  pearlType: pearlTypeSlice,
  pearlQuality: pearlQualitySlice,
  mrpMarkup: mrpMarkupSlice,
  tagGroup: tagGroupSlice,
  tag: tagSlice,
  category: categorySlice,
  badge: badgeSlice,
  sizeChartGroup: sizeChartGroupSlice,
  sizeChartValue: sizeChartValueSlice,
  product: productSlice,
  pricingRule: pricingRuleSlice,
})

export default rootReducer
