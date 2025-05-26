import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch all services
    const services = await executeQuery(`
      SELECT id, name, display_name FROM services ORDER BY display_name
    `)

    // Initialize products object
    const products = {}

    // For each service, fetch its product options and details
    for (const service of services) {
      let productData = []

      switch (service.name) {
        case "roofing":
          // Fetch roofing product options
          const roofingOptions = await executeQuery(
            `
            SELECT 
              p.id,
              p.product_data,
              p.scope_notes,
              p.created_at
            FROM 
              products p
            WHERE 
              p.service_id = $1
            ORDER BY 
              p.created_at DESC
            LIMIT 50
          `,
            [service.id],
          )

          // Process roofing options
          productData = roofingOptions.map((option) => {
            const data = option.product_data || {}
            return {
              id: option.id,
              material: data.material || "",
              addGutters: data.addGutters ? "Yes" : "No",
              gutterLength: data.gutterLength || "",
              pricePerSquare: data.pricePerSquare || "",
              scopeNotes: option.scope_notes || "",
              lastUsed: option.created_at,
            }
          })
          break

        case "hvac":
          // Fetch HVAC product options
          const hvacOptions = await executeQuery(
            `
            SELECT 
              p.id,
              p.product_data,
              p.scope_notes,
              p.created_at
            FROM 
              products p
            WHERE 
              p.service_id = $1
            ORDER BY 
              p.created_at DESC
            LIMIT 50
          `,
            [service.id],
          )

          // Process HVAC options
          productData = hvacOptions.map((option) => {
            const data = option.product_data || {}
            return {
              id: option.id,
              systemType: data.systemType || "",
              tonnage: data.tonnage || "",
              seerRating: data.seerRating || "",
              addons: Array.isArray(data.addons) ? data.addons.join(", ") : "",
              scopeNotes: option.scope_notes || "",
              lastUsed: option.created_at,
            }
          })
          break

        case "windows-doors":
          // Fetch windows & doors product options
          const windowsDoorsOptions = await executeQuery(
            `
            SELECT 
              p.id,
              p.product_data,
              p.scope_notes,
              p.created_at
            FROM 
              products p
            WHERE 
              p.service_id = $1
            ORDER BY 
              p.created_at DESC
            LIMIT 50
          `,
            [service.id],
          )

          // Process windows & doors options
          productData = windowsDoorsOptions.map((option) => {
            const data = option.product_data || {}
            return {
              id: option.id,
              windowType: data.windowType || "",
              windowColor: data.windowColor || "",
              doorTypes: Array.isArray(data.doorTypes) ? data.doorTypes.join(", ") : "",
              windowCount: data.windowCount || "",
              doorCount: data.doorCount || "",
              customColors: data.customColors ? "Yes" : "No",
              scopeNotes: option.scope_notes || "",
              lastUsed: option.created_at,
            }
          })
          break

        case "garage-doors":
          // Fetch garage doors product options
          const garageDoorsOptions = await executeQuery(
            `
            SELECT 
              p.id,
              p.product_data,
              p.scope_notes,
              p.created_at
            FROM 
              products p
            WHERE 
              p.service_id = $1
            ORDER BY 
              p.created_at DESC
            LIMIT 50
          `,
            [service.id],
          )

          // Process garage doors options
          productData = garageDoorsOptions.map((option) => {
            const data = option.product_data || {}
            return {
              id: option.id,
              model: data.model || "",
              width: data.width || "",
              height: data.height || "",
              addons: Array.isArray(data.addons) ? data.addons.join(", ") : "",
              quantity: data.quantity || "",
              scopeNotes: option.scope_notes || "",
              lastUsed: option.created_at,
            }
          })
          break

        case "paint":
          // Fetch paint product options
          const paintOptions = await executeQuery(
            `
            SELECT 
              p.id,
              p.product_data,
              p.scope_notes,
              p.created_at
            FROM 
              products p
            WHERE 
              p.service_id = $1
            ORDER BY 
              p.created_at DESC
            LIMIT 50
          `,
            [service.id],
          )

          // Process paint options
          productData = paintOptions.map((option) => {
            const data = option.product_data || {}
            return {
              id: option.id,
              serviceType: data.serviceType || "",
              squareFootage: data.squareFootage || "",
              coats: data.coats || "",
              includePaint: data.includePaint ? "Yes" : "No",
              includePrimer: data.includePrimer ? "Yes" : "No",
              includePrep: data.includePrep ? "Yes" : "No",
              scopeNotes: option.scope_notes || "",
              lastUsed: option.created_at,
            }
          })
          break

        default:
          // Generic handling for other services
          const genericOptions = await executeQuery(
            `
            SELECT 
              p.id,
              p.product_data,
              p.scope_notes,
              p.created_at
            FROM 
              products p
            WHERE 
              p.service_id = $1
            ORDER BY 
              p.created_at DESC
            LIMIT 50
          `,
            [service.id],
          )

          // Process generic options
          productData = genericOptions.map((option) => {
            return {
              id: option.id,
              productData: JSON.stringify(option.product_data),
              scopeNotes: option.scope_notes || "",
              lastUsed: option.created_at,
            }
          })
      }

      // Add to products object
      products[service.display_name] = productData
    }

    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error("Error fetching products for export:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch product data" }, { status: 500 })
  }
}
