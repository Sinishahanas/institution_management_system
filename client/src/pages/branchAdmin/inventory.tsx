import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";  
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inventory } from "@shared/schema";
import { formatCurrency, formatDateToDDMMYYYY } from "@/lib/utils";

// Form Schema
/**
 * @purpose Ensures that inventory items have a valid name and amount.
 *
 * @params
 * - items: string — Name of the inventory item. Must not be empty.
 * - amount: number — Quantity of the item. Must be 0 or greater. Uses z.coerce.number() to convert strings to numbers.
 *
 * @returns
 * Validated inventory form object containing `items` and `amount`.
 *
 * @throws
 * Throws Zod validation errors if:
 *   - `items` is empty
 *   - `amount` is less than 0 or not a number
 *
 * @sideEffects
 * None
 *
 * @example
 * ```ts
 * const data = { items: "Notebook", amount: "10" };
 * const parsed = inventoryFormSchema.parse(data);
 * // parsed = { items: "Notebook", amount: 10 }
 * ```
 */
const inventoryFormSchema = z.object({
  items: z.string().min(1, "Item name is required"),
  amount: z.coerce.number().min(0, "Amount must be 0 or greater"),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;


/**
 * BranchAdminInventory Component
 *
 * @purpose
 * Renders the Inventory management dashboard. Provides functionalities to:
 * - View all inventory items.
 * - Add new inventory items via a form dialog.
 * - Edit existing inventory items.
 * - Delete inventory items with confirmation.
 *
 * @returns JSX.Element - The rendered Branch Admin Inventory page.
 *
 * @sideEffects
 * - Uses `useQuery` to fetch inventory data from the backend.
 * - Uses `useState` to manage dialog states and selected inventory item.
 * - Uses `react-hook-form` and `zod` for form validation.
 * - Updates backend and invalidates query cache on create/edit/delete.
 * - Displays toast notifications for user feedback.
 *
 * @throws Errors from API requests are caught and displayed via toast.
 *
 * @example
 * ```tsx
 * <BranchAdminInventory />
 * ```
 */
export default function BranchAdminInventory() {

  /**
   * State to control create inventory dialog visibility.
   */
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  /**
   * State to control edit inventory dialog visibility.
   */
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  /**
   * State to control delete inventory dialog visibility.
   */
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  /**
   * Currently selected inventory item for edit or delete.
   */
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  /**
   * Toast hook for notifications.
   */
  const { toast } = useToast();

  /**
   * @purpose Fetch inventory items from API.
   *
   * @param None
   * @returns {Inventory[]} - List of inventory items.
   * @throws None
   * @sideEffects None
   * @example
   * ```ts
   * const { data: inventoryItems = [], isLoading } = useQuery<Inventory[]>({
   *   queryKey: ["/api/inventory"],
   * });
   * ```
   */
  const { data: inventoryItems = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  /**
   * @purpose Form instance for creating a new inventory entry.
   *
   * @type {UseFormReturn<InventoryFormValues>}
   * @param None
   * @returns A form object with methods to manage inventory form state (values, validation, reset, etc.)
   * @throws None
   * @sideEffects None
   * @example
   * ```ts
   * form.setValue("items", "Prodigy Book");
   * form.setValue("amount", 10);
   * const values = form.getValues();
   * console.log(values.items, values.amount);
   * ```
   */
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      items: "",
      amount: 0,
    },
  });

  /**
   * @purpose Form instance for editing an existing inventory entry.
   *
   * @type {UseFormReturn<InventoryFormValues>}
   * @param None
   * @returns A form object with methods to manage inventory form state (values, validation, reset, etc.)
   * @throws None
   * @sideEffects None
   * @example
   * ```ts
   * editForm.reset({ items: "Piano", amount: 2 });
   * const values = editForm.getValues();
   * console.log(values.items, values.amount);
   * ```
   */
  const editForm = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      items: "",
      amount: 0,
    },
  });

  /**
   * @purpose Opens the edit dialog for a selected inventory item and resets the edit form with its values.
   *
   * @param {Inventory} inventory - The inventory item to edit.
   * @returns {void}
   * @throws None
   * @sideEffects Updates `selectedInventory`, resets `editForm`, and opens the edit dialog.
   * @example
   * handleEditInventory({ id: 1, items: "Guitar", amount: 10 });
   */
  const handleEditInventory = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    editForm.reset({
      items: inventory.items || "",
      amount: inventory.amount || 0,
    });
    setIsEditDialogOpen(true);
  };

  /**
   * @purpose Opens the delete confirmation dialog for a selected inventory item.
   *
   * @param {Inventory} inventory - The inventory item to delete.
   * @returns {void}
   * @throws None
   * @sideEffects Updates `selectedInventory` and opens the delete confirmation dialog.
   * @example
   * handleDeleteClick({ id: 1, items: "Piano", amount: 2 });
   */
  const handleDeleteClick = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    setIsDeleteDialogOpen(true);
  };

  /**
   * @purpose Deletes the selected inventory item via API request and updates the state.
   *
   * @returns {Promise<void>}
   * @throws Throws an error if the delete API request fails.
   * @sideEffects Removes the inventory from the query cache, closes delete dialog, resets `selectedInventory`, and shows a toast notification.
   * @example
   * await handleDeleteInventory();
   */
  const handleDeleteInventory = async () => {
    if (!selectedInventory) return;
    try {
      await apiRequest("DELETE", `/api/inventory/${selectedInventory.id}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setIsDeleteDialogOpen(false);
      setSelectedInventory(null);
      toast({
        title: "Success",
        description: "Inventory item deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete inventory item.",
        variant: "destructive",
      });
    }
  };


  /**
   * @purpose Column definitions for the inventory table.
   *
   * @type {ColumnDef<Inventory>[]}
   * @param None
   * @returns {ColumnDef<Inventory>[]} Array of column definitions used in the inventory table.
   * @throws None
   * @sideEffects None
   * @example
   * <Table columns={inventoryColumns} data={inventoryData} />
   */
  const inventoryColumns: ColumnDef<Inventory>[] = [
    {
      id: "serial",
      header: "SL.No.",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "items",
      header: "Item Name",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div>{formatCurrency(row.getValue("amount"))}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div>{formatDateToDDMMYYYY(row.getValue("createdAt"))}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const inventory = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
              onClick={() => handleEditInventory(inventory)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => handleDeleteClick(inventory)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];


  /**
   * @purpose Handles submission of the create inventory form.
   *
   * @param {InventoryFormValues} data - The form values for creating a new inventory item.
   * @returns {Promise<void>} Resolves when the inventory item is successfully created and the query cache is updated.
   * @throws {Error} Throws if the API request fails. The error is caught and displayed using a toast notification.
   * @sideEffects
   * - Sends a POST request to the API to create a new inventory item.
   * - Invalidates the `/api/inventory` query in React Query cache.
   * - Closes the create dialog.
   * - Resets the create form.
   * - Displays a toast notification for success or failure.
   * @example
   * await onSubmit({ items: "Keyboard", amount: 15 });
   */
  const onSubmit = async (data: InventoryFormValues) => {
    try {
    //   console.log("Submitting data:", data);
      const response = await apiRequest("POST", "/api/inventory", data);
      console.log("Response:", response);
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Inventory item added successfully.",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add inventory item.",
        variant: "destructive",
      });
    }
  };

  
  /**
   * @purpose Handles submission of the edit inventory form.
   *
   * @param {InventoryFormValues} data - The updated form values for editing an existing inventory item.
   * @returns {Promise<void>} Resolves when the inventory item is successfully updated and the query cache is refreshed.
   * @throws {Error} Throws if the API request fails. The error is caught and displayed using a toast notification.
   * @sideEffects
   * - Sends a PUT request to the API to update the inventory item.
   * - Invalidates the `/api/inventory` query in React Query cache.
   * - Closes the edit dialog.
   * - Resets the edit form.
   * - Clears the `selectedInventory` state.
   * - Displays a toast notification for success or failure.
   * @example
   * await onEditSubmit({ items: "Drum Set", amount: 5 });
   */
  const onEditSubmit = async (data: InventoryFormValues) => {
    if (!selectedInventory) return;

    try {
      await apiRequest("PUT", `/api/inventory/${selectedInventory.id}`, data);
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedInventory(null);
      toast({
        title: "Success",
        description: "Inventory item updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory item.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppShell>
      {/* Page Header with title, description and action button */}
      <PageHeader
        title="Inventory"
        description="Manage inventory items and their quantities."
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        }
      />

      {/* Inventory Table with search and actions*/}
      <Tabs defaultValue="inventory">
        <TabsContent value="inventory" className="mt-6">
          <DataTable
            columns={inventoryColumns} //Column definitions for the inventory table
            data={inventoryItems} //Data for the inventory table
            searchColumns={["items", "amount", "createdAt"]} //Columns to search in the inventory table
            searchPlaceholder="Search inventory..." //Placeholder for the search input
          />
        </TabsContent>
      </Tabs>

      {/* Create Inventory Dialog with form */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Enter the details of the new inventory item.
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Item Name Field */}
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount Field */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cancel and Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Item</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the details of the inventory item.
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-8">
              {/* Item Name Field */}
              <FormField
                control={editForm.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount Field */}
              <FormField
                control={editForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dialog Footer - Cancel and Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Item</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Inventory Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            {/* Dialog Header */}
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </DialogDescription>
          </DialogHeader>

          {/* Dialog Footer - Cancel and Delete Button */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDeleteInventory()}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}