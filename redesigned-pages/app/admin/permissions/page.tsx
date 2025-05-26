"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Shield,
  Users,
  Plus,
  Trash2,
  Edit,
  Copy,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Settings,
  BarChart3,
} from "lucide-react"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Mock roles data
const initialRoles = [
  {
    id: 1,
    name: "Administrator",
    description: "Full system access with all permissions",
    users: 4,
    permissions: {
      dashboard: { view: true, edit: true },
      users: { view: true, create: true, edit: true, delete: true },
      pricing: { view: true, create: true, edit: true, delete: true },
      proposals: { view: true, create: true, edit: true, delete: true, approve: true },
      reports: { view: true, create: true, export: true },
      settings: { view: true, edit: true },
    },
  },
  {
    id: 2,
    name: "Sales Manager",
    description: "Manage sales team and view reports",
    users: 6,
    permissions: {
      dashboard: { view: true, edit: false },
      users: { view: true, create: false, edit: false, delete: false },
      pricing: { view: true, create: false, edit: true, delete: false },
      proposals: { view: true, create: true, edit: true, delete: true, approve: true },
      reports: { view: true, create: true, export: true },
      settings: { view: false, edit: false },
    },
  },
  {
    id: 3,
    name: "Sales Representative",
    description: "Create and manage proposals",
    users: 22,
    permissions: {
      dashboard: { view: true, edit: false },
      users: { view: false, create: false, edit: false, delete: false },
      pricing: { view: true, create: false, edit: false, delete: false },
      proposals: { view: true, create: true, edit: true, delete: false, approve: false },
      reports: { view: true, create: false, export: false },
      settings: { view: false, edit: false },
    },
  },
  {
    id: 4,
    name: "Support Staff",
    description: "Customer support and limited system access",
    users: 10,
    permissions: {
      dashboard: { view: true, edit: false },
      users: { view: true, create: false, edit: false, delete: false },
      pricing: { view: true, create: false, edit: false, delete: false },
      proposals: { view: true, create: false, edit: false, delete: false, approve: false },
      reports: { view: true, create: false, export: false },
      settings: { view: false, edit: false },
    },
  },
]

// Permission modules
const permissionModules = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: BarChart3,
    permissions: [
      { id: "view", name: "View Dashboard" },
      { id: "edit", name: "Customize Dashboard" },
    ],
  },
  {
    id: "users",
    name: "User Management",
    icon: Users,
    permissions: [
      { id: "view", name: "View Users" },
      { id: "create", name: "Create Users" },
      { id: "edit", name: "Edit Users" },
      { id: "delete", name: "Delete Users" },
    ],
  },
  {
    id: "pricing",
    name: "Pricing Management",
    icon: DollarSign,
    permissions: [
      { id: "view", name: "View Pricing" },
      { id: "create", name: "Create Pricing Items" },
      { id: "edit", name: "Edit Pricing" },
      { id: "delete", name: "Delete Pricing Items" },
    ],
  },
  {
    id: "proposals",
    name: "Proposals",
    icon: FileText,
    permissions: [
      { id: "view", name: "View Proposals" },
      { id: "create", name: "Create Proposals" },
      { id: "edit", name: "Edit Proposals" },
      { id: "delete", name: "Delete Proposals" },
      { id: "approve", name: "Approve Proposals" },
    ],
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    icon: BarChart3,
    permissions: [
      { id: "view", name: "View Reports" },
      { id: "create", name: "Create Reports" },
      { id: "export", name: "Export Reports" },
    ],
  },
  {
    id: "settings",
    name: "System Settings",
    icon: Settings,
    permissions: [
      { id: "view", name: "View Settings" },
      { id: "edit", name: "Edit Settings" },
    ],
  },
]

