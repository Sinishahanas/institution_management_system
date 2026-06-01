import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card component
 *
 * @purpose 
 * - A container component with consistent styling for displaying grouped content.
 * - Provides a rounded border, background, shadow, and text styling.
 * - Can wrap headers, content, descriptions, and footers for a card-like layout.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard div props.
 * @param {React.Ref<HTMLDivElement>} ref - Ref forwarded to the card container.
 * @returns {JSX.Element} A styled card container.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Main content here</CardContent>
 *   <CardFooter>Footer content</CardFooter>
 * </Card>
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader component
 *
 * @purpose 
 * - Container for the card's header section.
 * - Adds vertical spacing and padding, usually containing a title and description.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard div props.
 * @param {React.Ref<HTMLDivElement>} ref - Ref forwarded to the header container.
 * @returns {JSX.Element} A card header container.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <CardHeader>
 *   <CardTitle>Title</CardTitle>
 *   <CardDescription>Description</CardDescription>
 * </CardHeader>
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle component
 *
 * @purpose 
 * - Display the card's main title.
 * - Renders a prominent heading with consistent font size, weight, and tracking.
 *
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - Standard heading props.
 * @param {React.Ref<HTMLHeadingElement>} ref - Ref forwarded to the heading element.
 * @returns {JSX.Element} A styled card title element.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <CardTitle>Title</CardTitle>
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription component
 *
 * @purpose 
 * - Display the card's description or subtitle.
 * - Renders smaller, muted text under the title for context or explanation.
 *
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - Standard paragraph props.
 * @param {React.Ref<HTMLHeadingElement>} ref - Ref forwarded to the paragraph element.
 * @returns {JSX.Element} A styled card description element.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <CardDescription>Description</CardDescription>
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent component
 *
 * @purpose 
 * - Container for the main content of the card.
 * - Adds padding to separate content from the card's header and footer.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard div props.
 * @param {React.Ref<HTMLDivElement>} ref - Ref forwarded to the content container.
 * @returns {JSX.Element} A card content container.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <CardContent>Main content here</CardContent>
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter component
 *
 * @purpose 
 * - Container for actions or supplementary content at the bottom of the card.
 * - Uses padding and flex layout for aligning buttons, links, or other footer elements.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard div props.
 * @param {React.Ref<HTMLDivElement>} ref - Ref forwarded to the footer container.
 * @returns {JSX.Element} A card footer container.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <CardFooter>Footer content</CardFooter>
 */

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
