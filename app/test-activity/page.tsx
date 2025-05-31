"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logPermissionChange } from "@/lib/client-logger"
import { toast } from "@/hooks/use-toast"

export default function TestActivityPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  
  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev])
  }
  
  const testLogging = async () => {
    try {
      setLoading(true)
      addLog("Starting activity log test...")
      
      // Test client-side logging
      addLog("Testing client-side permission change logging...")
      const result = await logPermissionChange(
        "test-user-id",
        "target-user-id",
        "John Doe",
        { role: "admin" },
        { role: "user" }
      )
      
      if (result) {
        addLog("✅ Client-side permission change logged successfully")
      } else {
        addLog("❌ Failed to log client-side permission change")
      }
      
      // Fetch latest logs from the API to confirm they were recorded
      addLog("Fetching logs from API to verify...")
      const response = await fetch('/api/admin/activity?limit=5')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.activities && data.activities.length > 0) {
        addLog(`✅ Found ${data.activities.length} logs in the system`)
        data.activities.forEach((activity: any) => {
          addLog(`- [${activity.type}] ${activity.details} (${activity.timestamp})`)
        })
      } else {
        addLog("❌ No logs found or API returned an error")
      }
      
      toast({
        title: "Test Completed",
        description: "Check the logs below for results"
      })
    } catch (error) {
      console.error("Error testing activity logs:", error)
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
      
      toast({
        title: "Error",
        description: "Failed to test activity logs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Activity Log Testing</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Activity Logger Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testLogging} 
            disabled={loading}
            className="mb-4"
          >
            {loading ? "Testing..." : "Test Activity Logging"}
          </Button>
          
          <div className="border rounded-md p-4 bg-muted/50 h-[300px] overflow-auto">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center">
                Logs will appear here when you run the test
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="text-sm font-mono whitespace-pre-wrap">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 