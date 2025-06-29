
import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"

// Export the recharts components for use in other files
export { AreaChart, BarChart, LineChart, PieChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, Pie, TrendingUp }

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

// Chart container component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config?: Record<string, any>
  }
>(({ className, config, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex aspect-video justify-center text-xs", className)}
      {...props}
    />
  )
})
ChartContainer.displayName = "ChartContainer"

// Chart tooltip component
const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof Tooltip>, 'className'> & {
    className?: string
  }
>(({ className, ...props }, ref) => {
  return (
    <Tooltip
      wrapperClassName={cn(
        "rounded-lg border bg-background p-2 shadow-md",
        className
      )}
      {...props}
    />
  )
})
ChartTooltip.displayName = "ChartTooltip"

// Chart tooltip content component
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
    payload?: Array<{
      color?: string
      dataKey?: string
      value?: string | number
    }>
    label?: string
  }
>(({ className, active, payload, label, ...props }, ref) => {
  if (active && payload && payload.length) {
    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-2 rounded-lg border bg-background p-2 shadow-md",
          className
        )}
        {...props}
      >
        {label && (
          <div className="font-medium">{label}</div>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.dataKey}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return null
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
}
