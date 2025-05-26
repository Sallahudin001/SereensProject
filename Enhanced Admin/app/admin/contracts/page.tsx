"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Edit,
  Trash2,
  Eye,
  Copy,
  FileUp,
  CheckCircle,
  Clock,
  AlertCircle,
  History,
} from "lucide-react"
import { format } from "date-fns"

// Mock contract data
const initialContracts = [
  {
    id: 1,
    name: "Standard Roofing Contract",
    description: "Standard contract for roofing projects",
    category: "Roofing",
    version: "1.2",
    status: "Active",
    lastUpdated: new Date(2025, 3, 15),
    createdBy: "Admin",
    usageCount: 42,
  },
  {
    id: 2,
    name: "HVAC Installation Agreement",
    description: "Standard contract for HVAC installation projects",
    category: "HVAC",
    version: "2.0",
    status: "Active",
    lastUpdated: new Date(2025, 4, 2),
    createdBy: "Admin",
    usageCount: 28,
  },
  {
    id: 3,
    name: "Window Replacement Contract",
    description: "Standard contract for window replacement projects",
    category: "Windows",
    version: "1.1",
    status: "Active",
    lastUpdated: new Date(2025, 4, 10),
    createdBy: "Admin",
    usageCount: 35,
  },
  {
    id: 4,
    name: "Exterior Painting Agreement",
    description: "Standard contract for exterior painting projects",
    category: "Paint",
    version: "1.0",
    status: "Draft",
    lastUpdated: new Date(2025, 4, 12),
    createdBy: "Admin",
    usageCount: 0,
  },
  {
    id: 5,
    name: "Garage Door Installation",
    description: "Standard contract for garage door installation",
    category: "Garage Doors",
    version: "1.3",
    status: "Active",
    lastUpdated: new Date(2025, 4, 5),
    createdBy: "Admin",
    usageCount: 17,
  },
  {
    id: 6,
    name: "Solar Panel Installation",
    description: "Standard contract for solar panel installation",
    category: "Solar",
    version: "2.1",
    status: "Active",
    lastUpdated: new Date(2025, 3, 28),
    createdBy: "Admin",
    usageCount: 23,
  },
  {
    id: 7,
    name: "Multi-Service Bundle Agreement",
    description: "Contract template for bundled services",
    category: "Bundle",
    version: "1.0",
    status: "Draft",
    lastUpdated: new Date(2025, 4, 14),
    createdBy: "Admin",
    usageCount: 0,
  },
]

