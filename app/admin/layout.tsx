"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Home,
  FileText,
  ShieldCheck,
  DollarSign,
  BarChart3,
  Settings,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Gift
} from "lucide-react"
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SignOutButton, useUser } from '@clerk/nextjs'
import { Badge } from "@/components/ui/badge"
import { useIsAdmin } from "@/components/admin-check"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [logoSrc, setLogoSrc] = useState("/newlogo.png")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const { user } = useUser();
  const { isAdmin } = useIsAdmin();

  // Load sidebar state from localStorage on mount - but default to collapsed for hover behavior
  useEffect(() => {
    setSidebarCollapsed(true) // Always start collapsed for hover behavior
  }, [])

  // Handle hover enter - expand immediately
  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setSidebarCollapsed(false)
  }

  // Handle hover leave - collapse with delay
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setSidebarCollapsed(true)
    }, 300) // 300ms delay before collapsing
    setHoverTimeout(timeout)
  }

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/proposals", label: "All Proposals", icon: FileText },
    { href: "/admin/customers", label: "All Customers", icon: User },
    { href: "/admin/approvals", label: "Approvals", icon: ShieldCheck },
    { href: "/admin/financing", label: "Financing", icon: DollarSign },
    { href: "/admin/pricing", label: "Pricing", icon: BarChart3 },
    { href: "/admin/offers", label: "Offers & Upsells", icon: Gift },
    { href: "/admin/permissions", label: "User Permissions", icon: ShieldCheck },
  ]

  // Handle logo loading error
  const handleLogoError = () => {
    setLogoSrc("/logo.jpeg")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation with Glassmorphism - Without User Profile */}
      <header className="border-b bg-gradient-to-r from-green-600/95 to-emerald-600/95 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 max-w-full">
          {/* Logo and title section - left side */}
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-white/95 backdrop-blur-md w-80 sm:w-[400px]">
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-white/95 p-2 rounded-lg shadow-lg border border-white/20">
                        <Image 
                          src={logoSrc}
                          alt="Evergreen Home Upgrades Logo" 
                          width={150}
                          height={60}
                          className="h-14 w-auto object-contain"
                          priority
                          onError={handleLogoError}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <nav className="space-y-2 flex-1 overflow-y-auto">
                    {menuItems.map((item, index) => {
                      const isActive = pathname === item.href;
                      return (
                      <Link
                        key={index}
                        href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                            isActive 
                              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg" 
                              : "hover:bg-emerald-50 text-gray-700 hover:text-emerald-700"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                      >
                          <item.icon className={cn(
                            "h-5 w-5",
                            isActive ? "text-white" : "text-emerald-600"
                          )} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile User Profile */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <Avatar className="h-10 w-10 border-2 border-emerald-200">
                        <AvatarImage src={user?.imageUrl || "/placeholder-user.jpg"} alt={user?.fullName || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                          {user?.firstName && user?.lastName
                            ? `${user.firstName[0]}${user.lastName[0]}`
                            : 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{user?.fullName || "User"}</div>
                        <div className="text-xs text-gray-500">{isAdmin ? "Administrator" : "User"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/admin" className="flex items-center">
              <div className="flex items-center">
                <div className="bg-white/95 p-2 sm:p-3 rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
                  <Image 
                    src={logoSrc}
                    alt="Evergreen Home Upgrades Logo" 
                    width={180}
                    height={72}
                    className="h-12 sm:h-16 w-auto object-contain"
                    priority
                    onError={handleLogoError}
                  />
                </div>
                <span className="text-lg sm:text-xl font-semibold text-white ml-3 hidden sm:inline-block drop-shadow-sm">Admin Dashboard</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar (desktop only) */}
        <motion.aside 
          className={cn(
            "hidden md:block flex-shrink-0 relative",
            sidebarCollapsed ? "w-20" : "w-72"
          )}
          animate={{ width: sidebarCollapsed ? 80 : 288 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Sidebar Container - Fixed positioning that fills available space */}
          <div className={cn(
            "fixed inset-y-0 left-0 top-[73px] bottom-0 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-lg z-30 transition-all duration-300 flex flex-col overflow-x-hidden",
            sidebarCollapsed ? "w-20" : "w-72"
          )}>
            
            {/* Hover indicator for collapsed sidebar */}
            {sidebarCollapsed && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-l-full opacity-50 animate-pulse"></div>
            )}
            
            {/* Navigation - Flex grow to fill available space */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
              
              <div className="p-4 space-y-2 pt-16 overflow-x-hidden">
                {menuItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden w-full",
                          isActive 
                            ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25" 
                            : "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 text-gray-600 hover:text-emerald-700",
                          sidebarCollapsed && "justify-center px-2"
                        )}
                        title={item.label}
                      >
                        <div className={cn(
                          "flex items-center justify-center p-2 rounded-lg transition-all duration-300 flex-shrink-0",
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "text-emerald-600 group-hover:text-emerald-700 group-hover:bg-emerald-100/50"
                        )}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <AnimatePresence>
                          {!sidebarCollapsed && (
                            <motion.span 
                              className={cn(
                                "text-sm font-medium transition-colors flex-1 truncate",
                                isActive ? "text-white" : "text-gray-700 group-hover:text-emerald-800"
                              )}
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* User Profile - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 border-t border-emerald-100/50 bg-white/50 overflow-x-hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn(
                    "w-full justify-start p-3 rounded-xl hover:bg-emerald-50 transition-all duration-200 overflow-hidden",
                    sidebarCollapsed && "justify-center px-2"
                  )}>
                    <Avatar className="h-8 w-8 border-2 border-emerald-200 flex-shrink-0">
                      <AvatarImage src={user?.imageUrl || "/placeholder-user.jpg"} alt={user?.fullName || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName[0]}${user.lastName[0]}`
                          : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div
                          className="ml-3 text-left flex-1 min-w-0"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="text-sm font-medium text-gray-900 truncate">{user?.fullName || "User"}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {isAdmin ? "Administrator" : "User"}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div
                          className="flex-shrink-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 bg-white/95 backdrop-blur-md border-emerald-200 shadow-xl">
                  <DropdownMenuLabel className="flex items-center gap-3 p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl || "/placeholder-user.jpg"} alt={user?.fullName || "User"} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-800">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName[0]}${user.lastName[0]}`
                          : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user?.fullName || "User"}</span>
                      <span className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress || ""}</span>
                      {isAdmin && (
                        <Badge className="mt-1 bg-emerald-600 text-xs">Administrator</Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
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
                  <SignOutButton>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-x-hidden bg-gradient-to-br from-gray-50/50 to-slate-100/50 min-w-0">
            <div className="w-full h-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
