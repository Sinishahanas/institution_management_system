import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from '@/hooks/use-toast';
import { capitalizeFirstLetter } from '@/lib/utils';
import React, { useState, useEffect, useMemo } from 'react';

/**
 * @purpose Represents a single permission option for a module.
 *
 * @property key - The unique key for the permission (used in backend and state).
 * @property label - The human-readable label displayed in the UI.
 * @returns {PermissionOption} Returns an object with `key` and `label` properties.
 * @throws None
 * @sideEffects None
 *
 * @example
 * const viewPermission: PermissionOption = { key: 'view', label: 'View' };
 */
export interface PermissionOption { key: string; label: string; }


/**
 * @purpose Represents a module and its permissions in the roles & permissions system.
 *
 * @property id - The plural module identifier (e.g., "courses") used in backend API.
 * @property module - The singular module name for display purposes (e.g., "Course").
 * @property isModuleChecked - Indicates whether all permissions for this module are enabled.
 * @property availablePermissions - The list of all possible permissions available for this module.
 * @property permissions - A record mapping permission keys to boolean values indicating if each permission is enabled.
 * @returns {ModulePermission} Returns an object with `id`, `module`, `isModuleChecked`, `availablePermissions`, and `permissions` properties.
 * @throws None
 * @sideEffects None
 *
 * @example
 * const courseModule: ModulePermission = {
 *   id: 'courses',
 *   module: 'Course',
 *   isModuleChecked: false,
 *   availablePermissions: [
 *     { key: 'view', label: 'View' },
 *     { key: 'create', label: 'Create' },
 *     { key: 'edit', label: 'Edit' },
 *     { key: 'delete', label: 'Delete' },
 *   ],
 *   permissions: { view: false, create: false, edit: false, delete: false },
 * };
 */
export interface ModulePermission {
  id: string; // Plural (e.g., "courses") to match your backend
  module: string; // Singular (e.g., "Course") for display
  isModuleChecked: boolean;
  availablePermissions: PermissionOption[];
  permissions: Record<string, boolean>;
}


/**
 * @purpose
 * - List of standard CRUD permissions used across most modules.
 * - Each permission defines an action (key) and a user-friendly label.
 * 
 * @param None
 * @returns {PermissionOption[]} Returns an array of CRUD permission definitions.
 * @throws {Error} This constant does not throw errors during normal execution.
 * @sideEffects None
 * 
 * @example
 * // Typical structure:
 * [
 *   { key: 'view', label: 'View' },
 *   { key: 'create', label: 'Create' },
 *   { key: 'edit', label: 'Edit' },
 *   { key: 'delete', label: 'Delete' },
 * ]
 */
