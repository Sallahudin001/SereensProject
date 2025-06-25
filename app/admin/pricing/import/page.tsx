"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  Download,
  RefreshCw,
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import * as XLSX from 'xlsx'

interface ProductPricing {
  id?: number;
  name: string;
  unit: string;
  base_price: number;
  min_price: number;
  max_price: number;
  cost: number;
  status: 'active' | 'inactive';
  category: string;
}

interface ImportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export default function PricingImportPage() {
  const [selectedCategory, setSelectedCategory] = useState("roofing");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProductPricing[]>([]);
  const [validationResult, setValidationResult] = useState<ImportValidation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<ProductPricing[]>([]);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  const categories = [
    { id: 'roofing', name: 'Roofing', description: 'Shingles, tiles, TPO, metal roofing materials' },
    { id: 'hvac', name: 'HVAC', description: 'Heating, cooling, ductwork systems' },
    { id: 'windows', name: 'Windows & Doors', description: 'Vinyl windows, entry doors, patio doors' },
    { id: 'garage', name: 'Garage Doors', description: 'Garage doors and openers' },
    { id: 'paint', name: 'Paint', description: 'Interior and exterior painting materials' },
  ];

  const requiredColumns = ['Name', 'Unit', 'Base Price'];
  const optionalColumns = ['Min Price', 'Max Price', 'Cost', 'Status'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    parseFile(file);
  };

  const parseFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      let workbook;

      if (file.type === 'text/csv') {
        const text = new TextDecoder().decode(arrayBuffer);
        workbook = XLSX.read(text, { type: 'string' });
      } else {
        workbook = XLSX.read(arrayBuffer, { type: 'array' });
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error("File must contain at least a header row and one data row");
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];

      const parsedItems: ProductPricing[] = dataRows
        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map((row) => {
          const item: any = {};
          headers.forEach((header, headerIndex) => {
            const cleanHeader = header.trim();
            const value = row[headerIndex];
            
            if (cleanHeader === 'Name') item.name = value?.toString().trim() || '';
            if (cleanHeader === 'Unit') item.unit = value?.toString().trim() || '';
            if (cleanHeader === 'Base Price') item.base_price = parseFloat(value) || 0;
            if (cleanHeader === 'Min Price') item.min_price = parseFloat(value) || 0;
            if (cleanHeader === 'Max Price') item.max_price = parseFloat(value) || 0;
            if (cleanHeader === 'Cost') item.cost = parseFloat(value) || 0;
            if (cleanHeader === 'Status') item.status = value?.toString().toLowerCase() === 'inactive' ? 'inactive' : 'active';
          });

          item.category = selectedCategory;
          if (!item.min_price && item.base_price) item.min_price = item.base_price * 0.9;
          if (!item.max_price && item.base_price) item.max_price = item.base_price * 1.2;
          if (!item.cost && item.base_price) item.cost = item.base_price * 0.8;
          if (!item.status) item.status = 'active';

          return item;
        });

      setParsedData(parsedItems);
      validateData(parsedItems, headers);
      setActiveTab("validation");
      
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : "Failed to parse the uploaded file.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validateData = (data: ProductPricing[], headers: string[]) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    data.forEach((item, index) => {
      const rowNum = index + 2;

      if (!item.name) {
        errors.push(`Row ${rowNum}: Name is required`);
      }

      if (!item.unit) {
        errors.push(`Row ${rowNum}: Unit is required`);
      }

      if (!item.base_price || item.base_price <= 0) {
        errors.push(`Row ${rowNum}: Base price must be greater than 0`);
      }

      if (item.min_price && item.max_price && item.min_price > item.max_price) {
        warnings.push(`Row ${rowNum}: Min price is greater than max price`);
      }
    });

    setValidationResult({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  };

  const handleImport = async () => {
    if (!validationResult?.isValid || parsedData.length === 0) {
      toast({
        title: "Cannot import",
        description: "Please fix validation errors before importing.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const importedItems: ProductPricing[] = [];

      for (const item of parsedData) {
        const response = await fetch('/api/products/pricing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });

        if (response.ok) {
          const savedItem = await response.json();
          importedItems.push(savedItem);
        }
      }

      setImportResults(importedItems);
      setShowResultsDialog(true);
      setActiveTab("import");

      toast({
        title: "Import complete",
        description: `Successfully imported ${importedItems.length} items out of ${parsedData.length}.`
      });

    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Import Error",
        description: "An error occurred during import. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
            <Link href="/admin/pricing">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pricing
              </Button>
            </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Import Product Pricing</h1>
          <p className="text-muted-foreground mt-1">
            Import pricing data from Excel or CSV files
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="validation" disabled={!parsedData.length}>
            <AlertCircle className="h-4 w-4 mr-2" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="import" disabled={!validationResult?.isValid}>
            <Save className="h-4 w-4 mr-2" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Pricing File</CardTitle>
              <CardDescription>
                Select the product category and upload an Excel (.xlsx) or CSV file with pricing data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="category">Product Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                      </SelectContent>
                    </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {categories.find(c => c.id === selectedCategory)?.description}
                  </p>
                  </div>

                <div>
                  <Label htmlFor="file">File Upload</Label>
                      <Input
                    id="file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                      />
                  <p className="text-sm text-muted-foreground mt-1">
                    Accepts Excel (.xlsx, .xls) and CSV files
                  </p>
                    </div>
                  </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Required Columns:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  {requiredColumns.map((col) => (
                    <div key={col} className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {col}
                    </div>
                  ))}
                </div>
                <h4 className="font-medium mb-2 mt-3">Optional Columns:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {optionalColumns.map((col) => (
                    <div key={col} className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-blue-600" />
                      {col}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResult?.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                Data Validation
              </CardTitle>
              <CardDescription>
                Review validation results before importing the data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationResult && (
                <div className="space-y-4">
                  {validationResult.errors.length > 0 && (
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h4 className="font-medium text-red-800 mb-2">Errors (must be fixed):</h4>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {validationResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <h4 className="font-medium text-yellow-800 mb-2">Warnings (review recommended):</h4>
                      <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        {validationResult.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.isValid && (
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <h4 className="font-medium text-green-800 mb-2">✓ Validation passed</h4>
                      <p className="text-sm text-green-700">
                        Found {parsedData.length} valid items ready for import.
                      </p>
                  </div>
                  )}
                </div>
              )}

              {parsedData.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Data Preview ({parsedData.length} items):</h4>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Base Price</TableHead>
                          <TableHead className="text-right">Min Price</TableHead>
                          <TableHead className="text-right">Max Price</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                      <TableBody>
                        {parsedData.slice(0, 10).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.base_price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.min_price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.max_price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.cost)}</TableCell>
                            <TableCell>
                              <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {parsedData.length > 10 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                              And {parsedData.length - 10} more items...
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                </Table>
              </div>
                </div>
              )}
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
              {validationResult?.isValid ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    Ready to import {parsedData.length} pricing items into the <strong>{selectedCategory}</strong> category.
                  </p>
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
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Please fix validation errors before importing data.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Import Complete
            </DialogTitle>
            <DialogDescription>
              Successfully imported {importResults.length} pricing items.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {importResults.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Imported Items:</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Base Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importResults.slice(0, 5).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.base_price)}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                          </TableCell>
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
                Done
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
