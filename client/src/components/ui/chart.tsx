import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

/** 
 * THEMES
 *
 * Purpose:
 *  Defines available chart themes and their corresponding CSS selectors.
 *  Used for theme-aware color mapping in charts.
 *
 * Format: { THEME_NAME: CSS_SELECTOR }
 */
const THEMES = { light: "", dark: ".dark" } as const

/**
 * ChartConfig
 *
 * @purpose
 *  - Configuration map for chart series/keys. Each entry can optionally supply a label, an icon component, and either a static color or a theme-aware color map.
 *
 * @param {object} props - Component props.
 * @param {string} [props.id] - Optional DOM id; used as part of the data-chart attribute.
 * @param {string} [props.className] - Additional classes applied to the root container.
 * @param {ChartConfig} props.config - Chart configuration mapping series keys to display options.
 * @param {React.ReactNode} props.children - Children to render inside Recharts ResponsiveContainer.
 * @returns {JSX.Element} A container that renders `ChartStyle` and the provided Recharts ResponsiveContainer children.
 * @throws None
 * @sideEffects Injects a `<style>` tag into the DOM (via ChartStyle) containing CSS variables used by chart elements.
 * 
 * @example
 * ```ts
 * const config: ChartConfig = {
 *   revenue: { label: "Revenue", color: "#4F46E5" },
 *   expenses: { label: "Expenses", theme: { light: "#F97316", dark: "#FB923C" } }
 * }
 * ```
 */
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}


/**
 * ChartContextProps
 *
 * @purpose Defines the shape of the chart context object.
 * 
 * @param {object} props - Component props.
 * @param {ChartConfig} props.config - Chart configuration mapping series keys to display options.
 * @returns {ChartContextProps} The chart context containing `config`.
 * @throws None
 * @sideEffects None
 * @example
 * ```ts
 * const config: ChartConfig = {
 *   revenue: { label: "Revenue", color: "#4F46E5" },
 *   expenses: { label: "Expenses", theme: { light: "#F97316", dark: "#FB923C" } }
 * }
 * ```
 */
type ChartContextProps = {
  config: ChartConfig
}


/** 
 * ChartContext
 *
 * @purpose 
 * - React context providing chart configuration to child components.
 * - Default value is null, enforcing usage within a provider.
 * 
 * @param {object} props - Component props.
 * @param {ChartContextProps} props.value - Chart configuration object.
 * @returns {ChartContextProps} The chart context containing `config`.
 * @throws None
 * @sideEffects None
 * @example
 * ```ts
 * const config: ChartConfig = {
 *   revenue: { label: "Revenue", color: "#4F46E5" },
 *   expenses: { label: "Expenses", theme: { light: "#F97316", dark: "#FB923C" } }
 * }
 * ```
 */
const ChartContext = React.createContext<ChartContextProps | null>(null)


/**
 * useChart
 *
 * @purpose Hook that returns the Chart context (config) for child components.
 * 
 * @param None
 * @returns {ChartContextProps} The chart context containing `config`.
 * @throws {Error} Throws an error if not used within a <ChartContainer />.
 * @sideEffects None
 * 
 * @example
 * ```ts
 * const config = useChart()
 * ```
 */
function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

/**
 * ChartContainer
 *
 * @purpose 
 * - Top-level wrapper for Recharts charts that injects theme-aware CSS variables
 * - and provides a chart configuration context to tooltip/legend helpers.
 *
 * @param {object} props - Component props.
 * @param {string} [props.id] - Optional DOM id; used as part of the data-chart attribute.
 * @param {string} [props.className] - Additional classes applied to the root container.
 * @param {ChartConfig} props.config - Chart configuration mapping series keys to display options.
 * @param {React.ReactNode} props.children - Children to render inside Recharts ResponsiveContainer.
 * @returns {JSX.Element} A container that renders `ChartStyle` and the provided Recharts ResponsiveContainer children.
 * @throws None
 * @sideEffects Injects a `<style>` tag into the DOM (via ChartStyle) containing CSS variables used by chart elements.
 * 
 * @example
 * ```tsx
 * <ChartContainer config={config} id="revenue-chart">
 *   <AreaChart data={data}>...</AreaChart>
 * </ChartContainer>
 * ```
 */
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
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
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

