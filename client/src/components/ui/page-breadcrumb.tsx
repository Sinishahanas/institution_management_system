import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MobileBreadcrumb, type BreadcrumbItem as MobileBreadcrumbItem } from "@/components/ui/mobile-breadcrumb";
import { cn } from "@/lib/utils";

/**
 * @purpose Represents a single breadcrumb item for a page.
 *
 * @param {string} title - The display text of the breadcrumb.
 * @param {string} [href] - Optional URL for navigation.
 * @param {React.ReactNode} [icon] - Optional icon to display alongside the title.
 * @returns {PageBreadcrumbItem} Breadcrumb item object.
 * @sideEffects None explicitly
 * 
 * @example
 * const items = [
 *   { title: "Home", href: "/" },
 *   { title: "Dashboard", href: "/dashboard" },
 *   { title: "Settings" }
 * ];
 *
 * <PageBreadcrumb items={items} className="mb-6" />
 */
export interface PageBreadcrumbItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
}

/**
 * @purpose Props for the PageBreadcrumb component.
 *
 * @param {PageBreadcrumbItem[]} items - Array of breadcrumb items to display.
 * @param {string} [className] - Optional additional CSS classes.
 * @returns {JSX.Element | null}
 * @sideEffects None explicitly
 * 
 * @example
 * const items = [
 *   { title: "Home", href: "/" },
 *   { title: "Dashboard", href: "/dashboard" },
 *   { title: "Settings" }
 * ];
 *
 * <PageBreadcrumb items={items} className="mb-6" />
 */
interface PageBreadcrumbProps {
  items: PageBreadcrumbItem[];
  className?: string;
}

/**
 * PageBreadcrumb component.
 *
 * @purpose
 * - Renders a breadcrumb navigation for desktop and mobile layouts.
 * - Switches automatically to a compact mobile version when screen width < 768px.
 * 
 * @param {PageBreadcrumbProps} props - Props containing breadcrumb items and optional CSS class.
 * @returns {JSX.Element | null}
 * @sideEffects Listens to window resize events to update mobile/desktop layout.
 * @throws {Error} None.
 *
 * @example
 * const items = [
 *   { title: "Home", href: "/" },
 *   { title: "Dashboard", href: "/dashboard" },
 *   { title: "Settings" }
 * ];
 *
 * <PageBreadcrumb items={items} className="mb-6" />
 */
export function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
  // Track if current viewport is mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);
  
  if (!items || items.length === 0) {
    return null;
  }
  
  /**
   * @purpose Convert items to mobile-friendly format.
   * 
   * @param {PageBreadcrumbItem[]} items - Array of breadcrumb items.
   * @returns {MobileBreadcrumbItem[]} Mobile-friendly breadcrumb items.
   * @sideEffects None.
   * @throws {Error} None.
   */
  const mobileItems: MobileBreadcrumbItem[] = items.map(item => ({
    title: item.title,
    href: item.href,
    icon: item.icon
  }));
  
  return (
    <div className={cn("mb-4", className)}>
      {isMobile ? (
        // Mobile Layout
        <MobileBreadcrumb items={mobileItems} />
      ) : (
        // Desktop Layout
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {index === items.length - 1 ? (
                    // Last item (page)
                    <BreadcrumbPage className="flex items-center">
                      {item.icon && <span className="mr-1">{item.icon}</span>}
                      {item.title}
                    </BreadcrumbPage>
                  ) : (
                    // Intermediate item (link)
                    <BreadcrumbLink 
                      asChild={!!item.href}
                      className="flex items-center"
                    >
                      {item.href ? (
                        <Link href={item.href}>
                          {item.icon && <span className="mr-1">{item.icon}</span>}
                          {item.title}
                        </Link>
                      ) : (
                        <span>
                          {item.icon && <span className="mr-1">{item.icon}</span>}
                          {item.title}
                        </span>
                      )}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {/* Separator */}
                {index < items.length - 1 && (
                  <BreadcrumbSeparator />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </div>
  );
}