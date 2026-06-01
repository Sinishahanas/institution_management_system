import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

/**
 * @purpose
 * Provides a React Context to manage and share toggle group settings (e.g., size and variant) across multiple `Toggle` components for consistent appearance and behavior.
 *
 * @param None — initialized directly with default values for `size` and `variant`.
 *
 * @returns {React.Context<VariantProps<typeof toggleVariants>>}
 * Returns a React Context object that holds configuration for toggle styling.
 * @throws None
 * @sideEffects None
 *
 * @example
 * ```tsx
 * // Accessing toggle group context in a child component
 * const { size, variant } = React.useContext(ToggleGroupContext);
 *
 * return <Toggle variant={variant} size={size}>Option</Toggle>;
 * ```
 */
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})


/**
 * ToggleGroup component
 *
 * @purpose
 * - Provides a grouped set of toggle buttons where only one (or multiple, depending on props) can be selected at a time.
 * - Acts as a wrapper around Radix UI's `ToggleGroupPrimitive.Root`.
 * - Shares styling variants (size, variant) via context with `ToggleGroupItem`.
 *
 * @param {object} props - Props passed to Radix `ToggleGroupPrimitive.Root`.
 * @param {"default"|"outline"} [props.variant="default"] - The visual style variant of toggle items.
 * @param {"default"|"sm"|"lg"} [props.size="default"] - The size of toggle items.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {React.ReactNode} props.children - Child `ToggleGroupItem` components.
 * @returns {JSX.Element} Rendered toggle group root with context provider.
 * @throws None
 * @sideEffects Provides context (`variant`, `size`) to all nested `ToggleGroupItem` components.
 *
 * @example
 * <ToggleGroup type="single" defaultValue="bold" variant="outline" size="sm">
 *   <ToggleGroupItem value="bold">B</ToggleGroupItem>
 *   <ToggleGroupItem value="italic">I</ToggleGroupItem>
 *   <ToggleGroupItem value="underline">U</ToggleGroupItem>
 * </ToggleGroup>
 */
const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName


/**
 * ToggleGroupItem component
 *
 * @purpose
 * - Represents an individual toggle button inside a `ToggleGroup`.
 * - Inherits size and variant styling from `ToggleGroup` context if not explicitly provided.
 * - Wraps Radix UI's `ToggleGroupPrimitive.Item`.
 *
 * @param {object} props - Props passed to Radix `ToggleGroupPrimitive.Item`.
 * @param {"default"|"outline"} [props.variant] - Visual style variant (overrides context).
 * @param {"default"|"sm"|"lg"} [props.size] - Size of the toggle item (overrides context).
 * @param {string} [props.className] - Additional class names for styling.
 * @param {React.ReactNode} props.children - Content inside the toggle button (e.g., text, icon).
 * @returns {JSX.Element} A styled toggle button.
 * @throws None
 * @sideEffects Consumes context (`variant`, `size`) from `ToggleGroup` if props are not provided.
 * 
 * @example
 * <ToggleGroup type="multiple" variant="default" size="lg">
 *   <ToggleGroupItem value="left">Left</ToggleGroupItem>
 *   <ToggleGroupItem value="center">Center</ToggleGroupItem>
 *   <ToggleGroupItem value="right">Right</ToggleGroupItem>
 * </ToggleGroup>
 */ 
const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
