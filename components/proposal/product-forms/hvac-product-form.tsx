"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HVACData {
  systemType: string
  tonnage: string
  seerRating: string
  addons: string[]
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
    scopeNotes: data.scopeNotes || "",
  })

  const systemTypes = [
    { value: "ac-only", label: "AC Only", description: "Cooling system only" },
    { value: "furnace-only", label: "Furnace Only", description: "Heating system only" },
    { value: "hvac", label: "HVAC", description: "Combined heating and cooling system" },
    { value: "heat-pump", label: "Heat Pump", description: "Energy-efficient heating and cooling" },
  ]

  const tonnageOptions = ["2", "2.5", "3", "3.5", "4", "5"]
  const seerOptions = ["14", "16", "18", "20", "22"]

  const addonOptions = [
    { value: "attic-install", label: "Attic Installation", description: "Installation in attic space" },
    { value: "power-line", label: "New Power Line", description: "Electrical upgrades for system" },
    { value: "copper-lines", label: "New Copper/Duct Lines", description: "New refrigerant and duct lines" },
    { value: "return-ducts", label: "Return Air Ducts", description: "Additional return air ducts" },
  ]

  const handleChange = (field: keyof HVACData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-generate scope notes when key fields change
      newData.scopeNotes = generateScopeNotes(newData)

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
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">System Type</h3>
        <RadioGroup
          value={formData.systemType}
          onValueChange={(value) => handleChange("systemType", value)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {systemTypes.map((system) => (
            <Card
              key={system.value}
              className={`cursor-pointer border ${formData.systemType === system.value ? "border-rose-600" : ""}`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <RadioGroupItem
                  value={system.value}
                  id={`system-${system.value}`}
                  className={formData.systemType === system.value ? "text-rose-600" : ""}
                />
                <div className="flex-1">
                  <Label htmlFor={`system-${system.value}`} className="font-medium cursor-pointer">
                    {system.label}
                  </Label>
                  <p className="text-sm text-gray-500">{system.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formData.systemType !== "furnace-only" && (
          <div className="space-y-2">
            <Label htmlFor="tonnage">System Size (Tons)</Label>
            <Select value={formData.tonnage} onValueChange={(value) => handleChange("tonnage", value)}>
              <SelectTrigger id="tonnage">
                <SelectValue placeholder="Select tonnage" />
              </SelectTrigger>
              <SelectContent>
                {tonnageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option} {option === "2.5" ? "tons" : `ton${option !== "1" ? "s" : ""}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.systemType !== "furnace-only" && (
          <div className="space-y-2">
            <Label htmlFor="seer">SEER Rating</Label>
            <Select value={formData.seerRating} onValueChange={(value) => handleChange("seerRating", value)}>
              <SelectTrigger id="seer">
                <SelectValue placeholder="Select SEER rating" />
              </SelectTrigger>
              <SelectContent>
                {seerOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option} SEER
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Add-ons</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addonOptions.map((addon) => (
            <div key={addon.value} className="flex items-start space-x-3">
              <Checkbox
                id={`addon-${addon.value}`}
                checked={formData.addons.includes(addon.value)}
                onCheckedChange={() => handleAddonToggle(addon.value)}
                className={formData.addons.includes(addon.value) ? "text-rose-600" : ""}
              />
              <div className="space-y-1">
                <Label htmlFor={`addon-${addon.value}`} className="font-medium cursor-pointer">
                  {addon.label}
                </Label>
                <p className="text-sm text-gray-500">{addon.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Scope Description</h3>
        <Textarea
          value={formData.scopeNotes}
          onChange={(e) => handleChange("scopeNotes", e.target.value)}
          rows={10}
          className="font-mono text-sm"
        />
      </div>
    </div>
  )
}
