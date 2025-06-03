"use client"

import Link from "next/link"
import Image from "next/image"
import { type ReactNode, useState, useEffect } from "react"
import { BarChart3, FileText, Home, LogOut, Menu, Settings, Users, X, Shield, ChevronLeft, ChevronRight } from "lucide-react"
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

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user } = useUser();
  const { isAdmin } = useIsAdmin();
  const [logoSrc, setLogoSrc] = useState("/evergreen.png");
  
  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };
  
  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Proposals", href: "/proposals" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
  ];

  // Add admin item to navigation items if user is admin
  const displayNavItems = isAdmin 
    ? [...navItems, { icon: Shield, label: "Admin", href: "/admin" }] 
    : navItems;
  
  // Handle logo loading error
  const handleLogoError = () => {
    // Fallback to logo.jpeg if evergreen.png fails to load
    setLogoSrc("/logo.jpeg");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation with Glassmorphism */}
      <header className="border-b bg-gradient-to-r from-green-600/95 to-emerald-600/95 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 max-w-full">
          {/* Logo and title section - left side */}
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-white/95 backdrop-blur-md">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Image 
                        src={logoSrc}
                        alt="Evergreen Energy Upgrades Logo" 
                        width={120}
                        height={48}
                        className="h-12 w-auto object-contain"
                        priority
                        onError={handleLogoError}
                      />
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
                <div className="bg-white/10 p-2 rounded-lg shadow-sm backdrop-blur-sm">
                  <Image 
                    src={logoSrc}
                    alt="Evergreen Energy Upgrades Logo" 
                    width={140}
                    height={56}
                    className="h-14 w-auto object-contain"
                    priority
                    onError={handleLogoError}
                  />
                </div>
                <span className="text-xl font-semibold text-white ml-3 hidden sm:inline-block drop-shadow-sm">EverGreen Proposals</span>
              </div>
            </Link>
          </div>

          {/* User profile - right side */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-9 w-9 overflow-hidden hover:bg-white/20 backdrop-blur-sm">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                    <AvatarImage src={user?.imageUrl || "/placeholder-user.jpg"} alt={user?.fullName || "User"} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-800">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 bg-white/95 backdrop-blur-md border-emerald-200">
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
                {isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link href="/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
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
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Improved Sidebar (desktop only) */}
        <motion.aside 
          className={cn(
            "hidden md:block border-r bg-white/80 backdrop-blur-sm shadow-xl flex-shrink-0",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
          animate={{ width: sidebarCollapsed ? 64 : 256 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="py-6 relative h-full">
            {/* Toggle button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -right-3 top-4 h-6 w-6 bg-white/90 backdrop-blur-sm border shadow-lg rotate-0 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-200"
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </Button>
          
            <div className="space-y-1 px-2">
              {displayNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-200 group relative overflow-hidden",
                    sidebarCollapsed && "justify-center"
                  )}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5 text-emerald-600 group-hover:text-emerald-700 transition-colors relative z-10" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span 
                        className="text-sm font-medium text-gray-700 group-hover:text-emerald-800 transition-colors relative z-10"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/0 to-green-100/0 group-hover:from-emerald-100/50 group-hover:to-green-100/30 transition-all duration-300 rounded-lg"></div>
                </Link>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden bg-gradient-to-br from-gray-50/50 to-slate-100/50 min-w-0">
          <div className="w-full h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
