import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @purpose
 * - Define the props for the custom Input component.
 * - Extends all standard HTML input attributes.
 * 
 * @param {object} props - Input props.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @param {string} [props.type] - Input type (text, password, email, file, etc.) (optional, defaults to "text").
 * @param {React.Ref<HTMLInputElement>} ref - Ref forwarded to the underlying HTML input element.
 * 
 * @returns {JSX.Element} The rendered input element.
 * @throws None
 * @sideEffects None internally
 * 
 * @example
 * ```tsx
 * <Input 
 *   type="text"
 *   placeholder="Enter your name" 
 *   value={name} 
 *   onChange={(e) => setName(e.target.value)} 
 * />
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}


/**
 * @purpose
 * - Define the custom Input component.
 * - Input is a styled wrapper around the native HTML input element.
 * - It supports all standard input props and includes styling for focus, disabled state, and file inputs.
 * 
 * @param {object} props - Input props.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @param {string} [props.type] - Input type (text, password, email, file, etc.) (optional, defaults to "text").
 * @param {React.Ref<HTMLInputElement>} ref - Ref forwarded to the underlying HTML input element.
 * 
 * @returns {JSX.Element} The rendered input element.
 * @throws None
 * @sideEffects None internally
 * 
 * @example
 * <Input
 *   type="text"
 *   placeholder="Enter your name"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 * />
 *
 * @example
 * <Input type="file" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
