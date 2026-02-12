// Common CSV utilities shared across modules

// File constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_EXTENSIONS: ['.csv'],
} as const

// Validate file before parsing
export function validateCSVFile(file: File): { isValid: boolean; error: string | null } {
  // Check file extension
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return {
      isValid: false,
      error: 'Only CSV files (.csv) are allowed',
    }
  }

  // Check file size
  if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size exceeds 5MB limit',
    }
  }

  return { isValid: true, error: null }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Export diamond pricing validation (explicit exports to avoid naming conflicts)
export {
  DIAMOND_CREATE_HEADERS,
  DIAMOND_UPDATE_HEADERS,
  parseDiamondPricingCSV,
  type DiamondCreateHeaders,
  type DiamondUpdateHeaders,
  type ParsedRow,
  type ParsedCSV,
} from './diamond-pricing-csv-validation'

// Export gemstone pricing validation (explicit exports, excluding duplicated types)
export {
  GEMSTONE_CREATE_HEADERS,
  GEMSTONE_UPDATE_HEADERS,
  parseGemstonePricingCSV,
  type GemstoneCreateHeaders,
  type GemstoneUpdateHeaders,
} from './gemstone-pricing-csv-validation'
