import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"


/**
 * toggleVariants
 *
 * @purpose
 * - Provides reusable class variance authority (CVA) variants for the Toggle component.
 * - Allows toggles to adapt to different `variant` and `size` styles consistently.
 *
 * @param {Object} options - CVA options
 * @param {"default"|"outline"} options.variant - Visual style variant of the toggle.
 * @param {"default"|"sm"|"lg"} options.size - Size of the toggle button.
 * @returns {string} - CSS class names for the toggle.
 * @throws None
 * @sideEffects None
 *
 * @example
 * const className = toggleVariants({ variant: "outline", size: "sm" });
 */
const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


/**
 * Toggle component
 *
 * @purpose
 * - A styled toggle button that supports on/off states.
 * - Wraps Radix UI's `TogglePrimitive.Root` and applies consistent styling.
 * - Supports CVA variants for `size` and `variant`.
 *
 * @param {Object} props - Props passed to Radix `TogglePrimitive.Root`.
 * @param {"default"|"outline"} [props.variant="default"] - Visual style variant.
 * @param {"default"|"sm"|"lg"} [props.size="default"] - Toggle button size.
 * @param {string} [props.className] - Additional class names for custom styling.
 * @param {React.ReactNode} props.children - Content inside the toggle button.
 * @returns {JSX.Element} Rendered toggle button.
 * @throws {Error} None
 * @sideEffects None
 *
 * @example
 * <Toggle variant="outline" size="sm">Toggle Me</Toggle>
 */
const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
