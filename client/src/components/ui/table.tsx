import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Table component wrapper.
 *
 * @purpose
 * - Provides a responsive container around a table.
 * - Adds default Tailwind classes for styling.
 *
 * @param {object} props - Props for the HTML `<table>` element.
 * @param {string} [props.className] - Additional custom classes.
 * @returns {JSX.Element} A styled table wrapped in a responsive container.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

/**
 * TableHeader
 *
 * @purpose
 * - Renders the `<thead>` section of a table.
 * - Adds bottom border to header rows for visual separation.
 *
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Standard thead props.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {JSX.Element} A styled `<thead>` element.
 * @throws None
 * @sideEffects None (pure render)
 *
 * @example
 * <TableHeader>
 *   <TableRow>
 *     <TableHead>Col 1</TableHead>
 *     <TableHead>Col 2</TableHead>
 *   </TableRow>
 * </TableHeader>
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

/**
 * TableBody
 *
 * @purpose
 * - Renders the `<tbody>` section of a table.
 * - Applies styling to remove the bottom border on the last row.
 *
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Standard tbody props.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {JSX.Element} A styled `<tbody>` element.
 * @throws None
 * @sideEffects None (pure render)
 *
 * @example
 * <TableBody>
 *   <TableRow>
 *     <TableCell>Value</TableCell>
 *   </TableRow>
 * </TableBody>
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"


/**
 * TableFooter
 *
 * @purpose
 * - Renders the `<tfoot>` section of a table.
 * - Provides muted background and top border styling (commonly used for totals).
 *
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Standard tfoot props.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {JSX.Element} A styled `<tfoot>` element.
 * @throws None
 * @sideEffects None (pure render)
 *
 * @example
 * <TableFooter>
 *   <TableRow>
 *     <TableCell>Total</TableCell>
 *   </TableRow>
 * </TableFooter>
 */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

/**
 * TableRow
 *
 * @purpose
 * - Renders a table row (`<tr>`) with hover and selected state styling.
 *
 * @param {React.HTMLAttributes<HTMLTableRowElement>} props - Standard tr props.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {JSX.Element} A styled `<tr>` element.
 * @throws None
 * @sideEffects None (pure render)
 *
 * @example
 * <TableRow>
 *   <TableCell>Cell 1</TableCell>
 *   <TableCell>Cell 2</TableCell>
 * </TableRow>
 */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

/**
 * TableHead
 *
 * @purpose
 * - Renders a table header cell (`<th>`) with correct padding, alignment and font weight.
 * - Adapts space if a checkbox is present within the cell.
 *
 * @param {React.ThHTMLAttributes<HTMLTableCellElement>} props - Standard th props.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {JSX.Element} A styled `<th>` element.
 * @throws None
 * @sideEffects None (pure render)
 *
 * @example
 * <TableHead scope="col">Name</TableHead>
 */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"


/**
 * TableCell
 *
 * @purpose
 * - Renders a data cell (`<td>`) with padding and alignment suitable for table content.
 * - Adapts space if a checkbox is present within the cell.
 *
 * @param {React.TdHTMLAttributes<HTMLTableCellElement>} props - Standard td props.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {JSX.Element} A styled `<td>` element.
 * @throws None
 * @sideEffects None (pure render)
 *
 * @example
 * <TableCell>Some text</TableCell>
 */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

/**
 * TableCaption
 *
 * @purpose
 * - Renders the `<caption>` element for a table, useful for additional context or descriptions.
 *
 * @param {React.HTMLAttributes<HTMLTableCaptionElement>} props - Standard caption props.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {JSX.Element} A styled `<caption>` element.
 * @throws None
 * @sideEffects None (pure render)
 *
 * @example
 * <TableCaption>List of users — updated daily</TableCaption>
 */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}


/**
 * Example showcasing all
 * @example
 * <Table>
 *   <TableCaption>Users — updated daily</TableCaption>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *       <TableHead>Role</TableHead>
 *       <TableHead>Last active</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Jane Doe</TableCell>
 *       <TableCell>jane@example.com</TableCell>
 *       <TableCell>Admin</TableCell>
 *       <TableCell>2 hours ago</TableCell>
 *     </TableRow>
 *     <TableRow data-state="selected">
 *       <TableCell>John Smith</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *       <TableCell>User</TableCell>
 *       <TableCell>Yesterday</TableCell>
 *     </TableRow>
 *   </TableBody>
 *   <TableFooter>
 *     <TableRow>
 *       <TableCell colSpan={4}>Total users: 2</TableCell>
 *     </TableRow>
 *   </TableFooter>
 * </Table>
 */
