import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { capitalizeFirstLetter, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Link } from "wouter";
import { FixedFooter } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { Home } from "lucide-react";

/**
 * ParentCreditNotes component displays the list of credit notes for the logged-in parent.
 *
 * @purpose To allow parents to view, filter, and access details of credit notes applied to their children.
 * 
 * @param None directly; uses `useAuth()` internally to get current user.
 * @returns {JSX.Element} A table with credit note data, filtered by "approved" or "open" tabs.
 * @throws Errors may be thrown if the fetch request for credit notes fails.
 * @sideEffects
 * - Fetches credit notes from the backend API using react-query.
 * - Filters and maps data to display in a table.
 * - Uses `useMemo` for performance optimization on mapped and filtered data.
 *
 * @example
 * <ParentCreditNotes />
 */
export default function ParentCreditNotes() {
    const [activeTab, setActiveTab] = useState("approved");
    const { user } = useAuth();

    /**
     * @purpose
     * - Fetches credit notes for the currently logged-in parent.
     * - Uses react-query `useQuery` to fetch credit notes from the endpoint:`/api/creditNotes/parent/{userId}?status=approved,open`.
     *
     * @param None directly; relies on `user.id` from `useAuth()`.
     * @returns {Array} An array of credit note objects with their details.
     * @throws Will throw an error if the fetch request fails.
     * @sideEffects
     * - Fetches data from the backend.
     * - Populates the `creditNotes` variable for further processing.
     *
     * @example
     * const { data: creditNotes = [] } = useQuery({
     *   queryKey: ["/api/creditNotes/parent", user?.id],
     *   enabled: !!user?.id,
     *   queryFn: async () => { ... }
     * });
     */
    const { data: creditNotes = [] } = useQuery({
        queryKey: ["/api/creditNotes/parent", user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const response = await fetch(`/api/creditNotes/parent/${user?.id}?status=approved,open`);
            if (!response.ok) {
                throw new Error("Failed to fetch credit notes");
            }
            return response.json();
        },
    });


    /**
     * Maps raw credit note API response into a simplified structure suitable for table rendering.
     *
     * @purpose Transform API response into a consistent format with key fields like student name, amount, status, etc.
     *
     * @param creditNotes - Array of credit note objects returned from the API.
     * @returns {Array<Object>} Returns a new array of objects containing:
     *  - `id`: number - Credit note ID
     *  - `creditNoteNumber`: string - Credit note number
     *  - `studentName`: string - Full name of the student
     *  - `appliedToType`: string - Type the credit note is applied to
     *  - `invoiceNumber`: string - Related invoice number
     *  - `amount`: number - Credit note amount
     *  - `generatedMonth`: string - Month when the credit note was generated
     *  - `reason`: string - Reason for the credit note
     *  - `status`: string - Status of the credit note ("approved" or "open")
     *  - `createdAt`: string - Creation timestamp
     *
     * @throws None directly; relies on valid `creditNotes` input.
     * @sideEffects Uses `useMemo` to memoize the mapped array, improving performance by recalculating only when `creditNotes` changes.
     *
     * @example
     * const mappedPayments = useMemo(() => creditNotes.map((p: any) => ({
     *   id: p.creditNotes.id,
     *   creditNoteNumber: p.creditNotes.creditNoteNumber,
     *   studentName: `${p.firstName} ${p.middleName} ${p.lastName}`,
     *   appliedToType: p.creditNotes.appliedToType,
     *   invoiceNumber: p.invoiceNumber,
     *   amount: Number(p.creditNotes.amount),
     *   generatedMonth: p.creditNotes.generatedMonth,
     *   reason: p.creditNotes.reason,
     *   status: p.creditNotes.status,
     *   createdAt: p.creditNotes.createdAt
     * })), [creditNotes]);
     */
    const mappedPayments = useMemo(() => creditNotes.map((p: any) => ({
        id: p.creditNotes.id,
        creditNoteNumber: p.creditNotes.creditNoteNumber,
        studentName: `${p.firstName} ${p.middleName} ${p.lastName}`,
        appliedToType: p.creditNotes.appliedToType,
        invoiceNumber: p.invoiceNumber,
        amount: Number(p.creditNotes.amount),
        generatedMonth: p.creditNotes.generatedMonth,
        reason: p.creditNotes.reason,
        status: p.creditNotes.status,
        createdAt: p.creditNotes.createdAt
    })), [creditNotes]);


    /**
    * Filters the mapped credit notes based on the currently active tab.
    *
    * @purpose Dynamically show only "approved" or "open" credit notes in the table based on the selected tab.
    *
    * @param mappedPayments - Array of mapped credit note objects.
    * @param activeTab - String indicating which tab is active ("approved" or "open").
    * @returns {Array<Object>} Returns a filtered array of credit note objects matching the active tab's status.
    * @throws None directly.
    * @sideEffects Uses `useMemo` to memoize the filtered array, recalculating only when `mappedPayments` or `activeTab` changes.
    *
    * @example
    * const filteredPayments = useMemo(() => {
    *   if (activeTab === "approved") {
    *     return mappedPayments.filter((p: any) => p.status === "approved");
    *   } else {
    *     return mappedPayments.filter((p: any) => p.status === "open");
    *   }
    * }, [mappedPayments, activeTab]);
    */
    const filteredPayments = useMemo(() => {
        if (activeTab === "approved") {
            return mappedPayments.filter((p: any) => p.status === "approved");
        } else {
            return mappedPayments.filter((p: any) => p.status === "open");
        }
    }, [mappedPayments, activeTab]);

    /**
     * Defines the column configuration for the Credit Notes table.
     *
     * @purpose Provides a structured definition for each column in the table, including headers, cell rendering, sorting behavior, and custom components like links and badges.
     *
     * @param columns - Array of `ColumnDef` objects where each object represents a table column:
     *  - `id` (optional): Unique identifier for the column.
     *  - `accessorKey` (optional): Key used to access the value from row data.
     *  - `header`: Column header text.
     *  - `cell`: Function that returns JSX for rendering the cell content.
     *  - `enableSorting` (optional): Boolean indicating if sorting is enabled for the column.
     *
     * @returns {ColumnDef<any>[]} An array of column definitions compatible with React Table or similar table libraries.
     * @throws None directly; assumes `row` and `table` objects are valid React Table row objects.
     * @sideEffects Renders JSX components inside table cells. Links and badges may trigger navigation or display dynamic styles.
     * 
     * @example
     * const columns: ColumnDef<any>[] = 
     * .....
     * Used as <DataTable columns={columns} data={filteredPayments} />
     */
    const columns: ColumnDef<any>[] = [
        {
            id: "serial",
            header: "SL.No.",
            cell: ({ table, row }) => {
                const sortedRows = table.getSortedRowModel().rows;
                const index = sortedRows.findIndex((r) => r.id === row.id);
                return <div>{index + 1}</div>;
            },
            enableSorting: false,
        },
        {
            accessorKey: "creditNoteNumber",
            header: "Credit Note Number",
            cell: ({ row }) => {
                const creditNoteNumber = row.getValue("creditNoteNumber") as string;
                return (
                    <Link
                        href={`/parent/print-credit-note/${creditNoteNumber}`}
                        className="text-blue-600 hover:underline"
                    >
                        {creditNoteNumber}
                    </Link>
                );
            },
        },
        {
            accessorKey: "studentName",
            header: "Student",
            cell: ({ row }) => {
                const student = row.getValue("studentName") as string;
                return student ?
                    <div>{student}</div> :
                    <div>Unknown</div>;
            },
        },
        {
            accessorKey: "appliedToType",
            header: "Applied To Type",
            cell: ({ row }) => {
                return capitalizeFirstLetter(row.original.appliedToType || "");
            },
        },
        {
            accessorKey: "invoiceNumber",
            header: "Invoice Number",
            cell: ({ row }) => {
                return row.original.invoiceNumber;
            },
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                return formatCurrency(Number(row.original.amount));
            },
        },
        {
            accessorKey: "generatedMonth",
            header: "Generated Month",
            cell: ({ row }) => {
                return row.original.generatedMonth;
            },
        },
        {
            accessorKey: "reason",
            header: "Reason",
            cell: ({ row }) => {
                return row.original.reason;
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => {
                const date = row.original.createdAt;
                return date ? format(new Date(date), "MMM dd, yyyy") : "-";
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                let badgeVariant: "default" | "success" | "secondary" | "destructive" | "outline" | null | undefined = "default";

                if (status === "open") {
                    badgeVariant = "secondary";
                } else if (status === "approved") {
                    badgeVariant = "default";
                }

                return (
                    <Badge variant={badgeVariant}>
                        {capitalizeFirstLetter(status)}
                    </Badge>
                );
            },
        },
    ];

    /**
     * Defines breadcrumbs for the parent children page.
     *
     * @purpose To provide a navigational trail in the UI for user orientation.
     * 
     * @param None
     * @returns {Array<Object>} Array of breadcrumb objects with `title`, `href`, and optional `icon`.
     * @throws None
     * @sideEffects None
     * 
     * @example
     * <Breadcrumbs items={breadcrumbs} />
     */
    const breadcrumbs = [
        {
            title: "Home",
            href: "/parent/dashboard",
            icon: <Home className="h-4 w-4" />
        },
        {
            title: "Credit Notes"
        }
    ];

    return (
        // AppShell wraps the page content and provides a consistent structure for the application.
        <AppShell>
            {/* PageHeader component is used to display the page title, description, and breadcrumbs. */}
            <PageHeader
                title="Credit Notes"
                description="View credit notes for students."
                breadcrumbs={breadcrumbs}
            />
            {/* Tabs component is used to display the tabs for the credit notes. */}
            <Tabs defaultValue="approved" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="open">Open</TabsTrigger>
                </TabsList>
            </Tabs>
            {/* DataTable component is used to display the credit notes in a table. */}
            <DataTable
                columns={columns} // Column configuration for the credit notes table.
                data={filteredPayments} // Data for the credit notes table.
                searchColumns={["studentId"]} // Columns to search in the credit notes table.
                searchPlaceholder="Search credit note..." // Placeholder for the search input.
            />
            {/* FixedFooter component is used to display the footer of the page. */}
            <FixedFooter user={user} />
        </AppShell>
    );
}
