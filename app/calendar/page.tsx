import { CalendarDashboard } from "@/components/calendar/calendar-dashboard"
import DashboardLayout from "@/components/dashboard-layout"

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        <CalendarDashboard />
      </div>
    </DashboardLayout>
  )
} 