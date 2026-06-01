import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"


/**
 * @purpose
 *  - A customizable checkbox component built on top of Radix UI's `@radix-ui/react-checkbox`.  
 *  - Supports indeterminate and checked states.
 *  - Handles disabled and focus-visible accessibility styles.
 *  - Displays a checkmark icon (`lucide-react`) when checked.
 *
 * @param {object} props React component props for `CheckboxPrimitive.Root`. Includes:
 *  - `className` (optional): Additional CSS classes to style the root element.
 *  - Other standard checkbox props like `checked`, `defaultChecked`, `disabled`, `onChange`, etc.
 * @returns {JSX.Element} A checkbox input wrapped in Radix UI's Root component.
 * @throws None
 * @sideEffects Renders a checkmark icon when checked. Applies focus and disabled styling based on state.
 * 
 * @example
 * ```tsx
 * import { Checkbox } from "@/components/ui/checkbox"
 *
 * export default function Example() {
 *   return (
 *     <form>
 *       <label className="flex items-center space-x-2">
 *         <Checkbox defaultChecked />
 *         <span>Accept terms and conditions</span>
 *       </label>
 *     </form>
 *   )
 * }
 * ```
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
