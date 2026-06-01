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
import { Inventory, stockItem, StockItem } from "@shared/schema";
import { formatCurrency, formatDateToDDMMYYYY } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form Schema
/**
 * @purpose Define the schema for item stock form validation.
 * 
 * @param stockItemId {number} The ID of the stock item to update.
 * @param stockQuantity {number} The quantity to add or subtract.
 * @returns {z.infer<typeof itemStockFormSchema>} The inferred type of the form values.
 * @throws Will throw an error if the form values are invalid.
 * @sideEffects Uses zod for form validation.
 * 
 * @example
 * ```ts
 * const form = useForm<ItemStockFormValues>({
 *   resolver: zodResolver(itemStockFormSchema),
 *   defaultValues: {
 *     stockItemId: 0,
 *     stockQuantity: 0,
 *   },
 * });
 * ```
 */
const itemStockFormSchema = z.object({
  stockItemId: z.coerce.number().min(1, "Item is required"),
  stockQuantity: z.coerce.number().min(1, "Quantity must be 1 or greater"),
});

type ItemStockFormValues = z.infer<typeof itemStockFormSchema>;

/**
 * Updates the stock quantity of a stock item.
 * @purpose Update the stock quantity of a stock item, ensuring the stock does not go below zero.
 * 
 * @param id {number} The ID of the stock item to update.
 * @param quantity {number} The quantity to add or subtract.
 * @param operation {'add' | 'subtract'} The operation to perform: 'add' to increase stock, 'subtract' to decrease stock.
 * @returns {Promise<boolean>} Returns true if the stock quantity was updated successfully.
 * @throws Will throw an error if:
 *  - The stock item is not found.
 *  - The resulting stock quantity would be negative.
 *  - The API request fails.
 * @sideEffects
 *  - Fetches the current stock item from the server.
 *  - Sends a PUT request to update the stock item.
 *
 * @example
 * ```ts
 * await updateStockQuantity(1, 5, 'add');       // Adds 5 to stock item with ID 1
 * await updateStockQuantity(2, 3, 'subtract');  // Subtracts 3 from stock item with ID 2
 * ```
 */
export async function updateStockQuantity(id: number, quantity: number, operation: 'add' | 'subtract') {
  try {
    const response = await apiRequest("GET", `/api/stock-item/${id}`);
    const stockItem = await response.json();
    
    if (!stockItem) throw new Error('Stock item not found');
    
    const newQuantity = operation === 'add' 
      ? stockItem.stockQuantity + quantity
      : stockItem.stockQuantity - quantity;
    
    if (newQuantity < 0) throw new Error('Insufficient stock quantity');
    
    await apiRequest("PUT", `/api/stock-item/${id}`, {
      ...stockItem,
      stockQuantity: newQuantity
    });
    
    return true;
  } catch (error: any) {
    console.error('Error updating stock quantity:', error);
    throw error;
  }
}


/**
 * AdminItemStock Component
 *
 * @purpose
 * Manage the stock of items, including:
 *  - Viewing a table of stock items.
 *  - Adding new stock.
 *  - Editing existing stock items.
 *  - Deleting stock items.
 *  - Updating stock quantities.
 *
 * @param {} - This component does not accept any props.
 * @returns {JSX.Element} The rendered component with dialogs and table for managing stock items.
 * @throws Will display toast errors if API requests for creating, updating, or deleting stock items fail.
 * @sideEffects
 *  - Fetches inventory items and stock items from APIs using react-query.
 *  - Uses `useForm` for create and edit forms.
 *  - Opens and closes dialogs.
 *  - Updates stock items through API requests.
 *  - Invalidates queries to refresh data after mutations.
 *  - Shows toast notifications on success or error.
 *
 * @example
 * ```tsx
 * import AdminItemStock from "@/pages/admin/AdminItemStock";
 *
 * <Route path="/admin/item-stock" component={AdminItemStock} />
 * ```
 */
