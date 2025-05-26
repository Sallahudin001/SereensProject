"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { BarChart3, Users, DollarSign, Shield, Home, LogOut, Sliders, FileText, Bell, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Pricing Management",
    href: "/admin/pricing",
    icon: DollarSign,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Permissions",
    href: "/admin/permissions",
    icon: Shield,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Proposals",
    href: "/admin/proposals",
    icon: FileText,
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Sliders,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80] bg-card border-r border-border">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <div className="relative h-8 w-40">
            <Image
              src="/images/evergreen-logo.png"
              alt="Evergreen Energy Upgrades"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="px-3 mb-2">
          <div className="bg-primary/10 rounded-md p-3 mb-2">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Admin Portal</p>
                <p className="text-xs text-muted-foreground">Full system access</p>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-2">MAIN NAVIGATION</div>
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    pathname === item.href
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                  aria-hidden="true"
                />
                {item.title}
              </Link>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-2">SUPPORT</div>
            <div className="space-y-1 py-2">
              <Link
                href="/admin/notifications"
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Bell className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                Notifications
              </Link>
              <Link
                href="/admin/help"
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <HelpCircle className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                Help & Support
              </Link>
            </div>
          </div>
        </ScrollArea>

        <div className="p-3 mt-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-muted-foreground">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Log out of admin portal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
