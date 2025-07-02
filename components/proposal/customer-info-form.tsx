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
  repFirstName: string
  repLastName: string
  repPhone: string
}

interface CustomerInfoFormProps {
  data: Partial<CustomerData>
  updateData: (data: Partial<CustomerData>) => void
  onValidationChange?: (isValid: boolean) => void
}

export default function CustomerInfoForm({ data, updateData, onValidationChange }: CustomerInfoFormProps) {
  // Use a ref to track if we've already updated the parent
  const hasUpdatedRef = useRef(false)

  // Initialize state only once
  const [formData, setFormData] = useState<CustomerData>(() => ({
    name: data.name || "",
    address: data.address || "",
    email: data.email || "",
    phone: data.phone || "",
    repFirstName: data.repFirstName || "",
    repLastName: data.repLastName || "",
    repPhone: data.repPhone || "",
  }))

  // Validation states
  const [errors, setErrors] = useState<Partial<CustomerData>>({})

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '')
    // Accept phone numbers between 10-15 digits
    return cleanPhone.length >= 10 && cleanPhone.length <= 15
  }

  const validateForm = useCallback((formData: CustomerData): { isValid: boolean; errors: Partial<CustomerData> } => {
    const newErrors: Partial<CustomerData> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (10-15 digits)"
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Property address is required"
    }

    // Rep first name validation
    if (!formData.repFirstName.trim()) {
      newErrors.repFirstName = "Rep first name is required"
    }

    // Rep last name validation
    if (!formData.repLastName.trim()) {
      newErrors.repLastName = "Rep last name is required"
    }

    // Rep phone validation
    if (!formData.repPhone.trim()) {
      newErrors.repPhone = "Rep phone number is required"
    } else if (!validatePhone(formData.repPhone)) {
      newErrors.repPhone = "Please enter a valid rep phone number (10-15 digits)"
    }

    const isValid = Object.keys(newErrors).length === 0
    return { isValid, errors: newErrors }
  }, [])

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length >= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    } else if (phoneNumber.length >= 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return phoneNumber
    }
  }

  // Handle form field changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Special handling for phone numbers - only allow digits and format
    let processedValue = value
    if (name === 'phone' || name === 'repPhone') {
      // Only allow digits and common phone number characters
      const digitsOnly = value.replace(/\D/g, '')
      // Limit to 10 digits for US phone numbers
      if (digitsOnly.length <= 10) {
        processedValue = formatPhoneNumber(digitsOnly)
      } else {
        // Don't update if more than 10 digits
        return
      }
    }

    setFormData((prev) => {
      // Skip update if value hasn't changed
      if (prev[name as keyof CustomerData] === processedValue) {
        return prev
      }

      // Mark that we need to update the parent
      hasUpdatedRef.current = false

      const newData = {
        ...prev,
        [name]: processedValue,
      }

      // Validate the form and update errors
      const { isValid, errors: newErrors } = validateForm(newData)
      setErrors(newErrors)

      return newData
    })
  }, [formatPhoneNumber, validateForm])

  // Use effect to notify parent of validation changes to avoid setState during render
  useEffect(() => {
    const { isValid } = validateForm(formData)
    if (onValidationChange) {
      onValidationChange(isValid)
    }
  }, [formData, validateForm, onValidationChange])

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

  // Initial validation check
  useEffect(() => {
    const { isValid } = validateForm(formData)
    if (onValidationChange) {
      onValidationChange(isValid)
    }
  }, []) // Only run on mount

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Customer Information</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter customer details to personalize the proposal. All fields are required to create a professional proposal.
        </p>
      </div>

      {/* Customer Form */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Details
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Contact Information Row */}
          <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full Name *
              </Label>
          <Input
            id="name"
            name="name"
                placeholder="e.g. John Smith"
            value={formData.name}
            onChange={handleChange}
            required
                className={`transition-all duration-200 focus:ring-2 ${
                  errors.name 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'focus:ring-emerald-500 focus:border-emerald-500'
                }`}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.name}
            </p>
          )}
        </div>
            
        <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address *
              </Label>
          <Input
            id="email"
            name="email"
            type="email"
                placeholder="e.g. john.smith@email.com"
            value={formData.email}
            onChange={handleChange}
            required
                className={`transition-all duration-200 focus:ring-2 ${
                  errors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'focus:ring-emerald-500 focus:border-emerald-500'
                }`}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

      <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone Number *
              </Label>
        <Input
          id="phone"
          name="phone"
                placeholder="e.g. (555) 123-4567"
          value={formData.phone}
          onChange={handleChange}
          required
                className={`transition-all duration-200 focus:ring-2 ${
                  errors.phone 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'focus:ring-emerald-500 focus:border-emerald-500'
                }`}
        />
        {errors.phone && (
          <p className="text-sm text-red-600 mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.phone}
          </p>
        )}
          </div>
        </div>

          {/* Address Section */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Property Address *
            </Label>
          <Input
            id="address"
            name="address"
              placeholder="e.g. 123 Main Street, City, State 12345"
            value={formData.address}
            onChange={handleChange}
            required
              className={`transition-all duration-200 focus:ring-2 ${
                errors.address 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'focus:ring-emerald-500 focus:border-emerald-500'
              }`}
            />
            {errors.address ? (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.address}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Include street address, city, state, and ZIP code</p>
            )}
          </div>
        </div>
      </div>

      {/* Rep Information Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Sales Representative Information
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Rep Information Row */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="repFirstName" className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Rep First Name *
              </Label>
              <Input
                id="repFirstName"
                name="repFirstName"
                placeholder="e.g. Jane"
                value={formData.repFirstName}
                onChange={handleChange}
                required
                className={`transition-all duration-200 focus:ring-2 ${
                  errors.repFirstName 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {errors.repFirstName && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.repFirstName}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="repLastName" className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Rep Last Name *
              </Label>
              <Input
                id="repLastName"
                name="repLastName"
                placeholder="e.g. Smith"
                value={formData.repLastName}
                onChange={handleChange}
                required
                className={`transition-all duration-200 focus:ring-2 ${
                  errors.repLastName 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {errors.repLastName && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.repLastName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="repPhone" className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Rep Phone Number *
              </Label>
              <Input
                id="repPhone"
                name="repPhone"
                placeholder="e.g. (555) 987-6543"
                value={formData.repPhone}
                onChange={handleChange}
                required
                className={`transition-all duration-200 focus:ring-2 ${
                  errors.repPhone 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {errors.repPhone && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.repPhone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Completion Indicator */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            formData.name && formData.email && formData.phone && formData.address && 
            formData.repFirstName && formData.repLastName && formData.repPhone
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-300 text-gray-600'
          }`}>
            {formData.name && formData.email && formData.phone && formData.address && 
             formData.repFirstName && formData.repLastName && formData.repPhone ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <div className="flex-1">
            {formData.name && formData.email && formData.phone && formData.address && 
             formData.repFirstName && formData.repLastName && formData.repPhone ? (
              <div>
                <p className="text-emerald-800 font-medium">Customer and rep information complete!</p>
                <p className="text-emerald-700 text-sm">Ready to proceed to service selection</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 font-medium">Complete customer and rep information</p>
                <p className="text-gray-600 text-sm">Fill in all required fields to continue</p>
              </div>
            )}
          </div>
          
          {/* Progress Indicator */}
          <div className="flex-shrink-0">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {[formData.name, formData.email, formData.phone, formData.address, 
                  formData.repFirstName, formData.repLastName, formData.repPhone].filter(Boolean).length}/7
              </p>
              <p className="text-xs text-gray-500">fields completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
