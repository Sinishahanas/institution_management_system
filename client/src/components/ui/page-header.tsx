import { cn } from "@/lib/utils";
import { PageBreadcrumb, type PageBreadcrumbItem } from "@/components/ui/page-breadcrumb";

/**
 * @purpose Props for the PageHeader component.
 *
 * @param {string} title - Main page title.
 * @param {string} [description] - Optional subtitle or description under the title.
 * @param {React.ReactNode} [actions] - Optional action elements (buttons, links, etc.) to display on the header.
 * @param {string} [className] - Optional additional CSS classes to apply to the container.
 * @param {PageBreadcrumbItem[]} [breadcrumbs] - Optional breadcrumb items to display above the header.
 * 
 * @returns {PageHeaderProps} Page header component.
 * @sideEffects None explicitly thrown.
 * @throws {Error} None.
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  breadcrumbs?: PageBreadcrumbItem[];
}

/**
 * PageHeader component.
 *
 * @purpose Renders a page header section including an optional breadcrumb navigation, title, description, and action buttons.
 * 
 * @param {PageHeaderProps} props - Props containing title, description, actions, optional CSS class, and optional breadcrumbs.
 * @returns {JSX.Element} Page header component.
 * @throws {Error} None.
 * @sideEffects None.
 * 
 * @example
 * const breadcrumbs = [
 *   { title: "Home", href: "/" },
 *   { title: "Dashboard", href: "/dashboard" },
 *   { title: "Settings" }
 * ];
 *
 * <PageHeader 
 *   title="Settings"
 *   description="Manage your account and preferences"
 *   actions={<button className="btn-primary">Save</button>}
 *   breadcrumbs={breadcrumbs}
 *   className="mb-6"
 * />
 */
export function PageHeader({ title, description, actions, className, breadcrumbs }: PageHeaderProps) {
  return (
    <>
      {breadcrumbs && breadcrumbs.length > 0 && (
        // PageBreadcrumb component is used to display a breadcrumb navigation
        <PageBreadcrumb items={breadcrumbs} />
      )}
      <div className={cn("mb-8 flex flex-col md:flex-row md:items-center md:justify-between", className)}>
        {/* Title and description */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h1>
          {description && <p className="text-neutral-600">{description}</p>}
        </div>
        {/* actions is an optional prop that can be used to display action buttons */}
        {actions && (
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </>
  );
}