const crudPermissions: PermissionOption[] = [
  { key: 'view', label: 'View' }, { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' },
];


/**
 * @purpose
 * - Base permissions template defining all modules and their default access controls.
 * - This acts as a **blueprint** for initializing a new role’s permissions before applying specific role-based updates from the API or database.
 *
 * Each module includes:
 *  - A unique `id` identifier (used in permission mapping)
 *  - A human-readable `module` name
 *  - A flag `isModuleChecked` (for UI toggling)
 *  - `availablePermissions`: an array of allowed permission types for that module
 *  - `permissions`: an object mapping each permission key to a boolean
 *
 * @returns {ModulePermission[]} Returns an array of module permission objects with all permission values initially set to `false`.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * // Usage: Initialize permissions in a role management component
 * const [permissions, setPermissions] = useState(basePermissionsTemplate);
 *
 * // Example output for a single module
 * {
 *   id: 'courses',
 *   module: 'Course',
 *   isModuleChecked: false,
 *   availablePermissions: [
 *     { key: 'view', label: 'View' },
 *     { key: 'create', label: 'Create' },
 *     { key: 'edit', label: 'Edit' },
 *     { key: 'delete', label: 'Delete' }
 *   ],
 *   permissions: {
 *     view: false,
 *     create: false,
 *     edit: false,
 *     delete: false
 *   }
 * }
 */
export const basePermissionsTemplate: ModulePermission[] = [
  { id: 'dashboard', module: 'Dashboard', isModuleChecked: false, availablePermissions: [ { key: 'viewStats', label: 'View Stats' }, { key: 'viewRevenue', label: 'View Revenue Data' }, { key: 'viewStudentDistribution', label: 'View Student Distribution' }, { key: 'viewRecentTransactions', label: 'View Recent Transactions' }, { key: 'viewTodayClasses', label: 'View Today\'s Classes' }, ], permissions: { viewStats: false, viewRevenue: false, viewStudentDistribution: false, viewRecentTransactions: false, viewTodayClasses: false }, },
  { id: 'courses', module: 'Course', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'batches', module: 'Batch', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'brands', module: 'Brand', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'branches', module: 'Branch', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'departments', module: 'Department', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'studio', module: 'Studio', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'inventory', module: 'Inventory', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'transportation', module: 'Transportation', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'attendance', module: 'Attendance', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'students', module: 'Student', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'employees', module: 'Employee', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'parents', module: 'Parent', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'invoices', module: 'Invoice', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'payments', module: 'Payment', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'receipts', module: 'Receipt', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
  { id: 'creditNotes', module: 'Credit Note', isModuleChecked: false, availablePermissions: crudPermissions, permissions: { view: false, create: false, edit: false, delete: false }, },
];


/**
 * @purpose 
 * - Populates a permissions template with actual API data.
 * - Merge the backend role data with the frontend permissions template.
 *
 * @param baseTemplate - The base permissions template to populate (e.g., `basePermissionsTemplate`).
 * @param apiPermissions - Permissions returned by the API in the format `{ [moduleId: string]: string[] }`.
 * @returns A deep-copied and populated array of `ModulePermission` objects with permissions set according to API.
 * @throws Will return the base template if `apiPermissions` is null or undefined.
 * @sideEffects None — returns a new array, does not mutate inputs.
 *
 * @example
 * const apiData = { courses: ['view', 'edit'], students: ['view'] };
 * const populatedPermissions = populatePermissionsFromAPI(basePermissionsTemplate, apiData);
 */ 
function populatePermissionsFromAPI(
  baseTemplate: ModulePermission[],
  apiPermissions: Record<string, string[]> | null
): ModulePermission[] {
  const populatedState = JSON.parse(JSON.stringify(baseTemplate)) as ModulePermission[];
  if (!apiPermissions) return populatedState;

  for (const module of populatedState) {
    const allowedActions = new Set(apiPermissions[module.id] || []);
    if (allowedActions.size === 0) continue;
    let allInModuleChecked = true;
    for (const action of module.availablePermissions) {
      if (allowedActions.has(action.key)) {
        module.permissions[action.key] = true;
      } else {
        allInModuleChecked = false;
      }
    }
    module.isModuleChecked = allInModuleChecked;
  }
  return populatedState;
}

/**
 * AdminRoles — React component for managing a single role's permissions.
 *
 * @purpose
 * - Displays and allows editing of the "branch_admin" role's permissions.
 *
 * @param None
 * @returns {JSX.Element}
 *   The component renders:
 *   - A header showing the role name and description.
 *   - A grid/table of modules with checkboxes for each available permission.
 *   - "Edit Role" and "Save Changes" buttons.
 *   - Handles loading and error states while fetching role data.
 * @sideEffects
 *   - Fetches role data from `/api/roles/branch_admin` when the component mounts.
 *   - Populates the permissions state using `populatePermissionsFromAPI`.
 *   - Tracks checkbox state for modules and individual permissions.
 *   - Sends updated permissions to the backend via PUT request to `/api/roles/branch_admin/permissions`.
 *   - Uses `toast` to show success or error notifications.
 * @throws
 *   - Displays an alert if fetching role data fails.
 *   - Shows a toast error if saving updated permissions fails.
 *
 * @example
 * ```tsx
 * <AdminRoles />
 * ```
 *
 * This will render a complete permissions table for the "branch_admin" role,
 * allowing an admin to view and edit permissions, and save changes to the backend.
 */
export default function AdminRoles() {
  const roleName = 'branch_admin';

  const [description, setDescription] = useState<string>('');
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);

  /**
   * useEffect — Load branch_admin role data on component mount.
   *
   * @purpose Fetches role description and permissions from the API for the 'branch_admin' role and populates the frontend state accordingly.
   * @param None
   * @returns None
   * @sideEffects
   *  - Updates `description` state with role description.
   *  - Updates `permissions` state with populated ModulePermission objects.
   *  - Updates `isLoading` state to manage loading UI.
   * @throws Alerts the user and logs to console if API call fails or role is not found.
   * 
   * @example
   * useEffect(() => {
   *   // Fetch and populate role data
   * }, [roleName]);
   */
  useEffect(() => {
    const loadRoleData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/roles/${roleName}`);
        if (!response.ok) {
          throw new Error(`Role '${roleName}' not found or API error.`);
        }
        const roleData = await response.json();

        setDescription(roleData.description || 'Administrator with branch-level access');
        const populatedState = populatePermissionsFromAPI(basePermissionsTemplate, roleData.permissions);
        setPermissions(populatedState);
      } catch (error) {
        alert(`Failed to load role data: ${error}`);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoleData();
  }, [roleName]); // It runs once, when roleName is set.


  /**
   * useEffect — Update "Select All" checkbox when permissions change.
   *
   * @purpose Automatically sets `isAllSelected` to true if all modules are checked, otherwise sets it to false.
   * 
   * @param None
   * @returns None
   * @throws None
   * @sideEffects Updates `isAllSelected` state.
   * 
   * @example
   * useEffect(() => {
   *   if (!isLoading) setIsAllSelected(permissions.every(mod => mod.isModuleChecked));
   * }, [permissions, isLoading]);
   */
  useEffect(() => {
    if (!isLoading) setIsAllSelected(permissions.every(mod => mod.isModuleChecked));
  }, [permissions, isLoading]);


  /**
   * handleSubmit — Save updated permissions and role description to backend.
   *  
   * @purpose Sends the updated permissions and description for the 'branch_admin' role to the API.
   * 
   * @param e - The form submission event.
   * @returns None
   * @throws Displays toast and logs error if API request fails.
   * @sideEffects
   *  - Calls API endpoint `/api/roles/branch_admin/permissions`.
   *  - Displays success or error toast messages.
   *  - Updates `isEditing` state to false on success.
   * 
   * @example
   * <form onSubmit={handleSubmit}>...</form>
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Form submitted"); // ✅ Log it for debugging

    if (!isEditing) {
      // console.log("Not editing, skip submit");
      return;
    }

    // Convert the UI state into the exact JSON format your backend needs.
    const permissionsToSave: Record<string, string[]> = {};
    for (const module of permissions) {
      const enabledActions = Object.keys(module.permissions).filter(key => module.permissions[key]);
      if (enabledActions.length > 0) {
        permissionsToSave[module.id] = enabledActions;
      }
    }
    
    const payload = { permissions: permissionsToSave, description };
    
    try {
      const response = await fetch(`/api/roles/${roleName}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An API error occurred.");
      }

      toast({
        title: "Success",
        description: `Role '${roleName}' was updated successfully!`,
      });

      setIsEditing(false);

    } catch (err) {
      toast({
        title: "Error",
        description: `Error saving role: ${err}`,
        variant: "destructive",
      });
      console.error(err);
    }
  };
  
  /**
   * handleSelectAll — Selects or deselects all modules and permissions.
   * @purpose Toggles all permissions for all modules based on checkbox state.
   *
   * @param e - Change event from the "Select / Deselect All" checkbox.
   * @returns {void}
   * @throws None
   * @sideEffects Updates `permissions` state for all modules.
   * 
   * @example
   * <input type="checkbox" onChange={handleSelectAll} />
   */
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setPermissions(prev => prev.map(mod => ({ ...mod, isModuleChecked: checked, permissions: Object.keys(mod.permissions).reduce((acc, key) => ({ ...acc, [key]: checked }), {}) })));
  };


  /**
   * handleModuleCheckboxChange — Selects or deselects all permissions of a single module.
   * @purpose Toggles all permissions for a specific module based on checkbox state.
   *
   * @param moduleId - ID of the module whose checkbox was changed.
   * @param checked - New checked state of the module checkbox.
   * @returns {void}
   * @throws None
   * @sideEffects Updates `permissions` state for the specific module.
   * 
   * @example
   * handleModuleCheckboxChange('courses', true);
   */
  const handleModuleCheckboxChange = (moduleId: string, checked: boolean) => {
    setPermissions(prev => prev.map(mod => {
        if (mod.id === moduleId) { return { ...mod, isModuleChecked: checked, permissions: Object.keys(mod.permissions).reduce((acc, key) => ({ ...acc, [key]: checked }), {}) }; }
        return mod;
    }));
  };


  /**
   * handlePermissionChange — Toggles a single permission within a module.
   * @purpose Toggles a single permission within a module based on checkbox state.
   *
   * @param moduleId - ID of the module.
   * @param permissionKey - Key of the permission to toggle.
   * @param checked - New checked state of the permission.
   * @returns {ModulePermission}
   * @throws None
   * @sideEffects Updates `permissions` state for the module and potentially `isModuleChecked`.
   * 
   * @example
   * handlePermissionChange('courses', 'edit', true);
   */
  const handlePermissionChange = (moduleId: string, permissionKey: string, checked: boolean) => {
    setPermissions(prev => prev.map(mod => {
        if (mod.id === moduleId) {
            const newPermissions = { ...mod.permissions, [permissionKey]: checked };
            const allInModuleChecked = mod.availablePermissions.every(p => newPermissions[p.key]);
            return { ...mod, permissions: newPermissions, isModuleChecked: allInModuleChecked };
        }
        return mod;
    }));
  };
  
  const maxPermissions = useMemo(() => Math.max(0, ...basePermissionsTemplate.map(mod => mod.availablePermissions.length)), []);
  const permissionsTableGridStyle = { gridTemplateColumns: `150px 200px repeat(${maxPermissions}, 1fr)` };
  
  if (isLoading) return <AppShell><div>Loading permissions for {roleName}...</div></AppShell>;

  return (
    // AppShell component is used to provide a consistent layout with a header, sidebar, and footer.
    <AppShell>
      {/* <PageHeader
        title={`Roles & Permissions: ${capitalizeFirstLetter(roleName)}`}
        description="Manage roles and permissions for your application."
        actions={ <Button type="submit" form="role-form-id">Save Changes</Button> }
      /> */}
      
      {/* Page header with title, description, and actions */}
      <PageHeader
        title={`Roles & Permissions: ${capitalizeFirstLetter(roleName)}`} 
        description="Manage roles and permissions"
        actions={
          !isEditing ? (
            <button type="button" onClick={() => setIsEditing(true)} className="bg-primary text-white px-4 py-2 rounded font-medium">
              Edit Role
            </button>
          ) : (
            <Button type="submit" form="role-form-id">Save Changes</Button>
          )
        }
      />
      <style>{componentStyles}</style>
      <div className="role-container">
        {/* Form for role details and permissions */}
        <form id="role-form-id" className="role-form" onSubmit={handleSubmit}>
          <div className="form-row">
            {/* Role name */}
            <div className="form-group">
              <label htmlFor="roleName">Role Name</label>
              <input type="text" id="roleName" value={roleName} readOnly />
            </div>
            {/* Role description */}
            <div className="form-group">
              <label htmlFor="roleDescription">Description</label>
              <input type="text" id="roleDescription" value={description} onChange={e => setDescription(e.target.value)} readOnly={!isEditing}/>
            </div>
          </div>
          {/* Permissions section */}
          <div className="permissions-section">
            {/* Permissions header */}
            <div className="permissions-header">
              <h2>✓ Permissions</h2>
              <label className="checkbox-label"><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />Select / Deselect All</label>
            </div>
            {/* Permissions table */}
            <div className="permissions-table">
              {/* Header row for permission grid — layout controlled by permissionsTableGridStyle */}
              <div className="permissions-table-header" style={permissionsTableGridStyle}>
                <div className="header-cell">Check/Uncheck</div> {/* Column for module checkbox */}
                <div className="header-cell module-header">Module</div> {/* Column for module name */}
                {Array.from({ length: maxPermissions }).map((_, i) => (<div key={`h-${i}`} className="header-cell">Permission</div>))} {/* Permission columns */}
              </div>
              {/* Rows: one per module with module-level and individual permission checkboxes */}
              {permissions.map(mod => (
                <div key={mod.id} className="permission-row" style={permissionsTableGridStyle}>
                  {/* Module-level checkbox */}
                  <div className="permission-cell"><input type="checkbox" checked={mod.isModuleChecked} onChange={e => handleModuleCheckboxChange(mod.id, e.target.checked)} /></div>
                  {/* Module name */}
                  <div className="permission-cell module-name">{mod.module}</div>
                  {/* Individual permission checkboxes */}
                  {Array.from({ length: maxPermissions }).map((_, index) => {
                    const p = mod.availablePermissions[index];
                    return (
                      <div key={p ? p.key : `p-${index}`} className="permission-cell">
                        {p && (
                          <div className="checkbox-label">
                            <input type="checkbox" id={`${mod.id}-${p.key}`} checked={mod.permissions[p.key] || false} disabled={!isEditing} onChange={e => handlePermissionChange(mod.id, p.key, e.target.checked)} />
                            <label htmlFor={`${mod.id}-${p.key}`}>{p.label}</label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}




/**
 * componentStyles — CSS styles for the AdminRoles component.
 *
 * @purpose Provides all styling for the roles and permissions form, including:
 *   - Layout and spacing for form rows and groups
 *   - Styling for the role name and description inputs
 *   - Permissions section, including table layout and headers
 *   - Checkbox appearance and hover states
 *   - Alternating row colors and responsive table behavior
 *
 * @sideEffects
 *  - Injected into the component using a `<style>` tag to style the form and permissions table.
 *
 * @example
 * <style>{componentStyles}</style>
 */
const componentStyles = `
  /* Same styles as before */
  .role-container { font-family: sans-serif; background-color: #f7f7f9; padding: 24px; color: #333; }
  .role-form { background-color: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .form-row { display: flex; gap: 24px; margin-bottom: 24px; }
  .form-group { flex: 1; }
  .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; color: #555; }
  .form-group input[type="text"] { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }
  .form-group input[readOnly] { background-color: #f0f0f0; cursor: not-allowed; }
  .permissions-section { border: 1px solid #e0e0e0; border-radius: 8px; overflow-x: auto; }
  .permissions-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background-color: #f7f7f9; border-bottom: 1px solid #e0e0e0; }
  .permissions-header h2 { font-size: 16px; font-weight: 600; margin: 0; color: #6c63ff; }
  .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; font-size: 14px; }
  .permissions-table { display: flex; flex-direction: column; min-width: 1200px; }
  .permissions-table-header, .permission-row { display: grid; align-items: center; padding: 0 16px; min-height: 50px; border-bottom: 1px solid #f0f0f0; gap: 16px; }
  .permission-row:last-child { border-bottom: none; }
  .permission-row:nth-child(even) { background-color: #fcfcfd; }
  .permissions-table-header { font-weight: 600; color: #888; font-size: 12px; text-transform: uppercase; }
  .header-cell, .permission-cell { padding: 8px 0; text-align: left; white-space: nowrap; }
  .module-name { font-weight: 500; }
  input[type="checkbox"] { width: 16px; height: 16px; accent-color: #6c63ff; cursor: pointer; }
`;