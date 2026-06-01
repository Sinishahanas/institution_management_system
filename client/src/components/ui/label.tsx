import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Variants for the Label component.
 *
 * @purpose
 * - This uses `class-variance-authority` (cva) to define base styles for the Label.
 * - It can be extended with additional variants if needed.
 *
 * @type {Function} labelVariants - Function that returns a string of class names.
 * @param {object} [options] - Optional configuration object (for future variants).
 * @returns {string} The computed class names for the Label component.
 * @throws None directly. May throw errors if cva throws errors.
 * @sideEffects None. Pure function for styling.
 *
 * @example
 * // Default usage
 * const className = labelVariants();
 *
 * // Combine with custom classes
 * const classNameWithCustom = cn(labelVariants(), "text-blue-500");
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * Props for the Label component.
 *
 * @purpose
 * - Define the props for the Label component.
 * - It extends the props of the underlying LabelPrimitive.Root and includes variant props.
 *
 * @type {Object} LabelProps - The props for the Label component.
 * @property {React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>} [props] - The props for the underlying LabelPrimitive.Root.
 * @property {VariantProps<typeof labelVariants>} [props] - The variant props for the Label component.
 * 
 * @returns {LabelProps} The props for the Label component.
 * @throws None directly. May throw errors if labelPrimitive.Root throws errors.
 * @sideEffects None. Pure function for styling.
 * 
 * @example
 * // Default usage
 * const className = labelVariants();
 *
 * // Combine with custom classes
 * const classNameWithCustom = cn(labelVariants(), "text-blue-500");
 */
export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {}


/**
 * Label is a styled wrapper around the Radix UI Label component.
 *
 * @purpose
 * - It is used to label form elements, respecting the disabled state of the associated input.
 * 
 * @param {object} props - Label props.
 * @param {string} [props.className] - Additional CSS classes for styling (optional).
 * @param {string} [props.htmlFor] - The `id` of the input this label is associated with (optional).
 * @param {React.Ref} ref - Ref forwarded to the underlying LabelPrimitive.Root.
 * 
 * @returns {JSX.Element} The rendered Label component.
 * @throws None directly. May throw errors if labelPrimitive.Root throws errors.
 * @sideEffects None. Pure UI component; does not modify state or call external APIs.
 * 
 * @example
 * <Label htmlFor="username">Username</Label>
 * <input id="username" type="text" />
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
