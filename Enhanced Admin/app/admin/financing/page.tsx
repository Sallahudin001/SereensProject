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
} from "@/components/ui/dialog"
import {
  Plus,
  FileUp,
  Download,
  Search,
  Edit,
  Trash2,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import * as XLSX from 'xlsx'

interface FinancingPlan {
  id: number;
  plan_number: string;
  provider: string;
  plan_name: string;
  interest_rate: number;
  term_months: number;
  payment_factor: number;
  merchant_fee: number;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function FinancingPage() {
  const [financingPlans, setFinancingPlans] = useState<FinancingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FinancingPlan | null>(null);
  
  // Form state
  const [formPlanNumber, setFormPlanNumber] = useState("");
  const [formProvider, setFormProvider] = useState("");
  const [formPlanName, setFormPlanName] = useState("");
  const [formInterestRate, setFormInterestRate] = useState("");
  const [formTermMonths, setFormTermMonths] = useState("");
  const [formPaymentFactor, setFormPaymentFactor] = useState("");
  const [formMerchantFee, setFormMerchantFee] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Fetch financing plans from API
  useEffect(() => {
    fetchFinancingPlans();
  }, []);

  const fetchFinancingPlans = async () => {
    setLoading(true);
    try {
      // Fetch financing plans from the API
      const response = await fetch('/api/financing/plans');
      if (!response.ok) throw new Error('Failed to fetch financing plans');
      const data = await response.json();
      
      setFinancingPlans(data);
    } catch (error) {
      console.error('Error fetching financing plans:', error);
      toast({
        title: "Error",
        description: "Failed to load financing plans. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    resetForm();
    setShowAddDialog(true);
  };

  const handleEditPlan = (plan: FinancingPlan) => {
    setEditingPlan(plan);
    setFormPlanNumber(plan.plan_number);
    setFormProvider(plan.provider);
    setFormPlanName(plan.plan_name);
    setFormInterestRate(plan.interest_rate.toString());
    setFormTermMonths(plan.term_months.toString());
    setFormPaymentFactor(plan.payment_factor.toString());
    setFormMerchantFee(plan.merchant_fee.toString());
    setFormNotes(plan.notes || "");
    setFormIsActive(plan.is_active);
    setShowAddDialog(true);
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm("Are you sure you want to delete this financing plan?")) {
      return;
    }

    try {
      const response = await fetch(`/api/financing/plans?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete financing plan');
      
      setFinancingPlans(plans => plans.filter(plan => plan.id !== id));
      
      toast({
        title: "Plan deleted",
        description: "The financing plan has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting financing plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete financing plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormPlanNumber("");
    setFormProvider("");
    setFormPlanName("");
    setFormInterestRate("");
    setFormTermMonths("");
    setFormPaymentFactor("");
    setFormMerchantFee("");
    setFormNotes("");
    setFormIsActive(true);
  };

  const handleSavePlan = async () => {
    // Validate form
    if (!formPlanNumber || !formProvider || !formPlanName || !formPaymentFactor) {
      toast({
        title: "Validation Error",
        description: "Plan number, provider, plan name, and payment factor are required.",
        variant: "destructive"
      });
      return;
    }

    if (
      isNaN(Number(formInterestRate)) || 
      isNaN(Number(formTermMonths)) ||
      isNaN(Number(formPaymentFactor)) ||
      isNaN(Number(formMerchantFee))
    ) {
      toast({
        title: "Validation Error",
        description: "Interest rate, term months, payment factor, and merchant fee must be numbers.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const planData = {
        plan_number: formPlanNumber,
        provider: formProvider,
        plan_name: formPlanName,
        interest_rate: Number(formInterestRate),
        term_months: Number(formTermMonths),
        payment_factor: Number(formPaymentFactor),
        merchant_fee: Number(formMerchantFee),
        notes: formNotes,
        is_active: formIsActive
      };

          if (editingPlan) {
        // Update existing plan
        const response = await fetch('/api/financing/plans', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingPlan.id,
            ...planData
          }),
        });
        if (!response.ok) throw new Error('Failed to update financing plan');
        const updatedPlan = await response.json();

        setFinancingPlans(plans =>
          plans.map(plan =>
            plan.id === editingPlan.id ? updatedPlan : plan
          )
        );
        
        toast({
          title: "Plan updated",
          description: "The financing plan has been updated successfully."
        });
    } else {
        // Add new plan
        const response = await fetch('/api/financing/plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData),
        });
        if (!response.ok) throw new Error('Failed to add financing plan');
        const newPlan = await response.json();

        setFinancingPlans(plans => [...plans, newPlan]);
        
        toast({
          title: "Plan added",
          description: "The new financing plan has been added successfully."
        });
      }

      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving financing plan:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingPlan ? 'update' : 'add'} financing plan. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportToExcel = () => {
    // Create a worksheet from the financing plans data
    const worksheet = XLSX.utils.json_to_sheet(
      financingPlans.map(plan => ({
        'Plan #': plan.plan_number,
        'Provider': plan.provider,
        'Plan Name': plan.plan_name,
        'Interest Rate': plan.interest_rate,
        'Term (months)': plan.term_months,
        'Payment Factor': plan.payment_factor,
        'Merchant Fee': plan.merchant_fee,
        'Notes': plan.notes || ''
      }))
    );
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financing Plans");
    
    // Generate and download the file
    XLSX.writeFile(workbook, "financing_plans_export.xlsx");
  };

  const filteredPlans = financingPlans.filter(
    plan =>
      plan.plan_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Financing Plans</h1>
          <p className="text-muted-foreground mt-1">
            Manage financing options, payment factors, and merchant fees
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/financing/import">
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
          <Button className="flex items-center gap-2" onClick={handleAddPlan}>
            <Plus className="h-4 w-4" />
            <span>Add Plan</span>
                </Button>
        </div>
      </div>

          <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
              <CardTitle>Financing Plans</CardTitle>
              <CardDescription>
                Manage financing plans, payment factors, and merchant fees
              </CardDescription>
                </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input
                placeholder="Search plans..."
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
              <p className="mt-2 text-sm text-muted-foreground">Loading financing plans...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan #</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Payment Factor</TableHead>
                    <TableHead>Merchant Fee</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.length > 0 ? (
                    filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                        <TableCell>{plan.plan_number}</TableCell>
                        <TableCell>{plan.provider}</TableCell>
                        <TableCell>{plan.plan_name}</TableCell>
                        <TableCell>{plan.interest_rate}%</TableCell>
                        <TableCell>{plan.term_months} months</TableCell>
                        <TableCell>{plan.payment_factor}</TableCell>
                        <TableCell>{plan.merchant_fee}%</TableCell>
                        <TableCell className="max-w-[200px] truncate">{plan.notes}</TableCell>
                      <TableCell>
                          <Switch checked={plan.is_active} />
                      </TableCell>
                      <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPlan(plan)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePlan(plan.id)}
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
                      <TableCell colSpan={10} className="text-center py-4">
                        No financing plans found.
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
              {editingPlan ? "Edit Financing Plan" : "Add New Financing Plan"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Update the financing plan details below."
                : "Fill out the form to create a new financing plan."}
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
              <Label htmlFor="provider" className="text-right">
                Provider
              </Label>
                <Input
                id="provider"
                value={formProvider}
                onChange={(e) => setFormProvider(e.target.value)}
                className="col-span-3"
                placeholder="GreenSky, PACE, Homerun, etc."
                />
              </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planName" className="text-right">
                Plan Name
              </Label>
                <Input
                id="planName"
                value={formPlanName}
                onChange={(e) => setFormPlanName(e.target.value)}
                className="col-span-3"
                />
              </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interestRate" className="text-right">
                Interest Rate (%)
              </Label>
                    <Input
                id="interestRate"
                      type="number"
                      step="0.01"
                value={formInterestRate}
                onChange={(e) => setFormInterestRate(e.target.value)}
                className="col-span-3"
                    />
                    </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="termMonths" className="text-right">
                Term (months)
              </Label>
                    <Input
                id="termMonths"
                      type="number"
                value={formTermMonths}
                onChange={(e) => setFormTermMonths(e.target.value)}
                className="col-span-3"
                    />
                    </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentFactor" className="text-right">
                Payment Factor
              </Label>
                    <Input
                id="paymentFactor"
                      type="number"
                step="0.0001"
                value={formPaymentFactor}
                onChange={(e) => setFormPaymentFactor(e.target.value)}
                className="col-span-3"
              />
                    </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merchantFee" className="text-right">
                Merchant Fee (%)
              </Label>
                    <Input
                id="merchantFee"
                      type="number"
                      step="0.1"
                value={formMerchantFee}
                onChange={(e) => setFormMerchantFee(e.target.value)}
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
              <Label htmlFor="isActive" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="isActive"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
              </div>
              </div>
            </div>
            <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            <Button 
              onClick={handleSavePlan} 
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
