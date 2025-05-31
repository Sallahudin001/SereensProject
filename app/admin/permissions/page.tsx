"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Search,
  Shield,
  User,
  UserCheck,
  UserX,
  Loader2,
  Settings
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
  last_login?: string;
  created_at: string;
  updated_at: string;
  user_type: string;
}

export default function PermissionsPage() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // Fetch all users from the system
  useEffect(() => {
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
    
    fetchUsers()
  }, [])

  // Handle role change
  const handleChangeRole = (user: SystemUser) => {
    setSelectedUser(user)
    setShowRoleDialog(true)
  }

  const handleUpdateRole = async (newRole: string) => {
    if (!selectedUser) return

    setUpdating(selectedUser.id)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_id: selectedUser.clerk_id,
          role: newRole,
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name
        })
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update user role')
      }
      
      // Update user in the list
      setUsers(users => 
        users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: newRole }
            : user
        )
      )
      
      toast({
        title: "Role Updated",
        description: `${selectedUser.first_name} ${selectedUser.last_name} is now ${newRole === 'admin' ? 'an Administrator' : 'a User'}`
      })
      
      setShowRoleDialog(false)
      setSelectedUser(null)
      
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive"
      })
    } finally {
      setUpdating(null)
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
  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary'
  }

  // Get role icon
  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : User
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and permissions for existing system users
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>System Users</CardTitle>
            <CardDescription>
              View and manage permissions for all users in the system
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
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const RoleIcon = getRoleIcon(user.role)
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <RoleIcon className="h-4 w-4 text-muted-foreground" />
                              {user.first_name} {user.last_name}
                            </div>
                      </TableCell>
                          <TableCell>{user.email}</TableCell>
                      <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                              {user.role}
                            </Badge>
                      </TableCell>
                      <TableCell>
                            {user.last_login 
                              ? new Date(user.last_login).toLocaleDateString() 
                              : "Never"}
                      </TableCell>
                      <TableCell>
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleChangeRole(user)}
                              disabled={updating === user.id}
                              title="Change user role"
                            >
                              {updating === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Settings className="h-4 w-4" />
                              )}
                              <span className="sr-only">Change Role</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        {searchQuery ? "No users found matching your search." : "No users found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
            </CardContent>
          </Card>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
            </DialogHeader>
          <div className="py-4">
            <div className="text-sm text-muted-foreground mb-4">
              Current role: <Badge variant={selectedUser ? getRoleBadgeVariant(selectedUser.role) : 'secondary'} className="capitalize">
                {selectedUser?.role}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Select new role:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedUser?.role === 'admin' ? 'secondary' : 'default'}
                  onClick={() => handleUpdateRole('admin')}
                  disabled={updating !== null || selectedUser?.role === 'admin'}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                  {selectedUser?.role === 'admin' && (
                    <UserCheck className="h-4 w-4 ml-auto" />
                  )}
                </Button>
                <Button
                  variant={selectedUser?.role === 'user' ? 'secondary' : 'outline'}
                  onClick={() => handleUpdateRole('user')}
                  disabled={updating !== null || selectedUser?.role === 'user'}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  User
                  {selectedUser?.role === 'user' && (
                    <UserCheck className="h-4 w-4 ml-auto" />
                  )}
                </Button>
              </div>
              </div>
            </div>
            <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRoleDialog(false)}
              disabled={updating !== null}
            >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}
