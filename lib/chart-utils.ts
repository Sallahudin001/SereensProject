// Color palette for charts
export const chartColors = [
  "#FF6384", // Pink
  "#36A2EB", // Blue
  "#FFCE56", // Yellow
  "#4BC0C0", // Teal
  "#9966FF", // Purple
  "#FF9F40", // Orange
  "#C9CBCF", // Grey
]

// Gradient color palette for charts - primary colors
export const gradientColors = [
  ["#FF6384", "#FF8C94"], // Pink gradient
  ["#3B82F6", "#93C5FD"], // Blue gradient
  ["#F59E0B", "#FCD34D"], // Amber gradient
  ["#10B981", "#6EE7B7"], // Emerald gradient
  ["#8B5CF6", "#C4B5FD"], // Purple gradient
  ["#EC4899", "#F9A8D4"], // Pink gradient
  ["#F43F5E", "#FDA4AF"], // Rose gradient
]

// Application theme gradients
export const themeGradients = {
  primary: ["#E11D48", "#FB7185"], // Rose gradient (primary brand color)
  secondary: ["#3B82F6", "#93C5FD"], // Blue gradient
  success: ["#10B981", "#6EE7B7"], // Emerald gradient
  warning: ["#F59E0B", "#FCD34D"], // Amber gradient
  info: ["#8B5CF6", "#C4B5FD"], // Violet gradient
  gray: ["#6B7280", "#D1D5DB"], // Gray gradient
}

// Status colors
export const statusColors: Record<string, string> = {
  draft: "#9CA3AF", // Gray
  sent: "#3B82F6", // Blue
  viewed: "#8B5CF6", // Purple
  signed: "#10B981", // Green
  rejected: "#F43F5E", // Rose/Red
  completed: "#10B981", // Green
  cancelled: "#F59E0B", // Amber
  expired: "#F59E0B", // Amber
}

// Format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format date
export const formatDate = (dateString: string, format: "short" | "long" = "short"): string => {
  if (!dateString) {
    return "Unknown";
  }
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Unknown";
  }

  if (format === "short") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(date)
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

// Format percentage
export const formatPercentage = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) {
    return "0%"
  }
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  // Check if it's a valid number
  if (isNaN(numValue)) {
    return "0%"
  }
  
  return `${numValue.toFixed(1)}%`
}

// Get a readable name for product types
export const getProductTypeName = (type: string): string => {
  const names: Record<string, string> = {
    roofing: "Roofing",
    hvac: "HVAC",
    windows_doors: "Windows & Doors",
    garage_doors: "Garage Doors",
    paint: "Paint",
  }

  return names[type] || type
}
