import * as React from "react"
import * as RechartsPrimitive from "recharts"
import {
  ResponsiveContainer,
  type LegendProps,
  type TooltipProps,
} from "recharts"

import { cn } from "@/lib/utils"

export interface ChartConfig {
  [key: string]: {
    label?: string
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  }
}

export interface ChartContextProps {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps>({
  config: {},
})

export const useChart = () => React.useContext(ChartContext)

const getPayloadConfigFromPayload = (
  config: ChartConfig,
  item: any,
  key: string
) => {
  if (item.payload && typeof item.payload === "object" && item.payload !== null) {
    return config?.[key] || config?.[item.dataKey] || config?.[item.name] || {}
  }
  return {}
}

interface ChartStyleProps {
  id: string
  config: ChartConfig
}

const ChartStyle = ({ id, config }: ChartStyleProps) => {
  const styles = React.useMemo(() => {
    let css = ""

    Object.keys(config).forEach((key) => {
      const item = config[key]
      if (item.icon) {
        css += `
        [data-chart="${id}"] [data-key="${key}"] .recharts-legend-item-text::before {
          content: "";
          display: inline-block;
          width: 1em;
          height: 1em;
          margin-right: 0.5em;
          vertical-align: middle;
          background-image: url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">${item.icon}</svg>`
          )}");
          background-size: contain;
        }
      `
      }
    })

    return css
  }, [config, id])

  return <style>{styles}</style>
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter && typeof value !== "undefined") {
        return labelFormatter(value, payload)
      }

      return value
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelKey,
      config,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? (
          <div className={cn("grid gap-1.5", { "pb-1.5": !hideLabel })}>
            {tooltipLabel && (
              <div className={cn("font-medium", labelClassName)}>
                {tooltipLabel}
              </div>
            )}
          </div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && (item?.value || item?.value === 0) ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? (
                          <div className={cn("font-medium", labelClassName)}>
                            {tooltipLabel}
                          </div>
                        ) : null}
                        <div className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </div>
                      </div>
                      {item.value && (
                        <div className="font-mono font-medium tabular-nums text-foreground">
                          {item.value}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                !hideIcon && (
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

const ChartPie = RechartsPrimitive.Pie
const ChartBar = RechartsPrimitive.Bar
const ChartLine = RechartsPrimitive.Line
const ChartArea = RechartsPrimitive.Area
const ChartScatter = RechartsPrimitive.Scatter
const ChartComposed = RechartsPrimitive.ComposedChart
const ChartResponsiveContainer = RechartsPrimitive.ResponsiveContainer
const ChartXAxis = RechartsPrimitive.XAxis
const ChartYAxis = RechartsPrimitive.YAxis
const ChartZAxis = RechartsPrimitive.ZAxis
const ChartCartesianGrid = RechartsPrimitive.CartesianGrid
const ChartPolarGrid = RechartsPrimitive.PolarGrid
const ChartTooltipItem = RechartsPrimitive.Tooltip
const ChartLegendItem = RechartsPrimitive.Legend
const ChartBrush = RechartsPrimitive.Brush
const ChartReferenceLine = RechartsPrimitive.ReferenceLine
const ChartReferenceArea = RechartsPrimitive.ReferenceArea
const ChartReferenceDot = RechartsPrimitive.ReferenceDot
const ChartCrosshair = RechartsPrimitive.Crosshair
const ChartCustomShape = RechartsPrimitive.Sector

export {
  useChart,
  ChartStyle,
  ChartPie,
  ChartBar,
  ChartLine,
  ChartArea,
  ChartScatter,
  ChartComposed,
  ChartContainer,
  ChartResponsiveContainer,
  ChartXAxis,
  ChartYAxis,
  ChartZAxis,
  ChartCartesianGrid,
  ChartPolarGrid,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipItem,
  ChartLegend,
  ChartLegendContent,
  ChartLegendItem,
  ChartBrush,
  ChartReferenceLine,
  ChartReferenceArea,
  ChartReferenceDot,
  ChartCrosshair,
  ChartCustomShape,
}
