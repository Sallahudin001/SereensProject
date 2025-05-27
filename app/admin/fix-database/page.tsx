"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/dashboard-layout"

export default function FixDatabasePage() {
  const [isFixing, setIsFixing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const fixDatabase = async () => {
    setIsFixing(true)
    try {
      const response = await fetch('/api/fix-users-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
        toast({
          title: "Database Fixed",
          description: "Users table has been updated successfully!",
          className: "bg-green-50 border-green-200"
        })
      } else {
        throw new Error(data.error || 'Failed to fix database')
      }
    } catch (error) {
      console.error('Error fixing database:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fix database",
        variant: "destructive"
      })
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Fix Database Schema
            </CardTitle>
            <p className="text-gray-600">
              This will add the missing clerk_id column to the users table.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={fixDatabase} 
              disabled={isFixing}
              className="w-full"
            >
              {isFixing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Fixing Database...
                </>
              ) : (
                "Fix Database Schema"
              )}
            </Button>

            {result && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h3 className="font-medium text-green-800 mb-2">Success!</h3>
                  <p className="text-sm text-green-700 mb-4">{result.message}</p>
                  
                  {result.tableStructure && (
                    <div>
                      <h4 className="font-medium text-green-800 mb-2">Updated Table Structure:</h4>
                      <div className="bg-white rounded border p-3 text-xs">
                        {result.tableStructure.map((col: any, index: number) => (
                          <div key={index} className="mb-1">
                            <strong>{col.column_name}:</strong> {col.data_type} 
                            {col.is_nullable === 'YES' ? ' (nullable)' : ' (not null)'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 