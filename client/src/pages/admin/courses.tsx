import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import ReactSelect from "react-select";
import React from "react";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { Course, Employee, Schedule, Studio } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, PlusCircle, Trash2, Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatTimeTo12Hour } from "@/lib/utils";

/**
 * Brand Form Schema
 * @purpose Defines the validation schema for a brand form using Zod.
 *
 * @param {object} brandFormSchema - Zod schema defining form validation rules.
 * @param {z.ZodString} brandFormSchema.name - Required brand name; must contain at least one character.
 * @param {z.ZodOptional<z.ZodString>} brandFormSchema.description - Optional brand description.
 * @returns {z.ZodObject<{ name: z.ZodString; description: z.ZodOptional<z.ZodString> }>}
 * - Returns a Zod object schema used to validate form data.
 * @throws {ZodError} Throws a ZodError if parsing fails when data does not meet the schema rules.
 * @sideEffects None
 *
 * @example
 * // Validate form data
 * const data = { name: "Innova", description: "Smart home brand" };
 * const parsed = brandFormSchema.parse(data);
 * // parsed => { name: "Innova", description: "Smart home brand" }
 */
const brandFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

/**
 * @purpose Represents the TypeScript type inferred from `brandFormSchema`.
 *
 * @type {object}
 * @property {string} name - Brand name (required).
 * @property {string} [description] - Brand description (optional).
 *
 * @returns {void}
 * @throws {None}
 * @sideEffects None
 *
 * @example
 * const values: BrandFormValues = { name: "Innova" };
 */
type BrandFormValues = z.infer<typeof brandFormSchema>;

/**
 * Department Form Schema
 * @purpose Defines the validation schema for a department form using Zod.
 *
 * @param {object} departmentFormSchema - Zod schema defining form validation rules.
 * @param {z.ZodString} departmentFormSchema.name - Required department name; must contain at least one character.
 * @param {z.ZodNumber} departmentFormSchema.brandId - Required brand ID; must be a number.
 * @param {z.ZodOptional<z.ZodString>} departmentFormSchema.description - Optional department description.
 * @returns {z.ZodObject<{ name: z.ZodString; brandId: z.ZodNumber; description: z.ZodOptional<z.ZodString> }>}
 * - Returns a Zod object schema used to validate form data.
 * @throws {ZodError} Throws a ZodError if parsing fails when data does not meet the schema rules.
 * @sideEffects None
 *
 * @example
 * // Validate form data
 * const data = { name: "Innova", brandId: 1, description: "Smart home brand" };
 * const parsed = departmentFormSchema.parse(data);
 * // parsed => { name: "Innova", brandId: 1, description: "Smart home brand" }
 */
const departmentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brandId: z.number().min(1, "Brand is required"),
  description: z.string().optional(),
});

/**
 * @purpose Represents the TypeScript type inferred from `departmentFormSchema`.
 *
 * @type {object}
 * @property {string} name - Department name (required).
 * @property {string} [description] - Department description (optional).
 * @returns {void}
 * @throws {None}
 * @sideEffects None
 *
 * @example
 * const values: DepartmentFormValues = { name: "Innova" };
 */
type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

/**
 * Schedule Form Schema
 * @purpose
 * - Defines the validation schema for a schedule form using Zod.
 * - This schema validates that:
 *    - `day` is a required string (representing the selected day or days),
 *    - `startTime` is a required string (start time of the schedule),
 *    - `endTime` is a required string (end time of the schedule).
 *
 * @param {object} scheduleFormSchema - Zod schema defining form validation rules.
 * @param {z.ZodString} scheduleFormSchema.day - Required; must be a non-empty string representing selected day(s).
 * @param {z.ZodString} scheduleFormSchema.startTime - Required; must be a non-empty string representing the start time.
 * @param {z.ZodString} scheduleFormSchema.endTime - Required; must be a non-empty string representing the end time.
 * @returns {z.ZodObject<{ day: z.ZodString; startTime: z.ZodString; endTime: z.ZodString }>}
 * - Returns a Zod object schema used for validating schedule form input.
 * @throws {ZodError} Throws a ZodError if the provided data does not satisfy schema validation rules.
 * @sideEffects None
 *
 * @example
 * // Example: Validating schedule input
 * const data = { day: "Monday", startTime: "09:00", endTime: "17:00" };
 * const parsed = scheduleFormSchema.parse(data);
 * // parsed => { day: "Monday", startTime: "09:00", endTime: "17:00" }
 */
const scheduleFormSchema = z.object({
  day: z.string().min(1, "At least one day must be selected"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

/**
 * @purpose TypeScript type inferred automatically from `scheduleFormSchema`.
 *
 * @type {object}
 * @property {string} day - Selected day(s) for the schedule (required).
 * @property {string} startTime - Start time for the schedule (required).
 * @property {string} endTime - End time for the schedule (required).
 * @returns {void}
 * @throws {None}
 * @sideEffects None
 *
 * @example
 * const values: ScheduleFormValues = {
 *   day: "Tuesday",
 *   startTime: "10:00",
 *   endTime: "18:00",
 * };
 */
type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

/**
 * Course Form Schema
 * @purpose Defines the validation schema for a course form using Zod.
 *
 * @param {object} courseFormSchema - Zod schema defining validation rules for course input.
 * @param {z.ZodString} courseFormSchema.code - Required; course code must be a non-empty string.
 * @param {z.ZodString} courseFormSchema.name - Required; course name must be a non-empty string.
 * @param {z.ZodNumber} courseFormSchema.brandId - Required; brand ID must be greater than or equal to 1.
 * @param {z.ZodString} courseFormSchema.category - Required; course category must be a non-empty string.
 * @param {z.ZodNumber} courseFormSchema.fee - Required; course fee must be a number greater than 0.
 * @returns {z.ZodObject<{ code: z.ZodString; name: z.ZodString; brandId: z.ZodNumber; category: z.ZodString; fee: z.ZodNumber }>}
 *    - Returns a Zod object schema used for validating course form input.
 * @throws {ZodError} Throws a ZodError if validation fails when data does not meet schema rules.
 * @sideEffects None
 *
 * @example
 * // Example: Validating course form data
 * const data = {
 *   code: "CS101",
 *   name: "Intro to Computer Science",
 *   brandId: 1,
 *   category: "Technology",
 *   fee: 500,
 * };
 * const parsed = courseFormSchema.parse(data);
 * // parsed => { code: "CS101", name: "Intro to Computer Science", brandId: 1, category: "Technology", fee: 500 }
 */
const courseFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  brandId: z.number().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  fee: z.number().min(1, "Fee must be greater than 0"),
});

/**
 * TypeScript type inferred from `courseFormSchema`.
 *
 * @purpose This type represents the validated structure of a course form object, ensuring compile-time type safety when handling validated course data.
 *
 * @type {object}
 * @property {string} code - Course code (required).
 * @property {string} name - Course name (required).
 * @property {number} brandId - ID of the selected brand (required).
 * @property {string} category - Course category (required).
 * @property {number} fee - Course fee (must be greater than 0).
 * @returns {void}
 * @throws {None}
 * @sideEffects None
 *
 * @example
 * const course: CourseFormValues = {
 *   code: "PHY202",
 *   name: "Advanced Physics",
 *   brandId: 2,
 *   category: "Science",
 *   fee: 800,
 * };
 */
type CourseFormValues = z.infer<typeof courseFormSchema>;

// Form schema for batch
/**
 * Batch Form Schema
 * @purpose Defines the validation schema for a batch form using Zod.
 *
 * @param {object} batchFormSchema - Zod schema defining validation rules for batch creation.
 * @param {z.ZodString} batchFormSchema.name - Required; batch name must be a non-empty string.
 * @param {z.ZodNumber} batchFormSchema.courseId - Required; course ID must be greater than or equal to 1.
 * @param {z.ZodNumber} batchFormSchema.perDayValue - Required; numeric value for per-day fees, must be ≥ 0.01.
 * @param {z.ZodNumber} batchFormSchema.teacherId - Required; teacher ID must be greater than or equal to 1.
 * @param {z.ZodString} batchFormSchema.startDate - Required; must be a valid date string (parsable by `Date.parse`).
 * @param {z.ZodNullable<z.ZodOptional<z.ZodString>>} batchFormSchema.endDate - Optional; must be a valid date string or null.
 * @param {z.ZodArray} batchFormSchema.schedules - Required; list of schedule objects defining class timings.
 * @param {z.ZodOptional<z.ZodString>} batchFormSchema.roomNumber - Optional; classroom number or identifier.
 * @param {z.ZodOptional<z.ZodNumber>} batchFormSchema.capacity - Optional; number of students in the batch.
 * @param {z.ZodString} batchFormSchema.category - Required; category name of the batch.
 * @param {z.ZodString} batchFormSchema.branch - Required; branch name or location.
 * @param {z.ZodEnum<["active", "completed", "cancelled"]>} batchFormSchema.status - Batch status with a default of `"active"`.
 * @returns {z.ZodObject} Returns a Zod object schema that validates batch form input.
 * @throws {ZodError} Throws a ZodError if validation fails for any field, including invalid date or time formats.
 * @sideEffects None
 *
 * @example
 * // Example: Validating batch form input
 * const data = {
 *   name: "Batch A",
 *   courseId: 1,
 *   perDayValue: 50,
 *   teacherId: 2,
 *   startDate: "2025-01-10",
 *   endDate: "2025-03-10",
 *   schedules: [
 *     { day: "Monday", startTime: "09:00", endTime: "11:00", duration: 120 },
 *   ],
 *   roomNumber: "R101",
 *   capacity: 20,
 *   category: "Regular",
 *   branch: "Main Campus",
 *   status: "active",
 * };
 * const parsed = batchFormSchema.parse(data);
 * // parsed => Validated and type-safe batch data
 */
const batchFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  courseId: z.number().min(1, "Course is required"),
  perDayValue: z
    .number({
      required_error: "Per day value is required",
      invalid_type_error: "Per day value must be a number",
    })
    .min(0.01, "Per day value must be at least 0.01"),
  teacherId: z.number().min(1, "Teacher is required"),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  endDate: z
    .string()
    .refine(
      (val) => val === "" || !isNaN(Date.parse(val)),
      "Invalid date format",
    )
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  schedules: z
    .array(
      z.object({
        day: z.string().min(1, "Day is required"),
        startTime: z
          .string()
          .min(1, "Start time is required")
          .refine(isValidTime, "Invalid time format"), // Add time validation
        endTime: z
          .string()
          .min(1, "End time is required")
          .refine(isValidTime, "Invalid time format"), // Add time validation
        duration: z.number().min(1, "Duration must be positive").optional(),
      }),
    )
    .min(1, "At least one schedule is required"),
  roomNumber: z.string().optional(),
  capacity: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  branch: z.string().min(1, "Branch is required"),
  status: z.enum(["active", "completed", "cancelled"]).default("active"),
});

/**
 * @purpose
 * - Helper function for validating time strings in HH:MM format (24-hour clock).
 * - Ensures that input times follow a valid format such as `"09:30"` or `"23:59"`.
 * - Used by the batch form schema to validate `startTime` and `endTime` fields.
 *
 * @param {string} time - The time string to validate.
 * @returns {boolean} Returns `true` if the time string is valid, otherwise `false`.
 * @throws {None}
 * @sideEffects None
 *
 * @example
 * isValidTime("09:45"); // true
 * isValidTime("25:00"); // false
 */
function isValidTime(time: string): boolean {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time); // HH:MM format
}

/**
 * @purpose TypeScript type inferred from `batchFormSchema`.
 *
 * @type {object}
 * @property {string} name - Name of the batch (required).
 * @property {number} courseId - ID of the associated course (required).
 * @property {number} perDayValue - Daily fee for the batch (≥ 0.01).
 * @property {number} teacherId - ID of the assigned teacher (required).
 * @property {string} startDate - Batch start date (valid date string).
 * @property {string|null} [endDate] - Optional end date (valid date string or null).
 * @property {Array<{day: string, startTime: string, endTime: string, duration?: number}>} schedules - List of batch schedules.
 * @property {string} [roomNumber] - Optional classroom identifier.
 * @property {number} [capacity] - Optional batch capacity.
 * @property {string} category - Batch category (required).
 * @property {string} branch - Branch name or location (required).
 * @property {"active" | "completed" | "cancelled"} status - Batch status (default: `"active"`).
 * @returns {void}
 * @throws {None}
 * @sideEffects None
 *
 * @example
 * const batch: BatchFormValues = {
 *   name: "Batch B",
 *   courseId: 2,
 *   perDayValue: 60,
 *   teacherId: 3,
 *   startDate: "2025-02-01",
 *   endDate: null,
 *   schedules: [{ day: "Wednesday", startTime: "10:00", endTime: "12:00" }],
 *   category: "Weekend",
 *   branch: "Downtown",
 *   status: "active",
 * };
 */
type BatchFormValues = z.infer<typeof batchFormSchema>;

/**
 * Branch Form Schema
 * @purpose
 * - Defines the validation schema for a branch form using Zod.
 * - Used for validating branch creation or editing forms in an organization or brand management system.
 *
 * @param {object} branchFormSchema - Zod schema defining validation rules for branch input.
 * @param {z.ZodString} branchFormSchema.code - Required; branch code must be a non-empty string.
 * @param {z.ZodString} branchFormSchema.name - Required; branch name must be a non-empty string.
 * @param {z.ZodArray<z.ZodNumber>} branchFormSchema.brandIds - Required; must contain at least one numeric brand ID.
 * @param {z.ZodString} branchFormSchema.phone - Required; branch phone number as a non-empty string.
 * @param {z.ZodNullable<z.ZodOptional<z.ZodString>>} branchFormSchema.manager - Optional; name of the branch manager.
 * @param {z.ZodEnum<["active", "inactive"]>} branchFormSchema.status - Branch status; defaults to `"active"`.
 * @returns {z.ZodObject} Returns a Zod schema object for branch validation.
 * @throws {ZodError} Throws if any required field is missing or invalid.
 * @sideEffects None
 *
 * @example
 * const data = {
 *   code: "BR001",
 *   name: "Downtown Branch",
 *   brandIds: [1, 2],
 *   phone: "9876543210",
 *   manager: "Alice Johnson",
 *   status: "active",
 * };
 * const parsed = branchFormSchema.parse(data);
 * // parsed => Valid branch object
 */
const branchFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  brandIds: z.array(z.number()).min(1, "At least one brand is required"),
  phone: z.string().min(1, "Phone is required"),
  manager: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

/**
 * TypeScript type inferred from `branchFormSchema`.
 *
 * @purpose Represents the validated structure of a branch form.
 *
 * @type {object}
 * @property {string} code - Branch code.
 * @property {string} name - Branch name.
 * @property {number[]} brandIds - List of associated brand IDs.
 * @property {string} phone - Branch phone number.
 * @property {string|null} [manager] - Optional branch manager.
 * @property {"active" | "inactive"} status - Branch status.
 * @returns {void}
 * @throws {None}
 * @sideEffects None
 *
 * @example
 * const branch: BranchFormValues = {
 *   code: "BR002",
 *   name: "Downtown Branch",
 *   brandIds: [1],
 *   phone: "1234567890",
 *   manager: null,
 *   status: "inactive",
 * };
 */
type BranchFormValues = z.infer<typeof branchFormSchema>;

/**
 * @purpose
 * - Defines the validation schema for transportation mode using Zod.
 * - This schema validates information related to a transportation mode, ensuring mode name, rate, and per-day value are provided and meet the required rules.
 *
 * @param {object} transportationModeFormSchema - Zod schema defining form validation for transportation modes.
 * @param {z.ZodString} transportationModeFormSchema.mode - Required; mode name must be a non-empty string.
 * @param {z.ZodNumber} transportationModeFormSchema.rate - Required; must be greater than 0.
 * @param {z.ZodNumber} transportationModeFormSchema.perDayValue - Required; must be a number ≥ 0.01.
 * @returns {z.ZodObject} Returns a Zod schema for transportation mode validation.
 * @throws {ZodError} Throws when data fails schema validation.
 * @sideEffects None
 *
 * @example
 * const data = { mode: "Bus", rate: 150, perDayValue: 15.5 };
 * const parsed = transportationModeFormSchema.parse(data);
 * // parsed => Valid transportation mode data
 */
const transportationModeFormSchema = z.object({
  mode: z.string().min(1, "Mode is required"),
  rate: z.number().min(1, "Rate must be greater than 0"),
  perDayValue: z
    .number({
      required_error: "Per day value is required",
      invalid_type_error: "Per day value must be a number",
    })
    .min(0.01, "Per day value must be at least 0.01"),
});

/**
 * TypeScript type inferred from `transportationModeFormSchema`.
 *
 * @purpose Represents the validated structure of a transportation mode entry.
 *
 * @type {object}
 * @property {string} mode - Mode of transportation.
 * @property {number} rate - Rate for transportation (must be > 0).
 * @property {number} perDayValue - Per-day cost (must be ≥ 0.01).
 * @returns {void}
 * @throws {None}
 * @sideEffects None
 *
 * @example
 * const mode: TransportationModeFormValues = {
 *   mode: "Taxi",
 *   rate: 250,
 *   perDayValue: 20,
 * };
 */
type TransportationModeFormValues = z.infer<
  typeof transportationModeFormSchema
>;

