"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Upload, X, FileText, Loader2, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import {
  bulkCreatePrices,
  bulkUpdatePrices,
  fetchDiamondPrices,
  clearBulkResult,
  downloadTemplate,
} from "@/redux/slices/diamondPricingSlice"
import { toast } from "sonner"
import {
  validateCSVFile,
  formatFileSize,
  parseDiamondPricingCSV,
  ParsedCSV,
  DIAMOND_CREATE_HEADERS,
  DIAMOND_UPDATE_HEADERS,
} from "@/utils/csv-validation"
import { DiamondPricingCSVPreviewTable } from "./diamond-pricing-csv-preview-table"
import { DiamondPricingUploadResults } from "./diamond-pricing-upload-results"

interface DiamondPricingUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "create" | "update"
}

type DialogStep = "upload" | "preview" | "processing" | "results"

export function DiamondPricingUploadDialog({
  open,
  onOpenChange,
  type,
}: DiamondPricingUploadDialogProps) {
  const dispatch = useAppDispatch()
  const { bulk, filters } = useAppSelector((state) => state.diamondPricing)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<DialogStep>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep("upload")
      setFile(null)
      setParsedData(null)
      setFileError(null)
      dispatch(clearBulkResult())
    }
  }, [open, dispatch])

  // When bulk result is received, show results
  useEffect(() => {
    if (bulk.uploadResult && step === "processing") {
      setStep("results")
    }
  }, [bulk.uploadResult, step])

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      // Validate file
      const validation = validateCSVFile(selectedFile)
      if (!validation.isValid) {
        setFileError(validation.error)
        return
      }

      setFile(selectedFile)
      setFileError(null)

      // Parse CSV
      try {
        const parsed = await parseDiamondPricingCSV(selectedFile, type)
        setParsedData(parsed)
        setStep("preview")
      } catch (error) {
        setFileError("Failed to parse CSV file. Please check the file format.")
      }
    },
    [type]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        handleFileSelect(selectedFile)
      }
    },
    [handleFileSelect]
  )

  const handleRemoveFile = () => {
    setFile(null)
    setParsedData(null)
    setFileError(null)
    setStep("upload")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setStep("processing")

    try {
      if (type === "create") {
        await dispatch(bulkCreatePrices(file)).unwrap()
      } else {
        await dispatch(bulkUpdatePrices(file)).unwrap()
      }
      // Refresh the list
      dispatch(fetchDiamondPrices(filters))
    } catch (error: any) {
      toast.error(error || 'Failed to process file')
      setStep("upload")
    }
  }

  const handleTryAgain = () => {
    setStep("upload")
    setFile(null)
    setParsedData(null)
    setFileError(null)
    dispatch(clearBulkResult())
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleDownloadTemplate = async () => {
    try {
      await dispatch(downloadTemplate()).unwrap()
      toast.success("Template downloaded successfully")
    } catch (error) {
      toast.error("Failed to download template")
    }
  }

  const title =
    type === "create" ? "Bulk Create Diamond Prices" : "Bulk Update Diamond Prices"

  const expectedHeaders =
    type === "create" ? DIAMOND_CREATE_HEADERS : DIAMOND_UPDATE_HEADERS

  // Determine if we can upload
  const canUpload =
    parsedData &&
    !parsedData.headerError &&
    (type === "create" ? parsedData.isValid : true) // For update, we allow partial success

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[90vw] !max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "results"
              ? `${type === "create" ? "Bulk Create" : "Bulk Update"} - Results`
              : step === "preview"
              ? `${title} - Preview`
              : title}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {type === "create"
                ? "Upload a CSV file to create new diamond price entries."
                : "Upload a CSV file to update existing diamond price entries."}
            </p>

            {type === "create" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                    <li>Use slugs from Reference Data (not display names)</li>
                    <li>All rows must be valid - file is rejected if any error</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {type === "update" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                    <li>Export current prices first to get the correct IDs</li>
                    <li>Only the price field will be updated</li>
                    <li>Rows with errors will be skipped</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drag and drop your CSV file here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supported: .csv (max 5MB)
              </p>
            </div>

            {fileError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && parsedData && (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file && formatFileSize(file.size)} • {parsedData.totalRows} rows
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                <X className="h-4 w-4" />
                Remove File
              </Button>
            </div>

            {/* Header error */}
            {parsedData.headerError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Invalid CSV Headers</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{parsedData.headerError}</p>
                  <div className="text-sm">
                    <p className="font-medium">
                      Expected: {expectedHeaders.join(", ")}
                    </p>
                    <p className="font-medium">
                      Found: {parsedData.headers.join(", ")}
                    </p>
                  </div>
                  <p className="text-sm">
                    Please use the template file with correct headers.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview table */}
            {!parsedData.headerError && parsedData.rows.length > 0 && (
              <>
                <DiamondPricingCSVPreviewTable
                  rows={parsedData.rows}
                  type={type}
                />

                {/* Validation summary */}
                {parsedData.invalidRows > 0 && (
                  <Alert variant={type === "create" ? "destructive" : "default"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {type === "create" ? (
                        <>
                          {parsedData.invalidRows} validation error
                          {parsedData.invalidRows > 1 ? "s" : ""} found. Fix
                          errors before uploading.
                        </>
                      ) : (
                        <>
                          {parsedData.invalidRows} row
                          {parsedData.invalidRows > 1 ? "s" : ""} have
                          validation errors. These will be skipped during
                          update.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Processing */}
        {step === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Processing...</p>
            <p className="text-sm text-muted-foreground mt-1">
              {type === "create"
                ? "Validating and creating entries"
                : "Updating price entries"}
            </p>
          </div>
        )}

        {/* Step 4: Results */}
        {step === "results" && bulk.uploadResult && (
          <DiamondPricingUploadResults result={bulk.uploadResult} type={type} />
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {parsedData?.headerError && type === "create" && (
                <Button onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              )}
              {!parsedData?.headerError && (
                <Button
                  onClick={handleUpload}
                  disabled={!canUpload || bulk.isUploading}
                >
                  {bulk.isUploading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {type === "create" ? "Upload & Create" : "Upload & Update"}
                </Button>
              )}
            </>
          )}

          {step === "results" && (
            <>
              {bulk.uploadResult &&
                !bulk.uploadResult.success &&
                type === "create" && (
                  <Button variant="outline" onClick={handleTryAgain}>
                    Try Again
                  </Button>
                )}
              <Button onClick={handleClose}>Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