/**
 * @purpose 
 * - Generates and injects a `<style>` element with CSS custom properties (variables)
 * - for series colors based on the provided ChartConfig and THEMES mapping.
 *
 * @param {object} props
 * @param {string} props.id - chart id used in the data-chart selector.
 * @param {ChartConfig} props.config - chart color/label configuration.
 * @returns {JSX.Element | null} A style element containing CSS variables or null if no colors provided.
 * @throws None
 * @sideEffects Uses `dangerouslySetInnerHTML` to inject CSS into the DOM.
 *
 * @example
 * ```tsx
 * <ChartStyle id="chart-rev" config={config} />
 * ```
 */
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
              ${prefix} [data-chart=${id}] {
              ${colorConfig
                .map(([key, itemConfig]) => {
                  const color =
                    itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
                    itemConfig.color
                  return color ? `  --color-${key}: ${color};` : null
                })
                .join("\n")}
              }
              `
          )
          .join("\n"),
      }}
    />
  )
}

/**
 * @purpose 
 * - Re-export of Recharts Tooltip primitive for convenience.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} The Recharts Tooltip component.
 */
const ChartTooltip = RechartsPrimitive.Tooltip

/**
 * ChartTooltipContent
 *
 * @purpose
 *  - A custom tooltip renderer compatible with Recharts that uses ChartConfig to label series,
 *  - optionally show icons, and render formatted values.
 *
 * @param {object} props - Component props.
 * @param {boolean} [props.hideLabel] - Hides group label.
 * @param {boolean} [props.hideIndicator] - Hides color marker.
 * @param {"line" | "dot" | "dashed"} [props.indicator] - Tooltip indicator style.
 * @param {string} [props.nameKey] - Key for tooltip name.
 * @param {string} [props.labelKey] - Key for tooltip label.
 * @returns {JSX.Element | null} The custom tooltip component.
 * @throws None
 * @sideEffects
 *  - Uses ChartContext via useChart
 *  - Throws if used outside ChartContainer
 * 
 * @example
 * ```tsx
 * <Tooltip content={<ChartTooltipContent hideLabel={false} />} />
 * ```
 */
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
    // Access chart configuration from context
    const { config } = useChart()

    /**
     * tooltipLabel
     *
     * @purpose 
     *  - Computes the label to display at the top of the tooltip.
     *  - Respects `hideLabel` and applies custom `labelFormatter`.
     *
     * @param None
     * @returns {string | null} The label to display or null if hidden.
     * @throws None
     * @sideEffects None
     * @example
     * ```ts
     * const label = tooltipLabel()
     * ```
     */
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

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
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
        {/* Display tooltip label if not nested */}
        {!nestLabel ? tooltipLabel : null}

        {/* Render each series/item in the payload */}
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
                {formatter && item?.value !== undefined && item.name ? (
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
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
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
ChartTooltipContent.displayName = "ChartTooltip"

/**
 * ChartLegend
 *
 * Re-export of Recharts Legend primitive for convenience.
 */
const ChartLegend = RechartsPrimitive.Legend

/**
 * ChartLegendContent
 *
 * @purpose
 *  - Custom legend renderer that uses ChartConfig to show labels and optional icons.
 *
 * @param {object} props
 *  - `payload` (from Recharts) - list of legend items.
 *  - `verticalAlign` - "top" | "bottom" (affects spacing)
 *  - `hideIcon` - hide icon square if true.
 *  - `nameKey` - optional key to read the name from payload.
 *
 * @returns JSX.Element | null
 * @throws None
 * @sideEffects Reads chart config from ChartContext; throws if used outside ChartContainer (via useChart).
 *
 * @example
 * ```tsx
 * <Legend content={<ChartLegendContent />} />
 * ```
 */
const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
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
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
/**
 * getPayloadConfigFromPayload
 *
 * @purpose
 *  - Helper that resolves an item configuration (from ChartConfig) for a given Recharts payload row.
 *
 * @param {ChartConfig} config - The global chart configuration map.
 * @param {any} payload - The Recharts payload entry (may include payload.payload).
 * @param {string} key - Key to look up configuration (usually dataKey or name).
 * @returns The matching config entry or undefined.
 * @throws None
 * @sideEffects None (pure lookup).
 *
 * @example
 * ```ts
 * const config = getPayloadConfigFromPayload(chartConfig, payload, "value")
 * ```
 */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  // Prefer label key from top-level payload
  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
