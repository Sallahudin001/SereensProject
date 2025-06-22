"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserButton } from "@/components/auth/mock-auth"
import {
  BarChart3,
  FileText,
  Home,
  Menu,
  Settings,
  Users,
  PlusCircle,
  Package,
  Bell,
  Search,
  HelpCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home, current: pathname === "/dashboard" },
    { name: "Proposals", href: "/proposals", icon: FileText, current: pathname.startsWith("/proposals") },
    { name: "Customers", href: "/customers", icon: Users, current: pathname.startsWith("/customers") },
    { name: "Analytics", href: "/analytics", icon: BarChart3, current: pathname.startsWith("/analytics") },
    { name: "Settings", href: "/settings", icon: Settings, current: pathname.startsWith("/settings") },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-border bg-card pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <img className="h-8 w-auto" src="/newlogo.png" alt="Evergreen Home Upgrades" />
            <h1 className="ml-3 text-xl font-semibold">HomeImprovePro</h1>
          </div>

          <div className="px-3 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="pl-8 bg-muted/50 border-none h-9" />
            </div>
          </div>

          <div className="mt-1 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 mt-6">
            <Button variant="outline" className="w-full justify-start gap-2">
              <HelpCircle className="h-4 w-4" />
              Help & Support
            </Button>
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserButton />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">John Smith</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <ThemeToggle className="ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-3 left-3 z-50">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[300px] p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center flex-shrink-0 px-4 h-14 border-b border-border">
              <img className="h-8 w-auto" src="/newlogo.png" alt="Evergreen Home Upgrades" />
              <h1 className="ml-3 text-xl font-semibold">HomeImprovePro</h1>
            </div>

            <div className="px-4 py-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="pl-8 bg-muted/50 border-none h-9" />
              </div>
            </div>

            <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="p-4 mt-auto">
              <Button variant="outline" className="w-full justify-start gap-2">
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </Button>
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserButton />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">John Smith</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
                <ThemeToggle className="ml-auto" />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-background/80 backdrop-blur-sm border-b border-border flex">
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="ml-10 md:ml-0">
              <h2 className="text-xl font-semibold hidden md:block">Evergreen Home Upgrades</h2>
            </div>
            <div className="ml-4 flex items-center md:ml-6 gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">View notifications</span>
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {[1, 2, 3].map((item) => (
                      <DropdownMenuItem key={item} className="cursor-pointer py-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://avatar.vercel.sh/notification-${item}`} />
                            <AvatarFallback>N{item}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">New proposal signed</p>
                            <p className="text-xs text-muted-foreground">Customer #1{item} has signed the proposal</p>
                            <p className="text-xs text-muted-foreground">2 hour{item} ago</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer justify-center">
                    <Link href="/notifications" className="text-sm text-primary">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">Create new</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Create New</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>New Proposal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    <span>New Customer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Package className="mr-2 h-4 w-4" />
                    <span>New Product</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ThemeToggle className="hidden md:flex" />
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
      </div>
    </div>
  )
}
