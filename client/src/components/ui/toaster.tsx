import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

/**
 * Toaster
 *
 * @purpose
 * - Provides a global notification system for the application.
 * - Listens to toast state via the `useToast` hook and renders toast notifications.
 * - Wraps Radix UI's ToastProvider and maps multiple toast messages dynamically.
 *
 * @param {object} props - Standard Radix ToastProvider props.
 * @param {string} [props.className] - Custom CSS classes.
 * @returns {JSX.Element} A `ToastProvider` that renders active toast notifications and a `ToastViewport`.
 * @throws None
 * @sideEffects
 * - Renders toast notifications into a fixed viewport (`ToastViewport`).
 * - Affects DOM by adding/removing toast elements dynamically when triggered.
 *
 * @example
 * // Example usage in your root layout or App.tsx:
 * function App() {
 *   return (
 *     <>
 *       <Navbar />
 *       <MainContent />
 *       <Toaster />   // <-- must be included once at the root level
 *     </>
 *   )
 * }
 *
 * // Example of triggering a toast
 * import { useToast } from "@/hooks/use-toast"
 *
 * function SaveButton() {
 *   const { toast } = useToast()
 *
 *   return (
 *     <button
 *       onClick={() =>
 *         toast({
 *           title: "Profile saved",
 *           description: "Your changes have been successfully saved.",
 *         })
 *       }
 *     >
 *       Save
 *     </button>
 *   )
 * }
 */
export function Toaster() {
  // Get the list of current toasts from the custom useToast hook
  const { toasts } = useToast()

  return (
    // The provider that wraps all toast components and manages their state and position
    <ToastProvider>
      {/* Loop through each toast and render it */}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      {/* The container (viewport) where all toasts appear, typically fixed to a screen corner */}
      <ToastViewport />
    </ToastProvider>
  )
}
