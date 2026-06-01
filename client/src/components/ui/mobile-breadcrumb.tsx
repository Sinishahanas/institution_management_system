import React, { useState } from "react";
import { Link } from "wouter";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * @purpose Represents a single breadcrumb entry.
 *
 * @property {string} title - Visible label for the breadcrumb.
 * @property {string} [href] - Optional link to navigate to when the breadcrumb is clicked.
 * @property {React.ReactNode} [icon] - Optional icon displayed before the title.
 * 
 * @returns {BreadcrumbItem} The breadcrumb item.
 * 
 * @example
 * ```tsx
 * const breadcrumbItem: BreadcrumbItem = {
 *   title: "Home",
 *   href: "/",
 *   icon: <HomeIcon />,
 * };
 * ```
 */
export interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
}

/**
 * @purpose Props for the MobileBreadcrumb component.
 *
 * @property {BreadcrumbItem[]} items - Array of breadcrumb items to display.
 * @property {string} [className] - Optional additional class names to apply to the nav container.
 */
interface MobileBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * MobileBreadcrumb Component
 *
 * @purpose A compact breadcrumb component optimized for mobile that collapses intermediate items
 *   into a dropdown when there are more than three items.
 *
 * @param {object} props - Component props
 * @param {BreadcrumbItem[]} props.items - Ordered list of breadcrumb items (first -> last).
 * @param {string} [props.className] - Optional additional class names to apply to the nav container.
 * @returns {JSX.Element | null} A navigation element with breadcrumbs or `null` when no items provided.
 *
 * @sideEffects
 *   - Manages local UI state (`isOpen`) for the dropdown open/close state.
 *   - Uses client-side navigation via `wouter`'s `<Link />` when `href` is provided.
 *
 * @throws {Error} If `items` is not an array or contains objects missing the required `title` property.
 * @throws {Error} If a `BreadcrumbItem` has an invalid `href` type (must be string if provided).
 * 
 * @example
 * ```tsx
 * <MobileBreadcrumb
 *   items={[
 *     { title: "Home", href: "/" },
 *     { title: "Dashboard", href: "/dashboard" },
 *     { title: "Reports", href: "/dashboard/reports" },
 *   ]}
 * />
 * ```
 */
export function MobileBreadcrumb({ items, className }: MobileBreadcrumbProps) {
  // Define which items to show directly (first and last two and which to collapse into the dropdown)

  // State to track dropdown open/close for middle items
  const [isOpen, setIsOpen] = useState(false);
  

  // Return null if no items provided
  if (!items || items.length === 0) {
    return null;
  }
  
  // Always show first item
  const firstItem = items[0];
  
  // If there are 3 or fewer items, show them all
  if (items.length <= 3) {
    return (
      <nav className={cn("flex items-center overflow-x-auto py-2", className)}>
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            )}
            {item.href ? (
              <Link 
                href={item.href}
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.title}
              </Link>
            ) : (
              <span className="flex items-center text-sm font-medium">
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.title}
              </span>
            )}
          </div>
        ))}
      </nav>
    );
  }
  
  // For more items, show first, dropdown, and last item
  const lastItem = items[items.length - 1];
  const middleItems = items.slice(1, items.length - 1);
  
  return (
    <nav className={cn("flex items-center overflow-x-auto py-2", className)}>
      {/* First item */}
      <Link 
        href={firstItem.href || "#"}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {firstItem.icon && <span className="mr-1">{firstItem.icon}</span>}
        {firstItem.title}
      </Link>
      
      <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      
      {/* Middle items dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto px-1 py-0.5 text-muted-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {middleItems.map((item, index) => (
            <DropdownMenuItem key={index} asChild>
              <Link 
                href={item.href || "#"} 
                className="flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.title}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      
      {/* Last item */}
      <span className="flex items-center text-sm font-medium">
        {lastItem.icon && <span className="mr-1">{lastItem.icon}</span>}
        {lastItem.title}
      </span>
    </nav>
  );
}