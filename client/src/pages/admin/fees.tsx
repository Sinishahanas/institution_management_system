import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

/**
 * @purpose
 * - To present a detailed overview of multiple fee categories.
 * - To allow creation of new fee entries via controlled dialogs.
 * - To organize fee data based on type and grade.
 *
 * @param {object} [props] - React props (none used directly in this component, but reserved for future extensibility).
 * @returns {JSX.Element} Returns a rendered JSX structure containing tables or lists of fees and state-controlled dialogs.
 * @sideEffects
 * - Uses multiple `useState` hooks to manage UI states such as active tabs and dialog visibility.
 * - Causes re-renders whenever any of the states (`activeTab`, `oneTimeCreateDialog`, `recurringFeesCreateDialog`) change.
 * - Manages in-memory data constants that represent static fee structures.
 * @throws {Error} Does not explicitly throw errors.
 * However, runtime errors may occur if:
 * - The component attempts to render before React hooks are initialized.
 * - UI child components (like dialogs or tables) fail to render properly.
 *
 * @example
 * // Example usage in a Finance Management Dashboard:
 * import FeeStructure from "./FeeStructure";
 *
 * function FinanceDashboard() {
 *   return (
 *     <div className="p-6 bg-white rounded-lg shadow-md">
 *       <h2 className="text-xl font-semibold mb-4">Fee Structure Overview</h2>
 *       <FeeStructure />
 *     </div>
 *   );
 * }
 */
