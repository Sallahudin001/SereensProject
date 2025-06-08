"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  AlertTriangle, 
  Bell, 
  Clock, 
  CheckCircle, 
  Timer, 
  X,
  User,
  Calendar,
  Phone
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

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
  minutes_overdue?: number
  minutes_until_due?: number
}

interface ReminderAlertsProps {
  reminders: Reminder[]
  onUpdate: () => void
}

export function ReminderAlerts({ reminders, onUpdate }: ReminderAlertsProps) {
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set())

  if (reminders.length === 0) {
    return null
  }

  const handleReminderAction = async (reminderIds: number[], action: 'complete' | 'snooze' | 'dismiss', snoozeMinutes = 60) => {
    setProcessingIds(prev => new Set([...prev, ...reminderIds]))

    try {
      const response = await fetch('/api/calendar/reminders/due', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminder_ids: reminderIds,
          action,
          snooze_minutes: snoozeMinutes
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        onUpdate() // Refresh the reminders
      } else {
        toast({
          title: "Error",
          description: data.error || `Failed to ${action} reminder`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing reminder:`, error)
      toast({
        title: "Error",
        description: `Error ${action}ing reminder`,
        variant: "destructive",
      })
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        reminderIds.forEach(id => newSet.delete(id))
        return newSet
      })
    }
  }

  const getUrgencyColor = (urgencyLevel?: string) => {
    switch (urgencyLevel) {
      case 'overdue': return 'border-red-500 bg-red-50'
      case 'due_now': return 'border-orange-500 bg-orange-50'
      case 'due_soon': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-blue-500 bg-blue-50'
    }
  }

  const getUrgencyIcon = (urgencyLevel?: string) => {
    switch (urgencyLevel) {
      case 'overdue': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'due_now': return <Bell className="h-5 w-5 text-orange-500" />
      case 'due_soon': return <Clock className="h-5 w-5 text-yellow-500" />
      default: return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeStatus = (reminder: Reminder) => {
    if (reminder.urgency_level === 'overdue' && reminder.minutes_overdue) {
      return `${Math.floor(reminder.minutes_overdue)} minutes overdue`
    } else if (reminder.minutes_until_due && reminder.minutes_until_due > 0) {
      return `Due in ${Math.floor(reminder.minutes_until_due)} minutes`
    } else {
      return formatDistanceToNow(new Date(reminder.due_date), { addSuffix: true })
    }
  }

  // Group reminders by urgency
  const overdueReminders = reminders.filter(r => r.urgency_level === 'overdue')
  const dueNowReminders = reminders.filter(r => r.urgency_level === 'due_now')
  const dueSoonReminders = reminders.filter(r => r.urgency_level === 'due_soon')

  return (
    <div className="space-y-4">
      {/* Critical Alerts - Overdue */}
      {overdueReminders.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-800">
                  {overdueReminders.length} Overdue Reminder{overdueReminders.length > 1 ? 's' : ''}
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReminderAction(overdueReminders.map(r => r.id), 'complete')}
                  disabled={overdueReminders.some(r => processingIds.has(r.id))}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Complete All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReminderAction(overdueReminders.map(r => r.id), 'snooze', 30)}
                  disabled={overdueReminders.some(r => processingIds.has(r.id))}
                >
                  <Timer className="mr-1 h-3 w-3" />
                  Snooze 30m
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueReminders.map((reminder) => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onAction={handleReminderAction}
                isProcessing={processingIds.has(reminder.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Due Now Alerts */}
      {dueNowReminders.length > 0 && (
        <Card className="border-orange-500 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-orange-800">
                  {dueNowReminders.length} Reminder{dueNowReminders.length > 1 ? 's' : ''} Due Now
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReminderAction(dueNowReminders.map(r => r.id), 'complete')}
                  disabled={dueNowReminders.some(r => processingIds.has(r.id))}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Complete All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReminderAction(dueNowReminders.map(r => r.id), 'snooze', 15)}
                  disabled={dueNowReminders.some(r => processingIds.has(r.id))}
                >
                  <Timer className="mr-1 h-3 w-3" />
                  Snooze 15m
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dueNowReminders.map((reminder) => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onAction={handleReminderAction}
                isProcessing={processingIds.has(reminder.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Due Soon Alerts */}
      {dueSoonReminders.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-yellow-800">
                  {dueSoonReminders.length} Reminder{dueSoonReminders.length > 1 ? 's' : ''} Due Soon
                </CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReminderAction(dueSoonReminders.map(r => r.id), 'dismiss')}
                disabled={dueSoonReminders.some(r => processingIds.has(r.id))}
              >
                <X className="mr-1 h-3 w-3" />
                Dismiss All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dueSoonReminders.map((reminder) => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onAction={handleReminderAction}
                isProcessing={processingIds.has(reminder.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ReminderCardProps {
  reminder: Reminder
  onAction: (ids: number[], action: 'complete' | 'snooze' | 'dismiss', snoozeMinutes?: number) => void
  isProcessing: boolean
}

function ReminderCard({ reminder, onAction, isProcessing }: ReminderCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeStatus = (reminder: Reminder) => {
    if (reminder.urgency_level === 'overdue' && reminder.minutes_overdue) {
      return `${Math.floor(reminder.minutes_overdue)} minutes overdue`
    } else if (reminder.minutes_until_due && reminder.minutes_until_due > 0) {
      return `Due in ${Math.floor(reminder.minutes_until_due)} minutes`
    } else {
      return formatDistanceToNow(new Date(reminder.due_date), { addSuffix: true })
    }
  }

  return (
    <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border shadow-sm">
      {/* Customer Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarFallback>
          {reminder.customer_name 
            ? reminder.customer_name.split(' ').map(n => n[0]).join('')
            : <User className="h-4 w-4" />
          }
        </AvatarFallback>
      </Avatar>

      {/* Reminder Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{reminder.title}</h4>
            {reminder.customer_name && (
              <p className="text-sm text-muted-foreground">{reminder.customer_name}</p>
            )}
            {reminder.description && (
              <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getPriorityColor(reminder.priority)}>
              {reminder.priority}
            </Badge>
            <Badge variant="outline">
              {reminder.reminder_type.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Time and Contact Info */}
        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(reminder.due_date), 'MMM d, h:mm a')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span className={reminder.urgency_level === 'overdue' ? 'text-red-600 font-medium' : ''}>
              {formatTimeStatus(reminder)}
            </span>
          </div>
          {reminder.customer_phone && (
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>{reminder.customer_phone}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-3">
          <Button
            size="sm"
            onClick={() => onAction([reminder.id], 'complete')}
            disabled={isProcessing}
            className="h-7 px-2 text-xs"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction([reminder.id], 'snooze', 60)}
            disabled={isProcessing}
            className="h-7 px-2 text-xs"
          >
            <Timer className="mr-1 h-3 w-3" />
            1hr
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction([reminder.id], 'snooze', 15)}
            disabled={isProcessing}
            className="h-7 px-2 text-xs"
          >
            <Timer className="mr-1 h-3 w-3" />
            15m
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAction([reminder.id], 'dismiss')}
            disabled={isProcessing}
            className="h-7 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
} 