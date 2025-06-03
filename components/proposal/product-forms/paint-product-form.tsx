"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface PaintData {
  serviceType: string
  squareFootage: string
  colorTone: string
  includePaint: boolean
  includePrimer: boolean
  includePrep: boolean
  scopeNotes: string
}

interface PaintProductFormProps {
  data: PaintData
  updateData: (data: PaintData) => void
}

export default function PaintProductForm({ data, updateData }: PaintProductFormProps) {
  const [formData, setFormData] = useState<PaintData>({
    serviceType: data.serviceType || "exterior",
    squareFootage: data.squareFootage || "",
    colorTone: data.colorTone || "1",
    includePaint: data.includePaint !== undefined ? data.includePaint : true,
    includePrimer: data.includePrimer || true,
    includePrep: data.includePrep || true,
    scopeNotes: data.scopeNotes || generateScopeNotes("exterior", "1", true, true, true),
  })

  const serviceTypes = [
    { value: "exterior", label: "Exterior", description: "Exterior house painting" },
    { value: "interior", label: "Interior", description: "Interior room painting" },
    { value: "both", label: "Both", description: "Complete interior and exterior painting" },
  ]

  const colorTones = [
    { value: "1", label: "1 Color" },
    { value: "2", label: "2-Tone" },
    { value: "3", label: "3-Tone" },
  ]

  function generateScopeNotes(
    serviceType: string,
    colorTone: string,
    includePrep: boolean,
    includePrimer: boolean,
    includePaint: boolean,
  ): string {
    let notes = `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Painting Services:\n`

    if (includePrep) {
      notes += "- Surface preparation including cleaning, scraping, and sanding\n"
      if (serviceType === "exterior" || serviceType === "both") {
        notes += "- Pressure washing of exterior surfaces\n"
      }
      notes += "- Repair of minor surface imperfections\n"
      notes += "- Masking and protection of non-painted surfaces\n"
    }

    if (includePrimer) {
      notes += "- Application of primer to prepared surfaces\n"
    }

    notes += `- ${colorTone}-tone color application\n`

    if (includePaint) {
      notes += "- Paint color will be selected by the homeowner from provided options.\n"
    } else {
      notes += "- Homeowner will purchase and supply the paint separately.\n"
    }

    notes += "- Clean up and removal of all painting materials\n"
    notes += "- Final inspection with homeowner\n"

    return notes
  }

  const handleChange = (field: keyof PaintData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-generate scope notes when key fields change
      if (
        field === "serviceType" ||
        field === "colorTone" ||
        field === "includePrep" ||
        field === "includePrimer" ||
        field === "includePaint"
      ) {
        newData.scopeNotes = generateScopeNotes(
          field === "serviceType" ? value : prev.serviceType,
          field === "colorTone" ? value : prev.colorTone,
          field === "includePrep" ? value : prev.includePrep,
          field === "includePrimer" ? value : prev.includePrimer,
          field === "includePaint" ? value : prev.includePaint,
        )
      }

      return newData
    })
  }

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
        <h3 className="text-lg font-medium">Service Type</h3>
        <RadioGroup
          value={formData.serviceType}
          onValueChange={(value) => handleChange("serviceType", value)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {serviceTypes.map((service) => (
            <Card
              key={service.value}
              className={`cursor-pointer border ${formData.serviceType === service.value ? "border-emerald-600" : ""}`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <RadioGroupItem
                  value={service.value}
                  id={`service-${service.value}`}
                  className={formData.serviceType === service.value ? "text-emerald-600" : ""}
                />
                <div className="flex-1">
                  <Label htmlFor={`service-${service.value}`} className="font-medium cursor-pointer">
                    {service.label}
                  </Label>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="square-footage">Square Footage</Label>
          <Input
            id="square-footage"
            type="number"
            min="0"
            placeholder="Enter square footage"
            value={formData.squareFootage}
            onChange={(e) => handleChange("squareFootage", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Color Tone Options</Label>
          <RadioGroup
            value={formData.colorTone}
            onValueChange={(value) => handleChange("colorTone", value)}
            className="flex flex-wrap gap-4"
          >
            {colorTones.map((tone) => (
              <div key={tone.value} className="flex items-center space-x-2">
                <RadioGroupItem value={tone.value} id={`tone-${tone.value}`} />
                <Label htmlFor={`tone-${tone.value}`}>{tone.label}</Label>
            </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Paint Inclusion</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-paint">Include Paint (default)</Label>
            <Switch
              id="include-paint"
              checked={formData.includePaint}
              onCheckedChange={(checked) => handleChange("includePaint", checked)}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            {formData.includePaint 
              ? "Paint will be selected by the homeowner from provided color options and is included in the price." 
              : "Homeowner will purchase and supply the paint. This is a labor-only quote."}
          </p>
          
          <p className="text-xs text-gray-500 mt-2">
            Default is 'Include Paint'. If homeowner is supplying their own paint, select 'Do Not Include Paint'.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="include-prep"
              checked={formData.includePrep}
              onCheckedChange={(checked) => handleChange("includePrep", checked)}
              className={formData.includePrep ? "text-emerald-600" : ""}
            />
            <div className="space-y-1">
              <Label htmlFor="include-prep" className="font-medium cursor-pointer">
                Surface Preparation
              </Label>
              <p className="text-sm text-gray-500">Cleaning, scraping, and sanding</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="include-primer"
              checked={formData.includePrimer}
              onCheckedChange={(checked) => handleChange("includePrimer", checked)}
              className={formData.includePrimer ? "text-emerald-600" : ""}
            />
            <div className="space-y-1">
              <Label htmlFor="include-primer" className="font-medium cursor-pointer">
                Include Primer
              </Label>
              <p className="text-sm text-gray-500">Apply primer before paint</p>
            </div>
          </div>
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