/**
 * Studio Form Schema
 * @purpose
 * - Defines the validation schema for a studio form using Zod.
 * - This schema validates basic studio information, including its name and optional description.
 *
 * @param {object} studioFormSchema - Zod schema defining validation rules for studio input.
 * @param {z.ZodString} studioFormSchema.name - Required; studio name must be a non-empty string.
 * @param {z.ZodOptional<z.ZodString>} studioFormSchema.description - Optional; description of the studio.
 * @returns {z.ZodObject} Returns a Zod object schema used for validating studio data.
 * @throws {ZodError} Throws a ZodError if validation fails.
 * @sideEffects None
 *
 * @example
 * const data = { name: "Innova Studio", description: "Music recording studio" };
 * const parsed = studioFormSchema.parse(data);
 * // parsed => Validated studio data
 */
const studioFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  description: z.string().optional(),
});

/**
 * TypeScript type inferred from `studioFormSchema`.
 *
 * @purpose Represents the validated structure of a studio form.
 *
 * @type {object}
 * @property {string} name - Studio name (required).
 * @property {string} [description] - Optional description of the studio.
 * @returns {void}
 * @throws {None}
 * @sideEffects None
 *
 * @example
 * const studio: studioSchemaType = {
 *   name: "Innova Design Lab",
 *   description: "A creative workspace for design projects",
 * };
 */
type studioSchemaType = z.infer<typeof studioFormSchema>;

/**
 * @purpose
 * - Manages UI and state for course-related admin operations (courses, batches, branches, departments, schedules, transportation, studios, brands). Provides dialog state, selected-item state, and integrates with toast notifications for user feedback.
 * - The component centralizes local UI state for many admin flows (create/update/delete), and is intended to be rendered inside an admin layout or route. It does not accept props.
 *
 * @param {void} none - This component takes no props.
 * @returns {JSX.Element} The rendered AdminCourses component tree (JSX).
 * @throws {None} This component does not throw. Validation/operations performed by called APIs or handlers may throw and should be handled where those calls occur.
 * @sideEffects
 * - Uses React state hooks to manage dialog visibility and selected entities.
 * - Calls `useToast()` to show notifications (external UI side-effect).
 * - May trigger network/API calls or other effects via event handlers (not shown here).
 *
 * @example
 * // Render inside your admin routes or pages:
 * import AdminCourses from "@/admin/AdminCourses";
 *
 * function AdminPage() {
 *   return (
 *     <AdminLayout>
 *       <AdminCourses />
 *     </AdminLayout>
 *   );
 * }
 */
