import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * ToastProvider
 *
 * @purpose
 * - Provides context for rendering and managing toast notifications.
 * - Wraps the application or part of it to allow `Toast` components to be displayed.
 *
 * @param {object} props - Standard Radix ToastProvider props.
 * @param {string} [props.className] - Additional custom class names.
 * @param {React.Ref} ref - Forwarded ref to the DOM element.
 * @returns {JSX.Element} A Radix UI `Toast.Provider` component.
 * @throws None
 * @sideEffects Renders portal-based notifications in the DOM.
 *
 * @example
 * <ToastProvider>
 *   <ToastViewport />
 * </ToastProvider>
 */
const ToastProvider = ToastPrimitives.Provider


/**
 * ToastViewport
 *
 * @purpose
 * - Defines where toast notifications are rendered within the DOM.
 * - By default, it appears fixed at the top (mobile) or bottom-right (desktop).
 *
 * @param {object} props - Standard Radix ToastViewport props.
 * @param {string} [props.className] - Additional custom class names.
 * @param {React.Ref} ref - Forwarded ref to the DOM element.
 * @returns {JSX.Element} A styled Radix `Toast.Viewport`.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <ToastViewport />
 */
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

/**
 * ToastVariants
 *
 * @purpose Defines function to generate Tailwind CSS class strings for toast components based on variant options.
 *
 * @param {object} config - Configuration object for class variance.
 * @param {string} config.base - Base Tailwind CSS classes applied to all toasts.
 * @param {object} config.variants - Variant definitions mapping variant names to classes.
 * @param {object} config.defaultVariants - Default variant values to use when not provided.
 * 
 * @returns {(options?: { variant?: 'default' | 'destructive' }) => string} 
 * A function that returns a full class string for a toast based on the given variant.
 * @throws Will throw if `cva` is undefined.
 * @sideEffects None. Pure function, does not modify state or call APIs.
 *
 * @example
 * const classes = toastVariants({ variant: "destructive" });
 * // returns: "relative w-full rounded-lg border p-4 ... text-destructive"
 */
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)


/**
 * Toast
 *
 * @purpose
 * - Main container for a toast notification.
 * - Supports variant styling (default or destructive).
 *
 * @param {object} props - Toast properties.
 * @param {"default" | "destructive"} [props.variant="default"] - Style variant.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref} ref - Forwarded ref.
 * @returns {JSX.Element} A styled toast notification container.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Toast>
 *   <ToastTitle>Success</ToastTitle>
 *   <ToastDescription>Profile updated successfully.</ToastDescription>
 *   <ToastClose />
 * </Toast>
 */
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

/**
 * ToastAction
 *
 * @purpose
 * - Renders an action button inside the toast (e.g., "Undo").
 *
 * @param {object} props - Standard Radix ToastAction props.
 * @param {string} [props.className] - Custom classes.
 * @param {React.Ref} ref - Forwarded ref.
 * @returns {JSX.Element} A styled toast action button.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <ToastAction altText="Undo">Undo</ToastAction>
 */
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName


/**
 * ToastClose
 *
 * @purpose
 * - Provides a close button for dismissing the toast.
 *
 * @param {object} props - Standard Radix ToastClose props.
 * @param {string} [props.className] - Custom CSS classes.
 * @param {React.Ref} ref - Forwarded ref.
 * @returns {JSX.Element} A close button (X icon).
 * @throws None
 * @sideEffects None
 *
 * @example
 * <ToastClose />
 */
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

/**
 * ToastTitle
 *
 * @purpose
 * - Displays the title text of a toast notification.
 *
 * @param {object} props - Standard Radix ToastTitle props.
 * @param {string} [props.className] - Custom CSS classes.
 * @param {React.Ref} ref - Forwarded ref.
 * @returns {JSX.Element} A styled `<h>` element.
 * @throws None
 * @sideEffects None
 *
 * @example <ToastTitle>Success</ToastTitle>
 */
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName


/**
 * ToastDescription
 *
 * @purpose
 * - Provides additional descriptive text for a toast.
 *
 * @param {object} props - Standard Radix ToastDescription props.
 * @param {string} [props.className] - Custom CSS classes.
 * @param {React.Ref} ref - Forwarded ref.
 * @returns {JSX.Element} A styled description block.
 * @throws None
 * @sideEffects None
 *
 * @example <ToastDescription>Your file has been uploaded.</ToastDescription>
 */
const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Type exports
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
