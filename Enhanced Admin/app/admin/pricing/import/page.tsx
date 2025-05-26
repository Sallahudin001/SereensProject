"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileUp,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Save,
  X,
} from "lucide-react"
import Link from "next/link"

// Mock data for spreadsheet preview
const mockSpreadsheetData = {
  roofing: [
    { id: 1, name: "Asphalt Shingles", unit: "sq ft", basePrice: 7.5, minPrice: 6.0, maxPrice: 9.0 },
    { id: 2, name: "Metal Roofing", unit: "sq ft", basePrice: 12.0, minPrice: 10.0, maxPrice: 15.0 },
    { id: 3, name: "Tile Roofing", unit: "sq ft", basePrice: 15.5, minPrice: 13.0, maxPrice: 18.0 },
    { id: 4, name: "Flat Roof", unit: "sq ft", basePrice: 8.0, minPrice: 6.5, maxPrice: 10.0 },
  ],
  hvac: [
    { id: 1, name: "AC Installation", unit: "unit", basePrice: 3500, minPrice: 3000, maxPrice: 4500 },
    { id: 2, name: "Furnace Installation", unit: "unit", basePrice: 2800, minPrice: 2400, maxPrice: 3500 },
    { id: 3, name: "Ductwork", unit: "linear ft", basePrice: 35, minPrice: 30, maxPrice: 45 },
    { id: 4, name: "Heat Pump", unit: "unit", basePrice: 4200, minPrice: 3800, maxPrice: 5000 },
  ],
  windows: [
    { id: 1, name: "Vinyl Windows", unit: "window", basePrice: 650, minPrice: 550, maxPrice: 800 },
    { id: 2, name: "Wood Windows", unit: "window", basePrice: 950, minPrice: 850, maxPrice: 1200 },
    { id: 3, name: "Fiberglass Windows", unit: "window", basePrice: 850, minPrice: 750, maxPrice: 1000 },
    { id: 4, name: "Window Installation", unit: "window", basePrice: 250, minPrice: 200, maxPrice: 350 },
  ],
}

export default function PricingImportPage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedCategory, setSelectedCategory] = useState("roofing")
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState([])
  const [validationErrors, setValidationErrors] = useState([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setFileName(e.target.files[0].name)
    }
  }

  const handleUpload = () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setIsProcessing(true)

          // Simulate processing
          setTimeout(() => {
            setIsProcessing(false)
            setShowPreview(true)
            setPreviewData(mockSpreadsheetData[selectedCategory])

            // Simulate some validation errors
            if (selectedCategory === "roofing") {
              setValidationErrors([
                { row: 3, column: "basePrice", message: "Price exceeds maximum allowed value" },
                { row: 4, column: "minPrice", message: "Minimum price cannot be less than cost" },
              ])
            } else {
              setValidationErrors([])
            }
          }, 1500)

          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const handleImport = () => {
    // Simulate import process
    setIsProcessing(true)

    setTimeout(() => {
      setIsProcessing(false)
      setShowSuccessDialog(true)
    }, 1500)
  }

  const handleDownloadTemplate = () => {
    // In a real app, this would trigger a file download
    console.log("Downloading template for", selectedCategory)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/pricing">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Import Pricing Data</h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-10">Import pricing data from Excel or CSV files.</p>
        </div>
      </div>

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="preview" disabled={!showPreview}>
            Preview & Validate
          </TabsTrigger>
          <TabsTrigger value="import" disabled={!showPreview}>
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Pricing Spreadsheet</CardTitle>
              <CardDescription>Upload an Excel or CSV file with your pricing data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Product Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="roofing">Roofing</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="windows">Windows & Doors</SelectItem>
                        <SelectItem value="garage">Garage Doors</SelectItem>
                        <SelectItem value="paint">Paint</SelectItem>
                        <SelectItem value="solar">Solar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>File Upload</Label>
                    <div
                      className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => document.getElementById("pricing-file").click()}
                    >
                      <FileUp className="h-10 w-10 text-muted-foreground/50 mb-2" />
                      <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">Excel or CSV (Max 10MB)</p>
                      {fileName && (
                        <div className="mt-4 flex items-center gap-2 bg-muted p-2 rounded-md w-full">
                          <FileSpreadsheet className="h-4 w-4 text-primary" />
                          <span className="text-sm truncate">{fileName}</span>
                        </div>
                      )}
                      <Input
                        id="pricing-file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300 ease-in-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing file...</span>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button onClick={handleUpload} disabled={!file || isUploading || isProcessing} className="flex-1">
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? "Uploading..." : "Upload File"}
                    </Button>

                    <Button variant="outline" onClick={handleDownloadTemplate} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-medium">Import Instructions</h3>
                  <div className="space-y-4 text-sm">
                    <p>To ensure a successful import, please follow these guidelines:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Select the appropriate product category.</li>
                      <li>Use our template for the correct format (download button on the left).</li>
                      <li>Ensure all required columns are present: Name, Unit, Base Price, Min Price, Max Price.</li>
                      <li>Prices should be entered as numbers without currency symbols.</li>
                      <li>Each row should represent a single product or service.</li>
                    </ol>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 mt-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            Importing will replace all existing pricing data for the selected category. Make sure your
                            spreadsheet contains all products you want to keep.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview & Validate</CardTitle>
              <CardDescription>Review the data before importing. Fix any validation errors.</CardDescription>
            </CardHeader>
            <CardContent>
              {validationErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Validation Errors</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        Please fix the following errors before importing:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400">
                        {validationErrors.map((error, index) => (
                          <li key={index}>
                            Row {error.row}: {error.message} (Column: {error.column})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Min Price</TableHead>
                      <TableHead>Max Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Pricing Data</CardTitle>
              <CardDescription>Confirm and import the validated pricing data.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Ready to import the data?</p>
              <Button onClick={handleImport} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Import Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showSuccessDialog} onOpenChange={() => setShowSuccessDialog(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Successful</DialogTitle>
            <DialogDescription>Pricing data has been successfully imported.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <p className="text-lg font-semibold">Success!</p>
          </div>
          <DialogFooter>
            <Button asChild>
              <Link href="/admin/pricing">
                <X className="mr-2 h-4 w-4" />
                Close
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
