"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Plus,
  FileUp,
  Download,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import * as XLSX from 'xlsx'

interface PricingItem {
  id: number;
  plan_number: string;
  rate_name: string;
  notes: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export default function PricingPage() {
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);
  
  // Form state
  const [formPlanNumber, setFormPlanNumber] = useState("");
  const [formRateName, setFormRateName] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formVisible, setFormVisible] = useState(true);

  // Fetch pricing data from API
  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pricing');
      if (!response.ok) {
        throw new Error('Failed to fetch pricing data');
      }
      const data = await response.json();
      setPricingItems(data);
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

  const handleEditItem = (item: PricingItem) => {
    setEditingItem(item);
    setFormPlanNumber(item.plan_number);
    setFormRateName(item.rate_name);
    setFormNotes(item.notes || "");
    setFormVisible(item.visible);
    setShowAddDialog(true);
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this pricing item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/pricing?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete pricing item');
      }

      setPricingItems(items => items.filter(item => item.id !== id));
      
      toast({
        title: "Pricing item deleted",
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

  const handleToggleVisibility = async (item: PricingItem) => {
    try {
      const updatedItem = { ...item, visible: !item.visible };
      
      const response = await fetch('/api/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      const savedItem = await response.json();
      
      setPricingItems(items =>
        items.map(i => i.id === item.id ? savedItem : i)
      );
      
      toast({
        title: `Item ${savedItem.visible ? 'visible' : 'hidden'}`,
        description: `"${savedItem.rate_name}" is now ${savedItem.visible ? 'visible' : 'hidden'}.`
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormPlanNumber("");
    setFormRateName("");
    setFormNotes("");
    setFormVisible(true);
  };

  const handleSaveItem = async () => {
    // Validate form
    if (!formRateName) {
      toast({
        title: "Validation Error",
        description: "Rate name is required.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const pricingData = {
        plan_number: formPlanNumber,
        rate_name: formRateName,
        notes: formNotes,
        visible: formVisible
      };

      let response;

      if (editingItem) {
        // Update existing item
        response = await fetch('/api/pricing', {
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
        response = await fetch('/api/pricing', {
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

      if (editingItem) {
        setPricingItems(items =>
          items.map(item =>
            item.id === editingItem.id ? savedItem : item
          )
        );
        toast({
          title: "Pricing item updated",
          description: "The pricing item has been updated successfully."
        });
      } else {
        setPricingItems(items => [...items, savedItem]);
        toast({
          title: "Pricing item added",
          description: "The new pricing item has been added successfully."
        });
      }

      setShowAddDialog(false);
      resetForm();
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
    // Create a worksheet from the pricingItems data
    const worksheet = XLSX.utils.json_to_sheet(
      pricingItems.map(item => ({
        'Plan #': item.plan_number,
        'Rate Name': item.rate_name,
        'Notes': item.notes || ''
      }))
    );
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pricing");
    
    // Generate and download the file
    XLSX.writeFile(workbook, "pricing_export.xlsx");
  };

  const filteredItems = pricingItems.filter(
    item =>
      item.plan_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rate_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add function to load product pricing data after import
  const loadProductPricing = async (category: string) => {
    try {
      const response = await fetch(`/api/products/pricing?category=${category}`);
      if (!response.ok) {
        throw new Error('Failed to load pricing data');
      }
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error loading product pricing:', error);
      return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Price Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage pricing plans and visibility
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/pricing/import">
            <Button variant="outline" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              <span>Import from Excel</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExportToExcel}
          >
            <Download className="h-4 w-4" />
            <span>Export to Excel</span>
          </Button>
          <Button className="flex items-center gap-2" onClick={handleAddItem}>
            <Plus className="h-4 w-4" />
            <span>Add Pricing</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Pricing List</CardTitle>
              <CardDescription>
                Manage pricing plans and their visibility.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input
                placeholder="Search pricing..."
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
                    <TableHead>Plan #</TableHead>
                    <TableHead>Rate Name</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.plan_number}</TableCell>
                        <TableCell>{item.rate_name}</TableCell>
                        <TableCell>{item.notes}</TableCell>
                        <TableCell>
                          <Switch 
                            checked={item.visible} 
                            onCheckedChange={() => handleToggleVisibility(item)}
                          />
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
                              onClick={() => handleDeleteItem(item.id)}
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
                        No pricing items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Pricing Item" : "Add New Pricing Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the pricing item details below."
                : "Fill out the form to create a new pricing item."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planNumber" className="text-right">
                Plan Number
              </Label>
              <Input
                id="planNumber"
                value={formPlanNumber}
                onChange={(e) => setFormPlanNumber(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rateName" className="text-right">
                Rate Name
              </Label>
              <Input
                id="rateName"
                value={formRateName}
                onChange={(e) => setFormRateName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visible" className="text-right">
                Visible
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="visible"
                  checked={formVisible}
                  onCheckedChange={setFormVisible}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveItem} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 