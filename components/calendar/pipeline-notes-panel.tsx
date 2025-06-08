"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  NotebookPen, 
  Plus, 
  Clock, 
  User, 
  Calendar,
  Bell,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface Customer {
  id: number
  name: string
  email: string
  phone?: string
}

interface PipelineNote {
  id: number
  customer_id: number
  customer_name: string
  customer_email: string
  note_text: string
  note_type: string
  follow_up_date?: string
  follow_up_status: string
  reminder_status?: string
  reminder_id?: number
  created_at: string
  user_name: string
}

interface PipelineNotesPanelProps {
  onNoteAdded?: () => void
}

export function PipelineNotesPanel({ onNoteAdded }: PipelineNotesPanelProps) {
  const [notes, setNotes] = useState<PipelineNote[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterFollowUp, setFilterFollowUp] = useState("all")

  // Form state for new note
  const [newNote, setNewNote] = useState({
    customer_id: "",
    note_text: "",
    note_type: "general",
    follow_up_date: "",
    follow_up_time: "",
    auto_create_reminder: true
  })

  useEffect(() => {
    fetchPipelineNotes()
    fetchCustomers()
  }, [])

  const fetchPipelineNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/calendar/notes')
      const data = await response.json()
      
      if (data.success) {
        setNotes(data.notes)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch pipeline notes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching pipeline notes:', error)
      toast({
        title: "Error",
        description: "Error loading pipeline notes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

  const handleAddNote = async () => {
    if (!newNote.customer_id || !newNote.note_text.trim()) {
      toast({
        title: "Error",
        description: "Please select a customer and enter a note",
        variant: "destructive",
      })
      return
    }

    try {
      // Combine date and time if both are provided
      let followUpDateTime = null
      if (newNote.follow_up_date) {
        followUpDateTime = newNote.follow_up_time 
          ? `${newNote.follow_up_date}T${newNote.follow_up_time}`
          : `${newNote.follow_up_date}T09:00`
      }

      const response = await fetch('/api/calendar/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: parseInt(newNote.customer_id),
          note_text: newNote.note_text,
          note_type: newNote.note_type,
          follow_up_date: followUpDateTime,
          auto_create_reminder: newNote.auto_create_reminder
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        setShowAddNoteDialog(false)
        setNewNote({
          customer_id: "",
          note_text: "",
          note_type: "general",
          follow_up_date: "",
          follow_up_time: "",
          auto_create_reminder: true
        })
        fetchPipelineNotes()
        onNoteAdded?.()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add note",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error adding note:', error)
      toast({
        title: "Error",
        description: "Error adding note",
        variant: "destructive",
      })
    }
  }

  // Filter notes based on search and filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.note_text.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "all" || note.note_type === filterType

    const matchesFollowUp = 
      filterFollowUp === "all" ||
      (filterFollowUp === "has_followup" && note.follow_up_date) ||
      (filterFollowUp === "no_followup" && !note.follow_up_date) ||
      (filterFollowUp === "overdue" && note.follow_up_status === "overdue") ||
      (filterFollowUp === "due_soon" && note.follow_up_status === "due_soon")

    const matchesCustomer = !selectedCustomer || note.customer_id === selectedCustomer

    return matchesSearch && matchesType && matchesFollowUp && matchesCustomer
  })

  const getFollowUpStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      case 'due_soon': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'no_followup': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'follow_up': return 'bg-green-100 text-green-800'
      case 'objection': return 'bg-red-100 text-red-800'
      case 'pricing': return 'bg-purple-100 text-purple-800'
      case 'contact_attempt': return 'bg-yellow-100 text-yellow-800'
      case 'meeting_summary': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFollowUpDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isPast(date)) return `${format(date, 'MMM d')} (Overdue)`
    return format(date, 'MMM d, yyyy')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Pipeline Notes</h2>
          <p className="text-muted-foreground">
            Quick notes and follow-ups for each customer in your pipeline
          </p>
        </div>
        
        <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Pipeline Note</DialogTitle>
              <DialogDescription>
                Add a quick note for a customer with optional follow-up reminder
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Customer Selection */}
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select 
                  value={newNote.customer_id} 
                  onValueChange={(value) => setNewNote({...newNote, customer_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
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

              {/* Note Text */}
              <div className="grid gap-2">
                <Label htmlFor="note">Note *</Label>
                <Textarea
                  id="note"
                  placeholder="Enter your note about this customer..."
                  value={newNote.note_text}
                  onChange={(e) => setNewNote({...newNote, note_text: e.target.value})}
                  rows={4}
                />
              </div>

              {/* Note Type */}
              <div className="grid gap-2">
                <Label htmlFor="type">Note Type</Label>
                <Select 
                  value={newNote.note_type} 
                  onValueChange={(value) => setNewNote({...newNote, note_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="objection">Objection Handling</SelectItem>
                    <SelectItem value="pricing">Pricing Discussion</SelectItem>
                    <SelectItem value="contact_attempt">Contact Attempt</SelectItem>
                    <SelectItem value="meeting_summary">Meeting Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Follow-up Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="followup-date">Follow-up Date</Label>
                  <Input
                    id="followup-date"
                    type="date"
                    value={newNote.follow_up_date}
                    onChange={(e) => setNewNote({...newNote, follow_up_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="followup-time">Follow-up Time</Label>
                  <Input
                    id="followup-time"
                    type="time"
                    value={newNote.follow_up_time}
                    onChange={(e) => setNewNote({...newNote, follow_up_time: e.target.value})}
                    disabled={!newNote.follow_up_date}
                  />
                </div>
              </div>

              {/* Auto-create reminder checkbox */}
              {newNote.follow_up_date && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-reminder"
                    checked={newNote.auto_create_reminder}
                    onChange={(e) => setNewNote({...newNote, auto_create_reminder: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="auto-reminder" className="text-sm">
                    Automatically create reminder for follow-up date
                  </Label>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                {newNote.follow_up_date ? 'Add Note & Set Reminder' : 'Add Note'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes or customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Customer Filter */}
            <Select value={selectedCustomer?.toString() || "all"} onValueChange={(value) => setSelectedCustomer(value === "all" ? null : parseInt(value))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Note Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="objection">Objection</SelectItem>
                <SelectItem value="pricing">Pricing</SelectItem>
                <SelectItem value="contact_attempt">Contact</SelectItem>
                <SelectItem value="meeting_summary">Meeting</SelectItem>
              </SelectContent>
            </Select>

            {/* Follow-up Filter */}
            <Select value={filterFollowUp} onValueChange={setFilterFollowUp}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All notes</SelectItem>
                <SelectItem value="has_followup">Has follow-up</SelectItem>
                <SelectItem value="no_followup">No follow-up</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="due_soon">Due soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <NotebookPen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No pipeline notes found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                {searchQuery || selectedCustomer || filterType !== "all" || filterFollowUp !== "all"
                  ? "No notes match your current filters."
                  : "Start adding notes to track your customer interactions and follow-ups."
                }
              </p>
              <Button onClick={() => setShowAddNoteDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  {/* Customer Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {note.customer_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Note Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{note.customer_name}</h4>
                        <p className="text-sm text-muted-foreground">{note.customer_email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getNoteTypeColor(note.note_type)}>
                          {note.note_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>

                    {/* Note Text */}
                    <div className="mt-3">
                      <p className="text-gray-700">{note.note_text}</p>
                    </div>

                    {/* Follow-up Information */}
                    {note.follow_up_date && (
                      <div className="mt-3 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Follow-up: {formatFollowUpDate(note.follow_up_date)} at{' '}
                            {format(new Date(note.follow_up_date), 'h:mm a')}
                          </span>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={getFollowUpStatusColor(note.follow_up_status)}
                        >
                          {note.follow_up_status === 'overdue' && <AlertTriangle className="mr-1 h-3 w-3" />}
                          {note.follow_up_status === 'due_soon' && <Clock className="mr-1 h-3 w-3" />}
                          {note.follow_up_status === 'scheduled' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {note.follow_up_status.replace('_', ' ')}
                        </Badge>

                        {note.reminder_status && (
                          <div className="flex items-center space-x-1">
                            <Bell className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Reminder: {note.reminder_status}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 