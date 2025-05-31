"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface CustomerData {
  name: string
  address: string
  email: string
  phone: string
}

interface CustomerInfoFormProps {
  data: CustomerData
  updateData: (data: Partial<CustomerData>) => void
}

export default function CustomerInfoForm({ data, updateData }: CustomerInfoFormProps) {
  // Use a ref to track if we've already updated the parent
  const hasUpdatedRef = useRef(false)

  // Initialize state only once
  const [formData, setFormData] = useState<CustomerData>(() => ({
    name: data.name || "",
    address: data.address || "",
    email: data.email || "",
    phone: data.phone || "",
  }))

  // Handle form field changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      // Skip update if value hasn't changed
      if (prev[name as keyof CustomerData] === value) {
        return prev
      }

      // Mark that we need to update the parent
      hasUpdatedRef.current = false

      return {
        ...prev,
        [name]: value,
      }
    })
  }, [])

  // Update parent component when form data changes
  useEffect(() => {
    // Skip if we've already updated with this data
    if (hasUpdatedRef.current) return

    // Only update if data has actually changed
    if (JSON.stringify(formData) !== JSON.stringify(data)) {
      updateData(formData)
      hasUpdatedRef.current = true
    }
  }, [formData, data, updateData])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Customer Information</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="John Smith"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={handleChange}
          required
        />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            placeholder="123 Main St, City, State, Zip"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  )
}
