"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, CheckCircle, AlertCircle } from "lucide-react"
import { QuickNav } from "@/components/admin/quick-nav"

// Mock role data
const initialRoles = [
  {
    id: 1,
    name: "Admin",
    description: "Full system access with all permissions",
    userCount: 2,
    isDefault: false,
    isSystem: true,
    permissions: [
      "view_all",
      "edit_all",
      "manage_users",
      "manage_pricing",
      "manage_contracts",
      "view_customers",
      "edit_customers",
      "view_pricing",
      "edit_pricing",
      "create_proposals",
      "view_reports",
    ],
  },
  {
    id: 2,
    name: "Manager",
    description: "Can manage most aspects of the system except user administration",
    userCount: 3,
    isDefault: false,
    isSystem: true,
    permissions: ["view_all", "edit_customers", "view_pricing", "edit_pricing", "view_reports", "create_proposals"],
  },
  {
    id: 3,
    name: "Sales Rep",
    description: "Can manage customers and create proposals",
    userCount: 8,
    isDefault: true,
    isSystem: true,
    permissions: ["view_customers", "edit_customers", "view_pricing", "create_proposals"],
  },
  {
    id: 4,
    name: "Support",
    description: "Can view customer information and provide support",
    userCount: 2,
    isDefault: false,
    isSystem: true,
    permissions: ["view_customers"],
  },
  {
    id: 5,
    name: "Custom Role",
    description: "Custom role with specific permissions",
    userCount: 1,
    isDefault: false,
    isSystem: false,
    permissions: ["view_customers", "view_pricing", "create_proposals"],
  },
]

// Available permissions
const availablePermissions = [
  { value: "view_all", label: "View All Data", description: "Can view all data in the system" },
  { value: "edit_all", label: "Edit All Data", description: "Can edit all data in the system" },
  { value: "manage_users", label: "Manage Users", description: "Can add, edit, and delete users" },
  { value: "manage_pricing", label: "Manage Pricing", description: "Can update pricing information" },
  { value: "manage_contracts", label: "Manage Contracts", description: "Can create and edit contract templates" },
  { value: "view_customers", label: "View Customers", description: "Can view customer information" },
  { value: "edit_customers", label: "Edit Customers", description: "Can edit customer information" },
  { value: "view_pricing", label: "View Pricing", description: "Can view pricing information" },
  { value: "edit_pricing", label: "Edit Pricing", description: "Can edit pricing information" },
  { value: "create_proposals", label: "Create Proposals", description: "Can create new proposals" },
  { value: "view_reports", label: "View Reports", description: "Can view reports and analytics" },
]

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [roles, setRoles] = useState(initialRoles)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false)
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    isDefault: false,
    permissions: [],
  })

  // Filter roles based on search query and active tab
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "system") return matchesSearch && role.isSystem
    if (activeTab === "custom") return matchesSearch && !role.isSystem

    return matchesSearch
  })

  const handleAddRole = () => {
    const newId = Math.max(0, ...roles.map((role) => role.id)) + 1
    setRoles([
      ...roles,
      {
        id: newId,
        name: newRole.name,
        description: newRole.description,
        userCount: 0,
        isDefault: newRole.isDefault,
        isSystem: false,
        permissions: newRole.permissions,
      },
    ])
    setNewRole({
      name: "",
      description: "",
      isDefault: false,
      permissions: [],
    })
    setShowAddRoleDialog(false)
  }

  const handleEditRole = (role) => {
    setSelectedRole({ ...role })
    setShowEditRoleDialog(true)
  }

  const handleSaveEdit = () => {
    // If this role is being set as default, unset any other default roles
    let updatedRoles = [...roles]
    if (selectedRole.isDefault) {
      updatedRoles = updatedRoles.map((role) => ({
        ...role,
        isDefault: role.id === selectedRole.id,
      }))
    }

    setRoles(updatedRoles.map((role) => (role.id === selectedRole.id ? selectedRole : role)))
    setShowEditRoleDialog(false)
  }

  const handleDeleteRole = (id) => {
    setRoles(roles.filter((role) => role.id !== id))
  }

  const handleTogglePermission = (permission, target) => {
    if (target === "new") {
      if (newRole.permissions.includes(permission)) {
        setNewRole({
          ...newRole,
          permissions: newRole.permissions.filter((p) => p !== permission),
        })
      } else {
        setNewRole({
          ...newRole,
          permissions: [...newRole.permissions, permission],
        })
      }
    } else if (target === "edit") {
      if (selectedRole.permissions.includes(permission)) {
        setSelectedRole({
          ...selectedRole,
          permissions: selectedRole.permissions.filter((p) => p !== permission),
        })
      } else {
        setSelectedRole({
          ...selectedRole,
          permissions: [...selectedRole.permissions, permission],
        })
      }
    }
  }

  const handleSetDefault = (id) => {
    setRoles(
      roles.map((role) => ({
        ...role,
        isDefault: role.id === id,
      })),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Role & Permission Management</h1>
          <p className="text-muted-foreground mt-1">Manage roles and their permissions in the system.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>Create a new role with custom permissions.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="e.g. Senior Sales Rep"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Input
                    id="role-description"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Brief description of this role"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-default"
                    checked={newRole.isDefault}
                    onCheckedChange={(checked) => setNewRole({ ...newRole, isDefault: checked })}
                  />
                  <Label htmlFor="is-default">Make this the default role for new users</Label>
                </div>
                <div className="space-y-4">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => {
                      const isGranted = newRole.permissions.includes(permission.value)
                      return (
                        <div key={permission.value} className="flex items-start space-x-3 bg-muted/30 p-3 rounded-md">
                          <Switch
                            id={`new-permission-${permission.value}`}
                            checked={isGranted}
                            onCheckedChange={() => handleTogglePermission(permission.value, "new")}
                          />
                          <div className="space-y-1">
                            <Label
                              htmlFor={`new-permission-${permission.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddRoleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRole} disabled={!newRole.name}>
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <QuickNav />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search roles..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Roles</TabsTrigger>
          <TabsTrigger value="system">System Roles</TabsTrigger>
          <TabsTrigger value="custom">Custom Roles</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.isSystem ? "System" : "Custom"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{role.userCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {role.isDefault ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Default
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          >
                            <AlertCircle className="mr-1 h-3 w-3" />
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {role.permissions.length} permissions
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditRole(role)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            {!role.isDefault && (
                              <DropdownMenuItem onClick={() => handleSetDefault(role.id)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Set as Default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              View Users
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!role.isSystem && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteRole(role.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Role
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">
                {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      {selectedRole && (
        <Dialog open={showEditRoleDialog} onOpenChange={setShowEditRoleDialog}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>Update role details and permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input
                  id="edit-role-name"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                  disabled={selectedRole.isSystem}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role-description">Description</Label>
                <Input
                  id="edit-role-description"
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is-default"
                  checked={selectedRole.isDefault}
                  onCheckedChange={(checked) => setSelectedRole({ ...selectedRole, isDefault: checked })}
                />
                <Label htmlFor="edit-is-default">Make this the default role for new users</Label>
              </div>
              <div className="space-y-4">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.map((permission) => {
                    const isGranted = selectedRole.permissions.includes(permission.value)
                    return (
                      <div key={permission.value} className="flex items-start space-x-3 bg-muted/30 p-3 rounded-md">
                        <Switch
                          id={`edit-permission-${permission.value}`}
                          checked={isGranted}
                          onCheckedChange={() => handleTogglePermission(permission.value, "edit")}
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor={`edit-permission-${permission.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditRoleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
