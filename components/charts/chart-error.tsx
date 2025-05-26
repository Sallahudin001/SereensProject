import { AlertCircle } from "lucide-react"

interface ChartErrorProps {
  message?: string
}

export function ChartError({ message = "Failed to load chart data" }: ChartErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <AlertCircle className="h-8 w-8 mb-2" />
      <p>{message}</p>
    </div>
  )
}
