"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RoofingProductForm from "./product-forms/roofing-product-form"
import HVACProductForm from "./product-forms/hvac-product-form"
import WindowsDoorsProductForm from "./product-forms/windows-doors-product-form"
import GarageDoorsProductForm from "./product-forms/garage-doors-product-form"
import PaintProductForm from "./product-forms/paint-product-form"

interface ProductSelectionFormProps {
  services: string[]
  data: any
  updateData: (data: any) => void
}

function ProductSelectionForm({ services, data, updateData }: ProductSelectionFormProps) {
  const [activeTab, setActiveTab] = useState<string>("")
  const [productData, setProductData] = useState<any>(data || {})
  const hasUpdatedRef = useRef(false)
  const prevServicesRef = useRef<string[]>([])

  // Set the first available service as the active tab
  useEffect(() => {
    // Skip if services haven't changed
    if (JSON.stringify(services) === JSON.stringify(prevServicesRef.current)) {
      return
    }

    prevServicesRef.current = [...services]

    if (services.length > 0 && !activeTab) {
      setActiveTab(services[0])
    } else if (services.length > 0 && !services.includes(activeTab)) {
      // If current active tab is no longer in services, reset to first service
      setActiveTab(services[0])
    }
  }, [services, activeTab])

  // Handle product data updates from child components
  const updateProductData = useCallback((service: string, serviceData: any) => {
    setProductData((prev: any) => {
      // Skip update if data hasn't changed
      if (JSON.stringify(prev[service]) === JSON.stringify(serviceData)) {
        return prev
      }

      const newData = {
        ...prev,
        [service]: serviceData,
      }

      // Mark that we need to update the parent
      hasUpdatedRef.current = false

      return newData
    })
  }, [])

  // Update parent component when product data changes
  useEffect(() => {
    // Skip if we've already updated with this data
    if (hasUpdatedRef.current) return

    // Only update if data has actually changed
    if (JSON.stringify(productData) !== JSON.stringify(data)) {
      updateData(productData)
      hasUpdatedRef.current = true
    }
  }, [productData, updateData, data])

  if (services.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Product Selection</h2>
          <p className="text-gray-600">Please go back and select at least one service to continue.</p>
        </div>
        <div className="text-center py-12 bg-amber-50 border border-amber-200 rounded-xl">
          <svg className="w-16 h-16 text-amber-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-amber-800 mb-2">No Services Selected</h3>
          <p className="text-amber-700">
            Go back to the previous step and select at least one service to configure products.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">Product Selection & Configuration</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Configure detailed product specifications for each selected service. Each tab represents a service that requires product configuration.
        </p>
      </div>

      {/* Service Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Service Configuration</h3>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Select a service tab below to configure product specifications
          </p>
        </div>

    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Enhanced Tab List */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <TabsList className="w-full grid gap-2 bg-transparent h-auto p-0" style={{gridTemplateColumns: `repeat(${services.length}, 1fr)`}}>
        {services.includes("roofing") && (
                <TabsTrigger 
                  value="roofing" 
                  className="flex-1 py-3 px-4 text-sm font-medium rounded-lg border-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <span>Roofing</span>
          </TabsTrigger>
        )}
              
        {services.includes("hvac") && (
                <TabsTrigger 
                  value="hvac" 
                  className="flex-1 py-3 px-4 text-sm font-medium rounded-lg border-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <span>HVAC</span>
          </TabsTrigger>
        )}
              
        {services.includes("windows-doors") && (
                <TabsTrigger 
                  value="windows-doors" 
                  className="flex-1 py-3 px-4 text-sm font-medium rounded-lg border-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <span>Windows & Doors</span>
          </TabsTrigger>
        )}
              
        {services.includes("garage-doors") && (
                <TabsTrigger 
                  value="garage-doors" 
                  className="flex-1 py-3 px-4 text-sm font-medium rounded-lg border-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <span>Garage Doors</span>
          </TabsTrigger>
        )}
              
        {services.includes("paint") && (
                <TabsTrigger 
                  value="paint" 
                  className="flex-1 py-3 px-4 text-sm font-medium rounded-lg border-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <span>Paint</span>
          </TabsTrigger>
        )}
      </TabsList>
          </div>

          {/* Tab Content */}
          <div className="p-6">
      {services.includes("roofing") && (
              <TabsContent value="roofing" className="mt-0">
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Roofing Configuration</h3>
                    <p className="text-gray-600 text-sm">Configure roofing materials, specifications, and pricing details</p>
                  </div>
          <RoofingProductForm
            data={productData.roofing || {}}
            updateData={(data) => updateProductData("roofing", data)}
          />
                </div>
        </TabsContent>
      )}

      {services.includes("hvac") && (
              <TabsContent value="hvac" className="mt-0">
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">HVAC Configuration</h3>
                    <p className="text-gray-600 text-sm">Configure heating and cooling system specifications</p>
                  </div>
                  <HVACProductForm 
                    data={productData.hvac || {}} 
                    updateData={(data) => updateProductData("hvac", data)} 
                  />
                </div>
        </TabsContent>
      )}

      {services.includes("windows-doors") && (
              <TabsContent value="windows-doors" className="mt-0">
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Windows & Doors Configuration</h3>
                    <p className="text-gray-600 text-sm">Configure window and door types, materials, and specifications</p>
                  </div>
          <WindowsDoorsProductForm
            data={productData["windows-doors"] || {}}
            updateData={(data) => updateProductData("windows-doors", data)}
          />
                </div>
        </TabsContent>
      )}

      {services.includes("garage-doors") && (
              <TabsContent value="garage-doors" className="mt-0">
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Garage Doors Configuration</h3>
                    <p className="text-gray-600 text-sm">Configure garage door styles, materials, and automation features</p>
                  </div>
          <GarageDoorsProductForm
            data={productData["garage-doors"] || {}}
            updateData={(data) => updateProductData("garage-doors", data)}
          />
                </div>
        </TabsContent>
      )}

      {services.includes("paint") && (
              <TabsContent value="paint" className="mt-0">
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Paint Configuration</h3>
                    <p className="text-gray-600 text-sm">Configure paint services, colors, and coverage specifications</p>
                  </div>
                  <PaintProductForm 
                    data={productData.paint || {}} 
                    updateData={(data) => updateProductData("paint", data)} 
                  />
                </div>
        </TabsContent>
      )}
          </div>
    </Tabs>
      </div>


    </div>
  )
}

export default ProductSelectionForm
