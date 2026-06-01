import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

/**
 * Pagination container component.
 *
 * @purpose Provides a semantic wrapper for pagination controls.
 * @param {React.ComponentProps<"nav"> & { className?: string }} props - Standard <nav> props and optional className.
 * @returns {JSX.Element} A nav element wrapping pagination controls.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Pagination className="my-4">
 *   <PaginationContent>...</PaginationContent>
 * </Pagination>
 */
const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"


/**
 * PaginationContent component.
 *
 * @purpose Wrapper for the pagination list items (<li>).
 * @param {React.ComponentProps<"ul"> & { className?: string }} props - Standard <ul> props and optional className.
 * @returns {JSX.Element} An unordered list element.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <PaginationContent>
 *   <PaginationItem>...</PaginationItem>
 * </PaginationContent>
 */
const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"


/**
 * PaginationItem component.
 *
 * @purpose Wraps a single pagination item (<li>).
 * @param {React.ComponentProps<"li"> & { className?: string }} props - Standard <li> props and optional className.
 * @returns {JSX.Element} A list item element.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <PaginationItem>
 *   <PaginationLink>1</PaginationLink>
 * </PaginationItem>
 */
const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"


/**
 * PaginationLink component.
 *
 * @purpose Renders a pagination link (<a>) and applies active styling.
 * @param {object} props
 * @param {boolean} [props.isActive] - Whether the page link is active.
 * @param {"icon" | "default" | "sm" | "lg"} [props.size] - Button size variant.
 * @param {React.ComponentProps<"a">} [props] - Standard anchor props.
 * @returns {JSX.Element} An anchor element styled as a pagination button.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <PaginationLink isActive href="/page/1">1</PaginationLink>
 */
type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"


/**
 * PaginationPrevious component.
 *
 * @purpose Renders a "Previous" pagination button with an arrow.
 * @param {React.ComponentProps<typeof PaginationLink>} props - Props for the underlying PaginationLink.
 * @returns {JSX.Element} "Previous" pagination button.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <PaginationPrevious onClick={goToPreviousPage} />
 */
const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"


/**
 * PaginationNext component.
 *
 * @purpose Renders a "Next" pagination button with an arrow.
 * @param {React.ComponentProps<typeof PaginationLink>} props - Props for the underlying PaginationLink.
 * @returns {JSX.Element} "Next" pagination button.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <PaginationNext onClick={goToNextPage} />
 */
const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"


/**
 * PaginationEllipsis component.
 *
 * @purpose Renders an ellipsis to indicate hidden pages.
 * @param {React.ComponentProps<"span">} props - Standard <span> props and optional className.
 * @returns {JSX.Element} Ellipsis element.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <PaginationEllipsis />
 */
const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}