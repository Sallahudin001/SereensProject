"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useRouter } from "next/navigation"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Download,
  Upload,
  Search
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function ProductManagementPage() {
  const headerSection = useScrollAnimation({ threshold: 0.1 })
  const contentSection = useScrollAnimation()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState("roofing")
  const [products, setProducts] = useState({
    roofing: [],
    hvac: [],
    "windows-doors": [],
    "garage-doors": [],
    paint: [],
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  
  // Mock data for the example
  useEffect(() => {
    // In a real implementation, fetch from an API
    setTimeout(() => {
      setProducts({
        roofing: [
          {
            id: 1,
            name: "GAF Architectural Shingles",
            material: "shingles",
            pricePerSquare: "450.00",
            showPricing: true,
            isDefault: true,
            scopeNotes: "High-quality architectural shingles with lifetime warranty..."
          },
          {
            id: 2,
            name: "Tile Roof System",
            material: "tile", 
            pricePerSquare: "850.00",
            showPricing: true,
            isDefault: false,
            scopeNotes: "Premium tile roofing system with 50-year warranty..."
          },
        ],
        hvac: [
          {
            id: 3,
            name: "Split System 14 SEER",
            systemType: "Split system",
            tonnage: "3",
            basePrice: "8500.00",
            isDefault: true,
            scopeNotes: "Complete HVAC system installation with 10-year parts warranty..."
          }
        ],
        "windows-doors": [
          {
            id: 4,
            name: "Vinyl Dual Pane Windows",
            windowType: "Vinyl",
            basePrice: "450.00",
            perUnitPrice: true,
            isDefault: true,
            scopeNotes: "Energy efficient dual pane vinyl windows..."
          }
        ],
        "garage-doors": [
          {
            id: 5,
            name: "Clopay T50L Standard",
            model: "T50L",
            basePrice: "1200.00",
            withOpener: true,
            openerPrice: "350.00",
            isDefault: true,
            scopeNotes: "Standard garage door with opener installation..."
          }
        ],
        paint: [
          {
            id: 6,
            name: "Exterior Paint Package",
            serviceType: "exterior",
            pricePerSqFt: "3.50",
            includePrimer: true,
            isDefault: true,
            scopeNotes: "Complete exterior painting services including prep work..."
          }
        ]
      })
      setLoading(false)
    }, 1000)
  }, [])
  
  const handleAddProduct = () => {
    setEditingProduct(null) // Creating new product
    setShowDialog(true)
  }
  
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowDialog(true)
  }
  
  const handleDeleteProduct = (productId) => {
    // In a real implementation, this would call an API
    const updatedProducts = { ...products }
    updatedProducts[activeTab] = updatedProducts[activeTab].filter(p => p.id !== productId)
    setProducts(updatedProducts)
    
    toast({
      title: "Product deleted",
      description: "The product has been deleted successfully."
    })
  }
  
  const handleSaveProduct = (formData) => {
    // In a real implementation, this would call an API
    const updatedProducts = { ...products }
    
    if (editingProduct) {
      // Edit existing product
      updatedProducts[activeTab] = updatedProducts[activeTab].map(p => 
        p.id === editingProduct.id ? { ...formData, id: p.id } : p
      )
      
      toast({
        title: "Product updated",
        description: "The product has been updated successfully."
      })
    } else {
      // Add new product
      const newId = Math.max(...updatedProducts[activeTab].map(p => p.id), 0) + 1
      updatedProducts[activeTab] = [
        ...updatedProducts[activeTab],
        { ...formData, id: newId }
      ]
      
      toast({
        title: "Product added",
        description: "The new product has been added successfully."
      })
    }
    
    setProducts(updatedProducts)
    setShowDialog(false)
  }
  
  const handleImportSpreadsheet = () => {
    // This would open a file dialog and import product data
    toast({
      title: "Import feature",
      description: "The import feature would be implemented here to upload product data from a spreadsheet."
    })
  }
  
  const handleExportSpreadsheet = () => {
    // This would export product data to a spreadsheet
    toast({
      title: "Export feature",
      description: "The export feature would be implemented here to download product data as a spreadsheet."
    })
  }
  
  const filteredProducts = products[activeTab]?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []
  
  // Different form fields based on product type
  const renderProductForm = () => {
    if (!showDialog) return null
    
    const defaultValues = editingProduct || {}
    
    switch (activeTab) {
      case "roofing":
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Product Name
              </Label>
              <Input
                id="name"
                defaultValue={defaultValues.name || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="material" className="text-right">
                Material Type
              </Label>
              <Input
                id="material"
                defaultValue={defaultValues.material || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pricePerSquare" className="text-right">
                Price Per Square
              </Label>
              <Input
                id="pricePerSquare"
                defaultValue={defaultValues.pricePerSquare || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="showPricing" className="text-right">
                Show Pricing
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="showPricing"
                  defaultChecked={defaultValues.showPricing !== false}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isDefault" className="text-right">
                Default Option
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="isDefault"
                  defaultChecked={defaultValues.isDefault || false}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scopeNotes" className="text-right">
                Scope Notes
              </Label>
              <Textarea
                id="scopeNotes"
                defaultValue={defaultValues.scopeNotes || ""}
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
        )
      // Similar forms would be implemented for other product types
      default:
        return (
          <div className="py-4">
            <p>Form for {activeTab} products would be implemented here.</p>
          </div>
        )
    }
  }
  
  // Determine table headers based on product type
  const getTableHeaders = () => {
    switch (activeTab) {
      case "roofing":
        return (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Price/Square</TableHead>
            <TableHead>Show Pricing</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        )
      case "hvac":
        return (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>System Type</TableHead>
            <TableHead>Tonnage</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        )
      case "windows-doors":
        return (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Per Unit</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        )
      case "garage-doors":
        return (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Includes Opener</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        )
      case "paint":
        return (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price/Sq.Ft.</TableHead>
            <TableHead>Includes Primer</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        )
      default:
        return (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        )
    }
  }
  
  // Render table rows based on product type
  const renderTableRows = () => {
    return filteredProducts.map(product => {
      switch (activeTab) {
        case "roofing":
          return (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.material}</TableCell>
              <TableCell>${product.pricePerSquare}</TableCell>
              <TableCell>{product.showPricing ? "Yes" : "No"}</TableCell>
              <TableCell>{product.isDefault ? "Yes" : "No"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        case "hvac":
          return (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.systemType}</TableCell>
              <TableCell>{product.tonnage} ton</TableCell>
              <TableCell>${product.basePrice}</TableCell>
              <TableCell>{product.isDefault ? "Yes" : "No"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        // Similar renderers for other product types
        default:
          return (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.type || "-"}</TableCell>
              <TableCell>${product.basePrice || product.pricePerSquare || product.pricePerSqFt}</TableCell>
              <TableCell>{product.isDefault ? "Yes" : "No"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
      }
    })
  }

  return (
    <DashboardLayout>
      <motion.div
        ref={headerSection.ref}
        initial="hidden"
        animate={headerSection.isInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-gray-500">Manage your product catalog and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            variant="outline" 
            onClick={handleImportSpreadsheet}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportSpreadsheet}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            className="bg-rose-600 hover:bg-rose-700" 
            onClick={handleAddProduct}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </motion.div>

      <motion.div
        ref={contentSection.ref}
        initial="hidden"
        animate={contentSection.isInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>Manage products for all services</CardDescription>
            
            {/* Search input */}
            <div className="relative w-full max-w-sm mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="roofing"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full justify-start mb-6 overflow-x-auto">
                <TabsTrigger value="roofing">Roofing</TabsTrigger>
                <TabsTrigger value="hvac">HVAC</TabsTrigger>
                <TabsTrigger value="windows-doors">Windows & Doors</TabsTrigger>
                <TabsTrigger value="garage-doors">Garage Doors</TabsTrigger>
                <TabsTrigger value="paint">Paint</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        {getTableHeaders()}
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              {searchQuery ? "No products found matching your search" : "No products found. Add your first product to get started."}
                            </TableCell>
                          </TableRow>
                        ) : (
                          renderTableRows()
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? "Update the details for this product" 
                : `Add a new ${activeTab.replace("-", " ")} product to your catalog`}
            </DialogDescription>
          </DialogHeader>
          
          {renderProductForm()}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                // In a real app, we'd gather form data properly
                const formData = {
                  name: document.getElementById("name")?.value,
                  material: document.getElementById("material")?.value,
                  pricePerSquare: document.getElementById("pricePerSquare")?.value,
                  showPricing: document.getElementById("showPricing")?.checked,
                  isDefault: document.getElementById("isDefault")?.checked,
                  scopeNotes: document.getElementById("scopeNotes")?.value
                }
                handleSaveProduct(formData)
              }}
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
} 