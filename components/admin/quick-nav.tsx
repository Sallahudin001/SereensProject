"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  FileText,
  DollarSign,
  Users,
  Settings,
  ShieldCheck,
  Home,
  ChevronRight,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function QuickNav() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)

  const links = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/contracts", label: "Contracts", icon: FileText },
    { href: "/admin/financing", label: "Financing", icon: DollarSign },
    { href: "/admin/pricing", label: "Pricing", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/permissions", label: "Permissions", icon: ShieldCheck },
  ]

  return (
    <div className="bg-card border rounded-lg p-2 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium ml-2">Quick Navigation</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setExpanded(!expanded)}>
          <ChevronRight className={cn("h-4 w-4 transition-transform", expanded && "rotate-90")} />
          <span className="sr-only">{expanded ? "Collapse" : "Expand"}</span>
        </Button>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon

            return (
              <Link key={link.href} href={link.href}>
                <Button variant={isActive ? "default" : "outline"} size="sm" className="w-full justify-start">
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
