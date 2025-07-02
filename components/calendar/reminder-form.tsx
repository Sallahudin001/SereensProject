"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface Customer {
  id: number
  name: string
  email: string
  phone?: string
}

interface Proposal {
  id: number
  proposal_number: string
  customer_name: string
  status: string
}

interface ReminderFormProps {
  onClose: () => void
  onSuccess: () => void
  preselectedCustomerId?: number
  preselectedProposalId?: number
}

export function ReminderForm({ onClose, onSuccess, preselectedCustomerId, preselectedProposalId }: ReminderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(false)
  const [customerMode, setCustomerMode] = useState<'existing' | 'custom'>('existing')
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    due_time: "09:00",
    customer_id: preselectedCustomerId?.toString() || "none",
    proposal_id: preselectedProposalId?.toString() || "none",
    reminder_type: "follow_up",
    priority: "medium",
    custom_contact_name: "",
    custom_contact_email: "",
    custom_contact_phone: ""
  })

  useEffect(() => {
    fetchCustomers()
    fetchProposals()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      
      if (data.success) {
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/proposals')
      const data = await response.json()
      
      if (data.success) {
        setProposals(data.proposals)
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.due_date || !formData.due_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate that due date is in the future
    const dueDateTime = new Date(`${formData.due_date}T${formData.due_time}`)
    
    if (dueDateTime <= new Date()) {
      toast({
        title: "Error",
        description: "Due date must be in the future",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/calendar/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          due_date: `${formData.due_date}T${formData.due_time}`,
          customer_id: customerMode === 'existing' && formData.customer_id !== "none" ? parseInt(formData.customer_id) : null,
          proposal_id: customerMode === 'existing' && formData.proposal_id !== "none" ? parseInt(formData.proposal_id) : null,
          reminder_type: formData.reminder_type,
          priority: formData.priority,
          custom_contact_name: customerMode === 'custom' ? formData.custom_contact_name : null,
          custom_contact_email: customerMode === 'custom' ? formData.custom_contact_email : null,
          custom_contact_phone: customerMode === 'custom' ? formData.custom_contact_phone : null
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Reminder created successfully!",
        })
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create reminder",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating reminder:', error)
      toast({
        title: "Error",
        description: "Error creating reminder",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTimeOptions = () => {
    const times = []
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = format(new Date(`2000-01-01T${timeString}`), 'h:mm a')
        times.push({ value: timeString, label: displayTime })
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  // Filter proposals by selected customer
  const filteredProposals = formData.customer_id 
    ? proposals.filter(p => p.customer_name === customers.find(c => c.id.toString() === formData.customer_id)?.name)
    : proposals

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Reminder</DialogTitle>
          <DialogDescription>
            Set up a reminder for follow-ups, payments, or other important tasks
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Follow up with customer, Payment due reminder"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          {/* Customer Input Mode Toggle */}
          <div className="grid gap-2">
            <Label>Contact Information</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCustomerMode('existing')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  customerMode === 'existing' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Select Customer
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('custom')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  customerMode === 'custom' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Enter Manually
              </button>
            </div>
          </div>

          {/* Customer Selection or Manual Input */}
          {customerMode === 'existing' ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer</Label>
                <Select 
                  value={formData.customer_id} 
                  onValueChange={(value) => {
                    setFormData({...formData, customer_id: value, proposal_id: "none"})
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No customer selected</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-xs text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Proposal Selection (if customer is selected) */}
              {formData.customer_id !== "none" && (
                <div className="grid gap-2">
                  <Label htmlFor="proposal">Related Proposal</Label>
                  <Select 
                    value={formData.proposal_id} 
                    onValueChange={(value) => setFormData({...formData, proposal_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a proposal (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No proposal selected</SelectItem>
                      {filteredProposals.map((proposal) => (
                        <SelectItem key={proposal.id} value={proposal.id.toString()}>
                          <div>
                            <div className="font-medium">{proposal.proposal_number}</div>
                            <div className="text-xs text-muted-foreground">Status: {proposal.status}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="custom-name">Contact Name</Label>
                <Input
                  id="custom-name"
                  placeholder="First Last Name"
                  value={formData.custom_contact_name}
                  onChange={(e) => setFormData({...formData, custom_contact_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="custom-email">Email (Optional)</Label>
                  <Input
                    id="custom-email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.custom_contact_email}
                    onChange={(e) => setFormData({...formData, custom_contact_email: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="custom-phone">Phone (Optional)</Label>
                  <Input
                    id="custom-phone"
                    placeholder="(555) 123-4567"
                    value={formData.custom_contact_phone}
                    onChange={(e) => setFormData({...formData, custom_contact_phone: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="due-date">Due Date *</Label>
              <Input
                id="due-date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due-time">Due Time *</Label>
              <Select 
                value={formData.due_time} 
                onValueChange={(value) => setFormData({...formData, due_time: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reminder Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Reminder Type</Label>
              <Select 
                value={formData.reminder_type} 
                onValueChange={(value) => setFormData({...formData, reminder_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="payment_due">Payment Due</SelectItem>
                  <SelectItem value="installation_check">Installation Check</SelectItem>
                  <SelectItem value="contract_expiry">Contract Expiry</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this reminder..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 