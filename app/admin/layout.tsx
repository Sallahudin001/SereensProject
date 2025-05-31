"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  Bell,
  Search,
  User,
  HelpCircle,
  BarChart3,
  Database,
} from "lucide-react"
import { Suspense } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/contracts", label: "Contracts", icon: FileText },
    { href: "/admin/approvals", label: "Approvals", icon: ShieldCheck },
    { href: "/admin/financing", label: "Financing", icon: DollarSign },
    { href: "/admin/pricing", label: "Pricing", icon: BarChart3 },
    { href: "/admin/permissions", label: "User Permissions", icon: ShieldCheck },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-3 w-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-lg font-bold text-primary-foreground">E</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">Evergreen Energy</span>
                <span className="text-xs text-muted-foreground">Admin Dashboard</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href} className="w-full">
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-3 py-2 w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start px-2">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src="https://avatar.vercel.sh/admin" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <span>Admin User</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col w-full overflow-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 w-full">
            <SidebarTrigger />
            <div className="flex flex-1 items-center gap-4 md:gap-8 w-full">
              <div className="relative flex-1 md:grow-0 md:basis-1/3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-md border border-input bg-background pl-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-2/3"
                />
              </div>
              <div className="ml-auto flex items-center gap-4">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 md:p-8 w-full overflow-x-hidden">
            <Suspense>{children}</Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
