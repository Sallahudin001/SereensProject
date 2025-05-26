"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileUp, 
  Download, 
  Loader2,
  ChevronRight
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface ProductCategory {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

interface Product {
  id: number
  category_id: number
  name: string
  description: string
  base_price: number
  is_active: boolean
  pricing_unit: string
  min_price: number
  price_visible: boolean
  product_data: any
  created_at: string
  updated_at: string
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("categories")
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Form state for categories
  const [formCategoryName, setFormCategoryName] = useState("")
  const [formCategoryDescription, setFormCategoryDescription] = useState("")
  
  // Form state for products
  const [formProductName, setFormProductName] = useState("")
  const [formProductDescription, setFormProductDescription] = useState("")
  const [formProductCategory, setFormProductCategory] = useState<number | null>(null)
  const [formProductBasePrice, setFormProductBasePrice] = useState("")
  const [formProductMinPrice, setFormProductMinPrice] = useState("")
  const [formProductPricingUnit, setFormProductPricingUnit] = useState("")
  const [formProductIsActive, setFormProductIsActive] = useState(true)
  const [formProductPriceVisible, setFormProductPriceVisible] = useState(true)
  const [formProductData, setFormProductData] = useState<any>({})
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/products/categories')
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
        
        // Fetch products
        const productsResponse = await fetch('/api/products')
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products')
        }
        const productsData = await productsResponse.json()
        setProducts(productsData)
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching product data:", error)
        toast({
          title: "Error",
          description: "Failed to load product data",
          variant: "destructive"
        })
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Reset form values
  const resetCategoryForm = () => {
    setFormCategoryName("")
    setFormCategoryDescription("")
  }
  
  const resetProductForm = () => {
    setFormProductName("")
    setFormProductDescription("")
    setFormProductCategory(null)
    setFormProductBasePrice("")
    setFormProductMinPrice("")
    setFormProductPricingUnit("")
    setFormProductIsActive(true)
    setFormProductPriceVisible(true)
  }
  
  // Handle add/edit category
  const handleAddCategory = () => {
    setEditingCategory(null)
    resetCategoryForm()
    setShowCategoryDialog(true)
  }
  
  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category)
    setFormCategoryName(category.name)
    setFormCategoryDescription(category.description)
    setShowCategoryDialog(true)
  }
  
  const handleSaveCategory = () => {
    // Validate form
    if (!formCategoryName) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      })
      return
    }
    
    if (editingCategory) {
      // Update existing category
      setCategories(categories => 
        categories.map(category => 
          category.id === editingCategory.id 
            ? {
                ...category,
                name: formCategoryName,
                description: formCategoryDescription,
                updated_at: new Date().toISOString()
              } 
            : category
        )
      )
      
      toast({
        title: "Category Updated",
        description: "Category has been updated successfully"
      })
    } else {
      // Add new category
      const newId = Math.max(0, ...categories.map(c => c.id)) + 1
      
      setCategories(categories => [
        ...categories,
        {
          id: newId,
          name: formCategoryName,
          description: formCategoryDescription,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      
      toast({
        title: "Category Added",
        description: "New category has been added successfully"
      })
    }
    
    resetCategoryForm()
    setShowCategoryDialog(false)
  }
  
  // Handle add/edit product
  const handleAddProduct = () => {
    setEditingProduct(null)
    resetProductForm()
    setShowProductDialog(true)
  }
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormProductName(product.name)
    setFormProductDescription(product.description)
    setFormProductCategory(product.category_id)
    setFormProductBasePrice(product.base_price.toString())
    setFormProductMinPrice(product.min_price.toString())
    setFormProductPricingUnit(product.pricing_unit)
    setFormProductIsActive(product.is_active)
    setFormProductPriceVisible(product.price_visible)
    setFormProductData(product.product_data)
    setShowProductDialog(true)
  }
  
  const handleSaveProduct = async () => {
    // Validate form
    if (!formProductName || !formProductCategory) {
      toast({
        title: "Validation Error",
        description: "Product name and category are required",
        variant: "destructive"
      })
      return
    }
    
    if (isNaN(Number(formProductBasePrice)) || isNaN(Number(formProductMinPrice))) {
      toast({
        title: "Validation Error",
        description: "Base price and min price must be numbers",
        variant: "destructive"
      })
      return
    }
    
    try {
      setLoading(true)
      
      const productData = {
        id: editingProduct?.id,
        category_id: formProductCategory,
        name: formProductName,
        description: formProductDescription,
        base_price: Number(formProductBasePrice),
        min_price: Number(formProductMinPrice),
        pricing_unit: formProductPricingUnit,
        is_active: formProductIsActive,
        price_visible: formProductPriceVisible,
        product_data: formProductData || {}
      }
      
      if (editingProduct) {
        // Update existing product via API
        const response = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
        
        if (!response.ok) {
          throw new Error('Failed to update product')
        }
        
        const updatedProduct = await response.json()
        
        // Update local state
        setProducts(products => 
          products.map(product => 
            product.id === editingProduct.id ? updatedProduct : product
          )
        )
        
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully"
        })
      } else {
        // Add new product via API
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
        
        if (!response.ok) {
          throw new Error('Failed to add product')
        }
        
        const newProduct = await response.json()
        
        // Update local state
        setProducts(products => [...products, newProduct])
        
        toast({
          title: "Product Added",
          description: "New product has been added successfully"
        })
      }
      
      setLoading(false)
      resetProductForm()
      setShowProductDialog(false)
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: editingProduct ? "Failed to update product" : "Failed to add product",
        variant: "destructive"
      })
      setLoading(false)
    }
  }
  
  // Handle delete category
  const handleDeleteCategory = (id: number) => {
    if (products.some(product => product.category_id === id)) {
      toast({
        title: "Cannot Delete",
        description: "This category has products. Remove the products first.",
        variant: "destructive"
      })
      return
    }
    
    setCategories(categories => categories.filter(category => category.id !== id))
    
    toast({
      title: "Category Deleted",
      description: "Category has been deleted successfully"
    })
  }
  
  // Handle delete product
  const handleDeleteProduct = (id: number) => {
    setProducts(products => products.filter(product => product.id !== id))
    
    toast({
      title: "Product Deleted",
      description: "Product has been deleted successfully"
    })
  }
  
  // Filter items based on search query
  const filteredCategories = categories.filter(
    category => category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredProducts = products.filter(
    product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categories.find(c => c.id === product.category_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Get category name by ID
  const getCategoryName = (id: number) => {
    return categories.find(category => category.id === id)?.name || "Unknown"
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage product categories and products
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            <span>Import</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={activeTab === "categories" ? handleAddCategory : handleAddProduct}
          >
            <Plus className="h-4 w-4" />
            <span>Add {activeTab === "categories" ? "Category" : "Product"}</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>
                  Manage product categories for your home improvement services
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading categories...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>{category.id}</TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell>
                              {products.filter(p => p.category_id === category.id).length}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCategory(category.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No categories found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Manage products and services for your home improvement business
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading products...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Base Price</TableHead>
                        <TableHead>Min Price</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Visible</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.id}</TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{getCategoryName(product.category_id)}</TableCell>
                            <TableCell>${Number(product.base_price).toFixed(2)}</TableCell>
                            <TableCell>${Number(product.min_price).toFixed(2)}</TableCell>
                            <TableCell>{product.pricing_unit}</TableCell>
                            <TableCell>
                              <Switch checked={product.is_active} />
                            </TableCell>
                            <TableCell>
                              <Switch checked={product.price_visible} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            No products found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details below"
                : "Fill out the form to create a new product category"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryName" className="text-right">
                Name
              </Label>
              <Input
                id="categoryName"
                value={formCategoryName}
                onChange={(e) => setFormCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryDescription" className="text-right">
                Description
              </Label>
              <Input
                id="categoryDescription"
                value={formCategoryDescription}
                onChange={(e) => setFormCategoryDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the product details below"
                : "Fill out the form to create a new product"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="productName" className="sm:text-right">
                Name
              </Label>
              <Input
                id="productName"
                value={formProductName}
                onChange={(e) => setFormProductName(e.target.value)}
                className="sm:col-span-3"
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="productCategory" className="sm:text-right">
                Category
              </Label>
              <select
                id="productCategory"
                value={formProductCategory || ""}
                onChange={(e) => setFormProductCategory(Number(e.target.value))}
                className="sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="productDescription" className="sm:text-right">
                Description
              </Label>
              <Input
                id="productDescription"
                value={formProductDescription}
                onChange={(e) => setFormProductDescription(e.target.value)}
                className="sm:col-span-3"
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="productBasePrice" className="sm:text-right">
                Base Price
              </Label>
              <Input
                id="productBasePrice"
                type="number"
                step="0.01"
                value={formProductBasePrice}
                onChange={(e) => setFormProductBasePrice(e.target.value)}
                className="sm:col-span-3"
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="productMinPrice" className="sm:text-right">
                Min Price
              </Label>
              <Input
                id="productMinPrice"
                type="number"
                step="0.01"
                value={formProductMinPrice}
                onChange={(e) => setFormProductMinPrice(e.target.value)}
                className="sm:col-span-3"
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="productPricingUnit" className="sm:text-right">
                Pricing Unit
              </Label>
              <Input
                id="productPricingUnit"
                value={formProductPricingUnit}
                onChange={(e) => setFormProductPricingUnit(e.target.value)}
                placeholder="per square, per unit, etc."
                className="sm:col-span-3"
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="productIsActive" className="sm:text-right">
                Active
              </Label>
              <div className="flex items-center space-x-2 sm:col-span-3">
                <Switch 
                  id="productIsActive" 
                  checked={formProductIsActive}
                  onCheckedChange={setFormProductIsActive}
                />
                <Label htmlFor="productIsActive">
                  {formProductIsActive ? "Yes" : "No"}
                </Label>
              </div>
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="productPriceVisible" className="sm:text-right">
                Price Visible
              </Label>
              <div className="flex items-center space-x-2 sm:col-span-3">
                <Switch 
                  id="productPriceVisible" 
                  checked={formProductPriceVisible}
                  onCheckedChange={setFormProductPriceVisible}
                />
                <Label htmlFor="productPriceVisible">
                  {formProductPriceVisible ? "Yes" : "No"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 