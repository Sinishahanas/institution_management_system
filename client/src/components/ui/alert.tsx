import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Alert Variants
 *
 * @purpose Defines function to generate Tailwind CSS class strings for alert components based on variant options.
 *
 * @param {object} config - Configuration object for class variance.
 * @param {string} config.base - Base Tailwind CSS classes applied to all alerts.
 * @param {object} config.variants - Variant definitions mapping variant names to classes.
 * @param {object} config.defaultVariants - Default variant values to use when not provided.
 * 
 * @returns {(options?: { variant?: 'default' | 'destructive' }) => string} 
 * A function that returns a full class string for an alert based on the given variant.
 * @throws Will throw if `cva` is undefined.
 * @sideEffects None. Pure function, does not modify state or call APIs.
 *
 * @example
 * const classes = alertVariants({ variant: "destructive" });
 * // returns: "relative w-full rounded-lg border p-4 ... text-destructive"
 */
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Alert Component
 *
 * @purpose 
 * Renders a styled alert box for displaying messages such as notifications, warnings, or errors.
 * Supports different style variants (`default`, `destructive`) for visual differentiation.
 *
 * @param {React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>} props
 * @param {string} [props.className] - Additional class names for custom styling.
 * @param {"default" | "destructive"} [props.variant] - Visual style variant of the alert.
 * @returns {JSX.Element} Rendered alert box.
 * @throws Will not typically throw, but may error if React or forwardRef is not properly imported.
 * @sideEffects None
 *
 * @example
 * <Alert variant="destructive">
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>Something went wrong!</AlertDescription>
 * </Alert>
 */
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

/**
 * AlertTitle Component
 *
 * @purpose Displays the title or heading of an alert.
 *
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props
 * @param {string} [props.className] - Additional class names for custom styling.
 * @returns {JSX.Element} Rendered alert title.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <AlertTitle>Error</AlertTitle>
 */
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

/**
 * AlertDescription Component
 *
 * @purpose Displays the descriptive message/content of an alert.
 *
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props
 * @param {string} [props.className] - Additional class names for custom styling.
 * @returns {JSX.Element} Rendered alert description.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <AlertDescription>Please try again later.</AlertDescription>
 */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
