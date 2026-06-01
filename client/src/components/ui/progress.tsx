import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

/**
 * Progress bar component.
 *
 * @purpose Displays a horizontal progress bar indicating completion percentage.
 *
 * @param {object} props - Props for the Progress component.
 * @param {string} [props.className] - Additional Tailwind class names for styling.
 * @param {number} [props.value] - Progress value between 0 and 100.
 * @param {React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>} props - Other props passed to Radix Progress root.
 * @returns {JSX.Element} Rendered progress bar component.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <Progress value={50} className="my-4" />
 */

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
