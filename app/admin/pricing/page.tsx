"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  FileUp,
  Download,
  Search,
  Edit,
  Trash2,
  Loader2,
  Package,
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import * as XLSX from 'xlsx'

interface ProductPricing {
  id: number;
  name: string;
  unit: string;
  base_price: number;
  min_price: number;
  max_price: number;
  cost: number;
  status: 'active' | 'inactive';
  category: string;
  created_at: string;
  updated_at: string;
}

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  avgPrice: number;
}

export default function PricingPage() {
  const [activeCategory, setActiveCategory] = useState("roofing");
  const [pricingData, setPricingData] = useState<Record<string, ProductPricing[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductPricing | null>(null);
  const [categoryStats, setCategoryStats] = useState<Record<string, CategoryStats>>({});
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formBasePrice, setFormBasePrice] = useState("");
  const [formMinPrice, setFormMinPrice] = useState("");
  const [formMaxPrice, setFormMaxPrice] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const categories = [
    { id: 'roofing', name: 'Roofing', description: 'Shingles, tiles, TPO, metal roofing materials' },
    { id: 'hvac', name: 'HVAC', description: 'Heating, cooling, ductwork systems' },
    { id: 'windows', name: 'Windows & Doors', description: 'Vinyl windows, entry doors, patio doors' },
    { id: 'garage', name: 'Garage Doors', description: 'Garage doors and openers' },
    { id: 'paint', name: 'Paint', description: 'Interior and exterior painting materials' },
  ];

  // Fetch pricing data for all categories
  useEffect(() => {
    fetchAllPricingData();
  }, []);

  const fetchAllPricingData = async () => {
    setLoading(true);
    try {
      const allData: Record<string, ProductPricing[]> = {};
      const allStats: Record<string, CategoryStats> = {};
      
      for (const category of categories) {
        try {
          const response = await fetch(`/api/products/pricing?category=${category.id}`);
          if (response.ok) {
            const data = await response.json();
            allData[category.id] = data;
            
            // Calculate stats
            allStats[category.id] = {
              total: data.length,
              active: data.filter((item: ProductPricing) => item.status === 'active').length,
              inactive: data.filter((item: ProductPricing) => item.status === 'inactive').length,
              avgPrice: data.length > 0 ? data.reduce((sum: number, item: ProductPricing) => sum + item.base_price, 0) / data.length : 0
            };
          } else {
            allData[category.id] = [];
            allStats[category.id] = { total: 0, active: 0, inactive: 0, avgPrice: 0 };
          }
        } catch (error) {
          console.error(`Error fetching ${category.id} pricing:`, error);
          allData[category.id] = [];
          allStats[category.id] = { total: 0, active: 0, inactive: 0, avgPrice: 0 };
        }
      }
      
      setPricingData(allData);
      setCategoryStats(allStats);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    resetForm();
    setShowAddDialog(true);
  };

  const handleEditItem = (item: ProductPricing) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormUnit(item.unit);
    setFormBasePrice(item.base_price.toString());
    setFormMinPrice(item.min_price.toString());
    setFormMaxPrice(item.max_price.toString());
    setFormCost(item.cost.toString());
    setFormStatus(item.status);
    setShowAddDialog(true);
  };

  const handleDeleteItem = async (id: number, category: string) => {
    if (!confirm("Are you sure you want to delete this pricing item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/pricing`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete pricing item');
      }

      // Update local state
      setPricingData(prev => ({
        ...prev,
        [category]: prev[category].filter(item => item.id !== id)
      }));
      
      toast({
        title: "Item deleted",
        description: "The pricing item has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting pricing item:', error);
      toast({
        title: "Error",
        description: "Failed to delete pricing item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (item: ProductPricing) => {
    try {
      const updatedItem = { ...item, status: item.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' };
      
      const response = await fetch('/api/products/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const savedItem = await response.json();
      
      // Update local state
      setPricingData(prev => ({
        ...prev,
        [item.category]: prev[item.category].map(i => i.id === item.id ? savedItem : i)
      }));
      
      toast({
        title: `Item ${savedItem.status}`,
        description: `"${savedItem.name}" is now ${savedItem.status}.`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormUnit("");
    setFormBasePrice("");
    setFormMinPrice("");
    setFormMaxPrice("");
    setFormCost("");
    setFormStatus('active');
  };

  const handleSaveItem = async () => {
    // Validate form
    if (!formName || !formUnit || !formBasePrice) {
      toast({
        title: "Validation Error",
        description: "Name, unit, and base price are required.",
        variant: "destructive"
      });
      return;
    }

    const basePrice = parseFloat(formBasePrice);
    const minPrice = parseFloat(formMinPrice) || basePrice * 0.9;
    const maxPrice = parseFloat(formMaxPrice) || basePrice * 1.2;
    const cost = parseFloat(formCost) || basePrice * 0.8;

    if (minPrice > basePrice || maxPrice < basePrice) {
      toast({
        title: "Validation Error",
        description: "Base price must be between min and max price.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const pricingData = {
        name: formName,
        unit: formUnit,
        base_price: basePrice,
        min_price: minPrice,
        max_price: maxPrice,
        cost: cost,
        status: formStatus,
        category: activeCategory
      };

      let response;

      if (editingItem) {
        // Update existing item
        response = await fetch('/api/products/pricing', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingItem.id,
            ...pricingData
          }),
        });
      } else {
        // Add new item
        response = await fetch('/api/products/pricing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pricingData),
        });
      }

      if (!response.ok) {
        throw new Error(editingItem ? 'Failed to update pricing item' : 'Failed to add pricing item');
      }

      const savedItem = await response.json();

      // Update local state
      if (editingItem) {
        setPricingData(prev => ({
          ...prev,
          [activeCategory]: prev[activeCategory].map(item =>
            item.id === editingItem.id ? savedItem : item
          )
        }));
        toast({
          title: "Item updated",
          description: "The pricing item has been updated successfully."
        });
      } else {
        setPricingData(prev => ({
          ...prev,
          [activeCategory]: [...(prev[activeCategory] || []), savedItem]
        }));
        toast({
          title: "Item added",
          description: "The new pricing item has been added successfully."
        });
      }

      setShowAddDialog(false);
      resetForm();
      
      // Refresh stats for the category
      await fetchAllPricingData();
    } catch (error) {
      console.error('Error saving pricing item:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? 'update' : 'add'} pricing item. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportToExcel = () => {
    const currentItems = pricingData[activeCategory] || [];
    
    // Create a worksheet from the current category data
    const worksheet = XLSX.utils.json_to_sheet(
      currentItems.map(item => ({
        'Name': item.name,
        'Unit': item.unit,
        'Base Price': item.base_price,
        'Min Price': item.min_price,
        'Max Price': item.max_price,
        'Cost': item.cost,
        'Status': item.status,
        'Category': item.category
      }))
    );
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeCategory}_pricing`);
    
    // Generate and download the file
    XLSX.writeFile(workbook, `${activeCategory}_pricing_export.xlsx`);
  };

  const currentItems = pricingData[activeCategory] || [];
  const filteredItems = currentItems.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Card */}
      <Card className="shadow-xl rounded-xl overflow-hidden bg-white border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div>
              <CardTitle className="text-3xl sm:text-4xl font-bold tracking-tight">Product Pricing</CardTitle>
              <CardDescription className="text-green-100 text-sm sm:text-base">
                Manage product pricing and catalog
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/admin/pricing/import">
                <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 w-full sm:w-auto">
                  <FileUp className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </Link>
              <Button
                onClick={handleAddItem}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => {
          const stats = categoryStats[category.id] || { total: 0, active: 0, inactive: 0, avgPrice: 0 };
          return (
            <Card 
              key={category.id} 
              className={`cursor-pointer transition-colors ${
                activeCategory === category.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {category.name}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active} active, {stats.inactive} inactive
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg: {formatCurrency(stats.avgPrice)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{category.name}</span>
                      Pricing
                    </CardTitle>
              <CardDescription>
                      {category.description} - {(categoryStats[category.id]?.total || 0)} items
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input
                      placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading pricing data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Base Price</TableHead>
                          <TableHead className="text-right">Min Price</TableHead>
                          <TableHead className="text-right">Max Price</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.base_price)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.min_price)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.max_price)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.cost)}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Badge
                                    variant={item.status === 'active' ? 'default' : 'secondary'}
                                    className={
                                      item.status === 'active'
                                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    }
                                  >
                                    {item.status}
                                  </Badge>
                          <Switch 
                                    checked={item.status === 'active'} 
                                    onCheckedChange={() => handleToggleStatus(item)}
                          />
                                </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                                    onClick={() => handleDeleteItem(item.id, category.id)}
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
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <Package className="h-8 w-8 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                  {searchQuery 
                                    ? `No items match "${searchQuery}" in ${category.name}.`
                                    : `No pricing items found for ${category.name}.`
                                  }
                                </p>
                                {!searchQuery && (
                                  <Button onClick={handleAddItem} variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Item
                                  </Button>
                                )}
                              </div>
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
        ))}
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Pricing Item" : `Add New ${categories.find(c => c.id === activeCategory)?.name} Item`}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the pricing item details below."
                : `Add a new pricing item to the ${categories.find(c => c.id === activeCategory)?.name} category.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Asphalt Shingles - Premium"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit *
              </Label>
              <Select value={formUnit} onValueChange={setFormUnit}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (roofing)</SelectItem>
                  <SelectItem value="unit">Unit (equipment)</SelectItem>
                  <SelectItem value="window">Window</SelectItem>
                  <SelectItem value="door">Door</SelectItem>
                  <SelectItem value="linear_foot">Linear Foot</SelectItem>
                  <SelectItem value="square_foot">Square Foot</SelectItem>
                  <SelectItem value="gallon">Gallon</SelectItem>
                  <SelectItem value="hour">Hour (labor)</SelectItem>
                  <SelectItem value="project">Project (flat rate)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="basePrice" className="text-right">
                Base Price *
              </Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                value={formBasePrice}
                onChange={(e) => setFormBasePrice(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minPrice" className="text-right">
                  Min Price
                </Label>
                <Input
                  id="minPrice"
                  type="number"
                  step="0.01"
                  value={formMinPrice}
                  onChange={(e) => setFormMinPrice(e.target.value)}
                  className="col-span-3"
                  placeholder="Auto: 90% of base"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxPrice" className="text-right">
                  Max Price
                </Label>
                <Input
                  id="maxPrice"
                  type="number"
                  step="0.01"
                  value={formMaxPrice}
                  onChange={(e) => setFormMaxPrice(e.target.value)}
                  className="col-span-3"
                  placeholder="Auto: 120% of base"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost" className="text-right">
                Cost
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formCost}
                onChange={(e) => setFormCost(e.target.value)}
                className="col-span-3"
                placeholder="Auto: 80% of base"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={formStatus} onValueChange={(value: 'active' | 'inactive') => setFormStatus(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingItem ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {editingItem ? 'Update Item' : 'Add Item'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 