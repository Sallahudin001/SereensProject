"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function UsersRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to permissions page
    router.replace("/admin/permissions")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Redirecting to User Permissions...</p>
      </div>
    </div>
  )
}