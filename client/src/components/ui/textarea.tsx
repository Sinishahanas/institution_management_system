import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @interface TextareaProps
 * @typedef {object} TextareaProps
 * @extends React.TextareaHTMLAttributes<HTMLTextAreaElement>
 * 
 * @description
 *  Extends the native HTML `<textarea>` attributes to include all standard properties.
 *
 * @property {string} [className] - Optional custom CSS classes.
 * @property {React.Ref<HTMLTextAreaElement>} ref - Forwarded ref to the `<textarea>` element.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}


/**
 * Textarea
 *
 * @purpose
 * - Provides a styled and accessible multi-line text input component.
 * - Enhances the default `<textarea>` element with consistent styling, 
 *   focus ring, disabled state, and placeholder text styling.
 *
 * @param {TextareaProps} props - All props applicable to a native `<textarea>`.
 * @param {string} [props.className] - Optional custom CSS classes.
 * @param {React.Ref<HTMLTextAreaElement>} ref - Forwarded ref to the `<textarea>` element.
 * @returns {JSX.Element} A styled `<textarea>` element.
 * @throws None
 * @sideEffects None
 *
 * @example
 * // Basic usage
 * <Textarea placeholder="Enter your message..." />
 *
 * @example
 * // With custom styling
 * <Textarea className="border-red-500" defaultValue="Hello World!" />
 * <Textarea rows={5} className="border-blue-500" defaultValue="Hello!" />
 *
 * @example
 * // With controlled state
 * const [value, setValue] = React.useState("");
 * <Textarea
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   placeholder="Type something..."
 * />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      /**
       * The main <textarea> element
       * - `rounded-md`, `border`, and `px-3 py-2` for styling
       * - `focus-visible:ring-2` for accessible focus states
       * - `disabled:opacity-50` and `disabled:cursor-not-allowed` for disabled UI feedback
       * - Tailwind classes merged using the `cn()` utility
       */
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

// Display name for React DevTools
Textarea.displayName = "Textarea"

export { Textarea }
