"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface HVACData {
  systemType: string
  tonnage: string
  seerRating: string
  addons: string[]
  systemCost: string
  ductworkCost: string
  showPricing: boolean
  showPriceBreakdown: boolean
  scopeNotes: string
}

interface HVACProductFormProps {
  data: HVACData
  updateData: (data: HVACData) => void
}

export default function HVACProductForm({ data, updateData }: HVACProductFormProps) {
  const [formData, setFormData] = useState<HVACData>({
    systemType: data.systemType || "hvac",
    tonnage: data.tonnage || "3",
    seerRating: data.seerRating || "14",
    addons: data.addons || [],
    systemCost: data.systemCost || "",
    ductworkCost: data.ductworkCost || "",
    showPricing: data.showPricing !== undefined ? data.showPricing : true,
    showPriceBreakdown: data.showPriceBreakdown !== undefined ? data.showPriceBreakdown : true,
    scopeNotes: data.scopeNotes || "",
  })

  const systemTypes = [
    { value: "ac-only", label: "AC Only", description: "Cooling system only" },
    { value: "furnace-only", label: "Furnace Only", description: "Heating system only" },
    { value: "hvac", label: "HVAC", description: "Combined heating and cooling system" },
    { value: "heat-pump", label: "Heat Pump", description: "Energy-efficient heating and cooling" },
  ]

  const tonnageOptions = ["2", "2.5", "3", "3.5", "4", "5"]
  const seerOptions = ["14", "18", "20"]

  const addonOptions = [
    { value: "attic-install", label: "Attic Installation", description: "Installation in attic space" },
    { value: "power-line", label: "New Power Line", description: "Electrical upgrades for system" },
    { value: "copper-lines", label: "New Copper/Duct Lines", description: "New refrigerant and duct lines" },
    { value: "return-ducts", label: "Return Air Ducts", description: "Additional return air ducts" },
    { value: "ductwork", label: "New Ductwork", description: "Complete replacement of ductwork" },
  ]

  // Calculate total cost
  const calculateTotal = () => {
    const systemCost = parseFloat(formData.systemCost) || 0
    const ductworkCost = parseFloat(formData.ductworkCost) || 0
    return (systemCost + ductworkCost).toFixed(2)
  }

  const handleChange = (field: keyof HVACData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-generate scope notes when key fields change
      if (field !== "systemCost" && field !== "ductworkCost" && field !== "showPricing" && field !== "showPriceBreakdown") {
        newData.scopeNotes = generateScopeNotes(newData)
      }

      return newData
    })
  }

  const handleAddonToggle = (addon: string) => {
    setFormData((prev) => {
      const newAddons = prev.addons.includes(addon) ? prev.addons.filter((a) => a !== addon) : [...prev.addons, addon]

      const newData = { ...prev, addons: newAddons }
      newData.scopeNotes = generateScopeNotes(newData)

      return newData
    })
  }

  function generateScopeNotes(data: HVACData): string {
    const systemTypeText = {
      "ac-only": "air conditioning system",
      "furnace-only": "furnace",
      hvac: "complete HVAC system",
      "heat-pump": "heat pump system",
    }[data.systemType]

    const tonnageText = data.tonnage + " ton"
    const seerText = data.systemType !== "furnace-only" ? `${data.seerRating} SEER` : ""

    let notes = `Installation of a new ${tonnageText} ${seerText} ${systemTypeText} including:
- Removal and disposal of existing equipment
- Installation of new ${systemTypeText}
- Connection to existing ductwork and electrical
- System testing and calibration
- 1-year labor warranty
- Manufacturer's equipment warranty`

    if (data.addons.length > 0) {
      notes += "\n\nAdditional services:"

      if (data.addons.includes("attic-install")) {
        notes += "\n- Attic installation with additional support and insulation"
      }

      if (data.addons.includes("power-line")) {
        notes += "\n- New dedicated power line installation"
      }

      if (data.addons.includes("copper-lines")) {
        notes += "\n- New copper refrigerant lines and/or ductwork"
      }

      if (data.addons.includes("return-ducts")) {
        notes += "\n- Additional return air ducts for improved airflow"
      }
      
      if (data.addons.includes("ductwork")) {
        notes += "\n- Complete replacement of existing ductwork with new, properly sized ducts"
      }
    }

    return notes
  }

  useEffect(() => {
    // Initialize scope notes if empty
    if (!formData.scopeNotes) {
      setFormData((prev) => ({
        ...prev,
        scopeNotes: generateScopeNotes(prev),
      }))
    }
  }, [])

  useEffect(() => {
    // Avoid unnecessary updates that could cause render loops
    const currentFormDataString = JSON.stringify(formData)
    const newDataString = JSON.stringify(data)

    if (currentFormDataString !== newDataString) {
      updateData(formData)
    }
  }, [formData, updateData, data])

  return (
    <div className="space-y-8">
      {/* System Type Selection */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">System Type Selection</h3>
            <p className="text-gray-600 text-sm">Choose the HVAC system configuration that best fits the project</p>
          </div>
        </div>

        <RadioGroup 
          value={formData.systemType} 
          onValueChange={(value) => handleChange("systemType", value)}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {systemTypes.map((type) => (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                formData.systemType === type.value 
                  ? "border-blue-500 bg-blue-50 shadow-lg transform scale-105" 
                  : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102"
              }`}
              onClick={() => handleChange("systemType", type.value)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={type.value}
                    id={`system-${type.value}`}
                    className={`mt-1 ${formData.systemType === type.value ? "text-blue-600" : ""}`}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`system-${type.value}`} className="font-semibold cursor-pointer text-gray-900">
                      {type.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    {formData.systemType === type.value && (
                      <div className="mt-2 text-sm text-blue-700 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Selected
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      {/* System Specifications */}
      {formData.systemType && formData.systemType !== "furnace-only" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-full">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Specifications</h3>
              <p className="text-gray-600 text-sm">Configure tonnage and efficiency ratings for optimal performance</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Tonnage Selection */}
            <Card className="border border-gray-200 shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <Label className="text-sm font-semibold text-gray-900">System Size (Tonnage)</Label>
                <p className="text-xs text-gray-600 mt-1">Select the appropriate cooling capacity</p>
              </div>
              <CardContent className="p-4">
                <Select value={formData.tonnage} onValueChange={(value) => handleChange("tonnage", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose tonnage" />
                  </SelectTrigger>
                  <SelectContent>
                    {tonnageOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>{option} {option === "2.5" ? "tons" : `ton${option !== "1" ? "s" : ""}`}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.tonnage && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                    ✓ {formData.tonnage} ton system selected
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEER Rating Selection */}
            <Card className="border border-gray-200 shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold text-gray-900">SEER Rating</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This will not be visible on the customer-facing proposal.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xs text-gray-600 mt-1">Energy efficiency rating</p>
              </div>
              <CardContent className="p-4">
                <Select value={formData.seerRating} onValueChange={(value) => handleChange("seerRating", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose SEER rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {seerOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{option} SEER</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.seerRating && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                    ✓ {formData.seerRating} SEER efficiency rating
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add-ons and Upgrades */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-full">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add-ons & Upgrades</h3>
            <p className="text-gray-600 text-sm">Select additional components and upgrades</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {addonOptions.map((addon) => (
            <Card
              key={addon.value}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                formData.addons.includes(addon.value)
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-purple-300 hover:shadow-sm"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`addon-${addon.value}`}
                    checked={formData.addons.includes(addon.value)}
                    onCheckedChange={(checked) => {
                      const newAddons = checked
                        ? [...formData.addons, addon.value]
                        : formData.addons.filter((a) => a !== addon.value)
                      handleChange("addons", newAddons)
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={`addon-${addon.value}`} className="font-semibold cursor-pointer text-gray-900">
                      {addon.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                    {formData.addons.includes(addon.value) && (
                      <div className="mt-2 text-sm text-purple-700 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added to system
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Configuration */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-full">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pricing Configuration</h3>
            <p className="text-gray-600 text-sm">Set pricing details and display options</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* System Cost */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">System Cost</Label>
            </div>
            <CardContent className="p-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={formData.systemCost}
                  onChange={(e) => handleChange("systemCost", e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ductwork Cost */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Ductwork Cost</Label>
            </div>
            <CardContent className="p-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={formData.ductworkCost}
                  onChange={(e) => handleChange("ductworkCost", e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Display Options */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">Pricing Display Options</h4>
            <p className="text-xs text-gray-600 mt-1">Control what pricing information is visible to customers</p>
          </div>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showPricing"
                  checked={formData.showPricing}
                  onCheckedChange={(checked) => handleChange("showPricing", checked)}
                />
                <Label htmlFor="showPricing" className="text-sm font-medium">Show Pricing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showPriceBreakdown"
                  checked={formData.showPriceBreakdown}
                  onCheckedChange={(checked) => handleChange("showPriceBreakdown", checked)}
                />
                <Label htmlFor="showPriceBreakdown" className="text-sm font-medium">Show Breakdown</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scope Notes */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-100 rounded-full">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Scope of Work Notes</h3>
            <p className="text-gray-600 text-sm">Detailed description of work to be performed</p>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <Textarea
              value={formData.scopeNotes}
              onChange={(e) => handleChange("scopeNotes", e.target.value)}
              rows={6}
              placeholder="Enter detailed scope of work notes..."
              className="resize-none"
            />
            <div className="mt-2 text-xs text-gray-500">
              This will appear in the customer proposal as the detailed scope of work.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Summary */}
      {(formData.systemType || formData.addons.length > 0) && (
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-emerald-900">Configuration Summary</h4>
            </div>
            
            <div className="grid gap-3 md:grid-cols-2">
              {formData.systemType && (
                <div className="text-sm">
                  <span className="text-emerald-700 font-medium">System:</span>
                  <span className="text-emerald-900 ml-2">
                    {systemTypes.find(t => t.value === formData.systemType)?.label}
                  </span>
                </div>
              )}
              
              {formData.tonnage && (
                <div className="text-sm">
                  <span className="text-emerald-700 font-medium">Tonnage:</span>
                  <span className="text-emerald-900 ml-2">{formData.tonnage} tons</span>
                </div>
              )}
              
              {formData.seerRating && (
                <div className="text-sm">
                  <span className="text-emerald-700 font-medium">SEER:</span>
                  <span className="text-emerald-900 ml-2">{formData.seerRating}</span>
                </div>
              )}
              
              {formData.addons.length > 0 && (
                <div className="text-sm">
                  <span className="text-emerald-700 font-medium">Add-ons:</span>
                  <span className="text-emerald-900 ml-2">{formData.addons.length} selected</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
