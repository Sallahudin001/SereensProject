"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { getAllServices } from "@/app/actions/proposal-actions"

interface ScopeOfWorkFormProps {
  data: string[]
  updateData: (data: string[]) => void
}

export default function ScopeOfWorkForm({ data, updateData }: ScopeOfWorkFormProps) {
  // Use a ref to track if we've already updated the parent
  const hasUpdatedRef = useRef(false)

  // Initialize state only once
  const [selectedServices, setSelectedServices] = useState<string[]>(() => data || [])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch services from the database
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        const servicesData = await getAllServices()
        setServices(servicesData)
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Handle service selection
  const handleServiceToggle = useCallback((service: string) => {
    setSelectedServices((prev) => {
      const newServices = prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]

      // Mark that we need to update the parent
      hasUpdatedRef.current = false

      return newServices
    })
  }, [])

  // Update parent component when selected services change
  useEffect(() => {
    // Skip if we've already updated with this data
    if (hasUpdatedRef.current) return

    // Only update if data has actually changed
    if (JSON.stringify(selectedServices) !== JSON.stringify(data)) {
      updateData(selectedServices)
      hasUpdatedRef.current = true
    }
  }, [selectedServices, updateData, data])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-500 mb-4">Select one or more services to include in this proposal:</p>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all ${
              selectedServices.includes(service.name) ? "border-rose-600 bg-rose-50" : "hover:border-gray-300"
            }`}
            onClick={() => handleServiceToggle(service.name)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`p-2 rounded-full ${selectedServices.includes(service.name) ? "bg-rose-100" : "bg-gray-100"}`}
              >
                <div
                  className={`h-5 w-5 ${selectedServices.includes(service.name) ? "text-rose-600" : "text-gray-500"}`}
                >
                  {/* Use the icon name from the database */}
                  {service.icon === "Home" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  )}
                  {service.icon === "Wind" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                    </svg>
                  )}
                  {service.icon === "AppWindowIcon" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M10 4v16" />
                      <path d="M2 10h20" />
                    </svg>
                  )}
                  {service.icon === "GalleryVerticalEnd" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 2h10" />
                      <path d="M5 6h14" />
                      <rect width="18" height="12" x="3" y="10" rx="2" />
                    </svg>
                  )}
                  {service.icon === "Paintbrush" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
                      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
                      <path d="M14.5 17.5 4.5 15" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor={`service-${service.name}`} className="font-medium cursor-pointer">
                  {service.display_name}
                </Label>
              </div>
              <Checkbox
                id={`service-${service.name}`}
                checked={selectedServices.includes(service.name)}
                onCheckedChange={() => handleServiceToggle(service.name)}
                className={selectedServices.includes(service.name) ? "text-rose-600" : ""}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedServices.length === 0 && (
        <div className="text-amber-600 bg-amber-50 p-4 rounded-md mt-4">
          Please select at least one service to continue.
        </div>
      )}
    </div>
  )
}
