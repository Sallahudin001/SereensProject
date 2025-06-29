"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Shield,
  User,
  UserPlus,
  MoreHorizontal,
  UserX,
  UserCheck,
  Loader2,
  Settings,
  Mail,
  Calendar,
  Edit,
  Trash2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SystemUser {
  id: string;
  clerk_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
  max_discount_percent: number;
  can_approve_discounts: boolean;
  user_type: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Dialog states
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState(false)
  
  // Selected user for actions
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  
  // Loading states
  const [submitting, setSubmitting] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  
  // Form data for adding/editing users
  const [formData, setFormData] = useState({
    email: "",
    role: "user"
  })

  // Fetch all users from the system
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load users')
      }
      
      setUsers(data.users || [])
      
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle adding a new user
  const handleAddUser = () => {
    setFormData({
      email: "",
      role: "user"
    })
    setSelectedUser(null)
    setShowAddUserDialog(true)
  }

  // Handle editing an existing user
  const handleEditUser = (user: SystemUser) => {
    setFormData({
      email: user.email,
      role: user.role
    })
    setSelectedUser(user)
    setShowEditUserDialog(true)
  }

  // Handle confirming user deletion
  const handleDeleteUser = (user: SystemUser) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  // Handle permanent user deletion
  const handlePermanentDeleteUser = (user: SystemUser) => {
    setSelectedUser(user)
    setShowPermanentDeleteDialog(true)
  }

  // Submit add user form
  const handleSubmitAddUser = async () => {
    if (!formData.email) {
      toast({
        title: "Validation Error",
        description: "Please provide an email address",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create user invitation')
      }
      
      toast({
        title: "User Invitation Sent",
        description: `An invitation has been sent to ${formData.email}`,
      })
      
      setShowAddUserDialog(false)
      
      // Refresh users list after a short delay to allow Clerk to process
      setTimeout(() => {
        fetchUsers()
      }, 2000)
      
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user invitation",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Submit edit user form
  const handleSubmitEditUser = async () => {
    if (!selectedUser || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_id: selectedUser.clerk_id,
          role: formData.role,
         
          email: formData.email
        })
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update user')
      }
      
      // Update user in the list
      setUsers(users => 
        users.map(user => 
          user.id === selectedUser.id 
            ? { 
                ...user, 
                role: formData.role,
                email: formData.email
              }
            : user
        )
      )
      
      toast({
        title: "User Updated",
        description: `${formData.email} has been updated successfully`
      })
      
      setShowEditUserDialog(false)
      
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Confirm and execute user deletion (actually demotes to user role)
  const handleConfirmDeleteUser = async () => {
    if (!selectedUser) return

    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/admin/users?id=${selectedUser.clerk_id}&action=demote`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to remove user')
      }
      
      // Update user role in the list to 'user'
      setUsers(users => 
        users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: 'user' }
            : user
        )
      )
      
      toast({
        title: "User Access Removed",
        description: `${selectedUser.email} has been demoted to regular user`
      })
      
      setShowDeleteDialog(false)
      
    } catch (error) {
      console.error('Error removing user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove user access",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Confirm and execute permanent user deletion
  const handleConfirmPermanentDeleteUser = async () => {
    if (!selectedUser) return

    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/admin/users?id=${selectedUser.clerk_id}&action=delete`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to permanently delete user')
      }
      
      // Remove user from the list completely
      setUsers(users => users.filter(user => user.id !== selectedUser.id))
      
      toast({
        title: "User Permanently Deleted",
        description: `${selectedUser.email} has been permanently removed from the system`
      })
      
      setShowPermanentDeleteDialog(false)
      
    } catch (error) {
      console.error('Error permanently deleting user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to permanently delete user",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Filter users based on search query
  const filteredUsers = users.filter(
    user => 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get role badge variant
  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    return role === 'admin' ? 'default' : 'secondary'
  }

  // Get role icon
  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : User
  }

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Add, remove, and manage user accounts and permissions
          </p>
        </div>
        <Button onClick={handleAddUser} className="bg-emerald-600 hover:bg-emerald-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>System Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Manage all users with access to the system
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
              disabled={loading}
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading users...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "No users found matching your search." : "No users found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const RoleIcon = getRoleIcon(user.role)
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                                  <span className="text-xs font-medium text-white">
                                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {user.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center space-x-1 w-fit">
                              <RoleIcon className="h-3 w-3" />
                              <span className="capitalize">{user.role}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(user.last_login)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteUser(user)}
                                  className="text-orange-600"
                                  disabled={user.role === 'user'}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Remove Admin Access
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handlePermanentDeleteUser(user)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Permanently Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user to join the system. The user will be prompted to set their name during registration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAddUser} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_email" className="text-right">
                Email
              </Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_role" className="text-right">
                Role
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEditUser} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin Access</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove administrative privileges from{" "}
              <strong>
                {selectedUser?.first_name} {selectedUser?.last_name}
              </strong>
              . They will be demoted to a regular user account.
              <br />
              <br />
              This action can be reversed by editing the user and changing their role back to Administrator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteUser}
              disabled={submitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Admin Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete User Confirmation Dialog */}
      <AlertDialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Permanently Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>This action cannot be undone!</strong>
              <br />
              <br />
              You are about to permanently delete{" "}
              <strong>
                {selectedUser?.first_name} {selectedUser?.last_name}
              </strong>{" "}
              from the entire system. This will:
              <br />
              <br />
              • Remove their account from the authentication system
              <br />
              • Delete all their associated data
              <br />
              • Revoke all access immediately
              <br />
              <br />
              <strong>This action is irreversible.</strong> The user will need to be re-invited to regain access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPermanentDeleteUser}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Permanently Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}