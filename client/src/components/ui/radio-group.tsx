import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * RadioGroup component.
 *
 * @purpose Provides a group of radio buttons for selecting a single option from multiple choices.
 * 
 * @param {object} props - Props for the RadioGroup component.
 * @param {string} [props.className] - Additional Tailwind class names for styling.
 * @param {React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>} props - Other props passed to Radix RadioGroup root.
 * @returns {JSX.Element} Rendered radio group.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <RadioGroup defaultValue="option1" onValueChange={(val) => console.log(val)}>
 *   <RadioGroupItem value="option1" />
 *   <RadioGroupItem value="option2" />
 * </RadioGroup>
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

/**
 * RadioGroupItem component.
 *
 * @purpose Represents a single radio button within a RadioGroup.
 * 
 * @param {object} props - Props for the RadioGroupItem component.
 * @param {string} [props.className] - Additional Tailwind class names for styling.
 * @param {React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>} props - Other props passed to Radix RadioGroup item.
 * @returns {JSX.Element} Rendered radio button.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <RadioGroupItem value="option1" />
 */
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
