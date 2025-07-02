"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldX, Home, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function ForbiddenPage() {
  useEffect(() => {
    // Log the 403 access attempt for security monitoring
    console.warn("403 Forbidden: Unauthorized access attempt to admin area")
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-red-200">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center"
            >
              <ShieldX className="h-8 w-8 text-red-600" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-red-700">
              403 - Access Forbidden
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">
                You don't have permission to access this admin area.
              </p>
              <p className="text-gray-500 text-xs">
                This incident has been logged for security purposes.
              </p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 text-sm mb-2">
                Why am I seeing this?
              </h3>
              <ul className="text-xs text-red-700 space-y-1 text-left">
                <li>• You need administrator privileges to access this area</li>
                <li>• Contact your system administrator for access</li>
                <li>• Your current role: <span className="font-semibold">User</span></li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-gray-300 hover:bg-gray-50"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Need admin access? Contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 