export default function AdminItemStock() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<StockItem | null>(null);
  const { toast } = useToast();

  /**
   * @purpose Use React Query's `useQuery` hook to fetch inventory data asynchronously.
   *
   * @param - queryKey: ["/api/inventory"] — Unique key identifying this query for caching and refetching.
   * @returns - data: Inventory[] — Array of inventory items. Defaults to an empty array if no data is returned.
   * @returns - isLoading: boolean — Indicates whether the query is currently loading.
   * @throws - Errors are handled internally by React Query. Can be accessed via the `error` field if needed.
   * @sideEffects
   * - Triggers a network request to `/api/inventory`.
   * - Caches the data automatically under the provided queryKey.
   * 
   * @example
   * ```ts
   * const { data: inventoryItems = [], isLoading } = useQuery<Inventory[]>({
   *   queryKey: ["/api/inventory"],
   * });
  *
   */
  const { data: inventoryItems = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });


  /**
   * @purpose Use React Query's `useQuery` hook to fetch stock item data asynchronously.
   *
   * @param - queryKey: ["/api/stock-item"] — Unique key identifying this query for caching and refetching.
   * @returns - data: StockItem[] — Array of stock items. Defaults to an empty array if no data is returned.
   * @returns - isLoading: boolean — Indicates whether the query is currently loading.
   * @throws - Errors are handled internally by React Query. Can be accessed via the `error` field if needed.
   * @sideEffects Fetches data from "/api/stock-item" endpoint
   * 
   * @example
   * ```ts
   * const { data: stockItems = [], isLoading: stockItemsLoading } = useQuery<StockItem[]>({
   *   queryKey: ["/api/stock-item"],
   * });
   * ```
   */
  const { data: stockItems = [], isLoading: stockItemsLoading } = useQuery<StockItem[]>({
    queryKey: ["/api/stock-item"],
  });


  /**
   * @purpose
   * - Creates a form instance for adding a new inventory stock item.
   * - Manage form state, validation, and submission for inventory stock items using React Hook Form with Zod validation.
   *
   * @params
   * - resolver: zodResolver(itemStockFormSchema) — Integrates Zod schema validation with React Hook Form.
   * - defaultValues: Initial values for the form fields:
   *    - stockItemId: number — ID of the inventory item (default 0).
   *    - stockQuantity: number — Quantity of the stock item (default 0).
   *
   * @returns form: UseFormReturn<ItemStockFormValues> — Object containing methods and properties for managing form state.
   * @throws Validation errors are handled internally by Zod and React Hook Form; they will not throw runtime exceptions.
   * @sideEffects None directly; updating form values may trigger re-renders in components using the form.
   *
   * @example
   * ```ts
   * const { register, handleSubmit, formState } = form;
   * <form onSubmit={handleSubmit(onSubmit)}>
   *   <input {...register("stockItemId")} />
   *   <input {...register("stockQuantity")} />
   * </form>
   * ```
   */
  const form = useForm<ItemStockFormValues>({
    resolver: zodResolver(itemStockFormSchema),
    defaultValues: {
      stockItemId: 0,
      stockQuantity: 0,
    },
  });

  
  /**
   * @purpose Creates a form instance for editing an existing inventory stock item.
   * @param resolver: zodResolver(itemStockFormSchema) — Integrates Zod schema validation with React Hook Form.
   * @param defaultValues: Initial values for the form fields:
   *    - stockItemId: number — ID of the inventory item (default 0).
   *    - stockQuantity: number — Quantity of the stock item (default 0).
   * @returns form: UseFormReturn<ItemStockFormValues> — Object containing methods and properties for managing form state.
   * @throws Validation errors are handled internally by Zod and React Hook Form; they will not throw runtime exceptions.
   * @sideEffects None directly; updating form values may trigger re-renders in components using the form.
   *
   * @example
   * ```ts
   * const { register, handleSubmit, formState } = editForm;
   * <form onSubmit={handleSubmit(onSubmit)}>
   *   <input {...register("stockItemId")} />
   *   <input {...register("stockQuantity")} />
   * </form>
   * ```
   */
  const editForm = useForm<ItemStockFormValues>({
    resolver: zodResolver(itemStockFormSchema),
    defaultValues: {
      stockItemId: 0,
      stockQuantity: 0,
    },
  });


  /**
   * @purpose Opens the edit dialog and pre-fills form with selected stock item data.
   * 
   * @param {stockItem} — The stock item to edit.
   * @returns void
   * @throws None
   * @sideEffects Opens the edit dialog and sets selected inventory.
   * 
   * @example
   * ```ts
   * handleEditInventory(stockItem);
   * ```
   */
  const handleEditInventory = (stockItem: StockItem) => {
    setSelectedInventory(stockItem);
    editForm.reset({
      stockItemId: stockItem.stockItemId || 0,
      stockQuantity: stockItem.stockQuantity || 0,
    });
    setIsEditDialogOpen(true);
  };


  /**
   * @purpose Opens the delete confirmation dialog for the selected stock item.
   * 
   * @param {stockItem} — The stock item to delete.
   * @returns void
   * @throws None
   * @sideEffects Opens the delete dialog and sets selected inventory.
   * 
   * @example
   * ```ts
   * handleDeleteClick(stockItem);
   * ```
   */
  const handleDeleteClick = (stockItem: StockItem) => {
    setSelectedInventory(stockItem);
    setIsDeleteDialogOpen(true);
  };


  /**
   * @purpose Deletes the selected stock item.
   * 
   * @param void
   * @returns void
   * @throws Will show a destructive toast if deletion fails.
   * @sideEffects Calls DELETE API, invalidates queries, closes dialog, and shows toast notification.
   * 
   * @example
   * ```ts
   * handleDeleteInventory();
   * ```
   */
  const handleDeleteInventory = async () => {
    if (!selectedInventory) return;
    try {
      await apiRequest("DELETE", `/api/stock-item/${selectedInventory.id}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/stock-item"] });
      setIsDeleteDialogOpen(false);
      setSelectedInventory(null);
      toast({
        title: "Success",
        description: "Stock item deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete stock item.",
        variant: "destructive",
      });
    }
  };


  /**
     * Columns definition for the stockItems data table.
     *
     * @purpose Display stock item information including serial number, name, description, and action buttons.
     * 
     * @param None directly. Uses `handleEditInventory` and `handleDeleteInventory` functions.
     * @returns {ColumnDef<StockItem>[]} Array of column definitions for rendering stock items in a table.
     * @throws None. Table rendering errors may occur if data or handler functions are missing.
     * @sideEffects Clicking "Edit" or "Delete" triggers the respective handler functions.
     *
     * @example
     * ```ts
     * const stockItemColumns: ColumnDef<StockItem>[] = [
     * <DataTable columns={stockItemColumns} data={stockItems} />
     * ```
     */
  const stockItemColumns: ColumnDef<StockItem>[] = [
    {
      id: "serial",
      header: "SL.No.",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "stockItemId",
      header: "Item Name",
      cell: ({ row }) => {
        const stockItemId = row.getValue("stockItemId") as number;
        const stockItem = inventoryItems.find((s: Inventory) => s.id === stockItemId);
        return stockItem ? stockItem.items : "Unknown Stock Item";
      },
    },
    {
      accessorKey: "stockQuantity",
      header: "Quantity",
      cell: ({ row }) => (
        <div>{row.getValue("stockQuantity")}</div>
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
        const stockItem = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
              onClick={() => handleEditInventory(stockItem)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => handleDeleteClick(stockItem)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  
  /**
   * Handles the creation of a new stock item.
   * 
   * @purpose
   *  - Sends a POST request to create a new stock item in the inventory.
   *  - Updates the UI by closing the dialog, resetting the form, and refreshing the stock items table.
   *
   * @param data: ItemStockFormValues — The data submitted from the "Add Stock" form.
   * @returns {Promise<void>} Resolves when the stock item is successfully created.
   * @throws Will display a toast error if the API request fails.
   * @sideEffects
   *  - Calls the `/api/stock-item` POST API endpoint.
   *  - Invalidates the `"/api/stock-item"` and `'allInventoryData'` queries to refresh cached data.
   *  - Closes the "Add Stock" dialog.
   *  - Resets the form state.
   *  - Displays success or error toast notifications.
   *
   * @example
   * ```ts
   * // Called automatically when the "Add Stock" form is submitted
   * await onSubmit({ stockItemId: 1, stockQuantity: 10 });
   * ```
   */
  const onSubmit = async (data: ItemStockFormValues) => {
    try {
    //   console.log("Submitting data:", data);
      const response = await apiRequest("POST", "/api/stock-item", data);
      console.log("Response:", response);
      await queryClient.invalidateQueries({ queryKey: ["/api/stock-item"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Stock item added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['allInventoryData'] });
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
   * Handles updating an existing stock item.
   * @purpose
   *  - Sends a PUT request to update the selected stock item in the inventory.
   *  - Updates the UI by closing the edit dialog, resetting the form, and refreshing the stock items table.
   *
   * @param data: ItemStockFormValues — The data submitted from the "Edit Stock" form.
   * @returns {Promise<void>} Resolves when the stock item is successfully updated.
   * @throws Will display a toast error if the API request fails or no stock item is selected.
   * @sideEffects
   *  - Calls the `/api/stock-item/:id` PUT API endpoint.
   *  - Invalidates the `"/api/stock-item"` query to refresh cached data.
   *  - Closes the "Edit Stock" dialog.
   *  - Resets the edit form state.
   *  - Clears the `selectedInventory`.
   *  - Displays success or error toast notifications.
   *
   * @example
   * ```ts
   * // Called automatically when the "Edit Stock" form is submitted
   * await onEditSubmit({ stockItemId: 1, stockQuantity: 15 });
   * ```
   */
  const onEditSubmit = async (data: ItemStockFormValues) => {
    if (!selectedInventory) return;

    try {
      await apiRequest("PUT", `/api/stock-item/${selectedInventory.id}`, data);
      await queryClient.invalidateQueries({ queryKey: ["/api/stock-item"] });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedInventory(null);
      toast({
        title: "Success",
        description: "Stock item updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update stock item.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppShell> {/** AppShell wraps the page content, likely providing common layout (header/sidebar) */}
    {/* Page header with title and description , actions button */}
      <PageHeader
        title="Item Stock"
        description="Manage item stock and their quantities."
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Stock
          </Button>
        }
      />

      {/* Stock Item Table */}
      <Tabs defaultValue="inventory">
        <TabsContent value="inventory" className="mt-6">
          <DataTable
            columns={stockItemColumns} //Column configuration
            data={stockItems} //Data to be displayed
            searchColumns={["stockItemId", "stockQuantity", "createdAt"]} //Columns to be searched
            searchPlaceholder="Search item stock..." //Search placeholder
          />
        </TabsContent>
      </Tabs>

      {/* Create Stock Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
       {/* Dialog content */}
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
           {/* Dialog title and description */}
            <DialogTitle>Add New Stock</DialogTitle>
            <DialogDescription>
              Enter the details of the new stock item.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
           {/* Form content */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             {/* Item name field */}
              <FormField
                control={form.control}
                name="stockItemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      {/* Dropdown for item selection */}
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* List of items */}
                          {inventoryItems.map((stockItem) => (
                            <SelectItem key={stockItem.id} value={stockItem.id.toString()}>
                              {stockItem.items}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity field */}
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      {/* Input for quantity */}
                      <Input
                        type="number"
                        placeholder="Enter quantity"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit and Cancel buttons */}
              <div className="flex justify-end space-x-4">
                {/* Cancel button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                {/* Submit button */}
                <Button type="submit">Add Stock</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stock Item</DialogTitle>
            <DialogDescription>
              Update the details of the stock item.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            {/* Form content */}
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-8">
              {/* Item name field */}
              <FormField
                control={editForm.control}
                name="stockItemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      {/* Dropdown for item selection */}
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* List of items */}
                          {inventoryItems.map((stockItem) => (
                            <SelectItem key={stockItem.id} value={stockItem.id.toString()}>
                              {stockItem.items}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity field */}
              <FormField
                control={editForm.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      {/* Input for quantity */}
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

              {/* Submit and Cancel buttons */}
              <div className="flex justify-end space-x-4">
                {/* Cancel button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                {/* Submit button */}
                <Button type="submit">Update Stock</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Stock Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
       {/* Dialog content */}
        <DialogContent className="sm:max-w-[425px]">
         {/* Dialog header */}
          <DialogHeader>
           {/* Dialog title and description */}
            <DialogTitle>Delete Stock</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </DialogDescription>
          </DialogHeader>
          {/* Dialog footer */}
          <DialogFooter>
            {/* Cancel button */}
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            {/* Delete button */}
            <Button variant="destructive" onClick={() => handleDeleteInventory()}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
