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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Scope of Work</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select services to include in the customer's project scope. Choose from our comprehensive range of home improvement services.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
              selectedServices.includes(service.name) 
                ? "border-emerald-500 bg-emerald-50 shadow-lg transform scale-105" 
                : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-25"
            }`}
            onClick={() => handleServiceToggle(service.name)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Icon Container */}
                <div
                  className={`p-4 rounded-full transition-all duration-300 ${
                    selectedServices.includes(service.name) 
                      ? "bg-emerald-500 text-white shadow-lg" 
                      : "bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                  }`}
                >
                  <div className="h-8 w-8">
                    {/* Service Icons */}
                    {service.icon === "Home" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
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
                        width="32"
                        height="32"
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
                    {(service.icon === "RectangleHorizontal" || service.name === "windows-doors") && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M7 4v16" />
                        <path d="M17 4v16" />
                        <circle cx="15" cy="12" r="1" />
                      </svg>
                    )}
                    {service.icon === "GalleryVerticalEnd" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
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
                        width="32"
                        height="32"
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
                    {/* Default icon for unknown services */}
                    {!["Home", "Wind", "RectangleHorizontal", "GalleryVerticalEnd", "Paintbrush"].includes(service.icon) && service.name !== "windows-doors" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 12h6" />
                        <path d="M12 9v6" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Service Information */}
                <div className="space-y-2">
                  <h3 className={`text-lg font-semibold transition-colors ${
                    selectedServices.includes(service.name) ? "text-emerald-700" : "text-gray-900"
                  }`}>
                    {service.display_name}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </div>
                
                {/* Selection Indicator */}
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                  selectedServices.includes(service.name)
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300 group-hover:border-emerald-400"
                }`}>
                  {selectedServices.includes(service.name) && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedServices.length === 0 && (
        <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex justify-center mb-2">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-amber-800 font-medium">Please select at least one service to continue</p>
          <p className="text-amber-700 text-sm mt-1">Choose the services that best match your customer's needs</p>
        </div>
      )}

      {selectedServices.length > 0 && (
        <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-emerald-800">
            <span className="font-semibold">{selectedServices.length}</span> service{selectedServices.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  )
}
