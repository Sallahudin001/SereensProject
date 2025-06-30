"use client"

import Link from "next/link"
import Image from "next/image"
import { type ReactNode, useState, useEffect } from "react"
import { BarChart3, FileText, Home, LogOut, Settings, Users, Shield, ChevronLeft, ChevronRight, Menu, X, Calendar } from "lucide-react"
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
import { useIsAdmin } from "./admin-check"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Start collapsed for hover behavior
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { user } = useUser();
  const { isAdmin } = useIsAdmin();
  const [logoSrc, setLogoSrc] = useState("/evergreenlogo.svg");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Handle client-side mounting and set initial collapsed state
  useEffect(() => {
    setIsMounted(true)
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
  
  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Proposals", href: "/proposals" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
  ];

  // Add admin item to navigation items if user is admin
  const displayNavItems = isAdmin 
    ? [...navItems, { icon: Shield, label: "Admin", href: "/admin" }] 
    : navItems;
  
  // Handle logo loading error
  const handleLogoError = () => {
    // Fallback to a different logo if needed
    setLogoSrc("/evergreenlogo.svg");
  };
  
  // Prevent hydration mismatch by not rendering animations until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Top Navigation */}
        <header className="border-b bg-gradient-to-r from-green-600/95 to-emerald-600/95 backdrop-blur-md shadow-lg sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3 max-w-full">
            <div className="flex items-center gap-2">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-white/95 backdrop-blur-md">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-xl bg-white shadow-lg">
                          <Image 
                            src={logoSrc}
                            alt="Evergreen Energy Upgrades Logo" 
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
                    
                    <nav className="space-y-1">
                      {displayNavItems.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-emerald-50 transition-colors"
                        >
                          <item.icon className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
              <Link href="/dashboard" className="flex items-center">
                <div className="flex items-center">
                  <div className="bg-white/95 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
                  <Image 
                    src={logoSrc}
                    alt="Evergreen Energy Upgrades Logo" 
                    width={180}
                    height={72}
                    className="h-16 w-auto object-contain"
                    priority
                    onError={handleLogoError}
                  />
                  </div>
                  <span className="text-xl font-semibold text-white ml-3 hidden sm:inline-block drop-shadow-sm">Evergreen Home Upgrades</span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 min-h-0">
          {/* Static Sidebar for SSR */}
          <aside className={cn(
            "hidden md:block flex-shrink-0 relative",
            sidebarCollapsed ? "w-20" : "w-72"
          )}>
            <div className={cn(
              "fixed inset-y-0 left-0 top-[73px] bottom-0 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-lg overflow-hidden z-30",
              sidebarCollapsed ? "w-20" : "w-72"
            )}>
              <div className="p-6 border-b border-emerald-100/50">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl shadow-lg">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">Evergreen</span>
                      <span className="text-xs text-emerald-600 font-medium">Energy Upgrades</span>
                    </div>
                  )}
                </div>
              </div>
            
              <div className="flex-1 p-4 space-y-2">
                {displayNavItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <div key={index}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                          isActive 
                            ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25" 
                            : "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 text-gray-600 hover:text-emerald-700",
                          sidebarCollapsed && "justify-center px-2"
                        )}
                        title={item.label}
                      >
                        <div className={cn(
                          "flex items-center justify-center p-2 rounded-lg transition-all duration-300",
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "text-emerald-600 group-hover:text-emerald-700 group-hover:bg-emerald-100/50"
                        )}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        {!sidebarCollapsed && (
                          <span 
                            className={cn(
                              "text-sm font-medium transition-colors flex-1",
                              isActive ? "text-white" : "text-gray-700 group-hover:text-emerald-800"
                            )}
                          >
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden bg-gradient-to-br from-gray-50/50 to-slate-100/50 min-w-0">
            <div className="w-full h-full">{children}</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="border-b bg-gradient-to-r from-green-600/95 to-emerald-600/95 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 max-w-full">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-white/95 backdrop-blur-md">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-xl bg-white shadow-lg">
                        <Image 
                          src={logoSrc}
                          alt="Evergreen Energy Upgrades Logo" 
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
                  
                  <nav className="space-y-1">
                    {displayNavItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-emerald-50 transition-colors"
                      >
                        <item.icon className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="flex items-center">
              <div className="flex items-center">
                <div className="bg-white/95 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
                  <Image 
                    src={logoSrc}
                    alt="Evergreen Energy Upgrades Logo" 
                    width={180}
                    height={72}
                    className="h-16 w-auto object-contain"
                    priority
                    onError={handleLogoError}
                  />
                </div>
                <span className="text-xl font-semibold text-white ml-3 hidden sm:inline-block drop-shadow-sm">Evergreen Home Upgrades</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Improved Sidebar (desktop only) with hover functionality */}
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
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-4 space-y-2 pt-16 overflow-x-hidden">
                {displayNavItems.map((item, index) => {
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
                          : 'U'}
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
                          : 'U'}
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
                  <SignOutButton>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.aside>

        {/* Main Content - Properly positioned to align with sidebar */}
        <main className="flex-1 overflow-x-hidden bg-gradient-to-br from-gray-50/50 to-slate-100/50 min-w-0">
          <div className="w-full h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
