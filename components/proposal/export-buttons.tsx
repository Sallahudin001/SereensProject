"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { exportProductsToExcel } from "@/lib/spreadsheet-export"

interface ExportButtonsProps {
  showProductExport?: boolean
}

export default function ExportButtons({ showProductExport = false }: ExportButtonsProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false)

  const handleExportToExcel = async () => {
    try {
      setIsExportingExcel(true)
      const result = await exportProductsToExcel()

      if (result.success) {
        toast({
          title: "Export successful",
          description: "Product data has been exported to Excel",
        })
      } else {
        toast({
          title: "Export failed",
          description: result.error || "Failed to export product data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      toast({
        title: "Export failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsExportingExcel(false)
    }
  }

  if (!showProductExport) {
    return null
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExportToExcel} disabled={isExportingExcel}>
      {isExportingExcel ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Products
        </>
      )}
    </Button>
  )
}
