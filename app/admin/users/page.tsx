"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Plus, 
  Search,
  Edit,
  Trash2,
  Shield, 
  User,
  Key,
  Loader2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface AdminUser {
  id: number;
  role_id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  last_login: string;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Dialogs
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  
  // Editing state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  
  // User form state
  const [formFirstName, setFormFirstName] = useState("")
  const [formLastName, setFormLastName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formRoleId, setFormRoleId] = useState<number | null>(null)
  const [formPassword, setFormPassword] = useState("")
  const [formIsActive, setFormIsActive] = useState(true)
  
  // Role form state
  const [formRoleName, setFormRoleName] = useState("")
  const [formRoleDescription, setFormRoleDescription] = useState("")
  const [formRolePermissions, setFormRolePermissions] = useState<number[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, these would be API calls
        // const usersResponse = await fetch('/api/admin/users');
        // const rolesResponse = await fetch('/api/admin/roles');
        // const permissionsResponse = await fetch('/api/admin/permissions');
        
        // if (!usersResponse.ok || !rolesResponse.ok || !permissionsResponse.ok) {
        //   throw new Error('Failed to fetch data');
        // }
        
        // const usersData = await usersResponse.json();
        // const rolesData = await rolesResponse.json();
        // const permissionsData = await permissionsResponse.json();
        
        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const usersData = [
          {
            id: 1,
            role_id: 1,
            first_name: "Admin",
            last_name: "User",
            email: "admin@example.com",
            is_active: true,
            last_login: "2023-07-15T14:30:00Z"
          },
          {
            id: 2,
            role_id: 2,
            first_name: "Sales",
            last_name: "Manager",
            email: "sales@example.com",
            is_active: true,
            last_login: "2023-07-14T11:45:00Z"
          },
          {
            id: 3,
            role_id: 3,
            first_name: "Field",
            last_name: "Technician",
            email: "tech@example.com",
            is_active: true,
            last_login: "2023-07-13T09:15:00Z"
          }
        ];
        
        const rolesData = [
          {
            id: 1,
            name: "Administrator",
            description: "Full system access"
          },
          {
            id: 2,
            name: "Sales Manager",
            description: "Manages sales team and proposals"
          },
          {
            id: 3,
            name: "Technician",
            description: "Field work and installation"
          }
        ];
        
        const permissionsData = [
  {
    id: 1,
            name: "products:read",
            description: "View products"
  },
  {
    id: 2,
            name: "products:write",
            description: "Create/edit products"
  },
  {
    id: 3,
            name: "pricing:read",
            description: "View pricing"
  },
  {
    id: 4,
            name: "pricing:write",
            description: "Update pricing"
  },
  {
    id: 5,
            name: "users:read",
            description: "View users"
          },
          {
            id: 6,
            name: "users:write",
            description: "Manage users"
          }
        ];
        
        setUsers(usersData);
        setRoles(rolesData);
        setPermissions(permissionsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Reset form values
  const resetUserForm = () => {
    setFormFirstName("");
    setFormLastName("");
    setFormEmail("");
    setFormRoleId(null);
    setFormPassword("");
    setFormIsActive(true);
  };
  
  const resetRoleForm = () => {
    setFormRoleName("");
    setFormRoleDescription("");
    setFormRolePermissions([]);
  };
  
  // Handle add/edit user
  const handleAddUser = () => {
    setEditingUser(null);
    resetUserForm();
    setShowUserDialog(true);
  };
  
  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormFirstName(user.first_name);
    setFormLastName(user.last_name);
    setFormEmail(user.email);
    setFormRoleId(user.role_id);
    setFormPassword(""); // Don't prefill password
    setFormIsActive(user.is_active);
    setShowUserDialog(true);
  };
  
  const handleSaveUser = async () => {
    // Validate form
    if (!formFirstName || !formLastName || !formEmail || !formRoleId) {
      toast({
        title: "Validation Error",
        description: "All fields except password are required",
        variant: "destructive"
      });
      return;
    }
    
    if (editingUser) {
      // Update existing user
      setUsers(users => 
        users.map(user => 
          user.id === editingUser.id 
            ? {
                ...user,
                first_name: formFirstName,
                last_name: formLastName,
                email: formEmail,
                role_id: formRoleId,
                is_active: formIsActive
              } 
            : user
        )
      );
      
      toast({
        title: "User Updated",
        description: "User has been updated successfully"
      });
    } else {
      // Add new user
      const newId = Math.max(0, ...users.map(u => u.id)) + 1;
      
      setUsers(users => [
      ...users,
      {
        id: newId,
          first_name: formFirstName,
          last_name: formLastName,
          email: formEmail,
          role_id: formRoleId,
          is_active: formIsActive,
          last_login: ""
        }
      ]);
      
      toast({
        title: "User Added",
        description: "New user has been added successfully"
      });
    }
    
    resetUserForm();
    setShowUserDialog(false);
  };
  
  // Handle add/edit role
  const handleAddRole = () => {
    setEditingRole(null);
    resetRoleForm();
    setShowRoleDialog(true);
  };
  
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormRoleName(role.name);
    setFormRoleDescription(role.description);
    // In a real app, you would fetch role permissions here
    setFormRolePermissions([1, 3]); // Example default permissions
    setShowRoleDialog(true);
  };
  
  const handleSaveRole = async () => {
    // Validate form
    if (!formRoleName) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (editingRole) {
      // Update existing role
      setRoles(roles => 
        roles.map(role => 
          role.id === editingRole.id 
            ? {
                ...role,
                name: formRoleName,
                description: formRoleDescription
              } 
            : role
        )
      );
      
      toast({
        title: "Role Updated",
        description: "Role has been updated successfully"
      });
    } else {
      // Add new role
      const newId = Math.max(0, ...roles.map(r => r.id)) + 1;
      
      setRoles(roles => [
        ...roles,
        {
          id: newId,
          name: formRoleName,
          description: formRoleDescription
        }
      ]);
      
      toast({
        title: "Role Added",
        description: "New role has been added successfully"
      });
    }
    
    resetRoleForm();
    setShowRoleDialog(false);
  };
  
  // Handle delete user
  const handleDeleteUser = (id: number) => {
    setUsers(users => users.filter(user => user.id !== id));
    
    toast({
      title: "User Deleted",
      description: "User has been deleted successfully"
    });
  };
  
  // Handle delete role
  const handleDeleteRole = (id: number) => {
    if (users.some(user => user.role_id === id)) {
      toast({
        title: "Cannot Delete",
        description: "This role has assigned users. Reassign them first.",
        variant: "destructive"
      });
      return;
    }
    
    setRoles(roles => roles.filter(role => role.id !== id));
    
    toast({
      title: "Role Deleted",
      description: "Role has been deleted successfully"
    });
  };
  
  // Toggle permission
  const togglePermission = (permissionId: number) => {
    if (formRolePermissions.includes(permissionId)) {
      setFormRolePermissions(formRolePermissions.filter(id => id !== permissionId));
    } else {
      setFormRolePermissions([...formRolePermissions, permissionId]);
    }
  };
  
  // Filter items based on search query
  const filteredUsers = users.filter(
    user => 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredRoles = roles.filter(
    role => role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get role name by ID
  const getRoleName = (id: number) => {
    return roles.find(role => role.id === id)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-2"
            onClick={activeTab === "users" ? handleAddUser : handleAddRole}
          >
            <Plus className="h-4 w-4" />
            <span>Add {activeTab === "users" ? "User" : "Role"}</span>
                </Button>
        </div>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>System Users</CardTitle>
              <CardDescription>
                  Manage users who have access to the admin system
              </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
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
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                      {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell className="font-medium">
                              {user.first_name} {user.last_name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{getRoleName(user.role_id)}</TableCell>
                        <TableCell>
                              {user.last_login 
                                ? new Date(user.last_login).toLocaleDateString() 
                                : "Never"}
                        </TableCell>
                        <TableCell>
                              <Switch checked={user.is_active} />
                        </TableCell>
                        <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                              </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                        </TableCell>
                      </TableRow>
                    ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No users found.
                          </TableCell>
                        </TableRow>
                  )}
                </TableBody>
              </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>
                  Manage roles and their associated permissions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
                <Input
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading roles...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell>{role.id}</TableCell>
                            <TableCell className="font-medium">{role.name}</TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell>
                              {users.filter(u => u.role_id === role.id).length}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditRole(role)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteRole(role.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No roles found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update the user details below"
                : "Fill out the form to create a new user"}
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="sm:text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
                className="sm:col-span-3"
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="sm:text-right">
                Last Name
              </Label>
                <Input
                id="lastName"
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
                className="sm:col-span-3"
                />
              </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="sm:text-right">
                Email
              </Label>
                <Input
                id="email"
                  type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="sm:col-span-3"
                />
              </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="sm:text-right">
                Role
              </Label>
              <select
                id="role"
                value={formRoleId || ""}
                onChange={(e) => setFormRoleId(Number(e.target.value))}
                className="sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
                </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="sm:text-right">
                {editingUser ? "New Password" : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="sm:col-span-3"
                placeholder={editingUser ? "Leave blank to keep current" : ""}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="sm:text-right">
                Active
              </Label>
              <div className="flex items-center space-x-2 sm:col-span-3">
                <Switch 
                  id="isActive" 
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
                <Label htmlFor="isActive">
                  {formIsActive ? "Yes" : "No"}
                </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                Cancel
              </Button>
            <Button onClick={handleSaveUser}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      
      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Add New Role"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update the role and its permissions"
                : "Create a new role and assign permissions"}
            </DialogDescription>
            </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="roleName" className="sm:text-right">
                Role Name
              </Label>
              <Input
                id="roleName"
                value={formRoleName}
                onChange={(e) => setFormRoleName(e.target.value)}
                className="sm:col-span-3"
              />
                </div>
            <div className="grid sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="roleDescription" className="sm:text-right">
                Description
              </Label>
              <Input
                id="roleDescription"
                value={formRoleDescription}
                onChange={(e) => setFormRoleDescription(e.target.value)}
                className="sm:col-span-3"
              />
              </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <Label className="sm:text-right pt-2">
                Permissions
              </Label>
              <div className="sm:col-span-3 border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`perm-${permission.id}`}
                        checked={formRolePermissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div>
                        <Label htmlFor={`perm-${permission.id}`} className="font-medium">
                          {permission.name}
                          </Label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </div>
            <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                Cancel
              </Button>
            <Button onClick={handleSaveRole}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}
