import * as React from "react";
import { 
  ColumnDef, 
  flexRender,
  getCoreRowModel, 
  useReactTable, 
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState, 
  ColumnFiltersState,
  FilterFn,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

/**
 * @purpose Props for the generic DataTable component.
 * 
 * @template TData Type of each data row
 * @template TValue Type of the column value
 */
interface DataTableProps<TData, TValue> {

   /** Array of column definitions using TanStack Table's ColumnDef */
  columns: ColumnDef<TData, TValue>[];

  /** Array of data rows */
  data: TData[];

  /** Optional list of column keys to enable global search */
  searchColumns?: string[];

  /** Placeholder text for the search input */
  searchPlaceholder?: string;

  /** Optional initial sorting state */
  initialSorting?: SortingState;
}

/**
 * @purpose 
 * - Render tabular data with sorting, filtering (global search), and pagination.
 * - Keep internal state for sorting, global filter, and column filters whilenexposing a flexible ColumnDef-driven API so consumers can define columns, custom cell renderers, and headers.
 * 
 * @template TData Type of each row
 * @template TValue Type of each column value
 * 
 * @param {Object} props - Component properties.
 * @param {ColumnDef<TData, TValue>[]} props.columns Array of TanStack `ColumnDef` definitions describing each column (accessorKey, header, cell, etc).
 * @param {TData[]} props.data Array of data rows to display in the table.
 * @param {string[]} [props.searchColumns=[]] Optional array of keys (property names of `TData`) to include in the global search.
 *   Global search will match rows where the stringified value of any of these keys
 *   contains the search term (case-insensitive).
 * @param {string} [props.searchPlaceholder="Search..."] Placeholder text for the global search input.
 * @param {SortingState} [props.initialSorting=[]] Optional initial sorting state to seed the table (TanStack `SortingState`).
 * 
 * @returns {JSX.Element} A React element containing the table, search input (if `searchColumns` provided), and pagination controls.
 * 
 * @sideEffects
 * - Renders the table and UI controls.
 * - Updates internal React state (`sorting`, `globalFilter`, `columnFilters`) on user interaction.
 * - Calls TanStack Table internal handlers to compute sorted/filtered/paginated rows.
 *
 * @throws {TypeError}
 * - If `columns` or `data` is not provided or not an array.
 * - If `searchColumns` contains keys not present on `TData` (best-effort — this is a runtime warning condition).
 *
 * @example
 * // Basic usage (auto-infers TData from data)
 * interface User { id: number; name: string; email: string }
 * const columns: ColumnDef<User, any>[] = [
 *   { accessorKey: "id", header: "ID" },
 *   { accessorKey: "name", header: "Name" },
 *   { accessorKey: "email", header: "Email" },
 * ];
 * const data: User[] = [{ id: 1, name: "Alice", email: "alice@test.com" }];
 *
 * <DataTable columns={columns} data={data} searchColumns={["name", "email"]} />
 *
 * @example
 * // With initial sorting
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   initialSorting={[{ id: "name", desc: false }]}
 *   searchColumns={["name"]}
 * />
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumns = [],
  searchPlaceholder = "Search...",
  initialSorting = []
}: DataTableProps<TData, TValue>) {

  // Internal state
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  // Global search filter state
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  // Column filter state (currently unused in UI, but available)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Initialize react-table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(), // basic row model
    getPaginationRowModel: getPaginationRowModel(), // pagination row model
    onSortingChange: setSorting, // sorting state
    getSortedRowModel: getSortedRowModel(), // sorted row model
    onGlobalFilterChange: setGlobalFilter, // global filter state
    getFilteredRowModel: getFilteredRowModel(), // filtered row model
    state: {
      sorting,
      globalFilter,
    },
    globalFilterFn: ((row: Row<TData>, columnId: string, filterValue: string) => {
      // Custom global search across specified columns
      const searchTerm = filterValue.toLowerCase();
      return searchColumns.some((col) => {
        const value = row.original[col as keyof typeof row.original];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm);
      });
    }) as FilterFn<TData>,
    initialState: {
      pagination: {
        pageSize: 100, // Default page size
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Global Search  input*/}
      {searchColumns.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) =>
                setGlobalFilter(event.target.value)
              }
              className="pl-8"
            />
          </div>
        </div>
      )}

      {/* Table container */}
      <div className="rounded-md border overflow-hidden bg-white">
        <Table>
          {/* Table Header */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-neutral-50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-neutral-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500">
          Showing{" "}
          <span className="font-medium">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}
          </span>{" "}
          of{" "}
          <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> entries
        </div>

        {/* Page size selector */}
        <div className="flex items-center space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {[100, 500, 1000].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Page navigation buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}