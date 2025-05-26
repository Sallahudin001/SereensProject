"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Save, Plus, Trash2, Download, History, AlertCircle, CheckCircle, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Mock pricing data
const initialPricingData = {
  roofing: [
    { id: 1, name: "Asphalt Shingles", unit: "sq ft", basePrice: 7.5, minPrice: 6.0, maxPrice: 9.0, active: true },
    { id: 2, name: "Metal Roofing", unit: "sq ft", basePrice: 12.0, minPrice: 10.0, maxPrice: 15.0, active: true },
    { id: 3, name: "Tile Roofing", unit: "sq ft", basePrice: 15.5, minPrice: 13.0, maxPrice: 18.0, active: true },
    { id: 4, name: "Flat Roof", unit: "sq ft", basePrice: 8.0, minPrice: 6.5, maxPrice: 10.0, active: true },
  ],
  hvac: [
    { id: 1, name: "AC Installation", unit: "unit", basePrice: 3500, minPrice: 3000, maxPrice: 4500, active: true },
    {
      id: 2,
      name: "Furnace Installation",
      unit: "unit",
      basePrice: 2800,
      minPrice: 2400,
      maxPrice: 3500,
      active: true,
    },
    { id: 3, name: "Ductwork", unit: "linear ft", basePrice: 35, minPrice: 30, maxPrice: 45, active: true },
    { id: 4, name: "Heat Pump", unit: "unit", basePrice: 4200, minPrice: 3800, maxPrice: 5000, active: true },
  ],
  windows: [
    { id: 1, name: "Vinyl Windows", unit: "window", basePrice: 650, minPrice: 550, maxPrice: 800, active: true },
    { id: 2, name: "Wood Windows", unit: "window", basePrice: 950, minPrice: 850, maxPrice: 1200, active: true },
    { id: 3, name: "Fiberglass Windows", unit: "window", basePrice: 850, minPrice: 750, maxPrice: 1000, active: true },
    { id: 4, name: "Window Installation", unit: "window", basePrice: 250, minPrice: 200, maxPrice: 350, active: true },
  ],
  solar: [
    { id: 1, name: "Solar Panel System", unit: "kW", basePrice: 2800, minPrice: 2500, maxPrice: 3200, active: true },
    { id: 2, name: "Battery Storage", unit: "unit", basePrice: 8500, minPrice: 7500, maxPrice: 10000, active: true },
    { id: 3, name: "Inverter", unit: "unit", basePrice: 1800, minPrice: 1500, maxPrice: 2200, active: true },
    { id: 4, name: "Installation", unit: "system", basePrice: 3500, minPrice: 3000, maxPrice: 4500, active: true },
  ],
}