// Mock contract versions
const contractVersions = [
  {
    id: 1,
    contractId: 1,
    version: "1.2",
    changes: "Updated warranty terms and added material specifications",
    updatedBy: "Admin",
    updatedAt: new Date(2025, 3, 15),
    status: "Current",
  },
  {
    id: 2,
    contractId: 1,
    version: "1.1",
    changes: "Added payment schedule section",
    updatedBy: "Admin",
    updatedAt: new Date(2025, 2, 20),
    status: "Archived",
  },
  {
    id: 3,
    contractId: 1,
    version: "1.0",
    changes: "Initial version",
    updatedBy: "Admin",
    updatedAt: new Date(2025, 1, 10),
    status: "Archived",
  },
]

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [contracts, setContracts] = useState(initialContracts)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddContractDialog, setShowAddContractDialog] = useState(false)
  const [showVersionHistoryDialog, setShowVersionHistoryDialog] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)
  const [newContract, setNewContract] = useState({
    name: "",
    description: "",
    category: "Roofing",
    file: null,
    fileName: "",
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Filter contracts based on search query and active tab
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.category.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && contract.status === "Active"
    if (activeTab === "draft") return matchesSearch && contract.status === "Draft"
    if (activeTab === "archived") return matchesSearch && contract.status === "Archived"

    // Filter by category
    return matchesSearch && contract.category.toLowerCase() === activeTab.toLowerCase()
  })

  const handleAddContract = () => {
    // Simulate file upload
    setIsUploading(true)

    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // After "upload" completes, add the new contract
    setTimeout(() => {
      const newId = Math.max(0, ...contracts.map((contract) => contract.id)) + 1
      setContracts([
        ...contracts,
        {
          id: newId,
          name: newContract.name,
          description: newContract.description,
          category: newContract.category,
          version: "1.0",
          status: "Draft",
          lastUpdated: new Date(),
          createdBy: "Admin",
          usageCount: 0,
        },
      ])
      setNewContract({
        name: "",
        description: "",
        category: "Roofing",
        file: null,
        fileName: "",
      })
      setUploadProgress(0)
      setIsUploading(false)
      setShowAddContractDialog(false)
    }, 2500)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewContract({
        ...newContract,
        file: e.target.files[0],
        fileName: e.target.files[0].name,
      })
    }
  }

  const handleActivateContract = (id) => {
    setContracts(contracts.map((contract) => (contract.id === id ? { ...contract, status: "Active" } : contract)))
  }

  const handleArchiveContract = (id) => {
    setContracts(contracts.map((contract) => (contract.id === id ? { ...contract, status: "Archived" } : contract)))
  }

  const handleDeleteContract = (id) => {
    setContracts(contracts.filter((contract) => contract.id !== id))
  }

  const handleViewVersionHistory = (contract) => {
    setSelectedContract(contract)
    setShowVersionHistoryDialog(true)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      case "Draft":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
      case "Archived":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contract Management</h1>
          <p className="text-muted-foreground mt-1">Upload, manage, and track contract templates for your proposals.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddContractDialog} onOpenChange={setShowAddContractDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Upload New Contract</DialogTitle>
                <DialogDescription>Upload a new contract template to use in your proposals.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="contract-name">Contract Name</Label>
                  <Input
                    id="contract-name"
                    value={newContract.name}
                    onChange={(e) => setNewContract({ ...newContract, name: e.target.value })}
                    placeholder="e.g. Standard Roofing Contract"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contract-description">Description</Label>
                  <Textarea
                    id="contract-description"
                    value={newContract.description}
                    onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                    placeholder="Brief description of this contract template"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contract-category">Category</Label>
                  <Select
                    value={newContract.category}
                    onValueChange={(value) => setNewContract({ ...newContract, category: value })}
                  >
                    <SelectTrigger id="contract-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Roofing">Roofing</SelectItem>
                      <SelectItem value="HVAC">HVAC</SelectItem>
                      <SelectItem value="Windows">Windows & Doors</SelectItem>
                      <SelectItem value="Garage Doors">Garage Doors</SelectItem>
                      <SelectItem value="Paint">Paint</SelectItem>
                      <SelectItem value="Solar">Solar</SelectItem>
                      <SelectItem value="Bundle">Bundle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contract-file">Contract File</Label>
                  <div
                    className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => document.getElementById("contract-file").click()}
                  >
                    <FileUp className="h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT (Max 10MB)</p>
                    {newContract.fileName && (
                      <div className="mt-4 flex items-center gap-2 bg-muted p-2 rounded-md w-full">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate">{newContract.fileName}</span>
                      </div>
                    )}
                    <Input
                      id="contract-file"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 ease-in-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddContractDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddContract}
                  disabled={!newContract.name || !newContract.fileName || isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Contract"}
                </Button>
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
            placeholder="Search contracts..."
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

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="roofing">Roofing</TabsTrigger>
          <TabsTrigger value="hvac">HVAC</TabsTrigger>
          <TabsTrigger value="windows">Windows</TabsTrigger>
          <TabsTrigger value="garage doors">Garage Doors</TabsTrigger>
          <TabsTrigger value="paint">Paint</TabsTrigger>
          <TabsTrigger value="solar">Solar</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Contract Templates</CardTitle>
              <CardDescription>
                {filteredContracts.length} contract{filteredContracts.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="h-12 w-12 mb-4 opacity-20" />
                          <p className="text-lg font-medium">No contracts found</p>
                          <p className="text-sm">Upload a new contract to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <div className="font-medium">{contract.name}</div>
                          <div className="text-xs text-muted-foreground">{contract.description}</div>
                        </TableCell>
                        <TableCell>{contract.category}</TableCell>
                        <TableCell>v{contract.version}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeClass(contract.status)}>
                            {contract.status === "Active" ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : contract.status === "Draft" ? (
                              <Clock className="mr-1 h-3 w-3" />
                            ) : (
                              <AlertCircle className="mr-1 h-3 w-3" />
                            )}
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(contract.lastUpdated, "MMM d, yyyy")}</TableCell>
                        <TableCell>{contract.usageCount} proposals</TableCell>
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
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Contract
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewVersionHistory(contract)}>
                                <History className="mr-2 h-4 w-4" />
                                Version History
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {contract.status !== "Active" && (
                                <DropdownMenuItem onClick={() => handleActivateContract(contract.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {contract.status !== "Archived" && (
                                <DropdownMenuItem onClick={() => handleArchiveContract(contract.id)}>
                                  <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteContract(contract.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">
                Showing {filteredContracts.length} of {contracts.length} contracts
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistoryDialog} onOpenChange={setShowVersionHistoryDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              {selectedContract && `History of changes for ${selectedContract.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractVersions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>v{version.version}</TableCell>
                    <TableCell>{version.changes}</TableCell>
                    <TableCell>{version.updatedBy}</TableCell>
                    <TableCell>{format(version.updatedAt, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          version.status === "Current"
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        }
                      >
                        {version.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowVersionHistoryDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
