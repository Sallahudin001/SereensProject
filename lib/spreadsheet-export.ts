// Function to export product data to Excel
export async function exportProductsToExcel() {
  try {
    // Dynamically import xlsx
    const XLSX = await import("xlsx")

    // Fetch all product data from the database
    const response = await fetch("/api/products/export")
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch product data")
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new()

    // Process each product category into its own worksheet
    Object.entries(data.products).forEach(([category, products]) => {
      // Convert products to worksheet format
      const ws = XLSX.utils.json_to_sheet(products as any[])

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, category)
    })

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })

    // Convert to Blob
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `product-data-${new Date().toISOString().split("T")[0]}.xlsx`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error("Error exporting products to Excel:", error)
    return { success: false, error: error.message }
  }
}
