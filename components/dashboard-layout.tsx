"use client"

import Link from "next/link"
import Image from "next/image"
import { type ReactNode, useState, useEffect } from "react"
import { BarChart3, FileText, Home, LogOut, Settings, Users, Shield, PanelLeftClose, PanelLeftOpen, Menu, X, Calendar, Search, User } from "lucide-react"
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
import { Input } from "@/components/ui/input"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // Start expanded by default
  const [isMounted, setIsMounted] = useState(false)
  const { user } = useUser();
  const { isAdmin } = useIsAdmin();
  const [logoSrc, setLogoSrc] = useState("/sereenh-04.png");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  
  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
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
    setLogoSrc("/sereenh-04.png");
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("🔍 Searching for:", searchQuery);
      
      // Simulate search results
      const mockResults = [
        { type: "proposal", title: `Proposal for ${searchQuery}`, href: "/proposals" },
        { type: "customer", title: `Customer: ${searchQuery}`, href: "/customers" },
        { type: "product", title: `Product: ${searchQuery}`, href: "/dashboard" }
      ].filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (mockResults.length > 0) {
        const resultsList = mockResults.map(r => `• ${r.title}`).join('\n');
        alert(`Search Results for "${searchQuery}":\n\n${resultsList}`);
        
        // Navigate to first result
        window.location.href = mockResults[0].href;
      } else {
        alert(`No results found for "${searchQuery}"`);
      }
    } else {
      alert("Please enter a search term");
    }
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
    // Show a loading state instead of preventing render for faster initial load
  if (!isMounted) {
    return (
      <div className="min-h-screen flex">
        {/* Mobile Menu Button - Fixed position */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50 bg-white/90 hover:bg-white text-gray-900 shadow-lg">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-gradient-to-b from-green-50/95 to-emerald-50/95 backdrop-blur-md">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                  <div className="bg-transparent p-2 rounded-xl shadow-lg">
                          <Image 
                            src={logoSrc}
                            alt="Evergreen Energy Upgrades Logo" 
                            width={150}
                            height={60}
                      className="h-12 w-auto object-contain"
                            priority
                            onError={handleLogoError}
                          />
                        </div>
                  <div className="ml-3">
                    <span className="text-lg font-semibold text-gray-900">Evergreen Home Upgrades</span>
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
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-emerald-100/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

        {/* Static Sidebar for SSR */}
        <aside className={cn(
          "hidden md:block flex-shrink-0 relative",
          sidebarCollapsed ? "w-20" : "w-72"
        )}>
          <div className={cn(
            "fixed inset-y-0 left-0 top-0 bottom-0 bg-gradient-to-b from-green-50/95 to-emerald-50/95 backdrop-blur-xl border-r border-green-200/50 shadow-lg overflow-hidden z-30",
            sidebarCollapsed ? "w-20" : "w-72"
          )}>
            {/* Logo and Title Section */}
            <div className={cn(
              "border-b border-emerald-200/50",
              sidebarCollapsed ? "p-2" : "p-4"
            )}>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className={cn(
                  "bg-transparent rounded-xl shadow-lg flex-shrink-0 transition-all duration-300",
                  sidebarCollapsed ? "p-1" : "p-2"
                )}>
                  <Image 
                    src={logoSrc}
                    alt="Evergreen Energy Upgrades Logo" 
                    width={120}
                    height={48}
                    className={cn(
                      "w-auto object-contain transition-all duration-300",
                      sidebarCollapsed ? "h-8" : "h-10"
                    )}
                    priority
                    onError={handleLogoError}
                  />
                  </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-gray-900 truncate">Evergreen Home Upgrades</span>
                    <span className="text-xs text-emerald-600 font-medium truncate">Sales Dashboard</span>
                </div>
                )}
              </Link>
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Navbar */}
          <header className="sticky top-0 z-40 bg-gradient-to-r from-green-100/95 to-emerald-100/95 backdrop-blur-md border-b border-green-200/50 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 h-16">
              {/* Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hidden md:flex"
              >
                {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </Button>
              
              {/* Center Search Bar */}
              <div className="flex-1 max-w-2xl mx-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search proposals, customers, or products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/80 border-green-200 focus:border-emerald-400 focus:ring-emerald-300 shadow-sm"
                  />
                </form>
              </div>

              {/* Right Profile Section */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl || "/placeholder-user.jpg"} alt={user?.fullName || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                          {user?.firstName && user?.lastName
                            ? `${user.firstName[0]}${user.lastName[0]}`
                            : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1 bg-white/95 backdrop-blur-md border-gray-200 shadow-xl">
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
                    <DropdownMenuSeparator />
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
          <main className="flex-1 overflow-x-hidden bg-gradient-to-br from-gray-50/50 to-slate-100/50 min-w-0">
            <div className="w-full h-full">{children}</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Button - Fixed position */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50 bg-white/90 hover:bg-white text-gray-900 shadow-lg">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-gradient-to-b from-green-50/95 to-emerald-50/95 backdrop-blur-md">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                <div className="bg-transparent p-2 rounded-xl shadow-lg">
                        <Image 
                          src={logoSrc}
                          alt="Evergreen Energy Upgrades Logo" 
                          width={150}
                          height={60}
                    className="h-12 w-auto object-contain"
                          priority
                          onError={handleLogoError}
                        />
                      </div>
                <div className="ml-3">
                  <span className="text-lg font-semibold text-gray-900">Evergreen Home Upgrades</span>
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
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-emerald-100/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

      {/* Desktop Sidebar without hover functionality */}
        <motion.aside 
          className={cn(
            "hidden md:block flex-shrink-0 relative",
            sidebarCollapsed ? "w-20" : "w-72"
          )}
          animate={{ width: sidebarCollapsed ? 80 : 288 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Sidebar Container - Fixed positioning that fills available space */}
        <div className={cn(
          "fixed inset-y-0 left-0 top-0 bottom-0 bg-gradient-to-b from-green-50/95 to-emerald-50/95 backdrop-blur-xl border-r border-green-200/50 shadow-lg z-30 transition-all duration-300 flex flex-col overflow-x-hidden",
          sidebarCollapsed ? "w-20" : "w-72"
        )}>
          {/* Logo and Title Section */}
          <div className={cn(
            "border-b border-emerald-200/50 transition-all duration-300",
            sidebarCollapsed ? "p-2" : "p-4"
          )}>
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className={cn(
                "bg-transparent rounded-xl shadow-lg flex-shrink-0 transition-all duration-300",
                sidebarCollapsed ? "p-1" : "p-2"
              )}>
                <Image 
                  src={logoSrc}
                  alt="Evergreen Energy Upgrades Logo" 
                  width={120}
                  height={48}
                  className={cn(
                    "w-auto object-contain transition-all duration-300",
                    sidebarCollapsed ? "h-8" : "h-10"
                  )}
                  priority
                  onError={handleLogoError}
                />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-gray-900 truncate">Evergreen Home Upgrades</span>
                  <span className="text-xs text-emerald-600 font-medium truncate">Sales Dashboard</span>
                </div>
              )}
            </Link>
          </div>
          
            {/* Navigation - Flex grow to fill available space */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 space-y-2 overflow-x-hidden">
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
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-green-100/95 to-emerald-100/95 backdrop-blur-md border-b border-green-200/50 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 h-16">
            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
            
            {/* Center Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search proposals, customers, or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/80 border-green-200 focus:border-emerald-400 focus:ring-emerald-300 shadow-sm"
                />
              </form>
            </div>

            {/* Right Profile Section */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl || "/placeholder-user.jpg"} alt={user?.fullName || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName[0]}${user.lastName[0]}`
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 bg-white/95 backdrop-blur-md border-gray-200 shadow-xl">
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
                  <DropdownMenuSeparator />
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
        <main className="flex-1 overflow-x-hidden bg-gradient-to-br from-gray-50/50 to-slate-100/50 min-w-0">
          <div className="w-full h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