export default function AdminCourses() {
  const [activeTab, setActiveTab] = useState("batches"); // Currently active tab in the admin panel
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); // Controls course creation dialog
  const [isCreateBatchDialogOpen, setIsCreateBatchDialogOpen] = useState(false); // Controls batch creation dialog
  const [isCreateBranchDialogOpen, setIsCreateBranchDialogOpen] =
    useState(false); // Controls branch creation dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Controls course editing dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Controls course deletion dialog
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null); // Currently selected course for edit/delete
  const [selectedBranch, setSelectedBranch] = useState<any>(null); // Currently selected branch for edit/delete
  const [isEditBranchDialogOpen, setIsEditBranchDialogOpen] = useState(false); // Controls branch editing dialog
  const [isDeleteBranchDialogOpen, setIsDeleteBranchDialogOpen] =
    useState(false); // Controls branch deletion dialog
  const [selectedBatch, setSelectedBatch] = useState<any>(null); // Currently selected batch for edit/delete
  const [isEditBatchDialogOpen, setIsEditBatchDialogOpen] = useState(false); // Controls batch editing dialog
  const [isDeleteBatchDialogOpen, setIsDeleteBatchDialogOpen] = useState(false); // Controls batch deletion dialog
  const [isCreateDepartmentDialogOpen, setIsCreateDepartmentDialogOpen] =
    useState(false); // Controls department creation dialog
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null); // Currently selected department for edit/delete
  const [isEditDepartmentDialogOpen, setIsEditDepartmentDialogOpen] =
    useState(false); // Controls department editing dialog
  const [isDeleteDepartmentDialogOpen, setIsDeleteDepartmentDialogOpen] =
    useState(false); // Controls department deletion dialog
  const [isCreateScheduleDialogOpen, setIsCreateScheduleDialogOpen] =
    useState(false); // Controls schedule creation dialog
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null); // Currently selected schedule for edit/delete
  const [isEditScheduleDialogOpen, setIsEditScheduleDialogOpen] =
    useState(false); // Controls schedule editing dialog
  const [isDeleteScheduleDialogOpen, setIsDeleteScheduleDialogOpen] =
    useState(false); // Controls schedule deletion dialog
  const [selectedDepartmentForBatch, setSelectedDepartmentForBatch] = useState<
    number | null
  >(null); // Currently selected department for batch
  const [
    isCreateTransportationDialogOpen,
    setIsCreateTransportationDialogOpen,
  ] = useState(false); // Controls transportation mode creation dialog
  const [isEditTransportationDialogOpen, setIsEditTransportationDialogOpen] =
    useState(false); // Controls transportation mode editing dialog
  const [
    isDeleteTransportationDialogOpen,
    setIsDeleteTransportationDialogOpen,
  ] = useState(false); // Controls transportation mode deletion dialog
  const [selectedTransportationMode, setSelectedTransportationMode] =
    useState<TransportationModeRow | null>(null); // Currently selected transportation mode for edit/delete
  const [selectedStudio, setSelectedStudio] = useState<any>(null); // Currently selected studio for edit/delete

  const [isStudioDialogOpen, setIsStudioDialogOpen] = useState<{
    create?: boolean;
    update?: boolean;
    delete?: boolean;
  }>({
    create: false,
    update: false,
    delete: false,
  }); // Controls studio dialogs (create/update/delete)
  const [isCreateBrandDialogOpen, setIsCreateBrandDialogOpen] = useState(false); // Controls brand creation dialog
  const [selectedBrand, setSelectedBrand] = useState<any>(null); // Currently selected brand for edit/delete
  const [isEditBrandDialogOpen, setIsEditBrandDialogOpen] = useState(false); // Controls brand editing dialog
  const [isDeleteBrandDialogOpen, setIsDeleteBrandDialogOpen] = useState(false); // Controls brand deletion dialog

  const { toast } = useToast(); // Toast notifications

  /**
   * @purpose Stores the current filter criteria for courses, batches, branches, schedules, or other related entities.
   *
   * This state object is used to filter displayed data based on user input, such as name, brand, course, per-day value,
   * branch, category, schedule day, start/end times, duration, teacher, room number, or capacity.
   *
   * @property {string} name - Filter by name.
   * @property {string} brandId - Filter by brand ID.
   * @property {string} courseId - Filter by course ID.
   * @property {string} perDayValue - Filter by per-day fee value.
   * @property {string} branch - Filter by branch name.
   * @property {string} category - Filter by category name.
   * @property {string} day - Filter by schedule day.
   * @property {string} startTime - Filter by schedule start time.
   * @property {string} endTime - Filter by schedule end time.
   * @property {string} duration - Filter by schedule duration.
   * @property {string} teacherId - Filter by teacher ID.
   * @property {string} roomNumber - Filter by room number.
   * @property {string} capacity - Filter by batch capacity.
   * @returns {void}
   * @throws {None}
   * @sideEffects None
   *
   * @example
   * // Update the name filter
   * setFilters(prev => ({ ...prev, name: "Intro to CS" }));
   */
  const [filters, setFilters] = useState({
    name: "",
    brandId: "",
    courseId: "",
    perDayValue: "",
    branch: "",
    category: "",
    day: "",
    startTime: "",
    endTime: "",
    duration: "",
    teacherId: "",
    roomNumber: "",
    capacity: "",
  });

  /** Array of all weekdays used for schedule selection/dropdowns */
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  /**
   * @purpose Calculates the duration in minutes for a schedule in the batch creation form and updates the form state.
   *
   * @param index - Index of the schedule in the batchForm schedules array.
   * @returns {void}
   * @throws Will throw if `startTime` or `endTime` is invalid date string.
   * @sideEffects Updates the `batchForm`'s `schedules` field with the calculated duration.
   *
   * @example
   * calculateDuration(0); // Calculates and updates duration for the first schedule
   */
  const calculateDuration = (index: number) => {
    const schedules = batchForm.getValues("schedules");
    const { startTime, endTime } = schedules[index];

    if (!startTime || !endTime) return;

    const startDate = new Date(`2000-01-01T${startTime}`);
    const endDate = new Date(`2000-01-01T${endTime}`);

    const diffMs = endDate.getTime() - startDate.getTime();

    // In hours
    // const durationHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    // In minutes
    const durationMinutes = Math.round(diffMs / (1000 * 60));

    schedules[index].duration = durationMinutes;
    batchForm.setValue("schedules", schedules);
    // batchForm.setValue("duration", durationMinutes);
  };

  /**
   * @purpose Calculates the duration in minutes for a schedule in the batch edit form and updates the form state.
   *
   * @param index - Index of the schedule in the editBatchForm schedules array.
   * @returns {void}
   * @throws Will throw if `startTime` or `endTime` is invalid date string.
   * @sideEffects Updates the `editBatchForm`'s `schedules` field with the calculated duration.
   *
   * @example
   * calculateDurationForEditBatch(1); // Calculates duration for second schedule
   */
  const calculateDurationForEditBatch = (index: number) => {
    const schedules = editBatchForm.getValues("schedules");
    const { startTime, endTime } = schedules[index];

    if (!startTime || !endTime) return;

    const startDate = new Date(`2000-01-01T${startTime}`);
    const endDate = new Date(`2000-01-01T${endTime}`);

    const diffMs = endDate.getTime() - startDate.getTime();

    // In hours
    // const durationHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    // In minutes
    const durationMinutes = Math.round(diffMs / (1000 * 60));

    schedules[index].duration = durationMinutes;
    editBatchForm.setValue("schedules", schedules);
    // batchForm.setValue("duration", durationMinutes);
  };

  /**
   * Fetches all courses from the API.
   *
   * @purpose Provides a list of courses for filters or batch forms.
   *
   * @param {void}
   * @returns {Course[]} Array of course objects.
   * @throws Will throw if the fetch fails (network error or non-OK response).
   * @sideEffects Sets `isLoading` state while fetching.
   *
   * @example
   * const { data: courses, isLoading } = useQuery<Course[]>({ queryKey: ["/api/courses"] });
   */
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  /**
   * Fetches all brands from the API.
   *
   * @purpose Provides a list of brands for filters or dropdowns.
   *
   * @param {void}
   * @returns {any[]} Array of brand objects.
   * @throws Will throw if the fetch fails.
   * @sideEffects Sets `isLoadingBrands` while fetching.
   *
   * @example
   * const { data: brands, isLoading: isLoadingBrands } = useQuery<any[]>({
   *   queryKey: ["/api/brands"],
   * });
   */
  const { data: brands = [], isLoading: isLoadingBrands } = useQuery<any[]>({
    queryKey: ["/api/brands"],
  });

  /**
   * Fetches all departments from the API.
   *
   * @purpose Provides department options for filtering batches or schedules.
   *
   * @param {void}
   * @returns {any[]} Array of department objects.
   * @throws Will throw if the fetch fails.
   * @sideEffects Sets `isLoadingDepartments` while fetching.
   *
   * @example
   * const { data: departments, isLoading: isLoadingDepartments } = useQuery<any[]>({
   *   queryKey: ["/api/departments"],
   * });
   */
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery<
    any[]
  >({
    queryKey: ["/api/departments"],
  });

  /**
   * Fetches all schedules from the API.
   *
   * @purpose Provides schedule data for batch creation/editing.
   *
   * @param {void}
   * @returns {any[]} Array of schedule objects.
   * @throws Will throw if the fetch fails.
   * @sideEffects Sets `isLoadingSchedules` while fetching.
   *
   * @example
   * const { data: schedules, isLoading: isLoadingSchedules } = useQuery<any[]>({
   *   queryKey: ["/api/schedules"],
   * });
   */
  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery<
    any[]
  >({
    queryKey: ["/api/schedules"],
  });

  /**
   * Fetches all batches from the API.
   *
   * @purpose Provides a list of batches for the admin panel.
   *
   * @param {void}
   * @returns {any[]} Array of batch objects.
   * @throws Will throw if the fetch fails.
   * @sideEffects Sets `isLoadingBatches` while fetching.
   *
   * @example
   * const { data: batches, isLoading: isLoadingBatches } = useQuery<any[]>({
   *   queryKey: ["/api/batches"],
   * });
   */
  const { data: batches = [], isLoading: isLoadingBatches } = useQuery<any[]>({
    queryKey: ["/api/batches"],
  });

  /**
   * Fetches all employees from the API.
   *
   * @purpose Retrieves employees to select active teachers for batches.
   *
   * @param {void}
   * @returns {Employee[]} Array of employee objects.
   * @throws Will throw if the fetch fails.
   * @sideEffects Sets `isLoadingEmployees` while fetching.
   *
   * @example
   * const { data: employees, isLoading: isLoadingEmployees } = useQuery<Employee[]>({
   *   queryKey: ["/api/employees"],
   * });
   */
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<
    Employee[]
  >({
    queryKey: ["/api/employees"],
  });

  /**
   * Fetches all branches from the API.
   *
   * @purpose Provides a list of branches for filtering batches or schedules.
   *
   * @param {void}
   * @returns {any[]} Array of branch objects.
   * @throws Will throw if the fetch fails.
   * @sideEffects Sets `isLoadingBranches` while fetching.
   *
   * @example
   * const { data: branches, isLoading: isLoadingBranches } = useQuery<any[]>({
   *   queryKey: ["/api/branches"],
   * });
   */
  const { data: branches = [], isLoading: isLoadingBranches } = useQuery<any[]>(
    {
      queryKey: ["/api/branches"],
    },
  );

  /**
   * Fetches all studios from the API.
   *
   * @purpose Provides studio information for batch or student management.
   *
   * @param {void}
   * @returns {any[]} Array of studio objects.
   * @throws Will throw if the fetch fails.
   * @sideEffects Sets `isLoadingStudios` while fetching.
   *
   * @example
   * const { data: studiosData, isLoading: isLoadingStudios } = useQuery<any[]>({
   *   queryKey: ["/api/studio"],
   * });
   */
  const { data: studiosData = [], isLoading: isLoadingStudios } = useQuery<
    any[]
  >({
    queryKey: ["/api/studio"],
  });

  /**
   * Fetches all transportation modes from the API.
   *
   * @purpose Provides a list of transportation modes for batch or student scheduling.
   * 
   * @param {void}
   * @returns {any[]} Array of transportation mode objects.
   * @throws Will throw if the fetch fails.
   * @sideEffects Sets `isLoadingTransportations` while fetching.
   * 
   * @example
   * const { data: transportations, isLoading: isLoadingTransportations } =useQuery<any[]>({
   *   queryKey: ["/api/transportationModes"],
    });
  */
  const { data: transportations = [], isLoading: isLoadingTransportations } =
    useQuery<any[]>({
      queryKey: ["/api/transportationModes"],
    });

  /**
   * Filters employees to include only active teachers.
   *
   * @purpose Provides a list of currently active teachers for batch assignment.
   *
   * @param {Employee[]} employees - Array of employee objects.
   * @returns {Employee[]} Array of employees with position "teacher" and status "active".
   * @throws Will throw if `employees` is not an array.
   * @sideEffects None
   *
   * @example
   * const teachers = employees.filter(
   *   (employee) => employee.position === "teacher" && employee.status === "active"
   * );
   */
  const teachers = employees.filter(
    (employee: any) =>
      employee.position === "teacher" && employee.status === "active",
  );

  /**
   * Retrieves schedules for a given batch and maps them to simplified objects.
   *
   * @purpose Provide the schedule details (day, startTime, endTime, duration) for a specific batch.
   *
   * @param {number} batchId - The ID of the batch to retrieve schedules for.
   * @returns {Schedule[]} Array of schedule objects containing day, startTime, endTime, and duration.
   * @throws Will throw if `schedules` array contains invalid date/time values (if further processing is added).
   * @sideEffects None
   *
   * @example
   * const batchSchedules = getSchedule(101);
   * // batchSchedules => [{ day: "Monday", startTime: "10:00", endTime: "12:00", duration: 120 }]
   */
  const getSchedule = (batchId: number) => {
    const schedule = schedules.filter((s: Schedule) => s.batchId === batchId);
    return schedule.map((s: Schedule) => ({
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
    }));
  };

  /**
   * React component to display the number of students in a batch.
   *
   * @purpose Dynamically fetch and display the strength of a batch.
   *
   * @param {any} row - Table row object containing batch data (row.original.id is used as batchId)
   * @returns {JSX.Element} JSX element displaying the student count or "Loading..." if count is not yet fetched.
   * @throws Will not throw, but fetch errors are caught internally and count defaults to 0.
   * @sideEffects Fetches student count from `/api/student-count?batchId=<id>` when component mounts or row.original.id changes.
   *
   * @example
   * <batchStrength row={rowData} />
   */
  const batchStrength: React.FC<{ row: any }> = ({ row }) => {
    const [count, setCount] = React.useState<number | null>(null);

    React.useEffect(() => {
      const batchId = row.original.id;
      fetch(`/api/student-count?batchId=${batchId}`)
        .then((res) => res.json())
        .then((data) => setCount(data.studentCount))
        .catch(() => setCount(0));
    }, [row.original.id]);

    return (
      <div style={{ textAlign: "center" }}>
        {count !== null ? count : "Loading..."}
      </div>
    );
  };

  /**
   * Creates a react-hook-form instance for creating/editing brands.
   *
   * @purpose Manage state and validation for brand creation.
   *
   * @param {BrandFormValues} defaultValues - Default values for the form.
   * @returns `brandForm` object with form methods (getValues, setValue, handleSubmit, etc.)
   * @throws Will not throw errors directly; form validation errors handled by zodResolver.
   * @sideEffects None, except form state management internally.
   *
   * @example
   * const brandForm = useForm<BrandFormValues>({
   *   resolver: zodResolver(brandFormSchema),
   *   defaultValues: { name: "", description: "" }
   * });
   *
   */
  const brandForm = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  /**
   * Creates a react-hook-form instance for editing an existing brand.
   *
   * @purpose Manage form state, validation, and submission for editing brand details.
   *
   * @param {BrandFormValues} defaultValues - Default values for the form.
   * @returns {UseFormReturn<BrandFormValues>} Form instance containing:
   *  - `register`: function to register input fields
   *  - `handleSubmit`: function to handle form submission
   *  - `setValue`: function to set field values programmatically
   *  - `watch`: function to observe form field values
   *  - `formState`: object containing errors and validation state
   * @throws Does not throw errors directly. Form validation errors are handled by `zodResolver`.
   * @sideEffects Manages internal form state and triggers component re-renders when values change.
   *
   * @example
   * // Usage in a form component
   * <form onSubmit={editBrandForm.handleSubmit(onSubmit)}>
   *   <input {...editBrandForm.register("name")} placeholder="Brand Name" />
   *   <input {...editBrandForm.register("description")} placeholder="Description" />
   *   <button type="submit">Save</button>
   * </form>
   */
  const editBrandForm = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  /**
   * Form hook for creating a department.
   *
   * @purpose Manage state and validation for department creation.
   * 
   * @param {DepartmentFormValues} defaultValues - Default values for the form.
   * @returns `departmentForm` object with form methods.
   * @throws Will not throw errors directly; form validation errors handled by zodResolver.
   * @sideEffects Updates form state and triggers validation via zodResolver.
   *
   * @example
   * const departmentForm = useForm<DepartmentFormValues>({
   *   resolver: zodResolver(departmentFormSchema),
   *   defaultValues: {
      name: "",
      brandId: 0,
      description: "",
    },
  });
  */
  const departmentForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      brandId: 0,
      description: "",
    },
  });

  /**
  * Form hook for editing a department.
  *
  * @purpose Manage state and validation for department editing.
  * 
  * @param {DepartmentFormValues} defaultValues - Default values for the form.
  * @returns `editDepartmentForm` object with form methods.
  * @throws Will not throw errors directly; form validation errors handled by zodResolver.
  * @sideEffects Updates form state and triggers validation via zodResolver.
  *
  * @example
  * const editDepartmentForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      brandId: 0,
      description: "",
    },
  });
  */
  const editDepartmentForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      brandId: 0,
      description: "",
    },
  });

  /**
  * Form hook for creating a schedule.
  *
  * @purpose Manage state and validation for schedule creation.
  * 
  * @param {ScheduleFormValues} defaultValues - Default values for the form.
  * @returns `scheduleForm` object with form methods.
  * @throws Will not throw errors directly; form validation errors handled by zodResolver.
  * @sideEffects Updates form state and triggers validation via zodResolver.
  *
  * @example
  * const scheduleForm = useForm<ScheduleFormValues>({
  *   resolver: zodResolver(scheduleFormSchema),
  *   defaultValues: {
      day: "",
      startTime: "",
      endTime: "",
    },
  });
  */
  const scheduleForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      day: "",
      startTime: "",
      endTime: "",
    },
  });

  /**
  * Form hook for editing a schedule.
  *
  * @purpose Manage state and validation for editing an existing schedule.
  * 
  * @param {ScheduleFormValues} defaultValues - Default values for the form.
  * @returns `editScheduleForm` object with form methods.
  * @throws Will not throw errors directly; form validation errors handled by zodResolver.
  * @sideEffects Updates form state and triggers validation via zodResolver.
  *
  * @example
  * const editScheduleForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      day: "",
      startTime: "",
      endTime: "",
    },
  });
  */
  const editScheduleForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      day: "",
      startTime: "",
      endTime: "",
    },
  });

  /**
   * Form hook for creating a course.
   *
   * @purpose Manage state and validation for course creation.
   * 
   * @param {CourseFormValues} defaultValues - Default values for the form.
   * @returns `courseForm` object with form methods.
   * @throws Will not throw errors directly; form validation errors handled by zodResolver.
   * @sideEffects Updates form state and triggers validation via zodResolver.
   *
   * @example
   * const courseForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      code: "",
      name: "",
      brandId: 0,
      category: "music",
      fee: 0,
    },
  });
  */
  const courseForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      code: "",
      name: "",
      brandId: 0,
      category: "music",
      fee: 0,
    },
  });

  /**
  * Form hook for editing a course.
  *
  * @purpose Manage state and validation for course editing.
  *
  * @param {CourseFormValues} defaultValues - Default values for the form.
  * @returns `editForm` object with form methods.
  * @throws Will not throw errors directly; form validation errors handled by zodResolver.
  * @sideEffects Updates form state and triggers validation via zodResolver.
  *
  * @example
  * const editForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      code: "",
      name: "",
      brandId: 0,
      category: "",
      fee: 0,
    },
  });
  */
  const editForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      code: "",
      name: "",
      brandId: 0,
      category: "",
      fee: 0,
    },
  });

  /**
  * Form hook for creating a batch.
  *
  * @purpose Manage state and validation for batch creation.
  *
  * @param {BatchFormValues} defaultValues - Default values for the form.
  * @returns `batchForm` object with form methods.
  * @throws Will not throw errors directly; form validation errors handled by zodResolver.
  * @sideEffects Updates form state and triggers validation via zodResolver.
  *
  * @example
  * const batchForm = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      courseId: 0,
      teacherId: 0,
      perDayValue: 0.0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      schedules: [
        {
          day: "",
          startTime: "",
          endTime: "",
          duration: 0,
        },
      ],
      roomNumber: "",
      capacity: 0,
      category: "dance",
      branch: "",
      status: "active",
    },
  });
  */
  const batchForm = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      courseId: 0,
      teacherId: 0,
      perDayValue: 0.0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      schedules: [
        {
          day: "",
          startTime: "",
          endTime: "",
          duration: 0,
        },
      ],
      roomNumber: "",
      capacity: 0,
      category: "dance",
      branch: "",
      status: "active",
    },
  });

  /**
  * Form hook for editing a batch.
  *
  * @purpose Manage state and validation for batch editing.
  *
  * @param {BatchFormValues} defaultValues - Default values for the form.
  * @returns `editBatchForm` object with form methods.
  * @throws Will not throw errors directly; form validation errors handled by zodResolver.
  * @sideEffects Updates form state and triggers validation via zodResolver.
  *
  * @example
  * const editBatchForm = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      courseId: 0,
      teacherId: 0,
      perDayValue: 0.0,
      startDate: "",
      endDate: "",
      schedules: [
        {
          day: "",
          startTime: "",
          endTime: "",
          duration: 0,
        },
      ],
      roomNumber: "",
      capacity: 0,
      category: "dance",
      branch: "",
      status: "active",
    },
  });
  */
  const editBatchForm = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      courseId: 0,
      teacherId: 0,
      perDayValue: 0.0,
      startDate: "",
      endDate: "",
      schedules: [
        {
          day: "",
          startTime: "",
          endTime: "",
          duration: 0,
        },
      ],
      roomNumber: "",
      capacity: 0,
      category: "dance",
      branch: "",
      status: "active",
    },
  });

  /**
   * Form hook for creating a transportation mode.
   *
   * @purpose Manage state and validation for transportation mode creation.
   * 
   * @param {TransportationModeFormValues} defaultValues - Default values for the form.
   * @returns `transportationModeForm` object with form methods.
   * @throws Will not throw errors directly; form validation errors handled by zodResolver.
   * @sideEffects Updates form state and triggers validation via zodResolver.
   *
   * @example
   * const transportationModeForm = useForm<TransportationModeFormValues>({
    resolver: zodResolver(transportationModeFormSchema),
    defaultValues: {
      mode: "",
      rate: 0,
      perDayValue: 0.0,
    },
  });
  */
  const transportationModeForm = useForm<TransportationModeFormValues>({
    resolver: zodResolver(transportationModeFormSchema),
    defaultValues: {
      mode: "",
      rate: 0,
      perDayValue: 0.0,
    },
  });

  /**
  * Form hook for creating a studio.
  *
  * @purpose Manage state and validation for studio creation.
  *
  * @param {studioSchemaType} defaultValues - Default values for the form.
  * @returns `studioForm` object with form methods.
  * @throws Will not throw errors directly; form validation errors handled by zodResolver.
  * @sideEffects Updates form state and triggers validation via zodResolver.
  *
  * @example
  * const studioForm = useForm<studioSchemaType>({
    resolver: zodResolver(studioFormSchema),
    defaultValues: {
      name: "",
    },
  });
  */

  const studioForm = useForm<studioSchemaType>({
    resolver: zodResolver(studioFormSchema),
    defaultValues: {
      name: "",
    },
  });

  /**
   * @purpose Generates a unique batch name based on branch code, course code, and serial number.
   *
   * @param {string} branchCode - Code of the branch.
   * @param {string} courseCode - Code of the course.
   * @param {number} serialNumber - Serial number to append to the batch name.
   * @returns {string} Generated batch name in the format: BRANCHCODECOURSECODE####.
   * @throws Will not throw errors directly. Invalid inputs may result in incorrect name.
   * @sideEffects None.
   *
   * @example
   * generateBatchName("NY", "GTR", 1001) // returns "NYGTR1001"
   */
  const generateBatchName = (
    branchCode: string,
    courseCode: string,
    serialNumber: number,
  ) => {
    return `${branchCode.toUpperCase()}${courseCode.toUpperCase()}${serialNumber
      .toString()
      .padStart(4, "0")}`;
  };

  /**
   * @purpose
   * - Automatically sets the batch name when `courseId` or `branch` changes in `batchForm`.
   * - Generates the next serial number based on existing batches.
   *
   * @param None
   * @returns {void}
   * @throws Will not throw errors directly; invalid course/branch may skip batch name generation.
   * @sideEffects Updates `batchForm` field `name` whenever `courseId` or `branch` changes.
   *               Reads from `courses`, `branches`, and `batches` arrays.
   *
   * @example
   * // If batchForm.courseId and batchForm.branch are set,
   * // automatically sets batchForm.name to next available serial.
   */
  useEffect(() => {
    const courseId = batchForm.watch("courseId");
    const branchId = batchForm.watch("branch");

    if (courseId && branchId) {
      const course = courses.find((c) => c.id === Number(courseId));
      const branch = branches.find((b) => b.name === branchId);

      if (course && branch) {
        const existingBatches = batches.filter(
          (batch) =>
            batch.branch === branchId && batch.courseId === Number(courseId),
        );

        const serialNumbers = existingBatches.map((batch) => {
          const match = batch.name.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        });

        const highestSerial =
          serialNumbers.length > 0 ? Math.max(...serialNumbers) : 1000;

        const nextSerial = highestSerial + 1;
        const batchName = generateBatchName(
          branch.code,
          course.code,
          nextSerial,
        );

        batchForm.setValue("name", batchName);
      }
    }
  }, [
    batchForm.watch("courseId"),
    batchForm.watch("branch"),
    courses,
    branches,
  ]);

  /**
   * Form hook for creating or editing a branch.
   *
   * @purpose Manage state and validation for branch creation or editing.
   *
   * @param {BranchFormValues} defaultValues - Default values for the form.
   * @returns `branchForm` object with form methods such as `getValues`, `setValue`, `handleSubmit`, etc.
   * @throws Will not throw errors directly; form validation errors handled by zodResolver.
   * @sideEffects Updates internal form state and triggers validation via `zodResolver`.
   *
   * @example
   * // Set branch name
   * branchForm.setValue("name", "Downtown Branch");
   *
   * // Get current values
   * const values = branchForm.getValues();
   * console.log(values.name); // "Downtown Branch"
   *
   * // Submit form
   * branchForm.handleSubmit((data) => console.log(data))();
   */
  const branchForm = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      code: "",
      name: "",
      phone: "",
      manager: "",
      brandIds: [],
      status: "active",
    },
  });

  /**
   * Columns configuration for the Brands table.
   *
   * @purpose Define how brand data should be displayed in a table, including serial number, name, description, and actions (edit/delete).
   *
   * @param None directly. Uses `brands` array and `handleEditBrand` / `handleDeleteBrand` functions from the surrounding scope.
   * @returns {ColumnDef<any>[]} Array of column definitions compatible with React Table or similar table library.
   * @throws None. Table rendering errors may occur if data or handler functions are missing.
   * @sideEffects Clicking "Edit" or "Delete" buttons triggers the respective handler functions.
   *
   * @example
   * <Table columns={brandColumns} data={brands} />
   */
  const brandColumns: ColumnDef<any>[] = [
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="cursor-pointer select-none flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Brand Name
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.name || "";
        const b = rowB.original.name || "";
        return b.localeCompare(a);
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const brand = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
              onClick={() => handleEditBrand(brand)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white bg-red-600 hover:bg-red-300"
              onClick={() => handleDeleteBrand(brand)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  /**
   * Columns configuration for the Departments table.
   *
   * @purpose Define how department data should be displayed, including serial number, name, brand, description, and actions (edit/delete).
   *
   * @param None directly. Uses `brands` array and `handleEditDepartment` / `handleDeleteDepartment` functions from the surrounding scope.
   * @returns {ColumnDef<any>[]} Array of column definitions for the departments table.
   * @throws None. Table rendering errors may occur if data or handler functions are missing.
   * @sideEffects Clicking "Edit" or "Delete" buttons triggers the respective handler functions.
   *
   * @example
   * <Table columns={departmentColumns} data={departments} />
   */
  const departmentColumns: ColumnDef<any>[] = [
    {
      id: "serial",
      header: "SL.No.",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="cursor-pointer select-none flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Department
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.name || "";
        const b = rowB.original.name || "";
        return b.localeCompare(a);
      },
    },
    {
      accessorKey: "brandId",
      header: "Brand",
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as number;
        const brand = brands.find((brand) => brand.id === brandId);
        return brand ? <div>{brand.name}</div> : "Unknown Brand";
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const department = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
              onClick={() => handleEditDepartment(department)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white bg-red-600 hover:bg-red-300"
              onClick={() => handleDeleteDepartment(department)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  /**
   * Columns configuration for the Schedule table.
   *
   * @purpose Display schedule information including serial number, day, start time, end time, and action buttons.
   *
   * @param None directly. Uses `handleEditSchedule` and `handleDeleteSchedule` from surrounding scope.
   * @returns {ColumnDef<Schedule>[]} Array of column definitions for rendering schedule data in a table.
   * @throws None. Table rendering errors may occur if data or handler functions are missing.
   * @sideEffects Clicking "Edit" or "Delete" buttons triggers the respective handler functions.
   *
   * @example
   * <Table columns={scheduleColumns} data={schedules} />
   */
  const scheduleColumns: ColumnDef<Schedule>[] = [
    {
      id: "serial",
      header: "SL.No.",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "day",
      header: "Day",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("day")}</div>
      ),
    },
    {
      accessorKey: "startTime",
      header: "Start Time",
      cell: ({ row }) => {
        const time = new Date(`1970-01-01T${row.getValue("startTime")}`);
        const formattedTime = time.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        return <div className="font-medium">{formattedTime}</div>;
      },
    },
    {
      accessorKey: "endTime",
      header: "End Time",
      cell: ({ row }) => {
        const time = new Date(`1970-01-01T${row.getValue("endTime")}`);
        const formattedTime = time.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        return <div className="font-medium">{formattedTime}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
            onClick={() => handleEditSchedule(row.original)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white bg-red-600 hover:bg-red-300"
            onClick={() => handleDeleteSchedule(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  /**
   * Columns configuration for the Studio table.
   *
   * @purpose Display studio information including serial number, name, description, and action buttons.
   *
   * @param None directly. Uses `handleEditStudio` and `handleDeleteStudio` functions.
   * @returns {ColumnDef<Studio>[]} Array of column definitions for rendering studios in a table.
   * @throws None. Table rendering errors may occur if data or handler functions are missing.
   * @sideEffects Clicking "Edit" or "Delete" triggers the respective handler functions.
   *
   * @example
   * <Table columns={studioColumns} data={studios} />
   */
  const studioColumns: ColumnDef<Studio>[] = [
    {
      id: "serial",
      header: "SL.No.",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    // {
    //   accessorKey: "name",
    //   header: "Name",
    //   cell: ({ row }) => (
    //     <div className="font-medium">{row.getValue("name")}</div>
    //   ),
    // },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="cursor-pointer select-none flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.name || "";
        const b = rowB.original.name || "";
        return b.localeCompare(a);
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
            onClick={() => handleEditStudio(row.original)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white bg-red-600 hover:bg-red-300"
            onClick={() => handleDeleteStudio(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  /**
   * Columns configuration for the Course table.
   *
   * @purpose Display course information including serial number, code, name, brand, department, fee, and actions.
   *
   * @param None directly. Uses `handleEditCourse` and `handleDeleteCourse` functions, and `brands` array.
   * @returns {ColumnDef<Course>[]} Array of column definitions for rendering courses in a table.
   * @throws None. Table rendering errors may occur if data or handler functions are missing.
   * @sideEffects Clicking "Edit" or "Delete" triggers the respective handler functions.
   *
   * @example
   * <Table columns={courseColumns} data={courses} />
   */
  const courseColumns: ColumnDef<Course>[] = [
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
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <div
            className="cursor-pointer select-none flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Course Code
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("code")}</div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.code || "";
        const b = rowB.original.code || "";
        return b.localeCompare(a);
      },
    },
    {
      accessorKey: "name",
      header: "Course Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "brandId",
      header: "Brand",
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as number;
        const brand = brands.find((brand) => brand.id === brandId);
        return brand ? <div>{brand.name}</div> : "Unknown Brand";
      },
    },
    {
      accessorKey: "category",
      header: "Department",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return (
          <div>{category.charAt(0).toUpperCase() + category.slice(1)}</div>
        );
      },
    },
    {
      accessorKey: "fee",
      header: "Fee (Per month)",
      cell: ({ row }) => <div>{row.getValue("fee")}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const course = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
              onClick={() => handleEditCourse(course)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white bg-red-600 hover:bg-red-300"
              onClick={() => handleDeleteCourse(course)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  /**
   * Columns configuration for the Batch table.
   *
   * @purpose Display batch information including serial number, name, branch, department, course, schedule, teacher, strength, status, and action buttons.
   *
   * @param None directly. Uses `getSchedule`, `formatTimeTo12Hour`, `batchStrength`, `handleEditBatch`, `handleDeleteBatch` from surrounding scope.
   * @returns {ColumnDef<any>[]} Array of column definitions for rendering batch data in a table.
   * @throws None. Errors may occur if `getSchedule` or handler functions are missing.
   * @sideEffects Clicking "Edit" or "Delete" buttons triggers the respective handler functions.
   *
   * @example
   * <Table columns={batchColumns} data={batches} />
   */
  const batchColumns: ColumnDef<any>[] = [
    {
      id: "serial",
      header: "SL.No.",
      cell: ({ table, row }) => {
        const sortedRows = table.getSortedRowModel().rows;
        const index = sortedRows.findIndex((r) => r.id === row.id);
        return <div style={{ textAlign: "center" }}>{index + 1}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="cursor-pointer select-none flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Batch Name
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.name || "";
        const b = rowB.original.name || "";
        return b.localeCompare(a);
      },
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => <div>{row.getValue("branch")}</div>,
    },
    {
      accessorKey: "category",
      header: "Department",
      cell: ({ row }) => {
        const departmentId = parseInt(row.getValue("category") as string);
        const department = departments.find((d: any) => d.id === departmentId);
        return department ? department.name : "Unknown Department";
      },
    },
    {
      accessorKey: "courseId",
      header: "Course",
      cell: ({ row }) => {
        const courseId = row.getValue("courseId") as number;
        const course = courses.find((c: Course) => c.id === courseId);
        return course ? course.name : "Unknown Course";
      },
    },
    {
      accessorKey: "day",
      header: "Day",
      cell: ({ row }) => {
        const schedule = row.original;
        return getSchedule(schedule.id).map((s, index) => (
          <div key={index} className={index > 0 ? "mt-1 pt-1 border-t" : ""}>
            {s.day}
          </div>
        ));
      },
    },
    {
      accessorKey: "startTime",
      header: "Start Time",
      cell: ({ row }) => {
        const schedule = row.original;
        return getSchedule(schedule.id).map((s, index) => (
          <div key={index} className={index > 0 ? "mt-1 pt-1 border-t" : ""}>
            {formatTimeTo12Hour(s.startTime)}
          </div>
        ));
      },
    },
    {
      accessorKey: "endTime",
      header: "End Time",
      cell: ({ row }) => {
        const schedule = row.original;
        return getSchedule(schedule.id).map((s, index) => (
          <div key={index} className={index > 0 ? "mt-1 pt-1 border-t" : ""}>
            {formatTimeTo12Hour(s.endTime)}
          </div>
        ));
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const schedule = row.original;
        return getSchedule(schedule.id).map((s, index) => (
          <div key={index} className={index > 0 ? "mt-1 pt-1 border-t" : ""}>
            {s.duration} mins
          </div>
        ));
      },
    },
    {
      accessorKey: "teacherId",
      header: "Teacher",
      cell: ({ row }) => {
        const teacherId = row.getValue("teacherId") as number;
        const employee = employees.find((e: Employee) => e.id === teacherId);
        return employee
          ? employee.firstName +
              " " +
              employee.middleName +
              " " +
              employee.lastName
          : "Unknown Teacher";
      },
    },
    {
      accessorKey: "capacity",
      header: "Strength",
      cell: batchStrength,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let badgeVariant: "default" | "destructive" | "outline" | "secondary" =
          "outline";

        if (status === "active") {
          badgeVariant = "secondary";
        } else if (status === "completed") {
          badgeVariant = "default";
        } else if (status === "cancelled") {
          badgeVariant = "destructive";
        }

        return (
          <Badge variant={badgeVariant}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const batch = row.original;

        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
              onClick={() => handleEditBatch(batch)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white bg-red-600 hover:bg-red-300"
              onClick={() => handleDeleteBatch(batch)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  /**
   * Columns configuration for the Branch table.
   *
   * @purpose Display branch information including serial number, code, name, brands, phone, manager, status, and actions.
   *
   * @param None directly. Uses `brands`, `handleEditBranch`, `handleDeleteBranch` from surrounding scope.
   * @returns {ColumnDef<any>[]} Array of column definitions for rendering branches in a table.
   * @throws None. Table rendering errors may occur if `brands` or handler functions are missing.
   * @sideEffects Clicking "Edit" or "Delete" triggers the respective handler functions.
   *
   * @example
   * <Table columns={branchColumns} data={branches} />
   */
  const branchColumns: ColumnDef<any>[] = [
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
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <div
            className="cursor-pointer select-none flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Branch Code
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("code")}</div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.code || "";
        const b = rowB.original.code || "";
        return b.localeCompare(a);
      },
    },
    {
      accessorKey: "name",
      header: "Branch Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "brandIds",
      header: "Brands",
      cell: ({ row }) => {
        const branchBrandIds = row.getValue("brandIds") as number[];
        if (
          !branchBrandIds ||
          !Array.isArray(branchBrandIds) ||
          branchBrandIds.length === 0
        )
          return "-";
        const branchBrands = brands.filter((brand) =>
          branchBrandIds.includes(brand.id),
        );
        return branchBrands.map((b) => b.name).join(", ");
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "manager",
      header: "Manager",
      cell: ({ row }) => row.getValue("manager") || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const badgeClass =
          status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
        return (
          <Badge variant="outline" className={badgeClass}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const branch = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
              onClick={() => handleEditBranch(branch)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white bg-red-600 hover:bg-red-300"
              onClick={() => handleDeleteBranch(branch)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  // Transportation table columns
  interface TransportationModeRow {
    id: number;
    mode: string;
    rate: number;
    perDayValue: number;
  }

  /**
   * Columns configuration for the Transportation Mode table.
   *
   * @purpose Display transportation mode information including serial number, mode, rate, per day value, and actions.
   *
   * @param None directly. Uses `handleEditTransportationMode`, `handleDeleteTransportationMode` from surrounding scope.
   * @returns {ColumnDef<TransportationModeRow>[]} Array of column definitions for rendering transportation modes in a table.
   * @throws None. Table rendering errors may occur if handler functions are missing.
   * @sideEffects Clicking "Edit" or "Delete" triggers the respective handler functions.
   *
   * @example
   * <Table columns={transportationModeColumns} data={transportationModes} />
   */
  const transportationModeColumns: ColumnDef<TransportationModeRow>[] = [
    {
      id: "serial",
      header: "SL.No.",
      cell: ({ row }: { row: { index: number } }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "mode",
      header: ({ column }) => {
        return (
          <div
            className="cursor-pointer select-none flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Transportation Mode
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </div>
        );
      },
      cell: ({ row }: { row: { getValue: (key: string) => any } }) => (
        <div className="font-medium">{row.getValue("mode")}</div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.mode || "";
        const b = rowB.original.mode || "";
        return b.localeCompare(a);
      },
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }: { row: { getValue: (key: string) => any } }) => (
        <div>{row.getValue("rate")}</div>
      ),
    },
    {
      accessorKey: "perDayValue",
      header: "Per Day Value",
      cell: ({ row }: { row: { getValue: (key: string) => any } }) => (
        <div>{row.getValue("perDayValue")}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: TransportationModeRow } }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
            onClick={() => handleEditTransportationMode(row.original)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white bg-red-600 hover:bg-red-300"
            onClick={() => handleDeleteTransportationMode(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  /**
   * Handles form submission to create a new brand.
   *
   * @purpose Send a POST request to the backend API to create a brand, reset the form, close the dialog, and show a success toast.
   *
   * @param {BrandFormValues} data - The form data containing brand `name` and `description`.
   * @returns {Promise<void>} Resolves when the brand is created and UI is updated.
   * @throws Will log error if the API request fails.
   * @sideEffects Updates query cache, closes dialog, resets form, and shows toast notifications.
   *
   * @example
   * onCreateBrandSubmit({ name: "Yamaha", description: "Music instruments" });
   */
  const onCreateBrandSubmit = async (data: BrandFormValues) => {
    try {
      const response = await apiRequest("POST", "/api/brands", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setIsCreateBrandDialogOpen(false);
      brandForm.reset();
      toast({
        title: "Brand created",
        description: "The brand has been created successfully.",
      });
    } catch (error: any) {
      console.error("Brand creation error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Handles form submission to update an existing brand.
   *
   * @purpose Send a PUT request to update a brand, reset the edit form, close the dialog, and show a success toast.
   *
   * @param {BrandFormValues} data - The updated brand data.
   * @returns {Promise<void>} Resolves when the brand is updated and UI is refreshed.
   * @throws Will log error if the API request fails or `selectedBrand` is null.
   * @sideEffects Updates query cache, closes dialog, clears selected brand, and shows toast notifications.
   *
   * @example
   * onEditBrandSubmit({ name: "Yamaha Updated", description: "Updated description" });
   */
  const onEditBrandSubmit = async (data: BrandFormValues) => {
    if (!selectedBrand) return;
    try {
      await apiRequest("PUT", `/api/brands/${selectedBrand.id}`, data);
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setIsEditBrandDialogOpen(false);
      setSelectedBrand(null);
      toast({
        title: "Brand updated",
        description: "The brand has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Brand update error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Prepares the brand edit form with selected brand data.
   *
   * @purpose Populate edit form fields with selected brand and open the edit dialog.
   *
   * @param {any} brand - The brand object selected for editing.
   * @returns {void}
   * @throws None
   * @sideEffects Sets the selected brand and opens the edit dialog.
   *
   * @example
   * handleEditBrand({ name: "Yamaha", description: "Music brand" });
   */
  const handleEditBrand = (brand: any) => {
    setSelectedBrand(brand);
    editBrandForm.reset({
      name: brand.name,
      description: brand.description || "",
    });
    setIsEditBrandDialogOpen(true);
  };

  /**
   * Opens delete confirmation for a selected brand.
   *
   * @purpose Set the brand to be deleted and open the delete confirmation dialog.
   *
   * @param {any} brand - The brand object selected for deletion.
   * @returns {void}
   * @throws None
   * @sideEffects Sets the selected brand and opens the delete dialog.
   *
   * @example
   * handleDeleteBrand({ name: "Yamaha", description: "Music brand" });
   */
  const handleDeleteBrand = (brand: any) => {
    setSelectedBrand(brand);
    setIsDeleteBrandDialogOpen(true);
  };

  /**
   * Deletes the selected brand.
   *
   * @purpose Send DELETE request to remove a brand, update query cache, and show a success toast.
   *
   * @param {void} None
   * @returns {Promise<void>} Resolves when brand is deleted.
   * @throws Will log error if the API request fails or `selectedBrand` is null.
   * @sideEffects Updates query cache, closes dialog, clears selected brand, and shows toast notifications.
   *
   * @example
   * deleteBrand();
   */
  const deleteBrand = async () => {
    if (!selectedBrand) return;
    try {
      await apiRequest("DELETE", `/api/brands/${selectedBrand.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setIsDeleteBrandDialogOpen(false);
      setSelectedBrand(null);
      toast({
        title: "Brand deleted",
        description: "The brand has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Brand delete error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Handles form submission to create a new department.
   *
   * @purpose Send POST request to create a department, reset form, close dialog, and show success toast.
   *
   * @param {DepartmentFormValues} data - The form data for the new department.
   * @returns {Promise<void>} Resolves after department creation.
   * @throws Logs error if API request fails.
   * @sideEffects Updates query cache, closes dialog, resets form, and shows toast notifications.
   *
   * @example
   * onCreateDepartmentSubmit({ name: "Music Department", description: "Department for music courses" });
   */
  const onCreateDepartmentSubmit = async (data: DepartmentFormValues) => {
    try {
      const response = await apiRequest("POST", "/api/departments", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsCreateDepartmentDialogOpen(false);
      departmentForm.reset();
      toast({
        title: "Department created",
        description: "The department has been created successfully.",
      });
    } catch (error: any) {
      console.error("Department creation error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Handles form submission to update a department.
   *
   * @purpose Send PUT request to update department, close dialog, reset selected department, and show success toast.
   *
   * @param {DepartmentFormValues} data - Updated department data.
   * @returns {Promise<void>} Resolves after department update.
   * @throws Logs error if API request fails or `selectedDepartment` is null.
   * @sideEffects Updates query cache, closes dialog, resets selected department, and shows toast notifications.
   *
   * @example
   * onEditDepartmentSubmit({ name: "Music Department Updated", description: "Updated department for music courses" });
   */
  const onEditDepartmentSubmit = async (data: DepartmentFormValues) => {
    if (!selectedDepartment) return;
    try {
      await apiRequest(
        "PUT",
        `/api/departments/${selectedDepartment.id}`,
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsEditDepartmentDialogOpen(false);
      setSelectedDepartment(null);
      toast({
        title: "Department updated",
        description: "The department has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Populates edit form with department data and opens dialog.
   *
   * @purpose Pre-fill edit department form for editing.
   *
   * @param {any} department - Department object to edit.
   * @returns {void}
   * @throws None
   * @sideEffects Sets selected department and opens edit dialog.
   *
   * @example
   * handleEditDepartment({ name: "Music Department", description: "Department for music courses" });
   */
  const handleEditDepartment = (department: any) => {
    setSelectedDepartment(department);
    editDepartmentForm.reset({
      name: department.name,
      brandId: department.brandId,
      description: department.description || "",
    });
    setIsEditDepartmentDialogOpen(true);
  };

  /**
   * Opens delete confirmation dialog for a department.
   *
   * @purpose Set the department to delete and open the dialog.
   *
   * @param {any} department - Department object to delete.
   * @returns {void}
   * @throws None
   * @sideEffects Sets selected department and opens delete dialog.
   *
   * @example
   * handleDeleteDepartment({ name: "Music Department", description: "Department for music courses" });
   */
  const handleDeleteDepartment = (department: any) => {
    setSelectedDepartment(department);
    setIsDeleteDepartmentDialogOpen(true);
  };

  /**
   * Deletes the selected department.
   *
   * @purpose Send DELETE request to remove department and show success toast.
   *
   * @param None.
   * @returns {Promise<void>} Resolves after department deletion.
   * @throws Logs error if API request fails or `selectedDepartment` is null.
   * @sideEffects Updates query cache, closes dialog, clears selected department, and shows toast notifications.
   *
   * @example
   * handleDeleteDepartmentSubmit();
   */
  const handleDeleteDepartmentSubmit = async () => {
    if (!selectedDepartment) return;
    try {
      await apiRequest("DELETE", `/api/departments/${selectedDepartment.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsDeleteDepartmentDialogOpen(false);
      setSelectedDepartment(null);
      toast({
        title: "Department deleted",
        description: "The department has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Handles form submission to create a new schedule.
   *
   * @purpose Send POST request to create a schedule, reset form, close dialog, and show a success toast.
   *
   * @param {ScheduleFormValues} data - Form data containing `day`, `startTime`, `endTime`.
   * @returns {Promise<void>} Resolves after schedule creation.
   * @throws Logs error if API request fails.
   * @sideEffects Updates query cache, closes dialog, resets form, and shows toast notifications.
   *
   * @example
   * onCreateScheduleSubmit({ day: "Monday", startTime: "09:00", endTime: "17:00" });
   */
  const onCreateScheduleSubmit = async (data: ScheduleFormValues) => {
    try {
      const response = await apiRequest("POST", "/api/schedules", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setIsCreateScheduleDialogOpen(false);
      scheduleForm.reset();
      toast({
        title: "Success",
        description: "Schedule created successfully.",
      });
    } catch (error: any) {
      console.error("Schedule creation error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Prepares the schedule edit form with selected schedule data.
   *
   * @purpose Populate the edit schedule form with the selected schedule and open the edit dialog.
   *
   * @param {Schedule} schedule - The schedule object to edit.
   * @returns {void}
   * @throws None
   * @sideEffects Sets the selected schedule and opens the edit dialog.
   *
   * @example
   * handleEditSchedule({ id: 1, day: "Monday", startTime: "09:00", endTime: "10:00" });
   */
  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    editScheduleForm.reset({
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setIsEditScheduleDialogOpen(true);
  };

  /**
   * Submits the edited schedule to update the backend.
   *
   * @purpose Send a PUT request to update a schedule, close dialog, reset selected schedule, and show success toast.
   * @param {ScheduleFormValues} data - Updated schedule form data.
   * @returns {Promise<void>} Resolves when the schedule is updated.
   * @throws Logs error if API request fails or `selectedSchedule` is null.
   * @sideEffects Updates query cache, closes dialog, resets selected schedule, and shows toast notifications.
   *
   * @example
   * onEditScheduleSubmit({ day: "Tuesday", startTime: "10:00", endTime: "11:00" });
   */
  const onEditScheduleSubmit = async (data: ScheduleFormValues) => {
    if (!selectedSchedule) return;
    try {
      await apiRequest("PUT", `/api/schedules/${selectedSchedule.id}`, data);
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setIsEditScheduleDialogOpen(false);
      setSelectedSchedule(null);
      toast({
        title: "Schedule updated",
        description: "The schedule has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Deletes the selected schedule.
   *
   * @purpose Send DELETE request to remove a schedule and show a success toast.
   *
   * @param None
   * @returns {Promise<void>} Resolves when schedule is deleted.
   * @throws Logs error if API request fails or `selectedSchedule` is null.
   * @sideEffects Updates query cache, closes dialog, resets selected schedule, and shows toast notifications.
   *
   * @example
   * deleteSchedule();
   */
  const deleteSchedule = async () => {
    if (!selectedSchedule) return;
    try {
      await apiRequest("DELETE", `/api/schedules/${selectedSchedule.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setIsDeleteScheduleDialogOpen(false);
      setSelectedSchedule(null);
      toast({
        title: "Schedule deleted",
        description: "The schedule has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Opens delete confirmation dialog for a schedule.
   *
   * @purpose Set the schedule to be deleted and open the delete confirmation dialog.
   *
   * @param {Schedule} schedule - Schedule object to delete.
   * @returns {void}
   * @throws None
   * @sideEffects Sets selected schedule and opens delete dialog.
   *
   * @example
   * handleDeleteSchedule({ id: 1, day: "Monday", startTime: "09:00", endTime: "17:00" });
   */
  const handleDeleteSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteScheduleDialogOpen(true);
  };

  /**
   * Prepares the course edit form with selected course data.
   *
   * @purpose Populate edit form fields with selected course and open the edit dialog.
   *
   * @param {Course} course - The course object to edit.
   * @returns {void}
   * @throws None
   * @sideEffects Sets selected course and opens edit dialog.
   *
   * @example
   * handleEditCourse({ id: 1, code: "CSE101", name: "Computer Science", brandId: 2, category: "IT", fee: 5000 });
   */
  const handleEditCourse = (course: Course) => {
    const department = departments.find(
      (d) =>
        d.name.trim().toLowerCase() === course.category.trim().toLowerCase(),
    );

    editForm.reset({
      code: course.code,
      name: course.name,
      brandId: course.brandId,
      category: course.category,
      fee: Number(course.fee),
    });

    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  /**
   * Opens delete confirmation dialog for a course.
   *
   * @purpose Set the course to delete and open the delete confirmation dialog.
   *
   * @param {Course} course - Course object to delete.
   * @returns {void}
   * @throws None
   * @sideEffects Sets selected course and opens delete dialog.
   *
   * @example
   * handleDeleteCourse({ id: 1, code: "CSE101", name: "Computer Science", brandId: 2, category: "IT", fee: 5000 });
   */
  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Submits the create course form to the backend.
   *
   * @purpose Send POST request to create a course, reset form, close dialog, and show success toast.
   *
   * @param {CourseFormValues} data - Form data containing course info.
   * @returns {Promise<void>} Resolves when course is created.
   * @throws Logs error if API request fails.
   * @sideEffects Updates query cache, resets form, closes dialog, and shows toast notifications.
   *
   * @example
   * onCreateCourseSubmit({ code: "CSE102", name: "Algorithms", brandId: 2, category: "IT", fee: 6000 });
   */
  const onCreateCourseSubmit = async (data: CourseFormValues) => {
    try {
      await apiRequest("POST", "/api/courses", data);
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsCreateDialogOpen(false);
      courseForm.reset();
      toast({
        title: "Course created",
        description: "The course has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Submits the edited course data to the backend.
   *
   * @purpose Send PUT request to update a course, close dialog, reset selected course, and show success toast.
   *
   * @param {CourseFormValues} data - Updated course form data.
   * @returns {Promise<void>} Resolves when course is updated.
   * @throws Logs error if API request fails or `selectedCourse` is null.
   * @sideEffects Updates query cache, closes dialog, resets selected course, and shows toast notifications.
   *
   * @example
   * onEditCourseSubmit({ code: "CSE102", name: "Algorithms", brandId: 2, category: "IT", fee: 6000 });
   */
  const onEditCourseSubmit = async (data: CourseFormValues) => {
    if (!selectedCourse) return;

    try {
      await apiRequest("PUT", `/api/courses/${selectedCourse.id}`, data);
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      toast({
        title: "Course updated",
        description: "The course has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Deletes the selected course.
   *
   * @purpose Send DELETE request to remove a course and show a success toast.
   *
   * @param None
   * @returns {Promise<void>} Resolves when course is deleted.
   * @throws Logs error if API request fails or `selectedCourse` is null.
   * @sideEffects Updates query cache, closes dialog, resets selected course, and shows toast notifications.
   *
   * @example
   * deleteCourse();
   */
  const deleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await apiRequest("DELETE", `/api/courses/${selectedCourse.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Submits the create batch form and its associated schedules.
   *
   * @purpose Send POST request to create a batch and its schedules, then reset form and show success toast.
   *
   * @param {BatchFormValues} data - Batch form data including schedules.
   * @returns {Promise<void>} Resolves when batch and schedules are created.
   * @throws Logs error if batch creation or any schedule creation fails.
   * @sideEffects Updates query cache, resets form, closes dialog, and shows toast notifications.
   *
   * @example
   * handleCreateBatch({
   *   name: "Batch A",
   *   courseId: 1,
   *   perDayValue: 100,
   *   teacherId: 3,
   *   startDate: "2025-10-01",
   *   schedules: [
   *     { day: "Monday", startTime: "09:00", endTime: "10:00", duration: 60 },
   *     { day: "Wednesday", startTime: "09:00", endTime: "10:00", duration: 60 }
   *   ]
   * });
   */
  const handleCreateBatch = async (data: BatchFormValues) => {
    try {
      // First create the batch
      const batchResponse = await apiRequest("POST", "/api/batches", {
        name: data.name,
        courseId: data.courseId,
        perDayValue: data.perDayValue,
        teacherId: data.teacherId,
        startDate: data.startDate,
        endDate: data.endDate || null, // Convert empty to null
        roomNumber: data.roomNumber || null,
        capacity: data.capacity,
        category: data.category,
        branch: data.branch,
        status: data.status,
      });

      if (!batchResponse.ok) throw new Error("Batch creation failed");
      const batchData = await batchResponse.json();

      // Then create schedules for each day

      // for (const schedule of data.schedules) {
      //   await apiRequest("POST", "/api/schedules", {
      //     batchId: batchData.id,
      //     ...schedule,
      //   });
      // }
      const schedulePromises = data.schedules.map((schedule) =>
        apiRequest("POST", "/api/schedules", {
          batchId: batchData.id,
          day: schedule.day,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          duration: schedule.duration,
        }),
      );

      const scheduleResults = await Promise.all(schedulePromises);
      const failedSchedules = scheduleResults.filter((r) => !r.ok);

      queryClient.invalidateQueries({ queryKey: ["allScheduleData"] });

      if (failedSchedules.length > 0) {
        throw new Error(`${failedSchedules.length} schedules failed to create`);
      }

      // Invalidate queries and reset form
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/batches"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/schedules"] }),
      ]);
      setIsCreateBatchDialogOpen(false);
      batchForm.reset();
      toast({
        title: "Success",
        description: "Batch created successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create batch",
        variant: "destructive",
      });
    }
  };

  /**
   * Submits the create transportation mode form to the backend.
   *
   * @purpose Sends POST request to create a transportation mode and resets the form on success.
   *
   * @param {TransportationModeFormValues} data - Form values including mode, rate, and perDayValue.
   * @returns {Promise<void>} Resolves when transportation mode is created.
   * @throws Logs error if API request fails.
   * @sideEffects Updates query cache, closes create dialog, resets form, and shows toast notifications.
   *
   * @example
   * onCreateTransportationModeSubmit({ mode: "Bus", rate: 500, perDayValue: 50 });
   */
  const onCreateTransportationModeSubmit = async (
    data: TransportationModeFormValues,
  ) => {
    try {
      const response = await apiRequest("POST", "/api/transportationMode", {
        mode: data.mode,
        rate: Number(data.rate),
        perDayValue: Number(data.perDayValue),
      });
      await queryClient.invalidateQueries({
        queryKey: ["/api/transportationModes"],
      });
      setIsCreateTransportationDialogOpen(false);
      transportationModeForm.reset();
      toast({
        title: "Success",
        description: "Transportation mode created successfully",
      });
    } catch (error) {
      console.error("Transportation mode creation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create transportation mode",
        variant: "destructive",
      });
    }
  };

  /**
   * Submits the create branch form along with associated brands.
   *
   * @purpose Sends POST request to create a branch, associate it with brands, and reset the form.
   *
   * @param {BranchFormValues} data - Branch form values including brandIds.
   * @returns {Promise<void>} Resolves when branch and brand associations are created.
   * @throws Logs error if branch creation fails or any brand associations fail.
   * @sideEffects Updates query cache, closes create dialog, resets form, and shows toast notifications.
   *
   * @example
   * onCreateBranchSubmit({ name: "Branch A", brandIds: [1, 2] });
   */
  const onCreateBranchSubmit = async (data: BranchFormValues) => {
    try {
      const branchResponse = await apiRequest("POST", "/api/branches", data);
      if (!branchResponse.ok) throw new Error("Branch creation failed");
      const branchData = await branchResponse.json();

      const brandAssociationPromises = data.brandIds.map((brandId) =>
        apiRequest("POST", "/api/branch_brands", {
          branchId: branchData.id,
          brandId,
        }),
      );

      const results = await Promise.all(brandAssociationPromises);
      const failed = results.filter((res) => !res.ok);

      if (failed.length > 0) {
        await apiRequest("DELETE", `/api/branches/${branchData.id}`);
        throw new Error(`${failed.length} brand associations failed`);
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      setIsCreateBranchDialogOpen(false);
      branchForm.reset();
      toast({
        title: "Success",
        description: "Branch created successfully",
      });
    } catch (error) {
      console.error("Branch creation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create branch",
        variant: "destructive",
      });
    }
  };

  /**
   * Submits edited branch details and updates brand associations.
   *
   * @purpose Updates branch info, deletes old brand associations, creates new associations, and resets form.
   *
   * @param {BranchFormValues} data - Edited branch form values.
   * @returns {Promise<void>} Resolves when branch and brand updates succeed.
   * @throws Logs error if branch update or brand associations fail.
   * @sideEffects Updates query cache, closes edit dialog, resets selected branch, and shows toast notifications.
   *
   * @example
   * onEditBranchSubmit({ name: "Branch A", brandIds: [1, 2] });
   */
  const onEditBranchSubmit = async (data: BranchFormValues) => {
    if (!selectedBranch) return;

    try {
      // 1. Update branch details
      const branchResponse = await apiRequest(
        "PUT",
        `/api/branches/${selectedBranch.id}`,
        {
          code: data.code,
          name: data.name,
          phone: data.phone,
          manager: data.manager,
          status: data.status,
        },
      );

      if (!branchResponse.ok) throw new Error("Branch update failed");

      // 2. Delete existing brand associations
      await apiRequest("DELETE", `/api/branch_brands/${selectedBranch.id}`);

      // 3. Create new brand associations
      const brandAssociationPromises = data.brandIds.map((brandId) =>
        apiRequest("POST", "/api/branch_brands", {
          branchId: selectedBranch.id,
          brandId,
        }),
      );

      const results = await Promise.all(brandAssociationPromises);
      const failed = results.filter((res) => !res.ok);

      if (failed.length > 0) {
        throw new Error(`${failed.length} brand associations failed`);
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      setIsEditBranchDialogOpen(false);
      setSelectedBranch(null);
      toast({
        title: "Branch updated",
        description: "The branch has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Branch update error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Opens the edit dialog for a branch and pre-fills the form with branch data.
   *
   * @purpose Set selected branch and reset form values for editing.
   *
   * @param {any} branch - Branch object to edit.
   * @returns {void}
   * @throws None
   * @sideEffects Opens edit branch dialog and populates form.
   *
   * @example
   * handleEditBranch({ name: "Branch A", brandIds: [1, 2] });
   */
  const handleEditBranch = (branch: any) => {
    setSelectedBranch(branch);
    branchForm.reset({
      code: branch.code,
      name: branch.name,
      phone: branch.phone,
      manager: branch.manager || "",
      brandIds: branch.brandIds || [],
      status: branch.status,
    });
    setIsEditBranchDialogOpen(true);
  };

  /**
   * Opens the delete confirmation dialog for a branch.
   *
   * @purpose Sets the branch to be deleted and opens the confirmation dialog.
   *
   * @param {any} branch - Branch object to delete.
   * @returns {void}
   * @throws None
   * @sideEffects Opens delete branch dialog.
   *
   * @example
   * handleDeleteBranch({ name: "Branch A", brandIds: [1, 2] });
   */
  const handleDeleteBranch = (branch: any) => {
    setSelectedBranch(branch);
    setIsDeleteBranchDialogOpen(true);
  };

  /**
   * Deletes the selected branch.
   *
   * @purpose Sends DELETE request to remove branch from backend.
   *
   * @param None
   * @returns {Promise<void>} Resolves when branch deletion succeeds.
   * @throws Logs error if deletion fails.
   * @sideEffects Updates query cache, closes dialog, resets selected branch, and shows toast notifications.
   *
   * @example
   * deleteBranch();
   */
  const deleteBranch = async () => {
    if (!selectedBranch) return;

    try {
      const response = await apiRequest(
        "DELETE",
        `/api/branches/${selectedBranch.id}`,
      );
      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
        setIsDeleteBranchDialogOpen(false);
        setSelectedBranch(null);
        toast({
          title: "Branch deleted",
          description: "The branch has been deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete branch");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toHHMM = (time: string) => time?.slice(0, 5) || "";

  /**
   * Opens the edit batch dialog and pre-fills the form with batch and schedule data.
   *
   * @purpose Prepare the batch edit form including its schedules for user modifications.
   *
   * @param {any} batch - Batch object to edit.
   * @returns {void}
   * @throws None
   * @sideEffects Opens edit batch dialog and resets form values.
   *
   * @example
   * handleEditBatch({ name: "Batch A", courseId: 1, perDayValue: 50 });
   */
  const handleEditBatch = (batch: any) => {
    setSelectedBatch(batch);
    editBatchForm.reset({
      name: batch.name,
      courseId: batch.courseId,
      perDayValue: Number(batch.perDayValue),
      teacherId: batch.teacherId,
      startDate: batch.startDate,
      endDate: batch.endDate,
      schedules: batch.schedules.map((s: any) => ({
        day: s.day,
        startTime: toHHMM(s.startTime),
        endTime: toHHMM(s.endTime),
        duration: s.duration,
      })),
      roomNumber: batch.roomNumber,
      capacity: batch.capacity,
      category: batch.category,
      branch: batch.branch,
      status: batch.status,
    });
    setIsEditBatchDialogOpen(true);
  };

  /**
   * Opens the delete confirmation dialog for a batch.
   *
   * @purpose Sets the batch to be deleted and opens the delete confirmation dialog.
   *
   * @param {any} batch - Batch object to delete.
   * @returns {void}
   * @throws None
   * @sideEffects Opens delete batch dialog.
   *
   * @example
   * handleDeleteBatch({ name: "Batch A", courseId: 1, perDayValue: 50 });
   */
  const handleDeleteBatch = (batch: any) => {
    setSelectedBatch(batch);
    setIsDeleteBatchDialogOpen(true);
  };

  /**
   * Submits the edited batch form and updates schedules.
   *
   * @purpose Sends PUT request to update batch details, deletes old schedules, creates new schedules, and resets form.
   *
   * @param {BatchFormValues} batch - Edited batch data including schedules.
   * @returns {Promise<void>} Resolves when batch and schedules are updated successfully.
   * @throws Logs error if batch update or schedule creation fails.
   * @sideEffects Updates query cache, closes edit batch dialog, resets form, and shows toast notifications.
   *
   * @example
   * handleUpdateBatch({ name: "Batch A", courseId: 1, perDayValue: 50 });
   */
  const handleUpdateBatch = async (batch: BatchFormValues) => {
    try {
      if (!selectedBatch?.id) return;

      // Update batch details
      const batchResponse = await apiRequest(
        "PUT",
        `/api/batches/${selectedBatch.id}`,
        {
          name: batch.name,
          courseId: batch.courseId,
          perDayValue: batch.perDayValue,
          teacherId: batch.teacherId,
          startDate: batch.startDate,
          endDate: batch.endDate || null,
          roomNumber: batch.roomNumber || null,
          capacity: batch.capacity,
          category: batch.category,
          branch: batch.branch,
          status: batch.status,
        },
      );

      if (!batchResponse.ok) throw new Error("Batch updation failed");
      const batchData = await batchResponse.json();
      const deleteResponse = await apiRequest(
        "DELETE",
        `/api/batch/schedules/${batchData.id}`,
      );
      if (!deleteResponse.ok) throw new Error("Failed to delete old schedules");

      const schedulePromises = batch.schedules.map((schedule) =>
        apiRequest("POST", "/api/schedules", {
          batchId: selectedBatch.id,
          day: schedule.day,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          duration: schedule.duration,
        }),
      );

      const scheduleResults = await Promise.all(schedulePromises);
      const failedSchedules = scheduleResults.filter((r: any) => !r.ok);

      if (failedSchedules.length > 0) {
        throw new Error(`${failedSchedules.length} schedules failed to create`);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/batches"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/schedules"] }),
      ]);
      setIsEditBatchDialogOpen(false);
      editBatchForm.reset();

      toast({
        title: "Success",
        description: "Batch updated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update batch",
        variant: "destructive",
      });
    }
  };

  /**
   * Deletes the selected batch.
   *
   * @purpose Send DELETE request to remove a batch, update query cache, and show a success toast.
   *
   * @param None
   * @returns {Promise<void>} Resolves when batch is deleted.
   * @throws Will log error if the API request fails or `selectedBatch` is null.
   * @sideEffects Updates query cache, closes dialog, clears selected batch, and shows toast notifications.
   *
   * @example
   * deleteBatch();
   */
  const deleteBatch = async () => {
    if (!selectedBatch) return;

    try {
      const response = await apiRequest(
        "DELETE",
        `/api/batches/${selectedBatch.id}`,
      );
      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
        setIsDeleteBatchDialogOpen(false);
        setSelectedBatch(null);
        toast({
          title: "Batch deleted",
          description: "The batch has been deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete batch");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * @purpose Creates a new studio.
   *
   * @param data - Form data for the new studio.
   * @returns void
   * @throws None
   * @sideEffects Updates cache, closes dialog, resets form, and shows toast.
   *
   * @example
   * handleCreateStudio({ name: "Studio A", branchId: 1 });
   */
  const handleCreateStudio = async (data: studioSchemaType) => {
    try {
      await apiRequest("POST", "/api/studio", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/studio"] });
      setIsStudioDialogOpen({ create: false, update: false, delete: false });
      studioForm.reset();
      toast({
        title: "Success",
        description: "Studio created successfully",
      });
    } catch (error) {
      console.error("studio creation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create studio",
        variant: "destructive",
      });
    }
  };

  /**
   * @purpose Opens the edit dialog for a selected studio and pre-fills the form with its data.
   *
   * @param studio The studio object to be edited.
   * @returns void
   * @throws None
   * @sideEffects
   * - Sets the selected studio in state.
   * - Resets `studioForm` with the studio's current values.
   * - Opens the studio edit dialog.
   *
   * @example
   * handleEditStudio({ id: 1, name: "Downtown Studio", description: "Main hall" });
   */
  const handleEditStudio = (studio: Studio) => {
    setSelectedStudio(studio);
    studioForm.reset({
      name: studio.name,
      description: studio.description,
    });
    setIsStudioDialogOpen({ create: false, update: true, delete: false });
  };

  /**
   * @purpose Submits the edited studio data to the API and updates the query cache.
   *
   * @param data The updated studio data from the form.
   * @returns Promise<void>
   * @throws Will throw an error if the API request fails or no studio is selected.
   * @sideEffects
   * - Calls the API to update the studio.
   * - Invalidates the `/api/studio` query in `react-query`.
   * - Closes the studio dialog and clears the selected studio.
   * - Shows success or error toast messages.
   *
   * @example
   * await onEditStudioSubmit({ name: "New Studio", description: "Updated description" });
   */
  const onEditStudioSubmit = async (data: studioSchemaType) => {
    if (!selectedStudio) return;

    try {
      const response = await apiRequest(
        "PUT",
        `/api/studio/${selectedStudio.id}`,
        data,
      );
      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/studio"] });
        setIsStudioDialogOpen({ create: false, update: false, delete: false });
        setSelectedStudio(null);
        toast({
          title: "Studio updated",
          description: "The studio has been updated successfully.",
        });
      } else {
        throw new Error("Failed to update studio");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * @purpose Opens the delete dialog for a selected studio.
   *
   * @param studio The studio object to be deleted.
   * @returns void
   * @throws None
   * @sideEffects
   * - Sets the selected studio in state.
   * - Opens the studio delete dialog.
   *
   * @example
   * handleDeleteStudio({ id: 2, name: "Uptown Studio" });
   */
  const handleDeleteStudio = (studio: Studio) => {
    setSelectedStudio(studio);
    setIsStudioDialogOpen({ delete: true, create: false, update: false });
  };

  /**
   * @purpose Deletes the selected studio via the API and updates the query cache.
   *
   * @param None
   * @returns Promise<void>
   * @throws Will throw an error if no studio is selected or the API request fails.
   * @sideEffects
   * - Calls the API to delete the studio.
   * - Invalidates the `/api/studio` query in `react-query`.
   * - Closes the studio dialog and clears the selected studio.
   * - Shows success or error toast messages.
   *
   * @example
   * await deleteStudio();
   */
  const deleteStudio = async () => {
    if (!selectedStudio) return;

    try {
      const response = await apiRequest(
        "DELETE",
        `/api/studio/${selectedStudio.id}`,
      );
      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/studio"] });
        setIsStudioDialogOpen({ create: false, update: false, delete: false });
        setSelectedStudio(null);
        toast({
          title: "Studio deleted",
          description: "The studio has been deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete studio");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * @purpose Filters the list of courses to only those belonging to the selected department.
   *
   * @param {Course[]} courses - The array of course objects.
   * @param {Departments[]} departments - The array of department objects.
   * @param {number | null} selectedDepartmentForBatch - The ID of the selected department to filter by. If null, returns all courses.
   * @returns {Course[]} An array of courses belonging to the selected department.
   * @throws Will throw an error if `selectedDepartmentForBatch` is invalid.
   * @sideEffects None. This function is pure.
   *
   * @example
   * ```ts
   * const filteredCourses = filterCourses(courses, departments, selectedDepartmentId);
   * console.log(filteredCourses); // Array of courses for the selected department
   * ```
   */
  const filteredCourses = useMemo(() => {
    if (!selectedDepartmentForBatch) return courses;
    const selectedDept = departments.find(
      (dept) => dept.id === selectedDepartmentForBatch,
    );
    if (!selectedDept) return courses;
    return courses.filter((course) => {
      if (!course.category) return false;

      const normalizeString = (str: string) => {
        return str.toLowerCase().replace(/[-\s]/g, "");
      };

      const normalizedCategory = normalizeString(course.category);
      const normalizedDeptName = normalizeString(selectedDept.name);

      return normalizedCategory === normalizedDeptName;
    });
  }, [courses, selectedDepartmentForBatch, departments]);

  /**
   * @purpose Opens the edit dialog for a selected transportation mode and pre-fills the form with its data.
   *
   * @param transportationMode The transportation mode object to edit.
   * @returns void
   * @throws None
   * @sideEffects
   * - Sets the selected transportation mode in state.
   * - Resets the `transportationModeForm` with the mode's current values.
   * - Opens the edit dialog.
   *
   * @example
   * handleEditTransportationMode({ id: 1, mode: "Bus", rate: 100, perDayValue: 50 });
   */
  const handleEditTransportationMode = (
    transportationMode: TransportationModeRow,
  ) => {
    setSelectedTransportationMode(transportationMode);
    transportationModeForm.reset({
      mode: transportationMode.mode,
      rate: transportationMode.rate,
      perDayValue: transportationMode.perDayValue,
    });
    setIsEditTransportationDialogOpen(true);
  };

  /**
   * @purpose Opens the delete dialog for a selected transportation mode.
   *
   * @param transportationMode The transportation mode object to delete.
   * @returns void
   * @throws None
   * @sideEffects
   * - Sets the selected transportation mode in state.
   * - Opens the delete dialog.
   *
   * @example
   * handleDeleteTransportationMode({ id: 2, mode: "Van", rate: 150, perDayValue: 75 });
   */
  const handleDeleteTransportationMode = (
    transportationMode: TransportationModeRow,
  ) => {
    setSelectedTransportationMode(transportationMode);
    setIsDeleteTransportationDialogOpen(true);
  };

  /**
   * @purpose Deletes the selected transportation mode via API and updates the query cache.
   *
   * @param None
   * @returns Promise<void>
   * @throws Will throw an error if the API request fails or no transportation mode is selected.
   * @sideEffects
   * - Calls API to delete the selected transportation mode.
   * - Invalidates `/api/transportationModes` query in `react-query`.
   * - Closes the delete dialog and clears the selected transportation mode.
   * - Shows success or error toast messages.
   *
   * @example
   * await deleteTransportationMode();
   */
  const deleteTransportationMode = async () => {
    if (!selectedTransportationMode) return;
    try {
      await apiRequest(
        "DELETE",
        `/api/transportationMode/${selectedTransportationMode.id}`,
      );
      queryClient.invalidateQueries({ queryKey: ["/api/transportationModes"] });
      setIsDeleteTransportationDialogOpen(false);
      setSelectedTransportationMode(null);
      toast({
        title: "Transportation mode deleted",
        description: "Transportation mode deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * @purpose Submits edited transportation mode data to the API and updates the query cache.
   *
   * @param data The updated transportation mode values from the form.
   * @returns Promise<void>
   * @throws Will throw an error if no transportation mode is selected or API request fails.
   * @sideEffects
   * - Calls API to update the selected transportation mode.
   * - Invalidates `/api/transportationModes` query in `react-query`.
   * - Closes the edit dialog and resets the form.
   * - Clears the selected transportation mode.
   * - Shows success or error toast messages.
   *
   * @example
   * await onEditTransportationModeSubmit({ mode: "Mini Bus", rate: 120, perDayValue: 60 });
   */
  const onEditTransportationModeSubmit = async (
    data: TransportationModeFormValues,
  ) => {
    if (!selectedTransportationMode) return;

    try {
      const response = await apiRequest(
        "PUT",
        `/api/transportationMode/${selectedTransportationMode.id}`,
        {
          mode: data.mode,
          rate: Number(data.rate),
          perDayValue: Number(data.perDayValue),
        },
      );
      await queryClient.invalidateQueries({
        queryKey: ["/api/transportationModes"],
      });
      setIsEditTransportationDialogOpen(false);
      transportationModeForm.reset();
      setSelectedTransportationMode(null);
      toast({
        title: "Success",
        description: "Transportation mode updated successfully",
      });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update transportation mode",
        variant: "destructive",
      });
    }
  };

  /**
   * @purpose Filters the list of batches based on the provided filter criteria.
   *
   * @param {Batch[]} batches - The array of batch objects to filter.
   * @param {Branches[]} branches - The array of branch objects used to derive branch names.
   * @param {Course[]} courses - The array of course objects used to derive brand IDs.
   * @param {Filters} filters - An object containing the selected filter criteria:
   *   - `brandId` - Filter by brand ID.
   *   - `branch` - Filter by branch ID.
   *   - `courseId` - Filter by course ID.
   *   - `teacherId` - Filter by teacher ID.
   *   - `category` - Filter by department/category.
   *   - `day` - Filter by schedule day.
   *   - `roomNumber` - Filter by room/studio number.
   *   - `name` - Filter by batch name (partial match, case-insensitive).
   *   - `startTime` - Filter by schedule start time.
   *   - `endTime` - Filter by schedule end time.
   * @returns {Batch[]} A filtered array of batches that match all the selected criteria.
   * @throws Will throw an error if `getSchedule(batch.id)` fails or if any required data is missing.
   * @sideEffects None. This function is pure and does not modify input arrays.
   *
   * @example
   * ```ts
   * const filtered = filterBatches(batches, branches, courses, filters);
   * console.log(filtered); // Array of batches matching the selected filters
   * ```
   */
  const filteredData = batches.filter((batch) => {
    const schedules = getSchedule(batch.id);
    const selectedBranch = branches.find(
      (b) => b.id.toString() === filters.branch,
    )?.name;
    const course = courses.find((c) => c.id === batch.courseId);
    const derivedBrandId = course?.brandId?.toString() || null;

    const matchesBrand = !filters.brandId || derivedBrandId === filters.brandId;

    const matchesBranch = !filters.branch || batch.branch === selectedBranch;

    const matchesCourse =
      !filters.courseId || batch.courseId === Number(filters.courseId);

    const matchesTeacher =
      !filters.teacherId || batch.teacherId === Number(filters.teacherId);

    const matchesDepartment =
      !filters.category || batch.category === filters.category;

    const matchesDay =
      !filters.day || schedules.some((s) => s.day === filters.day);

    const matchesRoom =
      !filters.roomNumber ||
      batch.roomNumber?.toString() === filters.roomNumber;

    const matchesName =
      !filters.name ||
      batch.name.toLowerCase().includes(filters.name.toLowerCase());

    const matchesStartTime =
      !filters.startTime ||
      schedules.some((s) => s.startTime === filters.startTime);

    const matchesEndTime =
      !filters.endTime || schedules.some((s) => s.endTime === filters.endTime);

    return (
      matchesBrand &&
      matchesBranch &&
      matchesCourse &&
      matchesDepartment &&
      matchesTeacher &&
      matchesDay &&
      matchesRoom &&
      matchesName &&
      matchesStartTime &&
      matchesEndTime
    );
  });

  //// RENDER //////
  return (
    // AppShell component is the main layout component that provides the application shell with a header, sidebar, and footer.
    <AppShell>
      {/* Page header with title, description and action button */}
      <PageHeader
        title="Courses & Batches"
        description="Manage brands,  branches, departments, courses, batches, and schedules offered by Institution."
        actions={
          <Button
            onClick={() => {
              // Open the corresponding creation dialog based on the active tab
              if (activeTab === "courses") {
                setIsCreateDialogOpen(true);
              } else if (activeTab === "batches") {
                setIsCreateBatchDialogOpen(true);
              } else if (activeTab === "branches") {
                setIsCreateBranchDialogOpen(true);
              } else if (activeTab === "departments") {
                setIsCreateDepartmentDialogOpen(true);
              } else if (activeTab === "brands") {
                setIsCreateBrandDialogOpen(true);
              } else if (activeTab === "schedules") {
                setIsCreateScheduleDialogOpen(true);
              } else if (activeTab === "transportation") {
                setIsCreateTransportationDialogOpen(true);
              } else if (activeTab === "studio") {
                setIsStudioDialogOpen({ create: true });
              }
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> {/* Icon for the button */}
            {/* Button label changes based on the active tab */}
            {activeTab === "courses"
              ? "New Course"
              : activeTab === "batches"
                ? "New Batch"
                : // : activeTab === "schedules"
                  //   ? "New Schedule"
                  activeTab === "transportation"
                  ? "New Transportation"
                  : activeTab === "brands"
                    ? "New Brand"
                    : activeTab === "departments"
                      ? "New Department"
                      : activeTab === "studio"
                        ? "New Studio"
                        : "New Branch"}
          </Button>
        }
      />

      {/* Tabs to switch between different admin sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="studio">Studio</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          {/* <TabsTrigger value="schedules">Schedules</TabsTrigger> */}
        </TabsList>

        {/* Tab content for Brands */}
        <TabsContent value="brands" className="mt-6">
          <DataTable
            columns={brandColumns} // Columns configuration
            data={brands} // Data to display
            searchColumns={["name"]} // Columns to search by
            searchPlaceholder="Search by brands..." // Search placeholder
            initialSorting={[{ id: "name", desc: true }]} // Initial sorting
          />
        </TabsContent>

        {/* Tab content for Departments */}
        <TabsContent value="departments" className="mt-6">
          <DataTable
            columns={departmentColumns} // Columns configuration
            data={departments} // Data to display
            searchColumns={["name"]} // Columns to search by
            searchPlaceholder="Search by departments..." // Search placeholder
            initialSorting={[{ id: "name", desc: true }]} // Initial sorting
          />
        </TabsContent>

        {/* Tab content for Courses */}
        <TabsContent value="courses" className="mt-6">
          <DataTable
            columns={courseColumns} // Columns configuration
            data={courses} // Data to display
            searchColumns={["name", "code", "category", "fee", "brandId"]} // Columns to search by
            searchPlaceholder="Search by course..." // Search placeholder
            initialSorting={[{ id: "code", desc: true }]} // Initial sorting
          />
        </TabsContent>

        {/* Tab content for Batches with filters */}
        <TabsContent value="batches" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-2">
            {/* Filter by batch name */}
            <ReactSelect
              value={
                filters.name
                  ? { label: filters.name, value: filters.name }
                  : null
              }
              onChange={(selectedOption) =>
                setFilters({ ...filters, name: selectedOption?.value || "" })
              }
              options={[
                { label: "All Batches", value: "" },
                ...[...new Set(batches.map((b) => b.name))].map((name) => ({
                  label: name,
                  value: name,
                })),
              ]}
              isClearable
              placeholder="Select Batch"
              className="w-full text-sm"
            />

            {/* Filter by brand */}
            <ReactSelect
              value={
                filters.brandId
                  ? {
                      label: brands.find(
                        (b) => b.id.toString() === filters.brandId,
                      )?.name,
                      value: filters.brandId,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                setFilters({ ...filters, brandId: selectedOption?.value || "" })
              }
              options={[
                { label: "All Brands", value: "" },
                ...brands.map((b) => ({
                  label: b.name,
                  value: b.id.toString(),
                })),
              ]}
              isClearable
              placeholder="Select Brand"
              className="w-full text-sm"
            />

            {/* Filter by branch */}
            <ReactSelect
              value={
                filters.branch
                  ? {
                      label: branches.find(
                        (b) => b.id.toString() === filters.branch,
                      )?.name,
                      value: filters.branch,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                setFilters({ ...filters, branch: selectedOption?.value || "" })
              }
              options={[
                { label: "All Branches", value: "" },
                ...branches.map((b) => ({
                  label: b.name,
                  value: b.id.toString(),
                })),
              ]}
              isClearable
              placeholder="Select Branch"
              className="w-full text-sm"
            />

            {/* Category Filter */}
            <ReactSelect
              value={
                filters.category
                  ? {
                      label: departments.find(
                        (c) => c.id === Number(filters.category),
                      )?.name,
                      value: filters.category,
                    }
                  : null
              }
              onChange={
                (selectedOption) =>
                  setFilters({
                    ...filters,
                    category: selectedOption?.value || "",
                  }) // Update category filter
              }
              options={[
                { label: "All Departments", value: "" },
                ...departments.map((c) => ({
                  label: c.name,
                  value: c.id.toString(),
                })),
              ]}
              isClearable
              placeholder="Select Department"
              className="w-full text-sm"
            />

            {/* Course Filter */}
            {/* <select
              value={filters.courseId}
              onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
              className="border px-2 py-1 text-sm rounded-lg h-10 px-2 text-base"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select> */}
            <ReactSelect
              value={
                filters.courseId
                  ? {
                      label: courses.find(
                        (c) => c.id === Number(filters.courseId),
                      )?.name,
                      value: filters.courseId,
                    }
                  : null
              }
              onChange={
                (selectedOption) =>
                  setFilters({
                    ...filters,
                    courseId: selectedOption?.value || "",
                  }) // Update course filter
              }
              options={[
                { label: "All Courses", value: "" },
                ...courses.map((c) => ({
                  label: c.name,
                  value: c.id.toString(),
                })),
              ]}
              isClearable
              placeholder="Select Course"
              className="w-full text-sm"
            />

            {/* Teacher Filter */}
            {/* <select
              value={filters.teacherId}
              onChange={(e) => setFilters({ ...filters, teacherId: e.target.value })}
              className="border px-2 py-1 text-sm rounded-lg h-10 px-2 text-base"
            >
              <option value="">All Teachers</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName}
                </option>
              ))}
            </select> */}
            <ReactSelect
              value={
                filters.teacherId
                  ? {
                      label:
                        employees.find(
                          (e) => e.id === Number(filters.teacherId),
                        )?.firstName +
                        " " +
                        employees.find(
                          (e) => e.id === Number(filters.teacherId),
                        )?.middleName +
                        " " +
                        employees.find(
                          (e) => e.id === Number(filters.teacherId),
                        )?.lastName,
                      value: filters.teacherId,
                    }
                  : null
              }
              onChange={
                (selectedOption) =>
                  setFilters({
                    ...filters,
                    teacherId: selectedOption?.value || "",
                  }) // Update teacher filter
              }
              options={[
                { label: "All Teachers", value: "" },
                ...employees.map((e) => ({
                  label: e.firstName + " " + e.middleName + " " + e.lastName,
                  value: e.id.toString(),
                })),
              ]}
              isClearable
              placeholder="Select Teacher"
              className="w-full text-sm"
            />

            {/* Day Filter */}
            {/* <select
              value={filters.day}
              onChange={(e) => setFilters({ ...filters, day: e.target.value })}
              className="border px-2 py-1 text-sm rounded-lg h-10 px-2 text-base"
            >
              <option value="">All Days</option>
              {[...new Set(batches.flatMap((b) => getSchedule(b.id).map((s) => s.day)))].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select> */}
            <ReactSelect
              value={
                filters.day ? { label: filters.day, value: filters.day } : null
              }
              onChange={
                (selectedOption) =>
                  setFilters({ ...filters, day: selectedOption?.value || "" }) // Update day filter
              }
              options={[
                { label: "All Days", value: "" },
                ...[
                  ...new Set(
                    batches.flatMap((b) => getSchedule(b.id).map((s) => s.day)),
                  ),
                ].map((day) => ({
                  label: day,
                  value: day,
                })),
              ]}
              isClearable
              placeholder="Select Day"
              className="w-full text-sm"
            />
          </div>

          {/* Batch Table */}
          <DataTable
            columns={batchColumns} //Column configuration
            data={filteredData} //Filtered batches data
            // searchColumns={["name","category","course","teacher","schedules","roomNumber", "branch"]}
            searchPlaceholder="Search by batch name, departments, courses, teacher, schedule, studio..." //Search placeholder
            initialSorting={[{ id: "name", desc: true }]} //Initial sorting
          />
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="mt-6">
          <DataTable
            columns={branchColumns} //Column configuration
            data={branches} //Branches data
            searchColumns={["name", "code", "manager"]} //Search columns
            searchPlaceholder="Search branches..." //Search placeholder
            initialSorting={[{ id: "code", desc: true }]} //Initial sorting
          />
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="mt-6">
          <DataTable
            columns={scheduleColumns} //Column configuration
            data={schedules} //Schedules data
            searchColumns={["day"]} //Search columns
            searchPlaceholder="Search schedules..." //Search placeholder
          />
        </TabsContent>

        {/* Transportation Tab */}
        <TabsContent value="transportation" className="mt-6">
          <DataTable
            columns={transportationModeColumns} //Column configuration
            data={transportations} //Transportations data
            searchColumns={["mode", "rate"]} //Search columns
            searchPlaceholder="Search transportation modes..." //Search placeholder
            initialSorting={[{ id: "mode", desc: true }]} //Initial sorting
          />
        </TabsContent>

        {/* Studio Tab */}
        <TabsContent value="studio" className="mt-6">
          <DataTable
            columns={studioColumns} //Column configuration
            data={studiosData} //Studios data
            searchColumns={["name"]} //Search columns
            searchPlaceholder="Search Studio..." //Search placeholder
            initialSorting={[{ id: "name", desc: true }]} //Default sorting
          />
        </TabsContent>
      </Tabs>

      {/* Create Brand Dialog */}
      <Dialog
        open={isCreateBrandDialogOpen} //Dialog open state
        onOpenChange={(open) => {
          setIsCreateBrandDialogOpen(open); //Update dialog state
          if (!open) {
            brandForm.reset(); //Reset form on dialog close
          }
        }}
      >
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>Create New Brand</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              Add a new brand to Institution. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {/* Brand creation form */}
          <Form {...brandForm}>
            <form
              onSubmit={brandForm.handleSubmit(onCreateBrandSubmit)}
              className="space-y-4"
            >
              {/* Brand name field */}
              <FormField
                control={brandForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input {...field} /> {/* Controlled Input */}
                    </FormControl>
                    <FormMessage /> {/* Validation Error message */}
                  </FormItem>
                )}
              />
              {/* Brand description field */}
              <FormField
                control={brandForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />{" "}
                      {/* Controlled Textarea */}
                    </FormControl>
                    <FormMessage /> {/* Validation Error message */}
                  </FormItem>
                )}
              />

              {/* Form submit button */}
              <DialogFooter>
                <Button type="submit">Create Brand</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog  */}
      <Dialog
        open={isEditBrandDialogOpen} // Controls whether the edit brand dialog is open
        onOpenChange={setIsEditBrandDialogOpen} // Updates dialog state
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Edit a brand in Institution. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {/* Edit brand form */}
          <Form {...editBrandForm}>
            <form
              onSubmit={editBrandForm.handleSubmit(onEditBrandSubmit)}
              className="space-y-4"
            >
              {/* Brand name field */}
              <FormField
                control={editBrandForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand description field */}
              <FormField
                control={editBrandForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form submit button */}
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Brand Dialog */}
      <Dialog
        open={isDeleteBrandDialogOpen}
        onOpenChange={setIsDeleteBrandDialogOpen}
      >
        {/* Dialog content */}
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>Delete Brand</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              Are you sure you want to delete this brand? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {/* Dialog footer */}
          <DialogFooter>
            {/* Cancel button */}
            <Button
              variant="outline"
              onClick={() => setIsDeleteBrandDialogOpen(false)}
            >
              Cancel
            </Button>
            {/* Delete button */}
            <Button onClick={deleteBrand}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Department Dialog */}
      <Dialog
        open={isCreateDepartmentDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDepartmentDialogOpen(open);
          if (!open) {
            departmentForm.reset();
          }
        }}
      >
        {/* Dialog content */}
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>Create New Department</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              Add a new department to Institution. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {/* Department creation form */}
          <Form {...departmentForm}>
            {/* Form */}
            <form
              onSubmit={departmentForm.handleSubmit(onCreateDepartmentSubmit)}
              className="space-y-4"
            >
              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={departmentForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Brand selection field */}
                <FormField
                  control={departmentForm.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      {/* Brand selection */}
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString() ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* List brands */}
                          {brands.map((brand) => (
                            <SelectItem
                              key={brand.id}
                              value={brand.id.toString()}
                            >
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Department description field */}
              <FormField
                control={departmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      {/* Description textarea */}
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form submit button */}
              <DialogFooter>
                <Button type="submit">Create Department</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog
        open={isEditDepartmentDialogOpen}
        onOpenChange={setIsEditDepartmentDialogOpen}
      >
        {/* Dialog content */}
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>Edit Department</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              Edit the department details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...editDepartmentForm}>
            <form
              onSubmit={editDepartmentForm.handleSubmit(onEditDepartmentSubmit)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editDepartmentForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Brand selection field */}
                <FormField
                  control={editDepartmentForm.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString() ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem
                              key={brand.id}
                              value={brand.id.toString()}
                            >
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Department description field */}
              <FormField
                control={editDepartmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form submit button */}
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog
        open={isDeleteDepartmentDialogOpen}
        onOpenChange={setIsDeleteDepartmentDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>Delete Department</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              Are you sure you want to delete this department? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {/* Cancel button */}
            <Button
              variant="outline"
              onClick={() => setIsDeleteDepartmentDialogOpen(false)}
            >
              Cancel
            </Button>
            {/* Delete button */}
            <Button
              variant="destructive"
              onClick={handleDeleteDepartmentSubmit}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Course Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            courseForm.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>Create New Course</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              Add a new course to Institution. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <Form {...courseForm}>
            <form
              onSubmit={courseForm.handleSubmit(onCreateCourseSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={courseForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Course name field */}
                <FormField
                  control={courseForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Brand selection field */}
                <FormField
                  control={courseForm.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString() ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem
                              key={brand.id}
                              value={brand.id.toString()}
                            >
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Course category field */}
                <FormField
                  control={courseForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem
                              key={department.id}
                              value={department.name}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Course fee field */}
                <FormField
                  control={courseForm.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee (Per month)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form submit button */}
              <DialogFooter>
                <Button type="submit">Create Course</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Batch Dialog */}
      <Dialog
        open={isCreateBatchDialogOpen}
        onOpenChange={(open) => {
          setIsCreateBatchDialogOpen(open);
          if (!open) {
            batchForm.reset();
          }
        }}
      >
        {/* Dialog content */}
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <DialogTitle>Create New Batch</DialogTitle>
              <DialogDescription>
                Add a new batch to an existing course. Click save when you're
                done.
              </DialogDescription>
            </div>
            <div className="flex items-center w-1/3">
              <Label
                htmlFor="batchName"
                className="whitespace-nowrap font-semibold text-lg"
              >
                Batch Name :
              </Label>
              <div
                id="batchName"
                className="flex-1 px-3 py-2 text-gray-700 font-bold"
              >
                {batchForm.watch("name")}
              </div>
            </div>
          </DialogHeader>

          {/* Form */}
          <Form {...batchForm}>
            <form
              onSubmit={batchForm.handleSubmit(handleCreateBatch)}
              className="space-y-4 py-4"
            >
              <div className="grid grid-cols-4 gap-4">
                {/* Branch selection field */}
                <FormField
                  control={batchForm.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.name}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Department selection field */}
                <FormField
                  control={batchForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedDepartmentForBatch(parseInt(value));
                          // batchForm.setValue('courseId', '');
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem
                              key={department.id}
                              value={department.id.toString()}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Course selection field */}
                <FormField
                  control={batchForm.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString()}
                        disabled={!selectedDepartmentForBatch}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedDepartmentForBatch
                                  ? "Select a course"
                                  : "Please select a department first"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCourses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id.toString()}
                            >
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Per day value field */}
                <FormField
                  control={batchForm.control}
                  name="perDayValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Day Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(
                              val === "" ? undefined : parseFloat(val),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Teacher selection field */}
                <FormField
                  control={batchForm.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem
                              key={teacher.id}
                              value={teacher.id.toString()}
                            >
                              {teacher.firstName +
                                " " +
                                teacher.middleName +
                                " " +
                                teacher.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Start date field */}
                <FormField
                  control={batchForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End date field */}
                <FormField
                  control={batchForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Studio selection field */}
                <FormField
                  control={batchForm.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Studio</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Studio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {studiosData.map((studio) => (
                            <SelectItem
                              key={studio.id}
                              value={studio.id.toString()}
                            >
                              {studio.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Strength field */}
                <FormField
                  control={batchForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strength</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter strength"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status field */}
                <FormField
                  control={batchForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Schedules field */}
              <div className="space-y-1">
                <FormField
                  control={batchForm.control}
                  name="schedules"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2">
                          <Label>Schedule</Label>
                          <div className="flex items-end gap-4 w-full mb-2">
                            <div className="flex-1 text-sm font-medium">
                              Select Day
                            </div>
                            <div className="flex-1 text-sm font-medium">
                              Start Time
                            </div>
                            <div className="flex-1 text-sm font-medium">
                              End Time
                            </div>
                            <div className="flex-1 text-sm font-medium">
                              Duration (In Mins)
                            </div>
                            <div className="w-10" />
                          </div>
                          <div className="space-y-4">
                            {batchForm
                              .watch("schedules")
                              ?.map((schedule, index) => (
                                <div
                                  key={index}
                                  className="flex items-end gap-4 w-full"
                                >
                                  <div className="flex-1 space-y-1">
                                    <Select
                                      value={schedule.day}
                                      onValueChange={(value) => {
                                        const schedules = [
                                          ...batchForm.getValues("schedules"),
                                        ];
                                        schedules[index].day = value;
                                        batchForm.setValue(
                                          "schedules",
                                          schedules,
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select day" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {daysOfWeek.map((day) => (
                                          <SelectItem key={day} value={day}>
                                            {day}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <input
                                      type="time"
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      value={schedule.startTime}
                                      onChange={(e) => {
                                        const schedules = [
                                          ...batchForm.getValues("schedules"),
                                        ];
                                        schedules[index].startTime =
                                          e.target.value;
                                        batchForm.setValue(
                                          "schedules",
                                          schedules,
                                        );
                                        calculateDuration(index);
                                      }}
                                    />
                                  </div>

                                  <div className="flex-1 space-y-1">
                                    <input
                                      type="time"
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      value={schedule.endTime}
                                      onChange={(e) => {
                                        const schedules = [
                                          ...batchForm.getValues("schedules"),
                                        ];
                                        schedules[index].endTime =
                                          e.target.value;
                                        batchForm.setValue(
                                          "schedules",
                                          schedules,
                                        );
                                        calculateDuration(index);
                                      }}
                                    />
                                  </div>

                                  <div className="flex-1 space-y-1">
                                    <Input
                                      type="number"
                                      readOnly
                                      value={schedule.duration ?? ""}
                                      className="w-full"
                                    />
                                  </div>

                                  <div className="w-10 flex-shrink-0">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => {
                                        const schedules = batchForm
                                          .getValues("schedules")
                                          .filter((_, i) => i !== index);
                                        batchForm.setValue(
                                          "schedules",
                                          schedules,
                                        );
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const schedules = [
                                  ...(batchForm.getValues("schedules") || []),
                                ];
                                schedules.push({
                                  day: "",
                                  startTime: "",
                                  endTime: "",
                                  duration: 0,
                                });
                                batchForm.setValue("schedules", schedules);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" /> Add Schedule
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dialog Footer */}
              <DialogFooter>
                <Button type="submit">Create Batch</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Branch Dialog */}
      <Dialog
        open={isCreateBranchDialogOpen}
        onOpenChange={(open) => {
          setIsCreateBranchDialogOpen(open);
          if (!open) {
            branchForm.reset();
          }
        }}
      >
        {/* Dialog Content */}
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
            <DialogDescription>
              Add a new branch to Institution. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <Form {...branchForm}>
            <form
              onSubmit={branchForm.handleSubmit(onCreateBranchSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Branch Code Field */}
                <FormField
                  control={branchForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Branch Name Field */}
                <FormField
                  control={branchForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Brands Field */}
                <FormField
                  control={branchForm.control}
                  name="brandIds"
                  render={({ field }) => {
                    // const selectedIds = field.value || [];
                    const selectedIds = Array.isArray(field.value)
                      ? field.value
                      : [];
                    return (
                      <FormItem>
                        <FormLabel>Brands</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              {selectedIds.length
                                ? brands
                                    .filter((brand) =>
                                      selectedIds.includes(brand.id),
                                    )
                                    .map((brand) => brand.name)
                                    .join(", ")
                                : "Select brands"}
                              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-2 max-h-60 overflow-auto">
                            {brands.map((brand) => {
                              const isChecked = selectedIds.includes(brand.id);
                              return (
                                <div
                                  key={brand.id}
                                  className="flex items-center space-x-2 cursor-pointer py-1"
                                  onClick={() => {
                                    const newValue = isChecked
                                      ? selectedIds.filter(
                                          (id: number) => id !== brand.id,
                                        )
                                      : [...selectedIds, brand.id];
                                    field.onChange(newValue);
                                  }}
                                >
                                  <Checkbox checked={isChecked} />
                                  <span>{brand.name}</span>
                                </div>
                              );
                            })}
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                {/* Phone Field */}
                <FormField
                  control={branchForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Manager Field */}
                <FormField
                  control={branchForm.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Status Field */}
                <FormField
                  control={branchForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Submit Button */}
              <DialogFooter>
                <Button type="submit">Create Branch</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {/* Dialog Header */}
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditCourseSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Course Code Field */}
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Course Name Field */}
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Brand Field */}
                <FormField
                  control={editForm.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString() ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem
                              key={brand.id}
                              value={brand.id.toString()}
                            >
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Field */}
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem
                              key={department.id}
                              value={department.name}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fee Field */}
                <FormField
                  control={editForm.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee (Per month)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter course fee"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Course Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            {/* Dialog Header */}
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {/* Warning Message */}
          <div className="p-4 border border-red-100 bg-red-50 rounded-md">
            <p className="text-sm text-red-500">
              Warning: Deleting this course will remove all associated data
              including batches, enrollments, and attendance records.
            </p>
          </div>

          {/* Dialog Footer */}
          <DialogFooter>
            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            {/* Delete Button */}
            <Button variant="destructive" onClick={deleteCourse}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog
        open={isEditBranchDialogOpen}
        onOpenChange={setIsEditBranchDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {/* Dialog Header */}
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              Update branch details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <Form {...branchForm}>
            <form
              onSubmit={branchForm.handleSubmit(onEditBranchSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Branch Code Field */}
                <FormField
                  control={branchForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Branch Name Field */}
                <FormField
                  control={branchForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Brand Field */}
                <FormField
                  control={branchForm.control}
                  name="brandIds"
                  render={({ field }) => {
                    // Convert field value to array of numbers
                    const selectedIds = Array.isArray(field.value)
                      ? field.value.map(Number)
                      : [];
                    return (
                      <FormItem>
                        <FormLabel>Brands</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              {selectedIds.length
                                ? brands
                                    .filter((brand) =>
                                      selectedIds.includes(brand.id),
                                    )
                                    .map((brand) => brand.name)
                                    .join(", ")
                                : "Select brands"}
                              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-2 max-h-60 overflow-auto">
                            {brands.map((brand) => {
                              const isChecked = selectedIds.includes(brand.id);
                              return (
                                <div
                                  key={brand.id}
                                  className="flex items-center space-x-2 cursor-pointer py-1"
                                  onClick={() => {
                                    const newValue = isChecked
                                      ? selectedIds.filter(
                                          (id) => id !== brand.id,
                                        )
                                      : [...selectedIds, brand.id];
                                    field.onChange(newValue);
                                  }}
                                >
                                  <Checkbox checked={isChecked} />
                                  <span>{brand.name}</span>
                                </div>
                              );
                            })}
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                {/* Phone Field */}
                <FormField
                  control={branchForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Manager Field */}
                <FormField
                  control={branchForm.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Status Field */}
                <FormField
                  control={branchForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dialog Footer */}
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Branch Confirmation Dialog */}
      <Dialog
        open={isDeleteBranchDialogOpen}
        onOpenChange={setIsDeleteBranchDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            {/* Dialog Header */}
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this branch? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 border border-red-100 bg-red-50 rounded-md">
            <p className="text-sm text-red-500">
              Warning: Deleting this branch will remove all associated data
              including batches, enrollments, and attendance records.
            </p>
          </div>

          {/* Dialog Footer */}
          <DialogFooter>
            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={() => setIsDeleteBranchDialogOpen(false)}
            >
              Cancel
            </Button>
            {/* Delete Button */}
            <Button variant="destructive" onClick={deleteBranch}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog
        open={isEditBatchDialogOpen}
        onOpenChange={setIsEditBatchDialogOpen}
      >
        {/* Dialog Content */}
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          {/* Dialog Header */}
          <DialogHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              {/* Dialog Title */}
              <DialogTitle>Edit Batch</DialogTitle>
              {/* Dialog Description */}
              <DialogDescription>
                Edit an existing batch. Click save when you're done.
              </DialogDescription>
            </div>
            {/* Batch Name */}
            <div className="flex items-center w-1/3">
              <Label
                htmlFor="batchName"
                className="whitespace-nowrap font-semibold text-lg"
              >
                Batch Name :
              </Label>
              <div
                id="batchName"
                className="flex-1 px-3 py-2 text-gray-700 font-bold"
              >
                {editBatchForm.watch("name")}
              </div>
            </div>
          </DialogHeader>

          {/* Form */}
          <Form {...{ ...editBatchForm }}>
            <form
              onSubmit={editBatchForm.handleSubmit(handleUpdateBatch)}
              className="space-y-4 py-4"
            >
              <div className="grid grid-cols-4 gap-4">
                {/* Branch Field */}
                <FormField
                  control={editBatchForm.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.name}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Department Field */}
                <FormField
                  control={editBatchForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedDepartmentForBatch(parseInt(value));
                          // batchForm.setValue('courseId', '');
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem
                              key={department.id}
                              value={department.id.toString()}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Course Field */}
                <FormField
                  control={editBatchForm.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString()}
                        disabled={!selectedDepartmentForBatch}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedDepartmentForBatch
                                  ? "Select a course"
                                  : "Please select a department first"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCourses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id.toString()}
                            >
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Per Day Value Field */}
                <FormField
                  control={editBatchForm.control}
                  name="perDayValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Day Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            // If empty, clear the field
                            if (val === "") {
                              field.onChange(undefined);
                            } else {
                              const parsed = parseFloat(val);
                              field.onChange(
                                isNaN(parsed) ? undefined : parsed,
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Teacher Field */}
                <FormField
                  control={editBatchForm.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem
                              key={teacher.id}
                              value={teacher.id.toString()}
                            >
                              {teacher.firstName +
                                " " +
                                teacher.middleName +
                                " " +
                                teacher.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Start Date Field */}
                <FormField
                  control={editBatchForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* End Date Field */}
                <FormField
                  control={editBatchForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Studio Field */}
                <FormField
                  control={editBatchForm.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Studio</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Studio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {studiosData.map((studio) => (
                            <SelectItem
                              key={studio.id}
                              value={studio.id.toString()}
                            >
                              {studio.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Strength Field */}
                <FormField
                  control={editBatchForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strength</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter strength"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Status Field */}
                <FormField
                  control={editBatchForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Schedules Field */}
              <div className="space-y-1">
                <FormField
                  control={editBatchForm.control}
                  name="schedules"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2">
                          <Label>Schedule</Label>
                          <div className="flex items-end gap-4 w-full mb-2">
                            <div className="flex-1 text-sm font-medium">
                              Select Day
                            </div>
                            <div className="flex-1 text-sm font-medium">
                              Start Time
                            </div>
                            <div className="flex-1 text-sm font-medium">
                              End Time
                            </div>
                            <div className="flex-1 text-sm font-medium">
                              Duration (In Mins)
                            </div>
                            <div className="w-10" />
                          </div>
                          <div className="space-y-4">
                            {editBatchForm
                              .watch("schedules")
                              ?.map((schedule, index) => (
                                <div
                                  key={index}
                                  className="flex items-end gap-4 w-full"
                                >
                                  <div className="flex-1 space-y-1">
                                    <Select
                                      value={schedule.day}
                                      onValueChange={(value) => {
                                        const schedules = [
                                          ...editBatchForm.getValues(
                                            "schedules",
                                          ),
                                        ];
                                        schedules[index].day = value;
                                        editBatchForm.setValue(
                                          "schedules",
                                          schedules,
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select day" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {daysOfWeek.map((day) => (
                                          <SelectItem key={day} value={day}>
                                            {day}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <input
                                      type="time"
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      value={schedule.startTime}
                                      onChange={(e) => {
                                        const schedules = [
                                          ...editBatchForm.getValues(
                                            "schedules",
                                          ),
                                        ];
                                        schedules[index].startTime =
                                          e.target.value;
                                        editBatchForm.setValue(
                                          "schedules",
                                          schedules,
                                        );
                                        calculateDurationForEditBatch(index);
                                      }}
                                    />
                                  </div>

                                  <div className="flex-1 space-y-1">
                                    <input
                                      type="time"
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      value={schedule.endTime}
                                      onChange={(e) => {
                                        const schedules = [
                                          ...editBatchForm.getValues(
                                            "schedules",
                                          ),
                                        ];
                                        schedules[index].endTime =
                                          e.target.value;
                                        editBatchForm.setValue(
                                          "schedules",
                                          schedules,
                                        );
                                        calculateDurationForEditBatch(index);
                                      }}
                                    />
                                  </div>

                                  <div className="flex-1 space-y-1">
                                    <Input
                                      type="number"
                                      readOnly
                                      value={schedule.duration ?? ""}
                                      className="w-full"
                                    />
                                  </div>

                                  <div className="w-10 flex-shrink-0">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => {
                                        const schedules = editBatchForm
                                          .getValues("schedules")
                                          .filter((_, i) => i !== index);
                                        editBatchForm.setValue(
                                          "schedules",
                                          schedules,
                                        );
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const schedules = [
                                  ...(editBatchForm.getValues("schedules") ||
                                    []),
                                ];
                                schedules.push({
                                  day: "",
                                  startTime: "",
                                  endTime: "",
                                  duration: 0,
                                });
                                editBatchForm.setValue("schedules", schedules);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" /> Add Schedule
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Submit Button */}
              <DialogFooter>
                <Button type="submit">Update Batch</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Batch Dialog */}
      <Dialog
        open={isDeleteBatchDialogOpen}
        onOpenChange={setIsDeleteBatchDialogOpen}
      >
        <DialogContent>
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Delete Batch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this batch? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={() => setIsDeleteBatchDialogOpen(false)}
            >
              Cancel
            </Button>
            {/* Delete Button */}
            <Button variant="destructive" onClick={deleteBatch}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Schedule Dialog */}
      <Dialog
        open={isCreateScheduleDialogOpen}
        onOpenChange={setIsCreateScheduleDialogOpen}
      >
        {/* Dialog Content */}
        <DialogContent>
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Add new schedule. Click save when done.
            </DialogDescription>
          </DialogHeader>
          {/* Form */}
          <Form {...scheduleForm}>
            <form
              onSubmit={scheduleForm.handleSubmit(onCreateScheduleSubmit)}
              className="space-y-8"
            >
              {/* Select Days */}
              <FormField
                control={scheduleForm.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Days</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {daysOfWeek.map((day) => (
                          <div
                            key={day}
                            className="flex items-center space-x-2 font-normal"
                          >
                            <Checkbox
                              id={`day-${day}`}
                              checked={field.value.split("-").includes(day)}
                              onCheckedChange={(checked) => {
                                const currentDays = field.value
                                  ? field.value.split("-")
                                  : [];
                                const newDays = checked
                                  ? [...currentDays, day]
                                  : currentDays.filter((d) => d !== day);
                                field.onChange(newDays.join("-"));
                              }}
                            />
                            <label
                              htmlFor={`day-${day}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Start Time */}
              <FormField
                control={scheduleForm.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* End Time */}
              <FormField
                control={scheduleForm.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Submit Button */}
              <DialogFooter>
                <Button type="submit">Create Schedule</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog
        open={isEditScheduleDialogOpen}
        onOpenChange={setIsEditScheduleDialogOpen}
      >
        {/* Dialog Content */}
        <DialogContent>
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Please enter the new schedule details
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <Form {...editScheduleForm}>
            <form
              onSubmit={editScheduleForm.handleSubmit(onEditScheduleSubmit)}
              className="space-y-8"
            >
              {/* Select Days */}
              <FormField
                control={editScheduleForm.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {daysOfWeek.map((day) => (
                          <div
                            key={day}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`day-${day}`}
                              checked={field.value.split("-").includes(day)}
                              onCheckedChange={(checked) => {
                                const currentDays = field.value
                                  ? field.value.split("-")
                                  : [];
                                const newDays = checked
                                  ? [...currentDays, day]
                                  : currentDays.filter((d) => d !== day);
                                field.onChange(newDays.join("-"));
                              }}
                            />
                            <label
                              htmlFor={`day-${day}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Start Time */}
              <FormField
                control={editScheduleForm.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* End Time */}
              <FormField
                control={editScheduleForm.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Submit Button */}
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Schedule Dialog */}
      <Dialog
        open={isDeleteScheduleDialogOpen}
        onOpenChange={setIsDeleteScheduleDialogOpen}
      >
        {/* Dialog Content */}
        <DialogContent className="sm:max-w-[425px]">
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be
              undone. This will permanently delete the schedule.
            </DialogDescription>
          </DialogHeader>

          {/* Dialog Footer */}
          <DialogFooter>
            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={() => setIsDeleteScheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            {/* Delete Button */}
            <Button variant="destructive" onClick={deleteSchedule}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE STUDIO */}
      <Dialog
        open={isStudioDialogOpen.create}
        onOpenChange={(open) => {
          setIsStudioDialogOpen({ create: open });
          if (!open) {
            studioForm.reset();
          }
        }}
      >
        {/* Dialog Content */}
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Create New Studio</DialogTitle>
            <DialogDescription>
              Add new studio. Click save when done.
            </DialogDescription>
          </DialogHeader>
          {/* Form */}
          <Form {...studioForm}>
            <form
              onSubmit={studioForm.handleSubmit(handleCreateStudio)}
              className="space-y-8"
            >
              {/* Studio Name */}
              <FormField
                control={studioForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Studio Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Studio Description */}
              <FormField
                control={studioForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Submit Button */}
              <DialogFooter>
                <Button type="submit">Create Studio</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* UPDATE STUDIO */}
      <Dialog
        open={isStudioDialogOpen.update}
        onOpenChange={(open) => {
          setIsStudioDialogOpen({ update: open });
          if (!open) {
            studioForm.reset();
          }
        }}
      >
        {/* Dialog Content */}
        <DialogContent>
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Edit Studio</DialogTitle>
            <DialogDescription>
              Edit studio. Click save when done.
            </DialogDescription>
          </DialogHeader>
          {/* Form */}
          <Form {...studioForm}>
            <form
              onSubmit={studioForm.handleSubmit(onEditStudioSubmit)}
              className="space-y-8"
            >
              {/* Studio Name */}
              <FormField
                control={studioForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Studio Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Studio Description */}
              <FormField
                control={studioForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Submit Button */}
              <DialogFooter>
                <Button type="submit">Update Studio</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* DELETE STUDIO*/}
      <Dialog
        open={isStudioDialogOpen.delete}
        onOpenChange={() =>
          setIsStudioDialogOpen({ delete: false, update: false, create: false })
        }
      >
        {/* Dialog Content */}
        <DialogContent className="sm:max-w-[425px]">
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Delete Studio</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this studio? This action cannot be
              undone. This will permanently delete the studio.
            </DialogDescription>
          </DialogHeader>
          {/* Dialog Footer */}
          <DialogFooter>
            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={() =>
                setIsStudioDialogOpen({
                  delete: false,
                  update: false,
                  create: false,
                })
              }
            >
              Cancel
            </Button>
            {/* Delete Button */}
            <Button variant="destructive" onClick={deleteStudio}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Transportation Mode Dialog */}
      <Dialog
        open={isCreateTransportationDialogOpen}
        onOpenChange={(isOpen) => {
          setIsCreateTransportationDialogOpen(isOpen);
          if (!isOpen) {
            transportationModeForm.reset();
          }
        }}
      >
        {/* Dialog Content */}
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Create New Transportation Mode</DialogTitle>
            <DialogDescription>
              Add a new transportation mode. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {/* Form */}
          <Form {...transportationModeForm}>
            <form
              onSubmit={transportationModeForm.handleSubmit(
                onCreateTransportationModeSubmit,
              )}
              className="space-y-8"
            >
              {/* Transportation Mode Name */}
              <FormField
                control={transportationModeForm.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transportation Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                {/* Transportation Mode Rate */}
                <FormField
                  control={transportationModeForm.control}
                  name="rate"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={value || ""}
                          onChange={(e) => onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Transportation Mode Per Day Value */}
                <FormField
                  control={transportationModeForm.control}
                  name="perDayValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Day Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(
                              val === "" ? undefined : parseFloat(val),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Submit Button */}
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsCreateTransportationDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Transportation Mode</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Transportation Mode Dialog */}
      <Dialog
        open={isEditTransportationDialogOpen}
        onOpenChange={(isOpen) => {
          setIsEditTransportationDialogOpen(isOpen);
          if (!isOpen) {
            transportationModeForm.reset();
          }
        }}
      >
        {/* Dialog Content */}
        <DialogContent>
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Edit Transportation Mode</DialogTitle>
            <DialogDescription>
              Edit transportation mode. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {/* Form */}
          <Form {...transportationModeForm}>
            <form
              onSubmit={transportationModeForm.handleSubmit(
                onEditTransportationModeSubmit,
              )}
              className="space-y-8"
            >
              {/* Transportation Mode Name */}
              <FormField
                control={transportationModeForm.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transportation Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Transportation Mode Rate */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={transportationModeForm.control}
                  name="rate"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={value || ""}
                          onChange={(e) => onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Transportation Mode Per Day Value */}
                <FormField
                  control={transportationModeForm.control}
                  name="perDayValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Day Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            // If empty, clear the field
                            if (val === "") {
                              field.onChange(undefined);
                            } else {
                              const parsed = parseFloat(val);
                              field.onChange(
                                isNaN(parsed) ? undefined : parsed,
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Submit Button */}
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditTransportationDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Edit Transportation Mode</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Transportation Mode Dialog */}
      <Dialog
        open={isDeleteTransportationDialogOpen}
        onOpenChange={setIsDeleteTransportationDialogOpen}
      >
        {/* Dialog Content */}
        <DialogContent className="sm:max-w-[425px]">
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Delete Transportation Mode</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transportation mode? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {/* Dialog Footer */}
          <DialogFooter>
            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={() => setIsDeleteTransportationDialogOpen(false)}
            >
              Cancel
            </Button>
            {/* Delete Button */}
            <Button variant="destructive" onClick={deleteTransportationMode}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
