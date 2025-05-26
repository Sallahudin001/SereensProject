"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

// At the top of the file, add the type declaration
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: object) => void;
  }
}

// Define types for data
type ProductData = {
  id: number;
  name: string;
  unit: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
}

type ValidationError = {
  row: number;
  column: string;
  message: string;
}

type CategoryType = "roofing" | "hvac" | "windows" | "garage" | "paint" | "solar";

// Mock data for spreadsheet preview
const mockSpreadsheetData: Record<CategoryType, ProductData[]> = {
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
  garage: [],
  paint: [],
  solar: []
}

export default function PricingImportPage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("roofing")
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<ProductData[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [importResults, setImportResults] = useState<any[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setFileName(e.target.files[0].name)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setValidationErrors([])

    // Create form data for file upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', selectedCategory)

    try {
      // Simulate upload progress (it will be fast in production)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // Send the file to the API
      const response = await fetch('/api/pricing/import', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
          setIsUploading(false)
          setIsProcessing(true)

      const data = await response.json()

      if (!response.ok) {
            setIsProcessing(false)

        // Handle validation errors
        if (data.validationErrors && data.validationErrors.length > 0) {
          const errors: ValidationError[] = []
          data.validationErrors.forEach((item: any) => {
            item.errors.forEach((error: any) => {
              errors.push(error)
            })
          })
          setValidationErrors(errors)
            setShowPreview(true)
          
          // Set preview data from the file for validation view
          const fileReader = new FileReader()
          fileReader.onload = (e) => {
            if (e.target?.result) {
              const csvData = e.target.result as string
              const rows = csvData.split('\n')
              const headers = rows[0].split(',')
              
              const previewProducts: ProductData[] = []
              
              // Parse first few rows for preview
              for (let i = 1; i < Math.min(rows.length, 10); i++) {
                if (!rows[i].trim()) continue
                
                const values = rows[i].split(',')
                const product: any = {}
                
                headers.forEach((header, index) => {
                  const cleanHeader = header.trim().toLowerCase().replace(/\s+/g, '')
                  
                  if (cleanHeader === 'id') {
                    product.id = parseInt(values[index], 10) || i
                  } else if (cleanHeader === 'name') {
                    product.name = values[index].trim()
                  } else if (cleanHeader === 'unit') {
                    product.unit = values[index].trim()
                  } else if (cleanHeader === 'baseprice' || cleanHeader === 'base price') {
                    product.basePrice = parseFloat(values[index]) || 0
                  } else if (cleanHeader === 'minprice' || cleanHeader === 'min price') {
                    product.minPrice = parseFloat(values[index]) || 0
                  } else if (cleanHeader === 'maxprice' || cleanHeader === 'max price') {
                    product.maxPrice = parseFloat(values[index]) || 0
                  }
                })
                
                if (product.name) {
                  previewProducts.push(product as ProductData)
                }
              }
              
              setPreviewData(previewProducts)
            }
          }
          fileReader.readAsText(file)
          
          setActiveTab("preview")
        } else {
          alert(`Error: ${data.error || 'Failed to import data'}`)
        }
      } else {
        // Success case
        setTimeout(() => {
          setIsProcessing(false)
          setShowSuccessDialog(true)
          
          // Reset state
          setFile(null)
          setFileName("")
          setPreviewData([])
              setValidationErrors([])
          setShowPreview(false)
          
          // Store import results for display
          setImportResults(data.items || [])
        }, 1000)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setIsUploading(false)
      setIsProcessing(false)
      alert('An error occurred while uploading the file.')
    }
  }

  const handleImport = async () => {
    if (!file || validationErrors.length > 0) return
    
    setIsProcessing(true)

    // Re-upload the file after validation
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', selectedCategory)
    
    try {
      const response = await fetch('/api/pricing/import', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      setIsProcessing(false)
      
      if (!response.ok) {
        alert(`Error: ${data.error || 'Failed to import data'}`)
      } else {
      setShowSuccessDialog(true)
        
        // Reset state
        setFile(null)
        setFileName("")
        setPreviewData([])
        setValidationErrors([])
        setShowPreview(false)
        
        // Store import results for display
        setImportResults(data.items || [])
      }
    } catch (error) {
      console.error('Error importing file:', error)
      setIsProcessing(false)
      alert('An error occurred while importing the file.')
    }
  }

  const handleDownloadTemplate = () => {
    // Make sure the template exists
    const templateFileName = `${selectedCategory}-pricing-template.csv`;
    const templatePath = `/templates/${templateFileName}`;
    
    // Create and trigger the download
    const link = document.createElement('a');
    link.href = templatePath;
    link.download = templateFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Add analytics tracking if available
    try {
      if (window.gtag) {
        window.gtag('event', 'download', {
          event_category: 'templates',
          event_label: templateFileName
        });
      }
    } catch (e) {
      console.log('Analytics not available');
    }
  }

  const formatCurrency = (value: number) => {
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
                    <Select value={selectedCategory} onValueChange={(value: CategoryType) => setSelectedCategory(value)}>
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
                      onClick={() => {
                        const fileInput = document.getElementById("pricing-file");
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
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
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold">Success!</p>
            <p className="text-center text-muted-foreground">
              Your {selectedCategory} pricing data has been imported into the system.
            </p>
            {importResults.length > 0 && (
              <div className="w-full mt-4 max-h-48 overflow-y-auto">
                <p className="text-sm font-medium mb-2">Imported Items:</p>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead>Rate Name</TableHead>
                        <TableHead>Factor</TableHead>
                        <TableHead>Fee %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importResults.slice(0, 5).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.plan_number}</TableCell>
                          <TableCell>{item.rate_name}</TableCell>
                          <TableCell>{item.payment_factor}</TableCell>
                          <TableCell>{item.merchant_fee}%</TableCell>
                        </TableRow>
                      ))}
                      {importResults.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                            And {importResults.length - 5} more items...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/pricing">View All Pricing</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/pricing">
                Close
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
