"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldOff,
  Mail,
  RefreshCcw
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const ROLES = {
  admin: {
    name: "Administrator",
    description: "Full access to all features",
    color: "bg-rose-100 text-rose-800"
  },
  manager: {
    name: "Manager",
    description: "Can manage proposals and approve discounts",
    color: "bg-amber-100 text-amber-800"
  },
  rep: {
    name: "Sales Rep",
    description: "Can create and manage own proposals",
    color: "bg-blue-100 text-blue-800"
  },
  viewer: {
    name: "Viewer",
    description: "View-only access to proposals and reports",
    color: "bg-gray-100 text-gray-800"
  }
}

export default function UserManagementPage() {
  const headerSection = useScrollAnimation({ threshold: 0.1 })
  const contentSection = useScrollAnimation()
  const router = useRouter()
  
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  // User form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "rep",
    active: true,
    canApproveDiscounts: false,
    canEditPricing: false,
    canManageUsers: false,
    maxDiscountPercent: "10",
  })
  
  // Mock data for the example
  useEffect(() => {
    // In a real implementation, fetch from an API
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          name: "Admin User",
          email: "admin@evergreenenergy.io",
          role: "admin",
          active: true,
          lastLogin: "2025-05-14T10:30:00Z",
          canApproveDiscounts: true,
          canEditPricing: true,
          canManageUsers: true,
          maxDiscountPercent: "100",
          avatar: null
        },
        {
          id: 2,
          name: "Manager User",
          email: "manager@evergreenenergy.io",
          role: "manager",
          active: true,
          lastLogin: "2025-05-13T15:45:00Z",
          canApproveDiscounts: true,
          canEditPricing: true,
          canManageUsers: false,
          maxDiscountPercent: "25",
          avatar: null
        },
        {
          id: 3,
          name: "Sales Rep",
          email: "rep@evergreenenergy.io",
          role: "rep",
          active: true,
          lastLogin: "2025-05-14T09:20:00Z",
          canApproveDiscounts: false,
          canEditPricing: false,
          canManageUsers: false,
          maxDiscountPercent: "10",
          avatar: null
        },
        {
          id: 4,
          name: "Inactive User",
          email: "inactive@evergreenenergy.io",
          role: "rep",
          active: false,
          lastLogin: "2025-04-01T11:15:00Z",
          canApproveDiscounts: false,
          canEditPricing: false,
          canManageUsers: false,
          maxDiscountPercent: "10",
          avatar: null
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])
  
  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      role: "rep",
      active: true,
      canApproveDiscounts: false,
      canEditPricing: false,
      canManageUsers: false,
      maxDiscountPercent: "10",
    })
    setShowDialog(true)
  }
  
  const handleEditUser = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      canApproveDiscounts: user.canApproveDiscounts,
      canEditPricing: user.canEditPricing,
      canManageUsers: user.canManageUsers,
      maxDiscountPercent: user.maxDiscountPercent,
    })
    setShowDialog(true)
  }
  
  const handleDeleteUser = (userId) => {
    // In a real implementation, this would call an API
    setUsers(users.filter(user => user.id !== userId))
    
    toast({
      title: "User deleted",
      description: "The user has been removed successfully."
    })
  }
  
  const handleSaveUser = () => {
    // In a real implementation, this would call an API
    if (editingUser) {
      // Edit existing user
      setUsers(users.map(user => 
        user.id === editingUser.id ? { ...user, ...formData } : user
      ))
      
      toast({
        title: "User updated",
        description: "The user has been updated successfully."
      })
    } else {
      // Add new user
      const newId = Math.max(...users.map(user => user.id), 0) + 1
      setUsers([
        ...users,
        { 
          id: newId, 
          ...formData, 
          lastLogin: null,
          avatar: null 
        }
      ])
      
      toast({
        title: "User added",
        description: "The new user has been added successfully."
      })
    }
    
    setShowDialog(false)
  }
  
  const handleToggleUserActive = (userId, currentActive) => {
    // In a real implementation, this would call an API
    setUsers(users.map(user => 
      user.id === userId ? { ...user, active: !currentActive } : user
    ))
    
    toast({
      title: currentActive ? "User deactivated" : "User activated",
      description: `The user has been ${currentActive ? "deactivated" : "activated"} successfully.`
    })
  }
  
  const handleSendResetPasswordEmail = (userId) => {
    // In a real implementation, this would call an API
    toast({
      title: "Password reset email sent",
      description: "A password reset email has been sent to the user."
    })
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return "Never"
    
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <motion.div
        ref={headerSection.ref}
        initial="hidden"
        animate={headerSection.isInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-500">Manage your system users and their permissions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            className="bg-rose-600 hover:bg-rose-700" 
            onClick={handleAddUser}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </motion.div>

      <motion.div
        ref={contentSection.ref}
        initial="hidden"
        animate={contentSection.isInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>Manage users and their permissions</CardDescription>
            
            {/* Search input */}
            <div className="relative w-full max-w-sm mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {searchQuery ? "No users found matching your search" : "No users found. Add your first user to get started."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
                        <TableRow key={user.id} className={!user.active ? "opacity-60" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar || ""} />
                                <AvatarFallback className="bg-rose-100 text-rose-800">
                                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={ROLES[user.role].color}>
                              {ROLES[user.role].name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.canApproveDiscounts && (
                                <Badge variant="outline" className="text-xs">
                                  Approve Discounts
                                </Badge>
                              )}
                              {user.canEditPricing && (
                                <Badge variant="outline" className="text-xs">
                                  Edit Pricing
                                </Badge>
                              )}
                              {user.canManageUsers && (
                                <Badge variant="outline" className="text-xs">
                                  Manage Users
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.lastLogin)}</TableCell>
                          <TableCell>
                            <Badge variant={user.active ? "default" : "destructive"}>
                              {user.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleUserActive(user.id, user.active)}>
                                  {user.active ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendResetPasswordEmail(user.id)}>
                                  <RefreshCcw className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Add/Edit User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Update user details and permissions" 
                : "Create a new user account and set permissions"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.role}
                  onValueChange={(value) => {
                    const role = value;
                    let updatedData = {...formData, role};
                    
                    // Auto-set permissions based on role
                    if (role === 'admin') {
                      updatedData = {
                        ...updatedData,
                        canApproveDiscounts: true,
                        canEditPricing: true,
                        canManageUsers: true,
                        maxDiscountPercent: "100"
                      };
                    } else if (role === 'manager') {
                      updatedData = {
                        ...updatedData,
                        canApproveDiscounts: true,
                        canEditPricing: true,
                        canManageUsers: false,
                        maxDiscountPercent: "25"
                      };
                    } else if (role === 'rep') {
                      updatedData = {
                        ...updatedData,
                        canApproveDiscounts: false,
                        canEditPricing: false,
                        canManageUsers: false,
                        maxDiscountPercent: "10"
                      };
                    } else {
                      updatedData = {
                        ...updatedData,
                        canApproveDiscounts: false,
                        canEditPricing: false,
                        canManageUsers: false,
                        maxDiscountPercent: "0"
                      };
                    }
                    
                    setFormData(updatedData);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="rep">Sales Rep</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                />
              </div>
            </div>
            
            <div className="border-t mt-2 pt-4">
              <h3 className="text-sm font-medium mb-2">Permissions</h3>
              
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label htmlFor="canApproveDiscounts" className="text-right">
                  Approve Discounts
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="canApproveDiscounts"
                    checked={formData.canApproveDiscounts}
                    onCheckedChange={(checked) => setFormData({...formData, canApproveDiscounts: checked})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label htmlFor="canEditPricing" className="text-right">
                  Edit Pricing
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="canEditPricing"
                    checked={formData.canEditPricing}
                    onCheckedChange={(checked) => setFormData({...formData, canEditPricing: checked})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label htmlFor="canManageUsers" className="text-right">
                  Manage Users
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="canManageUsers"
                    checked={formData.canManageUsers}
                    onCheckedChange={(checked) => setFormData({...formData, canManageUsers: checked})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label htmlFor="maxDiscountPercent" className="text-right">
                  Max Discount %
                </Label>
                <Input
                  id="maxDiscountPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.maxDiscountPercent}
                  onChange={(e) => setFormData({...formData, maxDiscountPercent: e.target.value})}
                  className="col-span-3 max-w-[100px]"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700"
              onClick={handleSaveUser}
              disabled={!formData.name || !formData.email}
            >
              {editingUser ? "Update User" : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
} 