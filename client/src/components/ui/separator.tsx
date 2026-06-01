import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Separator component to visually divide content.
 *
 * @purpose Renders a horizontal or vertical line to separate UI elements.
 * 
 * @param {object} props - Props passed to the Separator.
 * @param {string} [props.className] - Additional CSS classes for custom styling.
 * @param {"horizontal"|"vertical"} [props.orientation="horizontal"] - Orientation of the separator.
 * @param {boolean} [props.decorative=true] - Marks the separator as decorative for accessibility.
 * @returns {JSX.Element} A styled separator line.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <div className="flex flex-col space-y-2">
 *   <span>Section 1</span>
 *   <Separator />
 *   <span>Section 2</span>
 * </div>
 *
 * @example
 * <div className="flex space-x-2">
 *   <span>Left</span>
 *   <Separator orientation="vertical" />
 *   <span>Right</span>
 * </div>
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
