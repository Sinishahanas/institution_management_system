import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

/**
 * Slider
 *
 * @purpose
 * - Provides a customizable range slider UI component.
 * - Built on top of Radix UI's SliderPrimitive for accessibility and keyboard support.
 *
 * @param {Object} props - Standard props for the Radix SliderRoot component.
 * @param {string} [props.className] - Additional CSS classes for custom styling.
 * @param {React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>} props - All other props supported by Radix SliderPrimitive.Root (value, min, max, step, onValueChange, etc.).
 * @returns {JSX.Element} A fully accessible slider element with track, range, and thumb components.
 * @throws None. Any prop validation errors are handled internally by Radix UI.
 * @sideEffects None. Purely a visual and interactive component.
 *
 * @example
 * <Slider defaultValue={[50]} max={100} step={1} />
 *
 * @example
 * <Slider
 *   value={volume}
 *   onValueChange={(val) => setVolume(val[0])}
 *   className="w-64"
 * />
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
