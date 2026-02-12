import * as XLSX from 'xlsx'

// Expected headers for gemstone pricing
export const GEMSTONE_CREATE_HEADERS = ['gemstone_type', 'shape', 'quality', 'color', 'from', 'to', 'price'] as const
export const GEMSTONE_UPDATE_HEADERS = ['id', 'gemstone_type', 'shape', 'quality', 'color', 'from', 'to', 'price'] as const

export type GemstoneCreateHeaders = (typeof GEMSTONE_CREATE_HEADERS)[number]
export type GemstoneUpdateHeaders = (typeof GEMSTONE_UPDATE_HEADERS)[number]

export interface ParsedRow {
  rowNumber: number
  data: Record<string, string>
  errors: string[]
  isValid: boolean
}

export interface ParsedCSV {
  headers: string[]
  rows: ParsedRow[]
  isValid: boolean
  headerError: string | null
  expectedHeaders: readonly string[]
  totalRows: number
  validRows: number
  invalidRows: number
}

// Parse CSV file for gemstone pricing
export async function parseGemstonePricingCSV(
  file: File,
  type: 'create' | 'update'
): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, {
          header: 1,
          raw: false,
        })

        const expected = type === 'create' ? GEMSTONE_CREATE_HEADERS : GEMSTONE_UPDATE_HEADERS

        if (jsonData.length === 0) {
          resolve({
            headers: [],
            rows: [],
            isValid: false,
            headerError: 'File is empty',
            expectedHeaders: expected,
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
          })
          return
        }

        const headers = (jsonData[0] as string[]).map((h) =>
          String(h || '').toLowerCase().trim()
        )
        const rawRows = jsonData.slice(1) as string[][]

        // Validate headers first
        const headerValidation = validateGemstonePricingHeaders(headers, type)
        if (!headerValidation.isValid) {
          resolve({
            headers,
            rows: [],
            isValid: false,
            headerError: headerValidation.error,
            expectedHeaders: expected,
            totalRows: rawRows.length,
            validRows: 0,
            invalidRows: rawRows.length,
          })
          return
        }

        // Parse and validate rows
        const parsedRows = parseGemstonePricingRows(headers, rawRows, type)

        if (parsedRows.length === 0) {
          resolve({
            headers,
            rows: [],
            isValid: false,
            headerError: 'File contains no data rows',
            expectedHeaders: expected,
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
          })
          return
        }

        const validRows = parsedRows.filter((r) => r.isValid).length
        const invalidRows = parsedRows.filter((r) => !r.isValid).length

        resolve({
          headers,
          rows: parsedRows,
          isValid: invalidRows === 0,
          headerError: null,
          expectedHeaders: expected,
          totalRows: parsedRows.length,
          validRows,
          invalidRows,
        })
      } catch (error) {
        reject(new Error('Failed to parse CSV file'))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// Validate headers for gemstone pricing
export function validateGemstonePricingHeaders(
  headers: string[],
  type: 'create' | 'update'
): { isValid: boolean; error: string | null } {
  const expected = type === 'create' ? GEMSTONE_CREATE_HEADERS : GEMSTONE_UPDATE_HEADERS

  // Check column count
  if (headers.length !== expected.length) {
    return {
      isValid: false,
      error: `Expected ${expected.length} columns, found ${headers.length}`,
    }
  }

  // Check each header
  for (let i = 0; i < expected.length; i++) {
    if (headers[i] !== expected[i]) {
      return {
        isValid: false,
        error: `Column ${i + 1}: Expected "${expected[i]}", found "${headers[i]}"`,
      }
    }
  }

  return { isValid: true, error: null }
}

// Parse rows and validate for gemstone pricing
function parseGemstonePricingRows(
  headers: string[],
  rawRows: string[][],
  type: 'create' | 'update'
): ParsedRow[] {
  return rawRows
    .filter((row) => row.some((cell) => cell && String(cell).trim() !== '')) // Skip empty rows
    .map((row, index) => {
      // Map row data to object using headers
      const data: Record<string, string> = {}
      headers.forEach((header, i) => {
        data[header] = String(row[i] || '').trim()
      })

      // Validate row
      const errors =
        type === 'create'
          ? validateGemstonePricingCreateRow(data)
          : validateGemstonePricingUpdateRow(data)

      return {
        rowNumber: index + 2, // +2 because: 1-indexed + header row
        data,
        errors,
        isValid: errors.length === 0,
      }
    })
}

// Validate individual row for Gemstone Pricing Create
export function validateGemstonePricingCreateRow(row: Record<string, string>): string[] {
  const errors: string[] = []

  // Required fields
  if (!row['gemstone_type']?.trim()) {
    errors.push('Missing "gemstone_type" value')
  }
  if (!row['shape']?.trim()) {
    errors.push('Missing "shape" value')
  }
  if (!row['quality']?.trim()) {
    errors.push('Missing "quality" value')
  }
  if (!row['color']?.trim()) {
    errors.push('Missing "color" value')
  }
  if (!row['from']?.trim()) {
    errors.push('Missing "from" value')
  }
  if (!row['to']?.trim()) {
    errors.push('Missing "to" value')
  }
  if (!row['price']?.trim()) {
    errors.push('Missing "price" value')
  }

  // Numeric validation
  const from = parseFloat(row['from'])
  const to = parseFloat(row['to'])
  const price = parseFloat(row['price'])

  if (row['from']?.trim() && isNaN(from)) {
    errors.push('"from" must be a number')
  }
  if (row['to']?.trim() && isNaN(to)) {
    errors.push('"to" must be a number')
  }
  if (row['price']?.trim() && isNaN(price)) {
    errors.push('"price" must be a number')
  }

  // Range validation
  if (!isNaN(from) && from < 0) {
    errors.push('"from" cannot be negative')
  }
  if (!isNaN(to) && to <= 0) {
    errors.push('"to" must be greater than 0')
  }
  if (!isNaN(from) && !isNaN(to) && from >= to) {
    errors.push('"from" must be less than "to"')
  }
  if (!isNaN(price) && price < 0) {
    errors.push('"price" cannot be negative')
  }

  return errors
}

// Validate individual row for Gemstone Pricing Update
export function validateGemstonePricingUpdateRow(row: Record<string, string>): string[] {
  const errors: string[] = []

  // ID is required for update
  if (!row['id']?.trim()) {
    errors.push('Missing "id" - cannot update without ID')
  }

  // Price is required
  if (!row['price']?.trim()) {
    errors.push('Missing "price" value')
  }

  // Numeric validation for price
  const price = parseFloat(row['price'])
  if (row['price']?.trim() && isNaN(price)) {
    errors.push('"price" must be a number')
  }
  if (!isNaN(price) && price < 0) {
    errors.push('"price" cannot be negative')
  }

  return errors
}