export default function FeeStructure() {
  const [activeTab, setActiveTab] = useState("oneTime");
  const [oneTimeCreateDialog, setOneTimeCreateDialog] = useState(false);
  const [recurringFeesCreateDialog, setRecurringFeesCreateDialog] =
    useState(false);

  /**
   * @constant oneTimeFees
   * Defines a list of standard one-time fee items applied to students.
   * Each entry includes an identifier, a descriptive label, and the fee amount.
   * @type {Array<{ id: number, particulars: string, amount: string }>}
   */
  const oneTimeFees = [
    { id: 1, particulars: "Registration fee", amount: "AED 250" },
    { id: 2, particulars: "Sibling Registration fee", amount: "AED 150" },
    { id: 3, particulars: "Stationary fee - 1 term", amount: "AED 100" },
    { id: 4, particulars: "Book fee - 1 term", amount: "AED 150" },
    { id: 5, particulars: "Regular Uniform - T-shirt", amount: "AED 50" },
    { id: 6, particulars: "Regular Uniform - Shorts", amount: "AED 50" },
    { id: 7, particulars: "PE uniform T-shirt", amount: "AED 55" },
    { id: 8, particulars: "PE uniform - Track pants", amount: "AED 55" },
  ];

  /**
   * @constant Institution
   * Defines Institution-specific fee items.
   * Each entry contains an ID, a description, and an amount.
   * @type {Array<{ id: number, particulars: string, amount: string }>}
   */
  const Institution = [
    { id: 1, particulars: "Registration fee", amount: "AED 100" },
    { id: 2, particulars: "Sibling Registration fee", amount: "AED 50" },
    { id: 3, particulars: "Teachers Diary", amount: "AED 25" },
    {
      id: 4,
      particulars: "Institution T-shirt (additional)",
      amount: "AED 50",
    },
    { id: 5, particulars: "Classical Dance - Shawl", amount: "AED 50" },
  ];

  /**
   * @constant prodigyBooks
   * Represents book fees for Prodigy program students by grade and subject.
   * Each object maps subjects to their respective fees.
   * @type {Array<{ grade: string, theory: string, drum: string, guitar: string, violin: string, vocal: string, piano: string }>}
   */
  const prodigyBooks = [
    {
      grade: "Nursery",
      theory: "AED 35",
      drum: "AED 40",
      guitar: "AED 40",
      violin: "-",
      vocal: "-",
      piano: "-",
    },
    {
      grade: "Basic 1 & 2",
      theory: "AED 35",
      drum: "AED 40",
      guitar: "AED 40",
      violin: "-",
      vocal: "-",
      piano: "-",
    },
    {
      grade: "Junior",
      theory: "AED 35",
      drum: "AED 40",
      guitar: "AED 40",
      violin: "AED 35",
      vocal: "AED 40",
      piano: "AED 35",
    },
    // Add more grades as per the image...
  ];

  /**
   * @constant fineArtsBooks
   * Lists Fine Arts program book fees by grade.
   * @type {Array<{ grade: string, amount: string }>}
   */
  const fineArtsBooks = [
    { grade: "Basic 1", amount: "AED 35" },
    { grade: "Basic 2", amount: "AED 40" },
    { grade: "Grade 1", amount: "AED 40" },
    { grade: "Grade 2", amount: "AED 35" },
  ];

  return (
    // AppShell is a layout component that provides a consistent structure for the application.
    <AppShell>
      {/* <div className="container mx-auto p-6"> */}
      {/* Page Header with title, description, and action button */}
      <PageHeader
        title="Fee Structure"
        description="Manage fee structure for one time and recurring fees."
        actions={
          <Button
            onClick={() => {
              if (activeTab === "onetimefees") {
                setOneTimeCreateDialog(true);
              } else if (activeTab === "recurringfees") {
                setRecurringFeesCreateDialog(true);
              }
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {activeTab === "recurringfees"
              ? "Add Recurring Fee"
              : "Add One Time Fee"}
          </Button>
        }
      />

      {/* Tabs for One Time and Recurring Fees */}
      <Tabs defaultValue="one-time">
        <TabsList className="mb-4">
          <TabsTrigger value="one-time">One Time Fees</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Fees</TabsTrigger>
        </TabsList>

        {/* One Time Fees Content */}
        <TabsContent value="one-time">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  {/* Circle Time Fees Table */}
                  <h2 className="text-xl font-semibold mb-4">Circle Time</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Particulars</TableHead>
                        <TableHead>Fee Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {oneTimeFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>{fee.id}</TableCell>
                          <TableCell>{fee.particulars}</TableCell>
                          <TableCell>{fee.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  {/* Institution Fees Table */}
                  <h2 className="text-xl font-semibold mb-4">Institution</h2>
                  <Table>
                    {/* Table Headers */}
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Particulars</TableHead>
                        <TableHead>Fee Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Institution.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>{fee.id}</TableCell>
                          <TableCell>{fee.particulars}</TableCell>
                          <TableCell>{fee.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  {/* Prodigy Book Fees Table */}
                  <h2 className="text-xl font-semibold mb-4">Prodigy Book</h2>
                  <Table>
                    {/* Table Headers */}
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grade Name</TableHead>
                        <TableHead>Theory</TableHead>
                        <TableHead>Drum</TableHead>
                        <TableHead>Guitar</TableHead>
                        <TableHead>Violin</TableHead>
                        <TableHead>Vocal</TableHead>
                        <TableHead>Piano</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prodigyBooks.map((book, index) => (
                        <TableRow key={index}>
                          <TableCell>{book.grade}</TableCell>
                          <TableCell>{book.theory}</TableCell>
                          <TableCell>{book.drum}</TableCell>
                          <TableCell>{book.guitar}</TableCell>
                          <TableCell>{book.violin}</TableCell>
                          <TableCell>{book.vocal}</TableCell>
                          <TableCell>{book.piano}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  {/* Fine Arts Book Fees Table */}
                  <h2 className="text-xl font-semibold mb-4">FINE ARTS BOOK</h2>
                  <Table>
                    {/* Table Headers */}
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grade Name</TableHead>
                        <TableHead>Fee Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fineArtsBooks.map((book, index) => (
                        <TableRow key={index}>
                          <TableCell>{book.grade}</TableCell>
                          <TableCell>{book.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recurring Fees Content */}
        <TabsContent value="recurring">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recurring Fees</h2>
              <p className="text-gray-500">
                Content for recurring fees will be added here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
