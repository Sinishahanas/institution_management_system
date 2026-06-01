import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Breadcrumb
 *
 * @purpose
 * -A navigation component that displays the current page's location within a hierarchy.
 * - Wraps a series of breadcrumb items to provide context for the user.
 *
 * @param {object} props - Props for the breadcrumb container.
 * @param {React.ReactNode} [props.separator] - Optional separator between items.
 * @param {string} [props.className] - Optional additional class names.
 * @returns {JSX.Element} Rendered breadcrumb container.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *       <BreadcrumbSeparator />
 *     </BreadcrumbItem>
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Dashboard</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 */
const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ className, separator, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    className={cn("flex flex-wrap items-center", className)}
    {...props}
  />
))
Breadcrumb.displayName = "Breadcrumb"

/**
 * BreadcrumbList
 *
 * @purpose
 * - Container for the list of breadcrumb items.
 * - Uses an ordered list for semantic HTML and accessibility.
 *
 * @param {string} [props.className] - Optional additional class names.
 * @returns {JSX.Element} Rendered ordered list of breadcrumb items.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <BreadcrumbList>
 *   <BreadcrumbItem>...</BreadcrumbItem>
 * </BreadcrumbList>
 */
const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

/**
 * BreadcrumbItem
 *
 * @purpose
 * - Represents a single breadcrumb item within the list.
 *
 * @param {string} [props.className] - Optional additional class names.
 * @returns {JSX.Element} Rendered list item.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <BreadcrumbItem>
 *   <BreadcrumbLink href="/">Home</BreadcrumbLink>
 * </BreadcrumbItem>
 */
const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

/**
 * BreadcrumbLink
 *
 * @purpose
 * - Link inside a breadcrumb item that navigates to a previous page.
 *
 * @param {boolean} [props.asChild] - Render as a custom child element instead of `<a>`.
 * @param {string} [props.className] - Optional additional class names.
 * @returns {JSX.Element} Rendered anchor or custom element.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <BreadcrumbLink href="/">Home</BreadcrumbLink>
 * <BreadcrumbLink asChild><button>Go Back</button></BreadcrumbLink>
 */
const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

/**
 * BreadcrumbPage
 *
 * @purpose
 * - Displays the current page in the breadcrumb.
 * - Marks the page as `aria-current="page"` for accessibility.
 *
 * @param {string} [props.className] - Optional additional class names.
 * @returns {JSX.Element} Rendered span representing the current page.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <BreadcrumbPage>Dashboard</BreadcrumbPage>
 */
const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

/**
 * BreadcrumbSeparator
 *
 * @purpose
 * - Displays a separator between breadcrumb items.
 * - Defaults to a right arrow icon but can accept a custom separator.
 *
 * @param {React.ReactNode} [props.children] - Optional custom separator content.
 * @param {string} [props.className] - Optional additional class names.
 * @returns {JSX.Element} Rendered separator list item.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <BreadcrumbSeparator />
 * <BreadcrumbSeparator>{">"}</BreadcrumbSeparator>
 */
const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children || <ChevronRight className="h-4 w-4" />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
}