export default function PermissionsManagement() {
  const [roles, setRoles] = useState(initialRoles)
  const [activeTab, setActiveTab] = useState("roles")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false)
  const [editRole, setEditRole] = useState(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: {
      dashboard: { view: true, edit: false },
      users: { view: false, create: false, edit: false, delete: false },
      pricing: { view: false, create: false, edit: false, delete: false },
      proposals: { view: true, create: true, edit: true, delete: false, approve: false },
      reports: { view: true, create: false, export: false },
      settings: { view: false, edit: false },
    },
  })

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddRole = () => {
    const newId = Math.max(0, ...roles.map((role) => role.id)) + 1
    setRoles([
      ...roles,
      {
        id: newId,
        ...newRole,
        users: 0,
      },
    ])
    setNewRole({
      name: "",
      description: "",
      permissions: {
        dashboard: { view: true, edit: false },
        users: { view: false, create: false, edit: false, delete: false },
        pricing: { view: false, create: false, edit: false, delete: false },
        proposals: { view: true, create: true, edit: true, delete: false, approve: false },
        reports: { view: true, create: false, export: false },
        settings: { view: false, edit: false },
      },
    })
    setShowAddRoleDialog(false)
  }

  const handleEditRole = (role) => {
    setEditRole({ ...role })
    setShowEditDialog(true)
  }

  const handleSaveEdit = () => {
    setRoles(roles.map((role) => (role.id === editRole.id ? editRole : role)))
    setShowEditDialog(false)
  }

  const handleDeleteRole = (id) => {
    setRoles(roles.filter((role) => role.id !== id))
  }

  const handleDuplicateRole = (role) => {
    const newId = Math.max(0, ...roles.map((role) => role.id)) + 1
    const duplicatedRole = {
      ...role,
      id: newId,
      name: `${role.name} (Copy)`,
      users: 0,
    }
    setRoles([...roles, duplicatedRole])
  }

  const togglePermission = (roleId, module, permission, value) => {
    if (editRole && editRole.id === roleId) {
      setEditRole({
        ...editRole,
        permissions: {
          ...editRole.permissions,
          [module]: {
            ...editRole.permissions[module],
            [permission]: value,
          },
        },
      })
    }
  }

  const toggleNewRolePermission = (module, permission, value) => {
    setNewRole({
      ...newRole,
      permissions: {
        ...newRole.permissions,
        [module]: {
          ...newRole.permissions[module],
          [permission]: value,
        },
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Permissions Management</h1>
          <p className="text-muted-foreground mt-1">Manage roles and permissions for system access control.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>Define a new role and set its permissions.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Role Name</Label>
                      <Input
                        id="name"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="e.g. Sales Manager"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        placeholder="Brief description of this role"
                      />
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm font-medium mb-2">Role Information</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Roles define what users can see and do in the system. Each role has a specific set of permissions.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>Users can have only one role assigned at a time.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-4">Permissions</h3>
                  <div className="space-y-6">
                    {permissionModules.map((module) => (
                      <div key={module.id} className="border rounded-md p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <module.icon className="h-5 w-5 text-primary" />
                          </div>
                          <h4 className="text-base font-medium">{module.name}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {module.permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`new-${module.id}-${permission.id}`}
                                checked={newRole.permissions[module.id]?.[permission.id] || false}
                                onCheckedChange={(checked) =>
                                  toggleNewRolePermission(module.id, permission.id, checked)
                                }
                              />
                              <Label htmlFor={`new-${module.id}-${permission.id}`} className="text-sm font-normal">
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddRoleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRole}>Create Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
        <Button variant="outline" className="sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="roles" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions Overview</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{role.name}</CardTitle>
                      <CardDescription className="mt-1">{role.description}</CardDescription>
                    </div>
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
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateRole(role)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={role.users > 0}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Users with this role</div>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {role.users}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Key Permissions</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(role.permissions).map(([module, perms]) => {
                          const hasPermissions = Object.values(perms).some(Boolean)
                          if (!hasPermissions) return null

                          const moduleInfo = permissionModules.find((m) => m.id === module)
                          return (
                            <div key={module} className="flex items-center gap-1.5">
                              <div className="bg-muted rounded-full p-1">
                                {moduleInfo && <moduleInfo.icon className="h-3 w-3 text-muted-foreground" />}
                              </div>
                              <span className="text-xs">{moduleInfo?.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="border-t p-4">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleEditRole(role)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Manage Permissions
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>Overview of all roles and their permissions in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Permission</TableHead>
                      {roles.map((role) => (
                        <TableHead key={role.id} className="text-center">
                          {role.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissionModules.map((module) => (
                      <React.Fragment key={module.id}>
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={roles.length + 1} className="font-medium">
                            <div className="flex items-center gap-2">
                              <module.icon className="h-4 w-4" />
                              {module.name}
                            </div>
                          </TableCell>
                        </TableRow>
                        {module.permissions.map((permission) => (
                          <TableRow key={`${module.id}-${permission.id}`}>
                            <TableCell className="pl-8">{permission.name}</TableCell>
                            {roles.map((role) => (
                              <TableCell key={role.id} className="text-center">
                                {role.permissions[module.id]?.[permission.id] ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Changes Audit Log</CardTitle>
              <CardDescription>Track all changes made to roles and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      date: "2023-05-14 14:32:15",
                      user: "Admin",
                      action: "Role Modified",
                      details: "Updated permissions for 'Sales Representative' role",
                    },
                    {
                      date: "2023-05-12 09:45:22",
                      user: "Admin",
                      action: "Role Created",
                      details: "Created new role 'Support Staff'",
                    },
                    {
                      date: "2023-05-10 16:18:05",
                      user: "Admin",
                      action: "Permission Changed",
                      details: "Added 'Edit Pricing' permission to 'Sales Manager' role",
                    },
                    {
                      date: "2023-05-08 11:27:33",
                      user: "Admin",
                      action: "Role Modified",
                      details: "Updated permissions for 'Administrator' role",
                    },
                    {
                      date: "2023-05-05 15:42:19",
                      user: "Admin",
                      action: "User Role Changed",
                      details: "Changed John Smith's role from 'Sales Rep' to 'Sales Manager'",
                    },
                  ].map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">{log.date}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.action === "Role Created"
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : log.action === "Role Modified"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                          }
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">Showing 5 of 24 log entries</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      {editRole && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role: {editRole.name}</DialogTitle>
              <DialogDescription>Modify role details and permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Role Name</Label>
                    <Input
                      id="edit-name"
                      value={editRole.name}
                      onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={editRole.description}
                      onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="text-sm font-medium mb-2">Role Information</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    This role is currently assigned to {editRole.users} user{editRole.users !== 1 ? "s" : ""}. Changes
                    to permissions will affect all users with this role.
                  </p>
                  {editRole.users > 0 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>Users will receive updated permissions immediately.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-4">Permissions</h3>
                <div className="space-y-6">
                  {permissionModules.map((module) => (
                    <div key={module.id} className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <module.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h4 className="text-base font-medium">{module.name}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {module.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${module.id}-${permission.id}`}
                              checked={editRole.permissions[module.id]?.[permission.id] || false}
                              onCheckedChange={(checked) =>
                                togglePermission(editRole.id, module.id, permission.id, checked)
                              }
                            />
                            <Label htmlFor={`edit-${module.id}-${permission.id}`} className="text-sm font-normal">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
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
