import { cn } from "@/lib/utils"

/**
 * @purpose 
 * - Displays a loading placeholder UI element.
 * - Typically used to indicate loading state for content such as text, buttons, or cards.
 *
 * @param {Object} props - Props for the container div.
 * @param {string} [props.className] - Additional CSS classes to customize appearance.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes (e.g., id, style, onClick).
 * @returns {JSX.Element} A `<div>` element with skeleton styling and animation.
 * @throws None.
 * @sideEffects None. (Pure UI component.)
 *
 * @example
 * <Skeleton className="h-6 w-32" />
 *
 * @example
 * // Used as a placeholder for a card
 * <div className="p-4 border rounded-md">
 *   <Skeleton className="h-4 w-3/4 mb-2" />
 *   <Skeleton className="h-4 w-full" />
 * </div>
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
