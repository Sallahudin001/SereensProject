"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CalendarIcon,
  Clock,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Bell,
  CheckCircle,
  FileText,
  CalendarPlus2Icon as CalendarIcon2,
  ArrowUpDown,
} from "lucide-react"
import { format, addDays, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data for appointments and reminders
const initialAppointments = [
  {
    id: 1,
    title: "Initial Consultation",
    customer: {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      avatar: "https://avatar.vercel.sh/john-smith",
    },
    date: new Date(2025, 4, 20, 10, 0),
    duration: 60,
    type: "In-Person",
    status: "Scheduled",
    notes: "Discuss roofing and window options",
    assignedTo: "Mike Johnson",
  },
  {
    id: 2,
    title: "Proposal Review",
    customer: {
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      phone: "(555) 234-5678",
      avatar: "https://avatar.vercel.sh/sarah-williams",
    },
    date: new Date(2025, 4, 21, 14, 30),
    duration: 45,
    type: "Virtual",
    status: "Scheduled",
    notes: "Review HVAC proposal and discuss financing options",
    assignedTo: "Lisa Chen",
  },
  {
    id: 3,
    title: "Contract Signing",
    customer: {
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      phone: "(555) 345-6789",
      avatar: "https://avatar.vercel.sh/robert-johnson",
    },
    date: new Date(2025, 4, 22, 11, 0),
    duration: 30,
    type: "In-Person",
    status: "Scheduled",
    notes: "Finalize contract for roofing project",
    assignedTo: "Mike Johnson",
  },
]

const initialReminders = [
  {
    id: 1,
    title: "Follow up on proposal",
    customer: {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      avatar: "https://avatar.vercel.sh/john-smith",
    },
    dueDate: addDays(new Date(), 1),
    status: "Pending",
    priority: "High",
    notes: "Check if customer has reviewed the proposal and address any questions",
    assignedTo: "Mike Johnson",
  },
  {
    id: 2,
    title: "Send updated quote",
    customer: {
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      phone: "(555) 234-5678",
      avatar: "https://avatar.vercel.sh/sarah-williams",
    },
    dueDate: addDays(new Date(), 2),
    status: "Pending",
    priority: "Medium",
    notes: "Update quote with additional window options as requested",
    assignedTo: "Lisa Chen",
  },
  {
    id: 3,
    title: "Check installation progress",
    customer: {
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      phone: "(555) 345-6789",
      avatar: "https://avatar.vercel.sh/robert-johnson",
    },
    dueDate: new Date(),
    status: "Completed",
    priority: "Low",
    notes: "Verify that the roofing installation is proceeding as scheduled",
    assignedTo: "Mike Johnson",
  },
]

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState("calendar")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState(initialAppointments)
  const [reminders, setReminders] = useState(initialReminders)
  const [showAddAppointmentDialog, setShowAddAppointmentDialog] = useState(false)
  const [showAddReminderDialog, setShowAddReminderDialog] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    date: new Date(),
    time: "10:00",
    duration: "60",
    type: "In-Person",
    notes: "",
    assignedTo: "",
  })
  const [newReminder, setNewReminder] = useState({
    title: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    dueDate: new Date(),
    priority: "Medium",
    notes: "",
    assignedTo: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState("dueDate")
  const [sortDirection, setSortDirection] = useState("asc")

  // Filter appointments for the selected date
  const filteredAppointments = appointments.filter(
    (appointment) => selectedDate && isSameDay(appointment.date, selectedDate),
  )

  // Filter and sort reminders
  const filteredReminders = reminders
    .filter(
      (reminder) =>
        reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortField === "dueDate") {
        return sortDirection === "asc"
          ? a.dueDate.getTime() - b.dueDate.getTime()
          : b.dueDate.getTime() - a.dueDate.getTime()
      } else if (sortField === "priority") {
        const priorityValues = { High: 3, Medium: 2, Low: 1 }
        return sortDirection === "asc"
          ? priorityValues[a.priority] - priorityValues[b.priority]
          : priorityValues[b.priority] - priorityValues[a.priority]
      } else if (sortField === "status") {
        return sortDirection === "asc" ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)
      }
      return 0
    })

  const handleAddAppointment = () => {
    const [hours, minutes] = newAppointment.time.split(":").map(Number)
    const appointmentDate = new Date(newAppointment.date)
    appointmentDate.setHours(hours, minutes)

    const newAppointmentObj = {
      id: appointments.length + 1,
      title: newAppointment.title,
      customer: {
        name: newAppointment.customerName,
        email: newAppointment.customerEmail,
        phone: newAppointment.customerPhone,
        avatar: `https://avatar.vercel.sh/${newAppointment.customerName.toLowerCase().replace(/\s+/g, "-")}`,
      },
      date: appointmentDate,
      duration: Number.parseInt(newAppointment.duration),
      type: newAppointment.type,
      status: "Scheduled",
      notes: newAppointment.notes,
      assignedTo: newAppointment.assignedTo,
    }

    setAppointments([...appointments, newAppointmentObj])
    setShowAddAppointmentDialog(false)
    setNewAppointment({
      title: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      date: new Date(),
      time: "10:00",
      duration: "60",
      type: "In-Person",
      notes: "",
      assignedTo: "",
    })
  }

  const handleAddReminder = () => {
    const newReminderObj = {
      id: reminders.length + 1,
      title: newReminder.title,
      customer: {
        name: newReminder.customerName,
        email: newReminder.customerEmail,
        phone: newReminder.customerPhone,
        avatar: `https://avatar.vercel.sh/${newReminder.customerName.toLowerCase().replace(/\s+/g, "-")}`,
      },
      dueDate: newReminder.dueDate,
      status: "Pending",
      priority: newReminder.priority,
      notes: newReminder.notes,
      assignedTo: newReminder.assignedTo,
    }

    setReminders([...reminders, newReminderObj])
    setShowAddReminderDialog(false)
    setNewReminder({
      title: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      dueDate: new Date(),
      priority: "Medium",
      notes: "",
      assignedTo: "",
    })
  }

  const handleCompleteReminder = (id: number) => {
    setReminders(reminders.map((reminder) => (reminder.id === id ? { ...reminder, status: "Completed" } : reminder)))
  }

  const handleDeleteReminder = (id: number) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id))
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      case "Medium":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
      case "Low":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      case "Pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
      case "Overdue":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar & Reminders</h1>
          <p className="text-muted-foreground mt-1">Manage appointments, follow-ups, and reminders for your team.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddReminderDialog} onOpenChange={setShowAddReminderDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Reminder</DialogTitle>
                <DialogDescription>Create a new follow-up reminder for a customer.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="reminder-title">Reminder Title</Label>
                  <Input
                    id="reminder-title"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    placeholder="e.g. Follow up on proposal"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      value={newReminder.customerName}
                      onChange={(e) => setNewReminder({ ...newReminder, customerName: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assigned-to">Assigned To</Label>
                    <Select
                      value={newReminder.assignedTo}
                      onValueChange={(value) => setNewReminder({ ...newReminder, assignedTo: value })}
                    >
                      <SelectTrigger id="assigned-to">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                        <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                        <SelectItem value="David Rodriguez">David Rodriguez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Customer Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={newReminder.customerEmail}
                      onChange={(e) => setNewReminder({ ...newReminder, customerEmail: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Customer Phone</Label>
                    <Input
                      id="customer-phone"
                      value={newReminder.customerPhone}
                      onChange={(e) => setNewReminder({ ...newReminder, customerPhone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <div className="relative">
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newReminder.dueDate && "text-muted-foreground",
                        )}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newReminder.dueDate ? format(newReminder.dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newReminder.priority}
                      onValueChange={(value) => setNewReminder({ ...newReminder, priority: value })}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newReminder.notes}
                    onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
                    placeholder="Add any relevant details or notes about this reminder"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddReminderDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddReminder}>Create Reminder</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddAppointmentDialog} onOpenChange={setShowAddAppointmentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>Create a new appointment with a customer.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="appointment-title">Appointment Title</Label>
                  <Input
                    id="appointment-title"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                    placeholder="e.g. Initial Consultation"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment-customer-name">Customer Name</Label>
                    <Input
                      id="appointment-customer-name"
                      value={newAppointment.customerName}
                      onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointment-assigned-to">Assigned To</Label>
                    <Select
                      value={newAppointment.assignedTo}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, assignedTo: value })}
                    >
                      <SelectTrigger id="appointment-assigned-to">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                        <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                        <SelectItem value="David Rodriguez">David Rodriguez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment-customer-email">Customer Email</Label>
                    <Input
                      id="appointment-customer-email"
                      type="email"
                      value={newAppointment.customerEmail}
                      onChange={(e) => setNewAppointment({ ...newAppointment, customerEmail: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointment-customer-phone">Customer Phone</Label>
                    <Input
                      id="appointment-customer-phone"
                      value={newAppointment.customerPhone}
                      onChange={(e) => setNewAppointment({ ...newAppointment, customerPhone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment-date">Date</Label>
                    <div className="relative">
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newAppointment.date && "text-muted-foreground",
                        )}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newAppointment.date ? format(newAppointment.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointment-time">Time</Label>
                    <Input
                      id="appointment-time"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment-duration">Duration (minutes)</Label>
                    <Select
                      value={newAppointment.duration}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, duration: value })}
                    >
                      <SelectTrigger id="appointment-duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointment-type">Appointment Type</Label>
                    <Select
                      value={newAppointment.type}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, type: value })}
                    >
                      <SelectTrigger id="appointment-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In-Person">In-Person</SelectItem>
                        <SelectItem value="Virtual">Virtual</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-notes">Notes</Label>
                  <Textarea
                    id="appointment-notes"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    placeholder="Add any relevant details about this appointment"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddAppointmentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAppointment}>Schedule Appointment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="reminders">Follow-up Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view appointments</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  classNames={{
                    day_today: "bg-primary/10 text-primary font-bold",
                    day_selected: "bg-primary text-primary-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                  }}
                  components={{
                    DayContent: (props) => {
                      // Check if there are appointments on this day
                      const hasAppointments = appointments.some((appointment) =>
                        isSameDay(appointment.date, props.date),
                      )

                      return (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {props.children}
                          {hasAppointments && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                          )}
                        </div>
                      )
                    },
                  }}
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddAppointmentDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Appointment
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "No Date Selected"}</CardTitle>
                <CardDescription>
                  {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarIcon2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No appointments scheduled</h3>
                    <p className="text-muted-foreground mt-1 mb-4">
                      There are no appointments scheduled for this date.
                    </p>
                    <Button onClick={() => setShowAddAppointmentDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-primary/10 rounded-md p-3 text-center min-w-[80px]">
                          <span className="text-lg font-bold text-primary">{format(appointment.date, "h:mm")}</span>
                          <span className="text-xs text-muted-foreground">{format(appointment.date, "a")}</span>
                          <span className="text-xs mt-1">{appointment.duration} min</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-base font-medium">{appointment.title}</h4>
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className="mr-2">
                                  {appointment.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Assigned to {appointment.assignedTo}
                                </span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Bell className="mr-2 h-4 w-4" />
                                  Set Reminder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center mt-3">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage
                                src={appointment.customer.avatar || "/placeholder.svg"}
                                alt={appointment.customer.name}
                              />
                              <AvatarFallback>{appointment.customer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{appointment.customer.name}</div>
                              <div className="text-xs text-muted-foreground">{appointment.customer.phone}</div>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-3 text-sm text-muted-foreground">
                              <p>{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Follow-up Reminders</CardTitle>
                  <CardDescription>Track and manage follow-ups with customers</CardDescription>
                </div>
                <Button onClick={() => setShowAddReminderDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reminder
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search reminders..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Customer & Task</TableHead>
                      <TableHead className="w-[150px]">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort("assignedTo")}>
                          Assigned To
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort("dueDate")}>
                          Due Date
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort("priority")}>
                          Priority
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort("status")}>
                          Status
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReminders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Bell className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No reminders found</p>
                            <p className="text-sm">Add a new reminder to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReminders.map((reminder) => (
                        <TableRow key={reminder.id}>
                          <TableCell>
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={reminder.customer.avatar || "/placeholder.svg"}
                                  alt={reminder.customer.name}
                                />
                                <AvatarFallback>{reminder.customer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{reminder.title}</div>
                                <div className="text-xs text-muted-foreground">{reminder.customer.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{reminder.assignedTo}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{format(reminder.dueDate, "MMM d, yyyy")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityBadgeClass(reminder.priority)}>
                              {reminder.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClass(reminder.status)}>
                              {reminder.status === "Completed" ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <Clock className="mr-1 h-3 w-3" />
                              )}
                              {reminder.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {reminder.status !== "Completed" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleCompleteReminder(reminder.id)}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Reminder
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDeleteReminder(reminder.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Reminder
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