export default function PricingManagement() {
  const [activeTab, setActiveTab] = useState("roofing")
  const [pricingData, setPricingData] = useState(initialPricingData)
  const [editItem, setEditItem] = useState(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    unit: "",
    basePrice: 0,
    minPrice: 0,
    maxPrice: 0,
    active: true,
  })
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [bulkAdjustment, setBulkAdjustment] = useState(0)
  const [selectedItems, setSelectedItems] = useState([])

  const handleEditItem = (item) => {
    setEditItem({ ...item })
    setShowEditDialog(true)
  }

  const handleSaveEdit = () => {
    setPricingData((prev) => {
      const newData = { ...prev }
      const index = newData[activeTab].findIndex((item) => item.id === editItem.id)
      if (index !== -1) {
        newData[activeTab][index] = editItem
      }
      return newData
    })
    setShowEditDialog(false)
  }

  const handleAddItem = () => {
    setPricingData((prev) => {
      const newData = { ...prev }
      const newId = Math.max(0, ...newData[activeTab].map((item) => item.id)) + 1
      newData[activeTab].push({ ...newItem, id: newId })
      return newData
    })
    setNewItem({
      name: "",
      unit: "",
      basePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      active: true,
    })
    setShowAddDialog(false)
  }

  const handleDeleteItem = (id) => {
    setPricingData((prev) => {
      const newData = { ...prev }
      newData[activeTab] = newData[activeTab].filter((item) => item.id !== id)
      return newData
    })
  }

  const handleToggleActive = (id) => {
    setPricingData((prev) => {
      const newData = { ...prev }
      const index = newData[activeTab].findIndex((item) => item.id === id)
      if (index !== -1) {
        newData[activeTab][index].active = !newData[activeTab][index].active
      }
      return newData
    })
  }

  const handleBulkAdjustment = () => {
    if (selectedItems.length === 0) return

    setPricingData((prev) => {
      const newData = { ...prev }
      newData[activeTab] = newData[activeTab].map((item) => {
        if (selectedItems.includes(item.id)) {
          const adjustmentFactor = 1 + bulkAdjustment / 100
          return {
            ...item,
            basePrice: Number.parseFloat((item.basePrice * adjustmentFactor).toFixed(2)),
            minPrice: Number.parseFloat((item.minPrice * adjustmentFactor).toFixed(2)),
            maxPrice: Number.parseFloat((item.maxPrice * adjustmentFactor).toFixed(2)),
          }
        }
        return item
      })
      return newData
    })

    setSelectedItems([])
    setBulkAdjustment(0)
    setBulkEditMode(false)
  }

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const selectAllItems = () => {
    if (selectedItems.length === pricingData[activeTab].length) {
      setSelectedItems([])
    } else {
      setSelectedItems(pricingData[activeTab].map((item) => item.id))
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pricing Management</h1>
          <p className="text-muted-foreground mt-1">Update and manage pricing for all services and products.</p>
        </div>
        <div className="flex gap-2">
          {bulkEditMode ? (
            <>
              <Button variant="outline" size="sm" className="h-9" onClick={() => setBulkEditMode(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-9" onClick={handleBulkAdjustment} disabled={selectedItems.length === 0}>
                Apply to {selectedItems.length} items
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="h-9" onClick={() => setBulkEditMode(true)}>
                Bulk Edit
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-9">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Pricing Item</DialogTitle>
                    <DialogDescription>Add a new product or service to your pricing catalog.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Item Name</Label>
                      <Input
                        id="name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="e.g. Premium Shingles"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        placeholder="e.g. sq ft, unit, each"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="basePrice">Base Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="basePrice"
                            type="number"
                            className="pl-8"
                            value={newItem.basePrice}
                            onChange={(e) =>
                              setNewItem({ ...newItem, basePrice: Number.parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="minPrice">Min Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="minPrice"
                            type="number"
                            className="pl-8"
                            value={newItem.minPrice}
                            onChange={(e) =>
                              setNewItem({ ...newItem, minPrice: Number.parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="maxPrice">Max Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="maxPrice"
                            type="number"
                            className="pl-8"
                            value={newItem.maxPrice}
                            onChange={(e) =>
                              setNewItem({ ...newItem, maxPrice: Number.parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={newItem.active}
                        onCheckedChange={(checked) => setNewItem({ ...newItem, active: checked })}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem}>Add Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {bulkEditMode && (
        <Card className="bg-muted/50 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Bulk Price Adjustment</CardTitle>
            <CardDescription>Select items below and apply a percentage adjustment to all prices.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="adjustment">Price Adjustment (%)</Label>
                  <span className="text-sm font-medium">
                    {bulkAdjustment > 0 ? `+${bulkAdjustment}%` : `${bulkAdjustment}%`}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setBulkAdjustment(Math.max(-50, bulkAdjustment - 5))}
                  >
                    -
                  </Button>
                  <Slider
                    id="adjustment"
                    min={-50}
                    max={50}
                    step={1}
                    value={[bulkAdjustment]}
                    onValueChange={(value) => setBulkAdjustment(value[0])}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setBulkAdjustment(Math.min(50, bulkAdjustment + 5))}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-[200px]">
                <Select
                  value={bulkAdjustment.toString()}
                  onValueChange={(value) => setBulkAdjustment(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select adjustment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-20">-20%</SelectItem>
                    <SelectItem value="-10">-10%</SelectItem>
                    <SelectItem value="-5">-5%</SelectItem>
                    <SelectItem value="0">No Change</SelectItem>
                    <SelectItem value="5">+5%</SelectItem>
                    <SelectItem value="10">+10%</SelectItem>
                    <SelectItem value="20">+20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="roofing" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-auto md:inline-grid">
          <TabsTrigger value="roofing">Roofing</TabsTrigger>
          <TabsTrigger value="hvac">HVAC</TabsTrigger>
          <TabsTrigger value="windows">Windows & Doors</TabsTrigger>
          <TabsTrigger value="solar">Solar</TabsTrigger>
        </TabsList>

        {Object.keys(pricingData).map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>{category.charAt(0).toUpperCase() + category.slice(1)} Pricing</CardTitle>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <History className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View price history</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Export pricing</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <CardDescription>
                  Manage pricing for {category} products and services. Last updated: 2 days ago.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {bulkEditMode && (
                        <TableHead className="w-[50px]">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={
                                selectedItems.length === pricingData[category].length &&
                                pricingData[category].length > 0
                              }
                              onChange={selectAllItems}
                            />
                          </div>
                        </TableHead>
                      )}
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Base Price</TableHead>
                      <TableHead className="text-right">Min Price</TableHead>
                      <TableHead className="text-right">Max Price</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingData[category].map((item) => (
                      <TableRow key={item.id}>
                        {bulkEditMode && (
                          <TableCell>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleSelectItem(item.id)}
                              />
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.basePrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.minPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.maxPrice)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              item.active
                                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            }
                          >
                            {item.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggleActive(item.id)}
                            >
                              {item.active ? (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {pricingData[category].length} items • {pricingData[category].filter((item) => item.active).length}{" "}
                  active
                </div>
                <Button variant="outline" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      {editItem && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pricing Item</DialogTitle>
              <DialogDescription>Update pricing information for this product or service.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Item Name</Label>
                <Input
                  id="edit-name"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={editItem.unit}
                  onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-basePrice">Base Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="edit-basePrice"
                      type="number"
                      className="pl-8"
                      value={editItem.basePrice}
                      onChange={(e) => setEditItem({ ...editItem, basePrice: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-minPrice">Min Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="edit-minPrice"
                      type="number"
                      className="pl-8"
                      value={editItem.minPrice}
                      onChange={(e) => setEditItem({ ...editItem, minPrice: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxPrice">Max Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="edit-maxPrice"
                      type="number"
                      className="pl-8"
                      value={editItem.maxPrice}
                      onChange={(e) => setEditItem({ ...editItem, maxPrice: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editItem.active}
                  onCheckedChange={(checked) => setEditItem({ ...editItem, active: checked })}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
