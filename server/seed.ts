import { roles } from "@shared/schema";
import { db } from "./db";

/**
 * Seeds the `roles` table with predefined roles and permissions.
 * @purpose Initialize roles in the database with full CRUD permissions for admin and branch_admin.
 * 
 * @param none
 * @returns Promise<void>
 * @throws Throws error if database insertion or deletion fails
 * @sideEffects Deletes all existing roles in the `roles` table and inserts new roles
 * @example
 * await seedRoles();
 */
export const seedRoles = async () => {
    await db.delete(roles).execute();
    await db.insert(roles).values([
    {
      id: "admin",
      name: "admin",
      permissions: {
        courses: ["view", "create", "edit", "delete"],
        students: ["view", "create", "edit", "delete"],
        batches: ["view", "create", "edit", "delete"],
        schedules: ["view", "create", "edit", "delete"],
        departments: ["view", "create", "edit", "delete"],
        branches: ["view", "create", "edit", "delete"],
        brands: ["view", "create", "edit", "delete"],
        users: ["view", "create", "edit", "delete"],
        enrollments: ["view", "create", "edit", "delete"],
        employees: ["view", "create", "edit", "delete"],
        parents: ["view", "create", "edit", "delete"],
        invoices: ["view", "create", "edit", "delete"],
        payments: ["view", "create", "edit", "delete"],
        receipts: ["view", "create", "edit", "delete"],
        creditNotes: ["view", "create", "edit", "delete"],
        payroll: ["view", "create", "edit", "delete"],
        studio: ["view", "create", "edit", "delete"],
        inventory: ["view", "create", "edit", "delete"],
        transportation: ["view", "create", "edit", "delete"],
        messages: ["view", "create", "edit", "delete"],
        attendance: ["view", "create", "edit", "delete"],
      },
    },
    {
      id: "branch_admin",
      name: "branch_admin",
      permissions: {
        courses: ["view", "create", "edit", "delete"],
        students: ["view", "create", "edit", "delete"],
        batches: ["view", "create", "edit", "delete"],
        schedules: ["view", "create", "edit", "delete"],
        departments: ["view", "create", "edit", "delete"],
        branches: ["view", "create", "edit", "delete"],
        brands: ["view", "create", "edit", "delete"],
        users: ["view", "create", "edit", "delete"],
        enrollments: ["view", "create", "edit", "delete"],
        invoices: ["view", "create", "edit", "delete"],
        payments: ["view", "create", "edit", "delete"],
        receipts: ["view", "create", "edit", "delete"],
        employees: ["view", "create", "edit", "delete"],
        parents: ["view", "create", "edit", "delete"],
        creditNotes: ["view", "create", "edit", "delete"],
        payroll: ["view", "create", "edit", "delete"],
        studio: ["view", "create", "edit", "delete"],
        inventory: ["view", "create", "edit", "delete"],
        transportation: ["view", "create", "edit", "delete"],
        messages: ["view", "create", "edit", "delete"],
        attendance: ["view", "create", "edit", "delete"],
      },
    },
  ]);
};

/**
 * Immediately execute role seeding.
 * @purpose Seed roles on script execution
 * 
 * @param none
 * @returns none
 * @throws Exits process if seeding fails
 * @sideEffects Seeds roles in database and exits process
 * @example
 * node seedRoles.js
 */
seedRoles()
  .then(() => {
    console.log("Roles seeded successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding roles:", err);
    process.exit(1);
  });
