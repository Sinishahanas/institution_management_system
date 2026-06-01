import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/**
 * Switch component.
 *
 * @purpose
 * - Provides an accessible toggle switch input with styled thumb and track.
 * - Uses Radix UI `Switch` primitives under the hood.
 *
 * @param {object} props - Props passed to Radix Switch root.
 * @param {string} [props.className] - Additional CSS classes for the switch root.
 * @param {React.Ref} ref - A forwarded ref pointing to the switch root element.
 * @returns {JSX.Element} A styled toggle switch component.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Switch defaultChecked />
 * 
 * @example
 * <Switch
 *   checked={isEnabled}
 *   onCheckedChange={(checked) => setIsEnabled(checked)}
 *   className="bg-blue-500"
 * />
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  // Root container for the switch (the track)
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    {/* Thumb element — the small circular handle that moves when toggled */}
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))

// Display name for better debugging in React DevTools
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
