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
    setProductData((prev) => {
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
      <div className="text-amber-600 bg-amber-50 p-4 rounded-md">
        Please go back and select at least one service to continue.
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start mb-6 overflow-x-auto">
        {services.includes("roofing") && (
          <TabsTrigger value="roofing" className="px-4">
            Roofing
          </TabsTrigger>
        )}
        {services.includes("hvac") && (
          <TabsTrigger value="hvac" className="px-4">
            HVAC
          </TabsTrigger>
        )}
        {services.includes("windows-doors") && (
          <TabsTrigger value="windows-doors" className="px-4">
            Windows & Doors
          </TabsTrigger>
        )}
        {services.includes("garage-doors") && (
          <TabsTrigger value="garage-doors" className="px-4">
            Garage Doors
          </TabsTrigger>
        )}
        {services.includes("paint") && (
          <TabsTrigger value="paint" className="px-4">
            Paint
          </TabsTrigger>
        )}
      </TabsList>

      {services.includes("roofing") && (
        <TabsContent value="roofing">
          <RoofingProductForm
            data={productData.roofing || {}}
            updateData={(data) => updateProductData("roofing", data)}
          />
        </TabsContent>
      )}

      {services.includes("hvac") && (
        <TabsContent value="hvac">
          <HVACProductForm data={productData.hvac || {}} updateData={(data) => updateProductData("hvac", data)} />
        </TabsContent>
      )}

      {services.includes("windows-doors") && (
        <TabsContent value="windows-doors">
          <WindowsDoorsProductForm
            data={productData["windows-doors"] || {}}
            updateData={(data) => updateProductData("windows-doors", data)}
          />
        </TabsContent>
      )}

      {services.includes("garage-doors") && (
        <TabsContent value="garage-doors">
          <GarageDoorsProductForm
            data={productData["garage-doors"] || {}}
            updateData={(data) => updateProductData("garage-doors", data)}
          />
        </TabsContent>
      )}

      {services.includes("paint") && (
        <TabsContent value="paint">
          <PaintProductForm data={productData.paint || {}} updateData={(data) => updateProductData("paint", data)} />
        </TabsContent>
      )}
    </Tabs>
  )
}

export default ProductSelectionForm
