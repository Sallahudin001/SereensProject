"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, AlertTriangle, TestTube } from "lucide-react"
import AdminOnly from "@/components/auth/AdminOnly"

export default function Test403Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <TestTube className="h-6 w-6" />
              403 Forbidden Error Test Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This page demonstrates the 403 Forbidden error implementation when users with 'user' role 
              try to access admin-restricted content.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Test Scenarios:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• If you're an admin: You'll see the admin content below</li>
                <li>• If you're a user: You'll see a 403 error message</li>
                <li>• If you try to access /admin/* routes as a user: You'll be redirected to /403</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Test AdminOnly Component */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-6 w-6" />
              AdminOnly Component Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The content below is wrapped in an AdminOnly component:
            </p>
            
            <AdminOnly>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">
                    🎉 Admin Content Visible!
                  </h3>
                </div>
                <p className="text-green-700 text-sm">
                  You are successfully authenticated as an administrator and can see this protected content.
                </p>
              </div>
            </AdminOnly>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-700">Navigation Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline">
                <Link href="/admin">
                  Test Admin Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/users">
                  Test Admin Users
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/403">
                  View 403 Page Directly
                </Link>
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              ↑ If you're a user (not admin), clicking the admin links will redirect you to the 403 page
            </p>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-700">How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="font-medium text-emerald-800 mb-1">For Users:</p>
                <p className="text-emerald-700">
                  If your role is 'user', you should see 403 error messages above and be redirected 
                  to /403 when clicking admin links.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-medium text-blue-800 mb-1">For Admins:</p>
                <p className="text-blue-700">
                  If your role is 'admin', you should see the green success message above and be able 
                  to access all admin links normally.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 