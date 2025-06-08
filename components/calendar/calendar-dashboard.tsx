"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarIcon, 
  Plus, 
  Bell, 
  Clock, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Calendar as CalendarClock,
  NotebookPen
} from "lucide-react"
import { format, isSameDay, isToday, isTomorrow, addDays } from "date-fns"
import { AppointmentForm } from "./appointment-form"
import { ReminderForm } from "./reminder-form"
import { ReminderAlerts } from "./reminder-alerts"
import { PipelineNotesPanel } from "./pipeline-notes-panel"

interface Appointment {
  id: number
  title: string
  description?: string
  start_time: string
  end_time: string
  customer_name?: string
  customer_email?: string
  appointment_type: string
  status: string
  location?: string
  meeting_notes?: string
}

interface Reminder {
  id: number
  title: string
  description?: string
  due_date: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  reminder_type: string
  priority: string
  status: string
  urgency_level?: string
  minutes_until_due?: number
  minutes_overdue?: number
}

export function CalendarDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [dueReminders, setDueReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Load initial data
  useEffect(() => {
    fetchCalendarData()
    fetchDueReminders()
    
    // Set up interval to check for due reminders every minute
    const interval = setInterval(fetchDueReminders, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch appointments and reminders
  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      
      // Fetch appointments for the current week
      const startDate = new Date(selectedDate)
      startDate.setDate(startDate.getDate() - startDate.getDay()) // Start of week
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6) // End of week

      const [appointmentsRes, remindersRes] = await Promise.all([
        fetch(`/api/calendar/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        fetch('/api/calendar/reminders?status=pending&limit=10')
      ])

      const appointmentsData = await appointmentsRes.json()
      const remindersData = await remindersRes.json()

      if (appointmentsData.success) {
        setAppointments(appointmentsData.appointments)
      }

      if (remindersData.success) {
        setReminders(remindersData.reminders)
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch due reminders for notifications
  const fetchDueReminders = async () => {
    try {
      const response = await fetch('/api/calendar/reminders/due?timeframe=soon')
      const data = await response.json()
      
      if (data.success) {
        setDueReminders(data.reminders)
      }
    } catch (error) {
      console.error('Error fetching due reminders:', error)
    }
  }

  // Filter appointments for selected date
  const selectedDateAppointments = appointments.filter(apt => 
    isSameDay(new Date(apt.start_time), selectedDate)
  )

  // Get upcoming reminders
  const upcomingReminders = reminders
    .filter(reminder => new Date(reminder.due_date) > new Date())
    .slice(0, 5)

  // Get today's events
  const todaysEvents = [
    ...appointments.filter(apt => isToday(new Date(apt.start_time))),
    ...reminders.filter(reminder => isToday(new Date(reminder.due_date)))
  ].sort((a, b) => {
    const timeA = new Date('start_time' in a ? a.start_time : a.due_date)
    const timeB = new Date('start_time' in b ? b.start_time : b.due_date)
    return timeA.getTime() - timeB.getTime()
  })

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800'
      case 'follow_up': return 'bg-green-100 text-green-800'
      case 'contract_signing': return 'bg-purple-100 text-purple-800'
      case 'installation_check': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReminderPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar & Reminders</h1>
          <p className="text-muted-foreground mt-1">
            Manage appointments, follow-ups, and pipeline notes for your customers.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowReminderForm(true)}
            variant="outline"
          >
            <Bell className="mr-2 h-4 w-4" />
            Add Reminder
          </Button>
          <Button onClick={() => setShowAppointmentForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      {/* Due Reminders Alert */}
      {dueReminders.length > 0 && (
        <ReminderAlerts 
          reminders={dueReminders} 
          onUpdate={fetchDueReminders}
        />
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="notes">Pipeline Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today's Events Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todaysEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {todaysEvents.filter(e => 'start_time' in e).length} appointments, {' '}
                  {todaysEvents.filter(e => 'due_date' in e).length} reminders
                </p>
              </CardContent>
            </Card>

            {/* Due Reminders Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due Reminders</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dueReminders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Need immediate attention
                </p>
              </CardContent>
            </Card>

            {/* This Week Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled appointments
                </p>
              </CardContent>
            </Card>

            {/* Pending Follow-ups Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
                <NotebookPen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingReminders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Customer follow-ups
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todaysEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarClock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No events scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaysEvents.map((event, index) => (
                      <div 
                        key={`${'start_time' in event ? 'apt' : 'rem'}-${event.id}`}
                        className="flex items-start space-x-3 p-3 rounded-lg border"
                      >
                        <div className="flex-shrink-0">
                          {'start_time' in event ? (
                            <CalendarIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                          ) : (
                            <Bell className="h-5 w-5 text-orange-500 mt-0.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {event.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {'customer_name' in event && event.customer_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(
                              new Date('start_time' in event ? event.start_time : event.due_date), 
                              'h:mm a'
                            )}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            'start_time' in event 
                              ? getAppointmentTypeColor(event.appointment_type)
                              : getReminderPriorityColor(event.priority)
                          }
                        >
                          {'start_time' in event ? event.appointment_type : event.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Reminders */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reminders</CardTitle>
                <CardDescription>Next 5 follow-ups scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingReminders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>All caught up! No pending reminders.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingReminders.map((reminder) => (
                      <div key={reminder.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{reminder.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {reminder.customer_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isToday(new Date(reminder.due_date)) 
                              ? 'Today' 
                              : isTomorrow(new Date(reminder.due_date))
                                ? 'Tomorrow'
                                : format(new Date(reminder.due_date), 'MMM d')
                            } at {format(new Date(reminder.due_date), 'h:mm a')}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getReminderPriorityColor(reminder.priority)}
                        >
                          {reminder.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Widget */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view appointments</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border-0"
                  modifiers={{
                    hasEvents: (date) => {
                      const hasAppointments = appointments.some(apt => 
                        isSameDay(new Date(apt.start_time), date)
                      )
                      const hasReminders = reminders.some(rem => 
                        isSameDay(new Date(rem.due_date), date)
                      )
                      return hasAppointments || hasReminders
                    }
                  }}
                  modifiersStyles={{
                    hasEvents: { 
                      position: 'relative',
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Selected Date Appointments */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>
                  {selectedDateAppointments.length} appointment(s) scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No appointments</h3>
                    <p className="text-muted-foreground mt-1">
                      No appointments scheduled for this date.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => setShowAppointmentForm(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateAppointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className="flex items-start space-x-4 p-4 border rounded-lg"
                      >
                        <div className="flex-shrink-0 text-center">
                          <div className="text-lg font-bold text-primary">
                            {format(new Date(appointment.start_time), 'h:mm')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(appointment.start_time), 'a')}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{appointment.title}</h4>
                          {appointment.customer_name && (
                            <p className="text-sm text-muted-foreground">
                              {appointment.customer_name}
                            </p>
                          )}
                          {appointment.location && (
                            <p className="text-xs text-muted-foreground mt-1">
                              📍 {appointment.location}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge 
                            variant="outline"
                            className={getAppointmentTypeColor(appointment.appointment_type)}
                          >
                            {appointment.appointment_type}
                          </Badge>
                          <Badge variant="outline">
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-4">
          {/* Reminders content will be implemented in separate component */}
          <Card>
            <CardHeader>
              <CardTitle>Reminders Management</CardTitle>
              <CardDescription>Manage your follow-up reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reminders component will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <PipelineNotesPanel onNoteAdded={fetchCalendarData} />
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showAppointmentForm && (
        <AppointmentForm
          selectedDate={selectedDate}
          onClose={() => setShowAppointmentForm(false)}
          onSuccess={() => {
            fetchCalendarData()
            setShowAppointmentForm(false)
          }}
        />
      )}

      {showReminderForm && (
        <ReminderForm
          onClose={() => setShowReminderForm(false)}
          onSuccess={() => {
            fetchCalendarData()
            fetchDueReminders()
            setShowReminderForm(false)
          }}
        />
      )}
    </div>
  )
} 