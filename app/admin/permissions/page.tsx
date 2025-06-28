"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function PermissionsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new comprehensive user management page
    router.replace("/admin/users")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Redirecting to User Management...</p>
        <p className="text-xs text-muted-foreground mt-2">
          User permissions are now managed in the User Management section.
        </p>
      </div>
    </div>
  )
} 