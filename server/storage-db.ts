import {
  users, User, InsertUser,
  courses, Course, InsertCourse,
  departments, Department, InsertDepartment,
  batches, Batch, InsertBatch,
  students, Student, InsertStudent,
  parents, Parent, InsertParent,
  enrollments, Enrollment, InsertEnrollment,
  studentEnrollmentFees, StudentEnrollmentFees, InsertStudentEnrollmentFees,
  attendance, Attendance, InsertAttendance,
  payments, Payment, InsertPayment,
  employees, Employee, InsertEmployee,
  payrolls, Payroll, InsertPayroll,
  messages, Message, InsertMessage,
  branches, Branch, InsertBranch,
  schedules, Schedule, InsertSchedule,
  transportation, Transportation, InsertTransportation,
  transportationMode, TransportationMode, InsertTransportationMode,
  inventory, Inventory, InsertInventory,
  studentInventory, StudentInventory, InsertStudentInventory,
  InsertStudio,
  Studio,
  studio,
  brands, Brand, InsertBrand,
  branchBrands, BranchBrand, InsertBranchBrand,
  studentCourseFee, StudentCourseFee, InsertStudentCourseFee,
  invoices, Invoice, InsertInvoice,
  invoiceItems,
  studentPayments, StudentPayment, InsertStudentPayment,
  receipts, Receipt, InsertReceipt,
  creditNotes, CreditNote, InsertCreditNote,
  paymentItems, PaymentItem, InsertPaymentItem,
  stockItem, InsertStockItem, StockItem,
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, and, like, asc, sql, or, desc, inArray } from "drizzle-orm";
import { IStorage } from "./storage";
import { hashPassword } from "./auth";
import { format } from "date-fns";

// PostgreSQL session store
const PostgresSessionStore = connectPg(session);


/**
 * @class DatabaseStorage
 * @purpose Implements the IStorage interface using a PostgreSQL database
 *          to store and manage session data. This class provides the underlying
 *          storage mechanism for session management in the application.
 *
 * @properties
 * @property {session.Store} sessionStore - An instance of a PostgreSQL-backed
 *           session store responsible for handling read/write operations
 *           for session data.
 *
 * @example
 * // Example of initializing DatabaseStorage (typically done once in your app setup)
 * const storage = new DatabaseStorage();
 * app.use(session({
 *   store: storage.sessionStore,
 *   secret: 'your_secret_key',
 *   resave: false,
 *   saveUninitialized: false,
 * }));
 */
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool, // Assumes 'pool' (e.g., pg.Pool) is defined and available in this scope
      createTableIfMissing: true,
    });
  }

  /**
   * Retrieves all users from the database.
   *
   * @purpose To provide a list of all registered users in the system.
   * @returns {Promise<User[]>} A promise that resolves to an array of User objects.
   * @sideEffects Performs a database read operation.
   * @example
   * const allUsers = await storage.getUsers();
   * allUsers.forEach(user => console.log(user.username));
   */
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  /**
   * Updates a user's password.
   *
   * @purpose To change the password for a specific user.
   * @param {string} username - The username of the user whose password is to be updated.
   * @param {string} newPassword - The new password for the user.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the password was
   *          successfully updated, `false` otherwise.
   * @sideEffects Modifies the user's password in the database.
   * @throws {Error} If the method is not yet implemented. (This should be updated
   *         once the actual implementation is provided).
   * @example
   * // Currently throws an error as it's not implemented.
   * // await storage.updateUserPassword("john_doe", "newSecurePass123");
   */
  updateUserPassword(username: string, newPassword: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  /**
   * Retrieves a single user from the database by their unique ID.
   *
   * @purpose To fetch specific user details using their identifier.
   * 
   * @param {number} id - The unique ID of the user to retrieve.
   * @returns {Promise<User | undefined>} A promise that resolves to the User object
   *          if found, otherwise `undefined`.
   * @sideEffects Performs a database read operation.
   * @example
   * const user = await storage.getUser(123);
   * if (user) { console.log(user.email); }
   */
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  /**
   * Retrieves a single user from the database by their username.
   *
   * @purpose To fetch specific user details using their unique username.
   * 
   * @param {string} username - The unique username of the user to retrieve.
   * @returns {Promise<User | undefined>} A promise that resolves to the User object
   *          if found, otherwise `undefined`.
   * @sideEffects Performs a database read operation.
   * @example
   * const adminUser = await storage.getUserByUsername("admin");
   * if (adminUser) { console.log(adminUser.role); }
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result[0];
  }

  /**
   * Retrieves all users from the database that match a specific role.
   *
   * @purpose To filter and retrieve users based on their assigned role (e.g., 'admin', 'student', 'parent').
   * 
   * @param {string} role - The role to filter users by.
   * @returns {Promise<User[]>} A promise that resolves to an array of User objects matching the role.
   * @sideEffects Performs a database read operation.
   * @example
   * const students = await storage.getUsersByRole("student");
   * students.forEach(s => console.log(s.firstName));
   */
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  /**
   * Creates a new user in the database.
   *
   * @purpose To register a new user account in the system.
   * 
   * @param {InsertUser} user - The user data to insert, excluding generated fields like `id` and `createdAt`.
   * @returns {Promise<User>} A promise that resolves to the newly created User object, including its generated ID.
   * @sideEffects Inserts a new record into the 'users' table in the database.
   * @example
   * const newUser = await storage.createUser({
   *   username: "jane.doe",
   *   email: "jane@example.com",
   *   password: "secure_password", // This would typically be hashed before insertion
   *   role: "user"
   * });
   * console.log(`New user created with ID: ${newUser.id}`);
   */
  async createUser(user: InsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        ...user,
        password: String(user.password), // Ensure password is a string
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  /**
   * Updates an existing user's information in the database.
   *
   * @purpose To modify specific fields of an existing user's profile.
   * 
   * @param {number} id - The unique ID of the user to update.
   * @param {Partial<User>} user - An object containing the fields to update and their new values.
   * @returns {Promise<User | undefined>} A promise that resolves to the updated User object
   *          if the user was found and updated, otherwise `undefined`.
   * @sideEffects Updates an existing record in the 'users' table in the database.
   * @example
   * const updatedUser = await storage.updateUser(123, { email: "new_email@example.com", role: "admin" });
   * if (updatedUser) { console.log(`User ${updatedUser.id} updated.`); }
   */
  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  /**
   * Deletes a user from the database by their unique ID.
   *
   * @purpose To remove a user's record from the system.
   * 
   * @param {number} id - The unique ID of the user to delete.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the user was
   *          successfully deleted, `false` otherwise.
   * @sideEffects Deletes a record from the 'users' table in the database.
   * @example
   * const wasDeleted = await storage.deleteUser(456);
   * if (wasDeleted) { console.log("User 456 deleted successfully."); }
   */
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  
  /**
   * Retrieves attendance records for a specific batch within a given date range.
   *
   * @purpose To track and review the attendance history for students in a particular batch over a period.
   * 
   * @param {number} batchId - The unique ID of the batch.
   * @param {Date} startDate - The start date of the range (inclusive) for filtering attendance records.
   * @param {Date} endDate - The end date of the range (inclusive) for filtering attendance records.
   * @returns {Promise<Attendance[]>} A promise that resolves to an array of Attendance objects
   *          for the specified batch and date range, ordered by date.
   * @sideEffects Performs a database read operation on the 'attendance' table.
   * 
   * @example
   * const today = new Date();
   * const lastMonth = new Date();
   * lastMonth.setMonth(today.getMonth() - 1);
   * const batchAttendance = await storage.getBatchAttendance(101, lastMonth, today);
   * batchAttendance.forEach(record => console.log(`${record.date}: ${record.status}`));
   */
  async getBatchAttendance(batchId: number, startDate: Date, endDate: Date): Promise<Attendance[]> {

    // Format dates to match PostgreSQL date format (YYYY-MM-DD)
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    // Create the query
    const query = db
      .select({
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        studentId: attendance.studentId,
        batchId: attendance.batchId,
        createdAt: attendance.createdAt,
        updatedAt: attendance.updatedAt,
        compensationBatchName: attendance.compensationBatchName,
        compensationDate: attendance.compensationDate
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.batchId, batchId),
          sql`${attendance.date}::date >= ${formattedStartDate}::date`,
          sql`${attendance.date}::date <= ${formattedEndDate}::date`
        )
      )
      .orderBy(attendance.date);

    // Execute the query
    const result = await query;
    return result;
  }

  // Course methods
  /**
   * Retrieves a single course from the database by its unique ID.
   *
   * @purpose To fetch specific course details using its identifier.
   * 
   * @param {number} id - The unique ID of the course to retrieve.
   * @returns {Promise<Course | undefined>} A promise that resolves to the Course object
   *          if found, otherwise `undefined`.
   * @sideEffects Performs a database read operation on the 'courses' table.
   * 
   * @example
   * const course = await storage.getCourse(1);
   * if (course) { console.log(course.name); }
   */
  async getCourse(id: number): Promise<Course | undefined> {
    const result = await db.select().from(courses).where(eq(courses.id, id));
    return result[0];
  }

  /**
   * Retrieves all courses from the database.
   *
   * @purpose To provide a list of all available courses in the system.
   * 
   * @returns {Promise<Course[]>} A promise that resolves to an array of Course objects.
   * @sideEffects Performs a database read operation on the 'courses' table.
   * 
   * @example
   * const allCourses = await storage.getCourses();
   * allCourses.forEach(c => console.log(c.title));
   */
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  /**
   * Retrieves all courses from the database that belong to a specific category.
   *
   * @purpose To filter and retrieve courses based on their classification (e.g., 'Music', 'Art', 'Dance').
   * 
   * @param {string} category - The category string to filter courses by.
   * @returns {Promise<Course[]>} A promise that resolves to an array of Course objects matching the category.
   * @sideEffects Performs a database read operation on the 'courses' table.
   * 
   * @example
   * const musicCourses = await storage.getCoursesByCategory("Music");
   * musicCourses.forEach(c => console.log(c.name));
   */
  async getCoursesByCategory(category: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.category, category));
  }

  /**
   * Creates a new course in the database.
   *
   * @purpose To add a new course offering to the system.
   * 
   * @param {InsertCourse} course - The course data to insert, typically excluding generated fields like `id` and `createdAt`.
   * @returns {Promise<Course>} A promise that resolves to the newly created Course object, including its generated ID.
   * @sideEffects Inserts a new record into the 'courses' table in the database.
   * 
   * @example
   * const newCourse = await storage.createCourse({
   *   name: "Introduction to Piano",
   *   category: "Music",
   *   description: "Learn basic piano techniques.",
   *   duration: "12 weeks"
   * });
   * console.log(`New course created with ID: ${newCourse.id}`);
   */
  async createCourse(course: InsertCourse): Promise<Course> {
    const result = await db
      .insert(courses)
      .values({
        ...course,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  /**
   * Updates an existing course's information in the database.
   *
   * @purpose To modify specific details of an existing course offering.
   * 
   * @param {number} id - The unique ID of the course to update.
   * @param {Partial<Course>} course - An object containing the fields to update and their new values.
   * @returns {Promise<Course | undefined>} A promise that resolves to the updated Course object
   *          if the course was found and updated, otherwise `undefined`.
   * @sideEffects Updates an existing record in the 'courses' table in the database.
   * 
   * @example
   * const updatedCourse = await storage.updateCourse(1, { description: "Advanced piano techniques." });
   * if (updatedCourse) { console.log(`Course ${updatedCourse.id} updated.`); }
   */
  async updateCourse(
    id: number,
    course: Partial<Course>
  ): Promise<Course | undefined> {
    const result = await db
      .update(courses)
      .set(course)
      .where(eq(courses.id, id))
      .returning();
    return result[0];
  }

  /**
   * Deletes a course from the database by its unique ID.
   *
   * @purpose To remove a course offering from the system.
   * 
   * @param {number} id - The unique ID of the course to delete.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the course was
   *          successfully deleted, `false` otherwise.
   * @sideEffects Deletes a record from the 'courses' table in the database.
   * 
   * @example
   * const wasDeleted = await storage.deleteCourse(2);
   * if (wasDeleted) { console.log("Course 2 deleted successfully."); }
   */
  async deleteCourse(id: number): Promise<boolean> {
    const result = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();
    return result.length > 0;
  }


  /**
   * Retrieves a single department from the database by its unique ID.
   *
   * @purpose To fetch specific department details using its identifier.
   * 
   * @param {number} id - The unique ID of the department to retrieve.
   * @returns {Promise<Department | undefined>} A promise that resolves to the Department object
   *          if found, otherwise `undefined`.
   * @sideEffects Performs a database read operation on the 'departments' table.
   * 
   * @example
   * const department = await storage.getDepartment(1);
   * if (department) { console.log(department.name); }
   */
  async getDepartment(id: number): Promise<Department | undefined> {
    const result = await db
      .select()
      .from(departments)
      .where(eq(departments.id, id));
    return result[0];
  }

  /**
   * Retrieves all departments from the database.
   *
   * @purpose To provide a list of all defined departments in the system.
   * 
   * @returns {Promise<Department[]>} A promise that resolves to an array of Department objects.
   * @sideEffects Performs a database read operation on the 'departments' table.
   * 
   * @example
   * const allDepartments = await storage.getDepartments();
   * allDepartments.forEach(dept => console.log(dept.name));
   */
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }


  /**
   * Creates a new department in the database.
   *
   * @purpose To add a new organizational department to the system.
   * 
   * @param {InsertDepartment} department - The department data to insert, typically excluding generated fields like `id` and `createdAt`.
   * @returns {Promise<Department>} A promise that resolves to the newly created Department object, including its generated ID.
   * @sideEffects Inserts a new record into the 'departments' table in the database.
   * 
   * @example
   * const newDepartment = await storage.createDepartment({ name: "Music Department", description: "Handles all music-related courses." });
   * console.log(`New department created with ID: ${newDepartment.id}`);
   */
  async createDepartment(department: InsertDepartment): Promise<Department> {
    const result = await db
      .insert(departments)
      .values({
        ...department,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  /**
   * Updates an existing department's information in the database.
   *
   * @purpose To modify specific details of an existing department.
   * 
   * @param {number} id - The unique ID of the department to update.
   * @param {Partial<Department>} department - An object containing the fields to update and their new values.
   * @returns {Promise<Department | undefined>} A promise that resolves to the updated Department object
   *          if the department was found and updated, otherwise `undefined`.
   * @sideEffects Updates an existing record in the 'departments' table in the database.
   * 
   * @example
   * const updatedDepartment = await storage.updateDepartment(1, { description: "Updated description for Music Department." });
   * if (updatedDepartment) { console.log(`Department ${updatedDepartment.id} updated.`); }
   */
  async updateDepartment(
    id: number,
    department: Partial<Department>
  ): Promise<Department | undefined> {
    const result = await db
      .update(departments)
      .set(department)
      .where(eq(departments.id, id))
      .returning();
    return result[0];
  }

  /**
   * Deletes a department from the database by its unique ID.
   *
   * @purpose To remove a department record from the system.
   * 
   * @param {number} id - The unique ID of the department to delete.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the department was
   *          successfully deleted, `false` otherwise.
   * @sideEffects Deletes a record from the 'departments' table in the database.
   * 
   * @example
   * const wasDeleted = await storage.deleteDepartment(2);
   * if (wasDeleted) { console.log("Department 2 deleted successfully."); }
   */
  async deleteDepartment(id: number): Promise<boolean> {
    const result = await db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning();
    return result.length > 0;
  }

  /**
   * Retrieves all brands from the database.
   *
   * @purpose To provide a list of all registered brands in the system.
   * 
   * @returns {Promise<Brand[]>} A promise that resolves to an array of Brand objects.
   * @sideEffects Performs a database read operation on the 'brands' table.
   * 
   * @example
   * const allBrands = await storage.getBrands();
   * allBrands.forEach(brand => console.log(brand.name));
   */
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands);
  }

  /**
   * Retrieves a single brand from the database by its unique ID.
   *
   * @purpose To fetch specific brand details using its identifier.
   * 
   * @param {number} id - The unique ID of the brand to retrieve.
   * @returns {Promise<Brand | undefined>} A promise that resolves to the Brand object
   *          if found, otherwise `undefined`.
   * @sideEffects Performs a database read operation on the 'brands' table.
   * 
   * @example
   * const brand = await storage.getBrand(1);
   * if (brand) { console.log(brand.logoUrl); }
   */
  async getBrand(id: number): Promise<Brand | undefined> {
    const result = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id));
    return result[0];
  }

  /**
   * Creates a new brand in the database.
   *
   * @purpose To add a new brand entity to the system.
   * 
   * @param {InsertBrand} brand - The brand data to insert, typically excluding generated fields like `id` and `createdAt`.
   * @returns {Promise<Brand>} A promise that resolves to the newly created Brand object, including its generated ID.
   * @sideEffects Inserts a new record into the 'brands' table in the database.
   * 
   * @example
   * const newBrand = await storage.createBrand({ name: "MusicMaster", logoUrl: "https://example.com/logo.png" });
   * console.log(`New brand created with ID: ${newBrand.id}`);
   */
  async createBrand(brand: InsertBrand): Promise<Brand> {
    const result = await db
      .insert(brands)
      .values({
        ...brand,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  /**
   * Updates an existing brand's information in the database.
   *
   * @purpose To modify specific details of an existing brand.
   * 
   * @param {number} id - The unique ID of the brand to update.
   * @param {Partial<Brand>} brand - An object containing the fields to update and their new values.
   * @returns {Promise<Brand | undefined>} A promise that resolves to the updated Brand object
   *          if the brand was found and updated, otherwise `undefined`.
   * @sideEffects Updates an existing record in the 'brands' table in the database.
   * 
   * @example
   * const updatedBrand = await storage.updateBrand(1, { name: "MusicPro", website: "https://musicpro.com" });
   * if (updatedBrand) { console.log(`Brand ${updatedBrand.id} updated.`); }
   */
  async updateBrand(
    id: number,
    brand: Partial<Brand>
  ): Promise<Brand | undefined> {
    const result = await db
      .update(brands)
      .set(brand)
      .where(eq(brands.id, id))
      .returning();
    return result[0];
  }


  /**
   * Updates an existing brand's information in the database.
   *
   * @purpose To modify specific details of an existing brand.
   * 
   * @param {number} id - The unique ID of the brand to update.
   * @param {Partial<Brand>} brand - An object containing the fields to update and their new values.
   * @returns {Promise<Brand | undefined>} A promise that resolves to the updated Brand object
   *          if the brand was found and updated, otherwise `undefined`.
   * @sideEffects Updates an existing record in the 'brands' table in the database.
   * 
   * @example
   * const updatedBrand = await storage.updateBrand(1, { name: "MusicPro", website: "https://musicpro.com" });
   * if (updatedBrand) { console.log(`Brand ${updatedBrand.id} updated.`); }
   */
  async deleteBrand(id: number): Promise<boolean> {
    const result = await db
      .delete(brands)
      .where(eq(brands.id, id))
      .returning();
    return result.length > 0;
  }

  // Schedule methods
  
  /**
  * Retrieves a single schedule entry from the database by its unique ID.
  *
  * @purpose To fetch specific details of a particular class or event schedule.
  * 
  * @param {number} id - The unique ID of the schedule entry to retrieve.
  * @returns {Promise<Schedule | undefined>} A promise that resolves to the Schedule object
  *          if found, otherwise `undefined`.
  * @sideEffects Performs a database read operation on the 'schedules' table.
  * 
  * @example
  * const scheduleEntry = await storage.getSchedule(10);
  * if (scheduleEntry) { console.log(`Schedule on ${scheduleEntry.day} at ${scheduleEntry.startTime}`); }
  */
  async getSchedule(id: number): Promise<Schedule | undefined> {
    const result = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, id));
    return result[0];
  }

  /**
   * Retrieves all schedule entries from the database.
   *
   * @purpose To provide a comprehensive list of all scheduled classes, events, or appointments.
   * 
   * @returns {Promise<Schedule[]>} A promise that resolves to an array of Schedule objects.
   * @sideEffects Performs a database read operation on the 'schedules' table.
   * 
   * @example
   * const allSchedules = await storage.getSchedules();
   * allSchedules.forEach(s => console.log(`${s.day}: ${s.startTime}-${s.endTime}`));
   */
  async getSchedules(): Promise<Schedule[]> {
    return await db.select().from(schedules);
  }

  /**
   * Creates a new schedule entry in the database.
   *
   * @purpose To add a new scheduled class, event, or appointment to the system.
   * 
   * @param {InsertSchedule} schedule - The schedule data to insert, including day, time, batch ID, and duration.
   * @returns {Promise<Schedule>} A promise that resolves to the newly created Schedule object, including its generated ID.
   * @sideEffects Inserts a new record into the 'schedules' table in the database.
   * 
   * @example
   * const newSchedule = await storage.createSchedule({
   *   day: "Monday",
   *   startTime: "09:00",
   *   endTime: "10:00",
   //   batchId: 5,
   *   duration: 60
   * });
   * console.log(`New schedule created for batch ${newSchedule.batchId} on ${newSchedule.day}.`);
   */
  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const result = await db.insert(schedules).values({
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      batchId: schedule.batchId,
      duration: schedule.duration,
      createdAt: new Date()
    }).returning();
    return result[0];
  }


  /**
   * Updates an existing schedule entry's information in the database.
   *
   * @purpose To modify specific details of an existing schedule entry.
   * 
   * @param {number} id - The unique ID of the schedule entry to update.
   * @param {Partial<Schedule>} schedule - An object containing the fields to update and their new values.
   * @returns {Promise<Schedule | undefined>} A promise that resolves to the updated Schedule object
   *          if the entry was found and updated, otherwise `undefined`.
   * @sideEffects Updates an existing record in the 'schedules' table in the database.
   * 
   * @example
   * const updatedSchedule = await storage.updateSchedule(10, { endTime: "10:30", duration: 90 });
   * if (updatedSchedule) { console.log(`Schedule ${updatedSchedule.id} end time updated.`); }
   */
  async updateSchedule(
    id: number,
    schedule: Partial<Schedule>
  ): Promise<Schedule | undefined> {
    const result = await db
      .update(schedules)
      .set(schedule)
      .where(eq(schedules.id, id))
      .returning();
    return result[0];
  }

  /**
   * Deletes a single schedule entry from the database by its unique ID.
   *
   * @purpose To remove a specific scheduled class or event.
   * 
   * @param {number} id - The unique ID of the schedule entry to delete.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the schedule entry was
   *          successfully deleted, `false` otherwise.
   * @sideEffects Deletes a record from the 'schedules' table in the database.
   * 
   * @example
   * const wasDeleted = await storage.deleteSchedule(11);
   * if (wasDeleted) { console.log("Schedule entry 11 deleted successfully."); }
   */
  async deleteSchedule(id: number): Promise<boolean> {
    const result = await db
      .delete(schedules)
      .where(eq(schedules.id, id))
      .returning();
    return result.length > 0;
  }

  /**
   * Deletes all schedule entries associated with a specific batch.
   *
   * @purpose To remove all scheduled classes or events for a given batch, for example, when a batch is discontinued.
   * 
   * @param {number} batchId - The unique ID of the batch whose schedules are to be deleted.
   * @returns {Promise<boolean>} A promise that resolves to `true` if any schedule entries were
   *          successfully deleted, `false` otherwise.
   * @sideEffects Deletes multiple records from the 'schedules' table in the database.
   * 
   * @example
   * const wereBatchSchedulesDeleted = await storage.deleteBatchSchedule(5);
   * if (wereBatchSchedulesDeleted) { console.log("All schedules for batch 5 deleted."); }
   */
  async deleteBatchSchedule(id: number): Promise<boolean> {
    const result = await db
      .delete(schedules)
      .where(eq(schedules.batchId, id))
      .returning();
    return result.length > 0;
  }

  /**
   * Creates a new studio entry in the database.
   *
   * @purpose To register a new physical studio or practice space in the system.
   * 
   * @param {InsertStudio} stud - The studio data to insert, typically excluding generated fields like `id`.
   * @returns {Promise<Studio>} A promise that resolves to the newly created Studio object, including its generated ID.
   * @sideEffects Inserts a new record into the 'studio' table in the database.
   * 
   * @example
   * const newStudio = await storage.createStudio({ name: "Studio Alpha", location: "Building A, Room 101" });
   * console.log(`New studio created with ID: ${newStudio.id}`);
   */
  async createStudio(stud: InsertStudio): Promise<Studio> {
    const result = await db.insert(studio).values(stud).returning();
    return result[0];
  }

  /**
   * Retrieves all studio entries from the database.
   *
   * @purpose To provide a list of all registered studios or practice spaces.
   * 
   * @returns {Promise<Studio[]>} A promise that resolves to an array of Studio objects.
   * @sideEffects Performs a database read operation on the 'studio' table.
   * 
   * @example
   * const allStudios = await storage.getStudios();
   * allStudios.forEach(s => console.log(s.name));
   */
  async getStudios(): Promise<Studio[]> {
    return await db.select().from(studio);
  }

  /**
   * Retrieves a single studio from the database by its unique ID.
   *
   * @purpose To fetch specific details of a particular studio.
   * 
   * @param {number} id - The unique ID of the studio to retrieve.
   * @returns {Promise<Studio | undefined>} A promise that resolves to the Studio object
   *          if found, otherwise `undefined`.
   * @sideEffects Performs a database read operation on the 'studio' table.
   * 
   * @example
   * const studio = await storage.getStudio(5);
   * if (studio) { console.log(`Found studio: ${studio.name}`); }
   */
  async getStudio(id: number): Promise<Studio | undefined> {
    const result = await db
      .select()
      .from(studio)
      .where(eq(studio.id, id));
    return result[0];
  }


  /**
   * Updates an existing studio's information in the database.
   *
   * @purpose To modify specific details of a registered studio.
   * 
   * @param {number} id - The unique ID of the studio to update.
   * @param {Partial<Studio>} studiodata - An object containing the fields to update and their new values.
   * @returns {Promise<Studio | undefined>} A promise that resolves to the updated Studio object
   *          if the studio was found and updated, otherwise `undefined`.
   * @sideEffects Updates an existing record in the 'studio' table in the database.
   * 
   * @example
   * const updatedStudio = await storage.updateStudio(5, { location: "Building B, Room 202" });
   * if (updatedStudio) { console.log(`Studio ${updatedStudio.id} location updated.`); }
   */
  async updateStudio(
    id: number,
    studiodata: Partial<Studio>
  ): Promise<Studio | undefined> {
    const result = await db
      .update(studio)
      .set(studiodata)
      .where(eq(studio.id, id))
      .returning();
    return result[0];
  }


  /**
   * Deletes a studio from the database by its unique ID.
   *
   * @purpose To remove a studio record from the system.
   * 
   * @param {number} id - The unique ID of the studio to delete.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the studio was
   *          successfully deleted, `false` otherwise.
   * @sideEffects Deletes a record from the 'studio' table in the database.
   * 
   * @example
   * const wasDeleted = await storage.deleteStudio(6);
   * if (wasDeleted) { console.log("Studio 6 deleted successfully."); }
   */
  async deleteStudio(id: number): Promise<boolean> {
    const result = await db
      .delete(studio)
      .where(eq(studio.id, id))
      .returning();
    return result.length > 0;
  }

  // Batch methods

  /**
   * Retrieves a single batch from the database by its unique ID,
   * including all associated schedule entries.
   *
   * @purpose To fetch comprehensive details for a specific batch,
   *          including its scheduled class times.
   * 
   * @param {number} id - The unique ID of the batch to retrieve.
   * @returns {Promise<(Batch & { schedules: Schedule[] }) | undefined>} A promise that
   *          resolves to the Batch object extended with an array of its Schedule objects
   *          if found, otherwise `undefined`.
   * @sideEffects Performs database read operations on the 'batches' and 'schedules' tables.
   * 
   * @example
   * const batchWithSchedules = await storage.getBatch(10);
   * if (batchWithSchedules) {
   *   console.log(`Batch: ${batchWithSchedules.name}, Schedules:`);
   *   batchWithSchedules.schedules.forEach(s => console.log(`- ${s.day} ${s.startTime}`));
   * }
   */
  async getBatch(id: number): Promise<(Batch & { schedules: Schedule[] }) | undefined> {
    const batchResults = await db.select().from(batches).where(eq(batches.id, id));
    const scheduleResults = await db.select().from(schedules).where(eq(schedules.batchId, id));
    return {
      ...batchResults[0],
      schedules: scheduleResults
    };
  }


  /**
   * Retrieves all batches from the database, each including its associated schedule entries.
   *
   * @purpose To provide a comprehensive list of all defined batches in the system,
   *          along with their full schedules.
   * 
   * @returns {Promise<(Batch & { schedules: Schedule[] })[]>} A promise that resolves to an
   *          array of Batch objects, each extended with an array of its Schedule objects.
   * @sideEffects Performs database read operations on the 'batches' and 'schedules' tables.
   * 
   * @example
   * const allBatchesWithSchedules = await storage.getBatches();
   * allBatchesWithSchedules.forEach(batch => {
   *   console.log(`Batch: ${batch.name} (${batch.courseId})`);
   *   batch.schedules.forEach(s => console.log(`  - ${s.day} ${s.startTime}`));
   * });
   */
  async getBatches(): Promise<(Batch & { schedules: Schedule[] })[]> {
    const batchResults = await db.select().from(batches);

    // Get all schedules in one query
    const allSchedules = await db.select().from(schedules);

    // Map schedules to batches
    return batchResults.map(batch => ({
      ...batch,
      schedules: allSchedules.filter(s => s.batchId === batch.id)
    }));
  }


  /**
   * Retrieves all batches associated with a specific course.
   *
   * @purpose To find all batches that are part of a particular course offering.
   * 
   * @param {number} courseId - The unique ID of the course to filter batches by.
   * @returns {Promise<Batch[]>} A promise that resolves to an array of Batch objects
   *          associated with the given course ID.
   * @sideEffects Performs a database read operation on the 'batches' table.
   * 
   * @example
   * const pianoBatches = await storage.getBatchesByCourse(1);
   * pianoBatches.forEach(b => console.log(b.name));
   */
  async getBatchesByCourse(courseId: number): Promise<Batch[]> {
    return await db
      .select()
      .from(batches)
      .where(eq(batches.courseId, courseId));
  }


  /**
   * Retrieves all batches taught by a specific teacher.
   *
   * @purpose To find all batches assigned to a particular teacher.
   * 
   * @param {number} teacherId - The unique ID of the teacher to filter batches by.
   * @returns {Promise<Batch[]>} A promise that resolves to an array of Batch objects
   *          associated with the given teacher ID.
   * @sideEffects Performs a database read operation on the 'batches' table.
   * 
   * @example
   * const teacher1Batches = await storage.getBatchesByTeacher(201);
   * teacher1Batches.forEach(b => console.log(b.name));
   */
  async getBatchesByTeacher(teacherId: number): Promise<Batch[]> {
    return await db
      .select()
      .from(batches)
      .where(eq(batches.teacherId, teacherId));
  }


  /**
   * Retrieves all batches associated with a specific branch, including their schedules.
   *
   * @purpose To fetch all batches offered by a given branch, providing full details
   *          including all scheduled class times for each batch.
   * 
   * @param {string} branch - The name of the branch to filter batches by.
   * @returns {Promise<(Batch & { schedules: Schedule[] })[]>} A promise that resolves to an
   *          array of Batch objects, each extended with an array of its Schedule objects,
   *          for the specified branch.
   * @sideEffects Performs database read operations on the 'batches' and 'schedules' tables.
   * 
   * @example
   * const mainBranchBatches = await storage.getBatchesByBranch("Main Branch");
   * mainBranchBatches.forEach(batch => {
   *   console.log(`Branch: ${batch.branch}, Batch: ${batch.name}`);
   *   batch.schedules.forEach(s => console.log(`  - ${s.day} ${s.startTime}`));
   * });
   */
  async getBatchesByBranch(branch: string): Promise<(Batch & { schedules: Schedule[] })[]> {
    const batchResults = await db
      .select()
      .from(batches)
      .where(eq(batches.branch, branch));

    const batchIds = batchResults.map(b => b.id);

    const scheduleResults = await db
      .select()
      .from(schedules)
      .where(inArray(schedules.batchId, batchIds));

    // Group schedules by batchId
    const schedulesByBatchId: Record<number, Schedule[]> = {};
    for (const schedule of scheduleResults) {
      if (!schedulesByBatchId[schedule.batchId]) {
        schedulesByBatchId[schedule.batchId] = [];
      }
      schedulesByBatchId[schedule.batchId].push(schedule);
    }

    // Merge schedules into batches
    const batchesWithSchedules = batchResults.map(batch => ({
      ...batch,
      schedules: schedulesByBatchId[batch.id] || [],
    }));

    return batchesWithSchedules;
  }

  /**
   * Creates a new batch in the database.
   *
   * @purpose To add a new group of students for a specific course and schedule.
   * 
   * @param {InsertBatch} batch - The batch data to insert, typically excluding generated fields like `id` and `createdAt`.
   * @returns {Promise<Batch>} A promise that resolves to the newly created Batch object, including its generated ID.
   * @sideEffects Inserts a new record into the 'batches' table in the database.
   * 
   * @example
   * const newBatch = await storage.createBatch({
   *   name: "Beginner Piano - Mon/Wed",
   *   courseId: 1,
   *   teacherId: 201,
   *   branch: "Main Branch",
   * });
   * console.log(`New batch created with ID: ${newBatch.id}`);
   */
  async createBatch(batch: InsertBatch): Promise<Batch> {
    const result = await db.insert(batches).values({
      ...batch,
      status: batch.status || "active",
      roomNumber: batch.roomNumber || null,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  /**
   * Updates an existing batch's information in the database.
   *
   * @purpose To modify specific details of an existing batch, such as its teacher, status, or room.
   * 
   * @param {number} id - The unique ID of the batch to update.
   * @param {Partial<Batch>} batch - An object containing the fields to update and their new values.
   * @returns {Promise<Batch | undefined>} A promise that resolves to the updated Batch object
   *          if the batch was found and updated, otherwise `undefined`.
   * @sideEffects Updates an existing record in the 'batches' table in the database.
   * 
   * @example
   * const updatedBatch = await storage.updateBatch(10, { status: "inactive", roomNumber: "S5" });
   * if (updatedBatch) { console.log(`Batch ${updatedBatch.id} updated.`); }
   */
  async updateBatch(
    id: number,
    batch: Partial<Batch>
  ): Promise<Batch | undefined> {
    const result = await db
      .update(batches)
      .set(batch)
      .where(eq(batches.id, id))
      .returning();
    return result[0];
  }


  /**
   * Deletes a batch from the database by its unique ID.
   *
   * @purpose To remove a batch record from the system, typically when a batch is no longer needed.
   * 
   * @param {number} id - The unique ID of the batch to delete.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the batch was
   *          successfully deleted, `false` otherwise.
   * @sideEffects Deletes a record from the 'batches' table in the database.
   * 
   * @example
   * const wasDeleted = await storage.deleteBatch(11);
   * if (wasDeleted) { console_log("Batch 11 deleted successfully."); }
   */
  async deleteBatch(id: number): Promise<boolean> {
    const result = await db
      .delete(batches)
      .where(eq(batches.id, id))
      .returning();
    return result.length > 0;
  }

  // Student methods

  /**
   * Retrieves a single student from the database by their unique internal ID.
   *
   * @purpose To fetch specific student details using the internal database identifier.
   * 
   * @param {number} id - The unique internal ID of the student to retrieve.
   * @returns {Promise<Student | undefined>} A promise that resolves to the Student object
   *          if found, otherwise `undefined`.
   * @sideEffects Performs a database read operation on the 'students' table.
   * 
   * @example
   * const student = await storage.getStudent(15);
   * if (student) { console.log(student.firstName); }
   */
  async getStudent(id: number): Promise<Student | undefined> {
    const result = await db.select().from(students).where(eq(students.id, id));
    return result[0];
  }

  /**
   * Retrieves a single student from the database by their external student ID.
   *
   * @purpose To fetch specific student details using their unique external student identifier.
   * 
   * @param {string} studentId - The unique external student ID of the student to retrieve.
   * @returns {Promise<Student | undefined>} A promise that resolves to the Student object
   *          if found, otherwise `undefined`.
   * @sideEffects Performs a database read operation on the 'students' table.
   * 
   * @example
   * const studentByExternalId = await storage.getStudentByStudentId("S001");
   * if (studentByExternalId) { console.log(studentByExternalId.fullName); }
   */
  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const result = await db
      .select()
      .from(students)
      .where(eq(students.studentId, studentId));
    return result[0];
  }

  /**
   * Retrieves all active or inactive students from the database.
   *
   * @purpose To provide a list of all students who are currently active or were active previously,
   *          excluding any other potential statuses.
   * 
   * @returns {Promise<Student[]>} A promise that resolves to an array of Student objects with 'active' or 'inactive' status.
   * @sideEffects Performs a database read operation on the 'students' table.
   * 
   * @example
   * const allStudents = await storage.getStudents();
   * allStudents.forEach(s => console.log(`${s.firstName} (${s.status})`));
   */
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).where(or(eq(students.status, 'active'), eq(students.status, 'inactive')));
  }

  /**
   * Retrieves all students associated with a specific parent.
   *
   * @purpose To find all children linked to a particular parent account.
   * 
   * @param {number} parentId - The unique ID of the parent to filter students by.
   * @returns {Promise<Student[]>} A promise that resolves to an array of Student objects
   *          associated with the given parent ID.
   * @sideEffects Performs a database read operation on the 'students' table.
   * 
   * @example
   * const parentChildren = await storage.getStudentsByParent(100);
   * parentChildren.forEach(child => console.log(child.firstName));
   */
  async getStudentsByParent(parentId: number): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(eq(students.parentId, parentId));
  }

  
  /**
   * Retrieves specific details of students associated with a given parent.
   * This method performs an inner join between the 'students' and 'parents' tables
   * and selectively returns a subset of student fields for the specified parent.
   *
   * @purpose To provide a concise list of a parent's children, including key student identifiers
   *          and demographic information, suitable for display in a parent dashboard.
   * 
   * @param {number} parentId - The unique ID of the parent whose students are to be retrieved.
   * @returns {Promise<Array<{
  *   studentIds: number;
  *   studentId: string;
  *   studentFirstName: string;
  *   studentMiddleName: string | null;
  *   studentLastName: string;
  *   studentDateOfBirth: Date;
  *   studentAge: number;
  *   studentGender: 'Male' | 'Female' | 'Other';
  *   studentStatus: 'active' | 'inactive';
  * }>>} A promise that resolves to an array of objects, each containing
  *          selected student details for the given parent.
  * @sideEffects Performs a database read operation with an inner join on 'students' and 'parents' tables.
  * 
  * @example
  * const parentChildrenDetails = await storage.getStudentsWithParents(100);
  * parentChildrenDetails.forEach(child => {
  *   console.log(`${child.studentFirstName} ${child.studentLastName} (Age: ${child.studentAge})`);
  * });
  */  
  async getStudentsWithParents(parentId: number) {
    return await db
      .select({
        studentIds: students.id,
        studentId: students.studentId,
        studentFirstName: students.firstName,
        studentMiddleName: students.middleName,
        studentLastName: students.lastName,
        studentDateOfBirth: students.dateOfBirth,
        studentAge: students.age,
        studentGender: students.gender,
        studentStatus: students.status,
      })
      .from(students)
      .innerJoin(parents, eq(parents.userId, students.parentId))
      .where(eq(students.parentId, parentId));
  }


  /**
  * Retrieve all students who are enrolled in batches of a specific branch.
  *
  * @purpose To fetch all students enrolled in batches of a specific branch.
  * 
  * @param branchId - The ID of the branch to fetch students for.
  * @returns A promise that resolves to an array of `Student` objects enrolled in the branch.
  * @throws Throws an error if database queries fail.
  * @sideEffects None. This method only reads data.
  * 
  * @example
  * const students = await storage.getStudentsByBranch("branch123");
  * console.log(students.length); // Outputs number of students in the branch
  */
  async getStudentsByBranch(branchId: string): Promise<Student[]> {
    // Step 1: Get batch IDs for the branch
    const batchesForBranch = await db
      .select({ id: batches.id })
      .from(batches)
      .where(eq(batches.branch, branchId));

    const batchIds = batchesForBranch.map((b) => b.id);
    if (batchIds.length === 0) return [];

    // Step 2: Get enrollments for those batch IDs
    const enrollmentsForBatch = await db
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .where(inArray(enrollments.batchId, batchIds));

    const studentIds = enrollmentsForBatch.map((e) => e.studentId);
    if (studentIds.length === 0) return [];

    // Step 3: Get students with status filter
    const studentsInBranch = await db
      .select()
      .from(students)
      .where(
        and(
          inArray(students.id, studentIds),
          or(
            eq(students.status, 'active'),
            eq(students.status, 'inactive')
          )
        )
      );

    return studentsInBranch;
  }

  /**
  * Retrieve a list of students along with the branches they are associated with.
  *
  * @purpose To fetch a list of students along with the branches they are associated with.
  * 
  * @returns A promise that resolves to an array of objects, each containing:
  * - `student_id`: ID of the student
  * - `first_name`: First name of the student
  * - `branch_id`: ID of the associated branch
  * - `branch_name`: Name of the branch
  * - `status`: Status of the student ("active", "inactive", etc.)
  * @throws Throws an error if the database query fails.
  * @sideEffects None. This method only reads data from the database.
    * @example
  * const studentsWithBranch = await storage.getStudentsWithBranch();
  * studentsWithBranch.forEach(s => {
  *   console.log(`${s.first_name} belongs to branch ${s.branch_name}`);
  * });
  */
  async getStudentsWithBranch() {
    const result = await db
      .selectDistinct({
        student_id: students.id,
        first_name: students.firstName,
        branch_id: enrollments.branchId,
        branch_name: branches.name,
        status: students.status,
      })
      .from(students)
      .leftJoin(enrollments, eq(enrollments.studentId, students.id))
      .leftJoin(branches, eq(branches.id, enrollments.branchId))

    return result;
  }


  /**
  * Retrieve all students enrolled in a specific batch.
  *
  * @purpose To fetch all students enrolled in a specific batch.
  * 
  * @param {string} batchId - The ID of the batch for which students should be retrieved.
  * @returns {Promise<Student[]>} A promise that resolves to an array of students
  *   enrolled in the specified batch. If no students are found, the array will be empty.
  * @throws Throws an error if the database query fails.
  * @sideEffects None. This method only reads data from the database.
  * 
  * @example
  * const studentsInBatch = await storage.getStudentsByBatch("3");
  * studentsInBatch.forEach(student => {
  *   console.log(student.firstName, student.lastName);
  * });
  */
  async getStudentsByBatch(batchId: string): Promise<Student[]> {
    // Get enrollments for this batch
    const batchEnrollments = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.batchId, Number(batchId)));

    const studentIds = batchEnrollments.map(
      (enrollment) => enrollment.studentId
    );

    // Get the students
    return await db
      .select()
      .from(students)
      .where(sql`${students.id} = ANY(${studentIds})`);
  }


  /**
  * Get the total number of active students enrolled in a specific batch.
  *
  * @purpose To fetch the total number of active students enrolled in a specific batch.
  * 
  * @param {number} batchId - The ID of the batch.
  * @returns {Promise<number>} A promise that resolves to the number of active students in the batch. Returns 0 if no students are found.
  * @throws Throws an error if the database query fails.
  * @sideEffects None. This method only reads data from the database.
  * 
  * @example
  * const count = await storage.getStudentCountByBatch(5);
  * console.log(`Total students in batch: ${count}`);
  */
  async getStudentCountByBatch(batchId: number): Promise<number> {
    const result = await db
      .select({
        student_count: sql<number>`COUNT(DISTINCT ${enrollments.studentId})`,
      })
      .from(enrollments)
      .where(and(eq(enrollments.batchId, batchId), eq(enrollments.status, 'active')));

    return result[0]?.student_count ?? 0;
  }


  /**
  * Get the total number of courses a student is enrolled in.
  * This method counts all enrollments for a given student ID.
  *
  * @purpose To fetch the total number of courses a student is enrolled in.
  * 
  * @param {number} studentId - The ID of the student.
  * @returns {Promise<number>} A promise that resolves to the total number of course the student is enrolled in. Returns 0 if the student has no enrollments.
  * @throws Throws an error if the database query fails.
  * @sideEffects None. This method only reads data from the database.
  * 
  * @example
  * const courseCount = await storage.getStudentCourseCount(12);
  * console.log(`Student is enrolled in ${courseCount} courses.`);
  */
  async getStudentCourseCount(studentId: number): Promise<number> {
    const result = await db
      .select({
        courseCount: sql<number>`COUNT(*)`,
      })
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId))
      .groupBy(enrollments.studentId);

    return result[0]?.courseCount ?? 0;
  }


  /**
  * Fetches detailed course and batch information for all students
  * associated with a specific parent.
  *
  * @purpose To fetch detailed course and batch information for all students
  * associated with a specific parent.
  *
  * @param {number} parentId - The ID of the parent whose students' details are fetched.
  * @returns {Promise<Array>} A promise that resolves to an array of students with nested course and batch information, including schedules.
  * @throws Throws an error if the database query fails.
  * @sideEffects None. This method only reads data from the database.
  *
  * @example
  * const details = await storage.getStudentCourseDetails(15);
  * console.log(details[0].courses[0].batches[0].schedule);
  */
  async getStudentCourseDetails(parentId: number) {
    const result = await db
      .select({
        studentId: students.id,
        student: students.firstName,
        parentFirstName: parents.firstName,
        parentMiddleName: parents.middleName,
        parentLastName: parents.lastName,
        batchName: batches.name,
        courseName: courses.name,
        day: schedules.day,
        startTime: schedules.startTime,
        endTime: schedules.endTime
      })
      .from(students)
      .innerJoin(parents, eq(parents.userId, students.parentId))
      .innerJoin(enrollments, eq(students.id, enrollments.studentId))
      .innerJoin(courses, eq(courses.id, enrollments.courseId))
      .innerJoin(batches, eq(batches.id, enrollments.batchId))
      .innerJoin(schedules, eq(schedules.batchId, batches.id))
      .where(and(eq(students.parentId, parentId), eq(enrollments.status, 'active')));

    const grouped = result.reduce((acc, row) => {
      const key = row.studentId;
      if (!acc[key]) {
        acc[key] = {
          studentId: row.studentId,
          student: row.student,
          parentFirstName: row.parentFirstName,
          parentMiddleName: row.parentMiddleName,
          parentLastName: row.parentLastName,
          courses: [],
          // day: row.day,
          // startTime: row.startTime,
          // endTime: row.endTime
        };
      }
      const alreadyExists = acc[key].courses.some(
        (c: any) => c.courseName === row.courseName && c.batchName === row.batchName
      );

      let courseEntry = acc[key].courses.find(
        (c: any) => c.courseName === row.courseName
      );

      if (!courseEntry) {
        courseEntry = {
          courseName: row.courseName,
          batches: [],
        };
        acc[key].courses.push(courseEntry);
      }

      let batchEntry = courseEntry.batches.find(
        (b: any) => b.batchName === row.batchName
      );

      if (!batchEntry) {
        batchEntry = {
          batchName: row.batchName,
          schedule: [],
        };
        courseEntry.batches.push(batchEntry);
      }

      batchEntry.schedule.push({
        day: row.day,
        startTime: row.startTime,
        endTime: row.endTime,
      });

      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped);
  }


  /**
  * Creates a new student record in the database.
  *
  * @purpose To create a new student record in the database.
  * 
  * @param {InsertStudent} student - The student data to insert.
  * @returns {Promise<Student>} A promise that resolves to the newly created student record.
  * @throws Throws an error if the database insert fails.
  * @sideEffects Inserts a new record into the 'students' table.
  * 
  * @example
  * const newStudent = await storage.createStudent({
  *   studentId: "S123",
  *   firstName: "John",
  *   lastName: "Doe",
  *   parentId: 5
  * });
  * console.log(newStudent.id); // Newly created student ID
  */
  async createStudent(student: InsertStudent): Promise<Student> {
    const result = await db.insert(students).values({
      studentId: student.studentId,
      firstName: student.firstName,
      middleName: student.middleName ?? null,
      lastName: student.lastName,
      parentId: student.parentId,
      email: student.email ?? null,
      phone: student.phone ?? null,
      whatsappNo: student.whatsappNo ?? null,
      residenceAddress: student.residenceAddress ?? null,
      street: student.street ?? null,
      community: student.community ?? null,
      flatNo: student.flatNo ?? null,
      dateOfBirth: student.dateOfBirth ?? null,
      age: student.age ?? null,
      gender: student.gender ?? null,
      registrationDate: student.registrationDate ?? null,
      registrationFee: student.registrationFee ?? null,
      isReRegistering: student.isReRegistering ?? "no",
      status: student.status ?? "active",
      course: student.course ?? null,
      branch: student.branch ?? null,
    }).returning();

    return result[0];
  }

  /**
  * @purpose To fetch all students whose status is "not_joined".
  * 
  * @returns {Promise<Student[]>} A promise that resolves to an array of students with the status "not_joined".
  * @throws Throws an error if the database query fails.
  * @sideEffects None. Only reads data from the database.
  * 
  * @example
  * const notJoinedStudents = await storage.getNotJoinedStudents();
  * console.log(notJoinedStudents.length);
  */
  async getNotJoinedStudents(): Promise<Student[]> {
    const result = await db.select().from(students).where(eq(students.status, 'not_joined'));
    return result;
  }


  /**
  * @purpose To update an existing student's record with the provided fields.
  * 
  * @param {number} id - The ID of the student to update.
  * @param {Partial<Student>} student - An object containing the fields to update.
  * @returns {Promise<Student | undefined>} A promise that resolves to the updated student record, or undefined if no student with the given ID exists.
  * @throws Throws an error if the database update fails.
  * @sideEffects Updates a record in the 'students' table.
  * 
  * @example
  * const updatedStudent = await storage.updateStudent(10, { status: 'active' });
  * console.log(updatedStudent?.status); // "active"
  */
  async updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined> {
    const result = await db.update(students)
      .set(student)
      .where(eq(students.id, id))
      .returning();
    return result[0];
  }


  /**
  * @purpose To delete a student record from the database.
  * 
  * @param {number} id - The ID of the student to delete.
  * @returns {Promise<boolean>} A promise that resolves to true if the student was deleted, or false if no student with the given ID exists.
  * @throws Throws an error if the database delete operation fails.
  * @sideEffects Deletes a record from the 'students' table.
  * 
  * @example
  * const wasDeleted = await storage.deleteStudent(10);
  * console.log(wasDeleted); // true or false
  */
  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id)).returning();
    return result.length > 0;
  }

  // Parent methods

  /**
  * @purpose To fetch a parent by their ID.
  * 
  * @param {number} id - The ID of the parent to retrieve.
  * @returns {Promise<Parent | undefined>} A promise that resolves to the parent record
  *               if found, or undefined if no parent exists with the given ID.
  * @throws Throws an error if the database query fails.
  * @sideEffects None. Only reads data from the database.
  * 
  * @example
  * const parent = await storage.getParent(5);
  * console.log(parent?.firstName);
  */
  async getParent(id: number): Promise<Parent | undefined> {
    const result = await db.select().from(parents).where(eq(parents.id, id));
    return result[0];
  }


  /**
  * @purpose To fetch all parents.
  * 
  * @returns {Promise<Parent[]>} A promise that resolves to an array of all parents.
  * @throws Throws an error if the database query fails.
  * @sideEffects None.
  * 
  * @example
  * const allParents = await storage.getParents();
  * console.log(allParents.length);
  */
  async getParents(): Promise<Parent[]> {
    return await db.select().from(parents);
  }


  /**
  * @purpose To fetch a parent by their associated user ID.
  * 
  * @param {number} userId - The user ID associated with the parent.
  * @returns {Promise<Parent | undefined>} A promise that resolves to the parent record
  *   if found, or undefined if no parent exists with the given user ID.
  * @throws Throws an error if the database query fails.
  * @sideEffects None.
  * 
  * @example
  * const parent = await storage.getParentByUserId(12);
  * console.log(parent?.email);
  */
  async getParentByUserId(userId: number): Promise<Parent | undefined> {
    const result = await db
      .select()
      .from(parents)
      .where(eq(parents.userId, userId));
    return result[0];
  }


  /**
  * @purpose To counts the number of students associated with a specific parent.
  * 
  * @param {number} parentId - The ID of the parent.
  * @returns {Promise<number>} A promise that resolves to the number of students linked
  *   to the parent.
  * @throws Throws an error if the database query fails.
  * @sideEffects None.
  * 
  * @example
  * const studentCount = await storage.getStudentCountByParentId(3);
  * console.log(studentCount); // e.g., 2
  */
  async getStudentCountByParentId(parentId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)`.as('StudentCount') })
      .from(students)
      .where(eq(students.parentId, parentId));

    return result[0]?.count ?? 0;
  }


  /**
  * @purpose To create a new parent and its associated user account.
  * 
  * @param {InsertParent} parent - The parent details to insert.
  * @returns {Promise<Parent>} A promise that resolves to the newly created parent record.
  * @throws Throws an error if password hashing or database insertion fails.
  * @sideEffects Inserts a new record into the 'parents' and 'users' tables.
  * 
  * @example
  * const newParent = await storage.createParent({
  *   firstName: 'Jane',
  *   middleName: 'A.',
  *   lastName: 'Doe',
  *   email: 'jane@example.com',
  *   username: 'jane_doe',
  *   password: 'password123',
  *   phone: '1234567890'
  * });
  * console.log(newParent.id);
  */
  async createParent(parent: InsertParent): Promise<Parent> {
    const hashedPassword = await hashPassword(parent.password!);
    const [user] = await db
      .insert(users)
      .values({
        username: parent.username,
        email: parent.email!,
        password: hashedPassword,
        fullName: parent.firstName + " " + parent.middleName + " " + parent.lastName,
        role: "parent",
        phone: parent.phone,
        address: parent.residenceAddress,
        branch: parent.community,
        createdAt: new Date(),
      })
      .returning();

    const result = await db
      .insert(parents)
      .values({
        ...parent,
        userId: user.id,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  /**
  * @purpose To update an existing parent's record.
  * 
  * @param {number} id - The ID of the parent to update.
  * @param {Partial<Parent>} parent - An object containing the fields to update.
  * @returns {Promise<Parent | undefined>} A promise that resolves to the updated parent
  *   record, or undefined if no parent exists with the given ID.
  * @throws Throws an error if the database update fails.
  * @sideEffects Updates a record in the 'parents' table.
  * 
  * @example
  * const updatedParent = await storage.updateParent(5, { phone: '9876543210' });
  * console.log(updatedParent?.phone);
  */
  async updateParent(
    id: number,
    parent: Partial<Parent>
  ): Promise<any | undefined> {
    console.log(parent);

    const result = await db
      .update(parents)
      .set(parent)
      .where(eq(parents.id, id))
      .returning();

    console.log(result);

    return result[0];
  }


  /**
  * @purpose To delete a parent and its associated user account.
  * 
  * @param {number} id - The ID of the parent to delete.
  * @returns {Promise<boolean>} A promise that resolves to true if the parent was deleted,
  *   or false if no parent exists with the given ID.
  * @throws Throws an error if the database deletion fails.
  * @sideEffects Deletes records from the 'parents' and 'users' tables.
  * 
  * @example
  * const wasDeleted = await storage.deleteParent(5);
  * console.log(wasDeleted); // true or false
  */
  async deleteParent(id: number): Promise<boolean> {
    const parent = await db
      .select({ userId: parents.userId })
      .from(parents)
      .where(eq(parents.id, id))
      .then((rows) => rows[0]);

    if (!parent) return false;

    await db.delete(parents).where(eq(parents.id, id));
    await db.delete(users).where(eq(users.id, parent.userId));

    return true;
  }


  /**
  * @purpose To fetches invoices for all students of a specific parent, optionally filtered by invoice status.
  * 
  * @param {number} parentId - The ID of the parent.
  * @param {string[]} [statuses] - Optional array of invoice statuses to filter by (e.g., ['paid', 'pending']).
  * @returns {Promise<any[]>} A promise that resolves to an array of invoices along with associated student details.
  * @throws Throws an error if the database query fails.
  * @sideEffects None. Only reads data from the database.
  * 
  * @example
  * const invoices = await storage.getInvoicesByParentId(3, ['paid', 'pending']);
  * console.log(invoices.length);
  */
  async getInvoicesByParentId(parentId: number, statuses?: string[]) {
    const whereClause = [
      eq(students.parentId, parentId),
      statuses && statuses.length > 0 ? inArray(invoices.status, statuses) : undefined,
    ].filter(Boolean);

    const result = await db
      .select({
        invoices: invoices,
        studentId: students.studentId,
        firstName: students.firstName,
        middleName: students.middleName,
        lastName: students.lastName,
      })
      .from(invoices)
      .innerJoin(students, eq(invoices.studentId, students.id))
      .where(and(...whereClause))
      .orderBy(invoices.id);

    return result;
  }


  /**
  * @purpose To fetches attendance records for a specific student, including the parent’s first name and batch name.
  * 
  * @param {number} studentId - The ID of the student.
  * @returns {Promise<any[]>} A promise that resolves to an array of attendance records with student and parent info.
  * @throws Throws an error if the database query fails.
  * @sideEffects Logs attendance records to the console using console.log.
  * 
  * @example
  * const attendanceRecords = await storage.getAttendanceWithParent(5);
  * console.log(attendanceRecords);
  */
  async getAttendanceWithParent(studentId: number) {
    const result = await db
      .select({
        studentId: attendance.studentId,
        date: attendance.date,
        batchName: batches.name,
        status: attendance.status,
        parentName: parents.firstName,
      })
      .from(attendance)
      .innerJoin(batches, eq(attendance.batchId, batches.id))
      .innerJoin(students, eq(attendance.studentId, students.id))
      .innerJoin(parents, eq(students.parentId, parents.userId))
      .where(eq(attendance.studentId, studentId));

    console.log("Attendance Records:", result);
    return result;
  }

  /**
  * @purpose To fetches detailed attendance records for a specific student, including parent and batch details.
  * 
  * @param {number} studentId - The ID of the student.
  * @returns {Promise<any[]>} A promise that resolves to an array of detailed attendance records.
  * @throws Throws an error if the database query fails.
  * @sideEffects None. Only reads data from the database.
  * 
  * @example
  * const attendanceDetails = await storage.getAttendanceDetailsByStudentId(5);
  * console.log(attendanceDetails);
  */
  async getAttendanceDetailsByStudentId(studentId: number) {
    const result = await db
      .select({
        studentId: attendance.studentId,
        date: attendance.date,
        batchName: batches.name,
        status: attendance.status,
        parentName: parents.firstName,
      })
      .from(attendance)
      .innerJoin(batches, eq(attendance.batchId, batches.id))
      .innerJoin(students, eq(students.id, attendance.studentId))
      .innerJoin(parents, eq(parents.userId, students.parentId))
      .where(eq(attendance.studentId, studentId));

    return result;
  }

  /**
  * @purpose To update the compensation details for a specific attendance record.
  * 
  * @param {number} attendanceId - The ID of the attendance record to update.
  * @param {string} compensationDate - The date of the compensation.
  * @param {string} compensationBatchName - The batch name for the compensation session.
  * @returns {Promise<void>} Resolves when the update is complete.
  * @throws Throws an error if the database update fails.
  * @sideEffects Updates the database record for the specified attendance.
  * 
  * @example
  * await storage.updateAttendanceCompensation(5, '2025-10-10', 'Batch A');
  */
  async updateAttendanceCompensation(attendanceId: number, compensationDate: string, compensationBatchName: string) {
    await db
      .update(attendance)
      .set({
        compensationDate: compensationDate,
        compensationBatchName: compensationBatchName
      })
      .where(eq(attendance.id, attendanceId));
  }


  /**
  * @purpose To fetches attendance records for a parent by their user ID, optionally filtered by a specific student.
  * 
  * @param {number} userId - The user ID of the parent.
  * @param {string} [studentId] - Optional student ID to filter the attendance records.
  * @returns {Promise<any[]>} A promise that resolves to an array of attendance records including student, batch, and parent details.
  * @throws Throws an error if the parent is not found or if an invalid student ID is provided.
  * @sideEffects None. Only reads data from the database.
  * 
  * @example
  * const records = await storage.getAttendanceByParentUserId(3);
  * const studentRecords = await storage.getAttendanceByParentUserId(3, '10');
  */
  async getAttendanceByParentUserId(userId: number, studentId?: string) {
    // console.log('Getting attendance for:', { userId, studentId });

    // First get the parent record
    const parent = await db
      .select()
      .from(parents)
      .where(eq(parents.userId, userId))
      .limit(1);

    if (parent.length === 0) {
      throw new Error('Parent not found');
    }

    const conditions = [eq(parents.userId, userId)];

    if (studentId !== undefined) {
      const studentIdNum = parseInt(studentId, 10);
      if (isNaN(studentIdNum)) {
        throw new Error('Invalid student ID format');
      }
      conditions.push(eq(students.id, studentIdNum));
    }

    const result = await db
      .select({
        id: attendance.id,
        studentId: students.id,
        date: attendance.date,
        batchName: batches.name,
        status: attendance.status,
        parentName: parents.firstName,
        compensationDate: attendance.compensationDate,
        compensationBatchName: attendance.compensationBatchName,
      })
      .from(attendance)
      .innerJoin(batches, eq(attendance.batchId, batches.id))
      .innerJoin(students, eq(students.id, attendance.studentId))
      .innerJoin(parents, eq(parents.userId, students.parentId))
      .where(and(...conditions))
      .orderBy(desc(attendance.date));

    // console.log('Found attendance records:', result.length);
    return result;
  }

  /**
  * @purpose To fetches a specific enrollment by its ID.
  * 
  * @param {number} id - The enrollment ID.
  * @returns {Promise<Enrollment | undefined>} A promise that resolves to the enrollment record or undefined if not found.
  * @throws Throws an error if the database query fails.
  * @sideEffects None. Only reads data from the database.
  * 
  * @example
  * const enrollment = await storage.getEnrollment(5);
  */
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    const result = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id));
    return result[0];
  }

  /**
  * @purpose To fetches all enrollments from the database.
  * 
  * @returns {Promise<Enrollment[]>} A promise that resolves to an array of all enrollments.
  * @throws Throws an error if the database query fails.
  * @sideEffects None.
  * 
  * @example
  * const allEnrollments = await storage.getEnrollments();
  */
  async getEnrollments(): Promise<Enrollment[]> {
    return await db.select().from(enrollments);
  }

  /**
  * @purpose To fetches all active enrollments from the database.
  * 
  * @returns {Promise<Enrollment[]>} A promise that resolves to an array of enrollments with status "active".
  * @throws Throws an error if the database query fails.
  * @sideEffects None.
  * 
  * @example
  * const activeEnrollments = await storage.getActiveEnrollments();
  */
  async getActiveEnrollments(): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.status, "active"));
  }

  /**
  * @purpose To fetches all enrollments for a specific student.
  * 
  * @param {number} studentId - The ID of the student.
  * @returns {Promise<Enrollment[]>} A promise that resolves to an array of enrollments for the student.
  * @throws Throws an error if the database query fails.
  * @sideEffects None.
  * 
  * @example
  * const studentEnrollments = await storage.getEnrollmentsByStudent(5);
  */
  async getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId));
  }

  /**
  * @purpose To counts the number of active enrollments for all students of a given parent.
  * 
  * @param {number} parentId - The ID of the parent.
  * @returns {Promise<number>} The number of active enrollments for the parent's students.
  * @throws Throws an error if the database query fails.
  * @sideEffects None.
  * 
  * @example
  * const activeCount = await storage.getActiveEnrollmentCountByParentId(3);
  */

  async getActiveEnrollmentCountByParentId(parentId: number): Promise<number> {
    const [row] = await db
      .select({
        activeEnrollments: sql<number>`COUNT(DISTINCT CONCAT(${enrollments.studentId}, '-', ${enrollments.courseId}, '-', ${enrollments.batchId}))
      `.as('activeEnrollments')
      })
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .where(
        and(
          eq(students.parentId, parentId),
          eq(enrollments.status, 'active')
        )
      );
    return row?.activeEnrollments ?? 0;
  }


  /**
  * @purpose To fetches all enrollments for a specific batch.
  * 
  * @param {number} batchId - The batch ID.
  * @returns {Promise<Enrollment[]>} A promise that resolves to an array of enrollments for the batch.
  * @throws Throws an error if the database query fails.
  * @sideEffects None.
  * 
  * @example
  * const batchEnrollments = await storage.getEnrollmentsByBatch(2);
  */
  async getEnrollmentsByBatch(batchId: number): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.batchId, batchId));
  }

  /**
  * @purpose To fetches unique enrollments for a specific batch.
  * Removes duplicate enrollments for the same student, course, and batch combination.
  *
  * @param {number} batchId - The ID of the batch to filter enrollments.
  * @returns {Promise<any[]>} A promise that resolves to an array of unique enrollment records including student and batch details.
  * @throws Throws an error if the database query fails.
  * @sideEffects None. Only reads data from the database.
  * 
  * @example
  * const uniqueEnrollments = await storage.getUniqueEnrollmentsByBatch(2);
  */
  async getUniqueEnrollmentsByBatch(batchId: number) {
    const result = await db.execute(sql`
        WITH ranked_enrollments AS (
          SELECT
            students.first_name,
            students.middle_name,
            students.last_name,
            enrollments.*,
            batches.name AS batch_name,
            ROW_NUMBER() OVER (
              PARTITION BY enrollments.student_id, enrollments.course_id, enrollments.batch_id
              ORDER BY enrollments.id
            ) AS row_num
          FROM enrollments
          LEFT JOIN students ON students.id = enrollments.student_id
          JOIN batches ON batches.id = enrollments.batch_id
          WHERE batches.id = ${batchId}
        )
        SELECT *
        FROM ranked_enrollments
        WHERE row_num = 1
      `);

    return result.rows;
  }


  /**
  * @purpose To create a new enrollment record in the database.
  * 
  * @param {InsertEnrollment} enrollment - The enrollment object containing student, course, batch, and status details.
  * @returns {Promise<Enrollment>} The newly created enrollment record.
  * @throws Throws an error if the database insert fails.
  * @sideEffects Inserts a new row into the "enrollments" table.
  * 
  * @example
  * const newEnrollment = await storage.createEnrollment({
  *   studentId: 5,
  *   courseId: 3,
  *   batchId: 2,
  *   status: 'active'
  * });
  */
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const result = await db
      .insert(enrollments)
      .values({
        ...enrollment,
        status: enrollment.status || "active",
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  /**
  * @purpose To update an existing enrollment record in the database.
  * 
  * @param {number} id - The ID of the enrollment to update.
  * @param {Partial<Enrollment>} enrollment - Partial enrollment object with fields to update.
  * @returns {Promise<Enrollment | undefined>} The updated enrollment record, or undefined if no record was found with the given ID.
  * @throws Throws an error if the database update fails.
  * @sideEffects Updates a row in the "enrollments" table.
  * 
  * @example
  * const updatedEnrollment = await storage.updateEnrollment(10, { status: 'inactive' });
  */
  async updateEnrollment(
    id: number,
    enrollment: Partial<Enrollment>
  ): Promise<Enrollment | undefined> {
    const result = await db
      .update(enrollments)
      .set(enrollment)
      .where(eq(enrollments.id, id))
      .returning();
    return result[0];
  }

  /**
  * Deactivates all enrollments for a specific student in a specific batch.
  *
  * @purpose Updates the status of a student's enrollments to "inactive" in the database.
  * 
  * @param {number} studentId - The ID of the student whose enrollments should be deactivated.
  * @param {number} batchId - The ID of the batch for which the enrollments should be deactivated.
  * @returns {Promise<any[]>} - Returns a promise that resolves to an array of the updated enrollment records.
  * @throws {Error} Throws an error if the database update operation fails.
  * @sideEffects Updates the `status` field of matching enrollments in the database to "inactive".
  *
  * @example
  * const updatedEnrollments = await deactivateStudentEnrollments(123, 456);
  * console.log(updatedEnrollments);
  */
  async deactivateStudentEnrollments(studentId: number, batchId: number) {
    const updated = await db
      .update(enrollments)
      .set({ status: "inactive" })
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.batchId, batchId)
        )
      )
      .returning();

    return updated;
  }

  /**
  * Deletes an enrollment by its ID.
  *
  * @purpose Removes a specific enrollment record from the database.
  *
  * @param {number} id - The ID of the enrollment to delete.
  * @returns {Promise<boolean>} - Returns `true` if the deletion was successful, `false` otherwise.
  * @throws {Error} Throws an error if the database delete operation fails.
  * @sideEffects Removes the specified enrollment record from the database.

  * @example
  * const isDeleted = await deleteEnrollment(789);
  * if (isDeleted) {
  *   console.log("Enrollment deleted successfully.");
  * } else {
  *   console.log("Enrollment not found or deletion failed.");
  * }
  */
  async deleteEnrollment(id: number): Promise<boolean> {
    const result = await db
      .delete(enrollments)
      .where(eq(enrollments.id, id))
      .returning();
    return result.length > 0;
  }

  
  /**
  * Retrieves a student course fee by its ID.
  *
  * @purpose Fetch a specific student course fee record from the database.
  *
  * @param {number} id - The ID of the student course fee to retrieve.
  * @returns {Promise<StudentCourseFee | undefined>} - The student course fee record, or `undefined` if not found.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const fee = await getStudentCourseFee(1);
  * console.log(fee);
  */
  async getStudentCourseFee(id: number): Promise<StudentCourseFee | undefined> {
    const result = await db.select().from(studentCourseFee).where(eq(studentCourseFee.id, id));
    return result[0];
  }

  /**
  * Retrieves all student course fee records.
  *
  * @purpose Fetch all student course fees from the database.
  * 
  * @returns {Promise<StudentCourseFee[]>} - Array of student course fee records.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  * 
  * @example
  * const fees = await getStudentCourseFees();
  * console.log(fees);
  */
  async getStudentCourseFees(): Promise<StudentCourseFee[]> {
    return await db.select().from(studentCourseFee);
  }


  /**
  * Creates a new student course fee record.
  *
  * @purpose Insert a new student course fee into the database.
  *
  * @param {InsertStudentCourseFee} courseFee - Data for the new student course fee.
  * @returns {Promise<StudentCourseFee>} - The newly created student course fee record.
  * @throws {Error} Throws an error if the database insert operation fails.
  * @sideEffects Inserts a new record into the `studentCourseFee` table.
  *
  * @example
  * const newFee = await createStudentCourseFee({
  *   enrollmentId: 1,
  *   durationMonths: 6,
  *   discountType: 'percentage',
  *   discountValue: 10,
  *   totalFee: 500
  * });
  * console.log(newFee);
  */
  async createStudentCourseFee(courseFee: InsertStudentCourseFee): Promise<StudentCourseFee> {
    const result = await db.insert(studentCourseFee).values({
      ...courseFee,
      enrollmentId: courseFee.enrollmentId,
      durationMonths: courseFee.durationMonths,
      discountType: courseFee.discountType,
      discountValue: courseFee.discountValue,
      totalFee: courseFee.totalFee,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  /**
  * Updates an existing student course fee.
  *
  * @purpose Modify a student course fee record in the database.
  *
  * @param {number} id - ID of the student course fee to update.
  * @param {Partial<StudentCourseFee>} courseFee - Fields to update in the student course fee.
  * @returns {Promise<StudentCourseFee | undefined>} - The updated student course fee record, or `undefined` if not found.
  * @throws {Error} Throws an error if the database update operation fails.
  * @sideEffects Updates fields of the `studentCourseFee` record.
  *
  * @example
  * const updatedFee = await updateStudentCourseFee(1, { totalFee: 550 });
  * console.log(updatedFee);
  */
  async updateStudentCourseFee(id: number, courseFee: Partial<StudentCourseFee>): Promise<StudentCourseFee | undefined> {
    const result = await db.update(studentCourseFee)
      .set(courseFee)
      .where(eq(studentCourseFee.id, id))
      .returning();
    return result[0];
  }

  /**
  * Deletes a student course fee by ID.
  *
  * @purpose Remove a student course fee from the database.
  *
  * @param {number} id - ID of the student course fee to delete.
  * @returns {Promise<boolean>} - `true` if deletion was successful, `false` otherwise.
  * @throws {Error} Throws an error if the database delete operation fails.
  * @sideEffects Deletes a record from the `studentCourseFee` table.
  *
  * @example
  * const isDeleted = await deleteStudentCourseFee(1);
  * console.log(isDeleted ? 'Deleted' : 'Not Found');
  */
  async deleteStudentCourseFee(id: number): Promise<boolean> {
    const result = await db.delete(studentCourseFee).where(eq(studentCourseFee.id, id)).returning();
    return result.length > 0;
  }


  /**
  * Retrieves a student enrollment fee by its ID.
  *
  * @purpose Fetch a specific student enrollment fee record.
  *
  * @param {number} id - ID of the student enrollment fee.
  * @returns {Promise<StudentEnrollmentFees | undefined>} - The enrollment fee record, or `undefined` if not found.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const fee = await getStudentEnrollmentFee(1);
  * console.log(fee);
  */
  async getStudentEnrollmentFee(id: number): Promise<StudentEnrollmentFees | undefined> {
    const result = await db.select().from(studentEnrollmentFees).where(eq(studentEnrollmentFees.id, id));
    return result[0];
  }


  /**
  * Retrieves all student enrollment fee records.
  *
  * @purpose Fetch all enrollment fees from the database.
  * 
  * @returns {Promise<StudentEnrollmentFees[]>} - Array of enrollment fee records.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const fees = await getStudentEnrollmentFees();
  * console.log(fees);
  */
  async getStudentEnrollmentFees(): Promise<StudentEnrollmentFees[]> {
    return await db.select().from(studentEnrollmentFees);
  }

  /**
  * Creates a new student enrollment fee record.
  *
  * @purpose Insert a new student enrollment fee into the database.
  *
  * @param {InsertStudentEnrollmentFees} enrollmentFee - Data for the new enrollment fee.
  * @returns {Promise<StudentEnrollmentFees>} - The newly created enrollment fee record.
  * @throws {Error} Throws an error if the database insert operation fails.
  * @sideEffects Inserts a new record into the `studentEnrollmentFees` table.
  *
  * @example
  * const newFee = await createStudentEnrollmentFees({ enrollmentId: 1, amount: 500 });
  * console.log(newFee);
  */
  async createStudentEnrollmentFees(enrollmentFee: InsertStudentEnrollmentFees): Promise<StudentEnrollmentFees> {
    const result = await db.insert(studentEnrollmentFees).values({
      ...enrollmentFee,
      updatedAt: new Date()
    }).returning();
    return result[0];
  }


  /**
  * Updates an existing student enrollment fee.
  *
  * @purpose Modify an enrollment fee record in the database.
  *
  * @param {number} id - ID of the enrollment fee to update.
  * @param {Partial<StudentEnrollmentFees>} enrollmentFee - Fields to update.
  * @returns {Promise<StudentEnrollmentFees | undefined>} - The updated record, or `undefined` if not found.
  * @throws {Error} Throws an error if the database update operation fails.
  * @sideEffects Updates fields of the `studentEnrollmentFees` record.
  *
  * @example
  * const updatedFee = await updateStudentEnrollmentFees(1, { amount: 550 });
  * console.log(updatedFee);
  */
  async updateStudentEnrollmentFees(id: number, enrollmentFee: Partial<StudentEnrollmentFees>): Promise<StudentEnrollmentFees | undefined> {
    const result = await db.update(studentEnrollmentFees)
      .set(enrollmentFee)
      .where(eq(studentEnrollmentFees.id, id))
      .returning();
    return result[0];
  }


  /**
  * Deletes a student enrollment fee by ID.
  *
  * @purpose Remove an enrollment fee record from the database.
  *
  * @param {number} id - ID of the enrollment fee to delete.
  * @returns {Promise<boolean>} - `true` if deletion was successful, `false` otherwise.
  * @throws {Error} Throws an error if the database delete operation fails.
  * @sideEffects Deletes a record from the `studentEnrollmentFees` table.
  *
  * @example
  * const isDeleted = await deleteStudentEnrollmentFees(1);
  * console.log(isDeleted ? 'Deleted' : 'Not Found');
  */
  async deleteStudentEnrollmentFees(id: number): Promise<boolean> {
    const result = await db.delete(studentEnrollmentFees).where(eq(studentEnrollmentFees.id, id)).returning();
    return result.length > 0;
  }

  
  /**
  * Retrieves a transportation record by its ID.
  *
  * @purpose Fetch a specific transportation record from the database.
  *
  * @param {number} id - The ID of the transportation record to retrieve.
  * @returns {Promise<Transportation | undefined>} - A promise that resolves to the transportation record, or `undefined` if not found.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const transport = await getTransportation(1);
  * console.log(transport);
  */
  async getTransportation(id: number): Promise<Transportation | undefined> {
    const result = await db
      .select()
      .from(transportation)
      .where(eq(transportation.id, id));
    return result[0];
  }

  /**
  * Retrieves all transportation records.
  *
  * @purpose Fetch all transportation records from the database.
  * 
  * @returns {Promise<Transportation[]>} - A promise that resolves to an array of all transportation records.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const transports = await getTransportations();
  * console.log(transports);
  */
  async getTransportations(): Promise<Transportation[]> {
    return await db.select().from(transportation);
  }

  /**
  * Creates a new transportation record.
  *
  * @purpose Insert a new transportation entry into the database.
  *
  * @param {InsertTransportation} data - The transportation data to be inserted.
  * @returns {Promise<Transportation>} - A promise that resolves to the newly created transportation record.
  * @throws {Error} Throws an error if the database insert operation fails.
  * @sideEffects Inserts a new record into the `transportation` table.
  *
  * @example
  * const newTransport = await createTransportation({
  *   vehicleNumber: 'AB-1234',
  *   driverName: 'John Doe',
  *   route: 'Route A',
  *   capacity: 40
  * });
  * console.log(newTransport);
  */
  async createTransportation(data: InsertTransportation): Promise<Transportation> {
    // console.log("Creating transportation with data:", data);
    try {
      const result = await db.insert(transportation).values({
        ...data,
        createdAt: new Date()
      }).returning();
      // console.log("Transportation creation result:", result);
      return result[0];
    } catch (error) {
      console.error("Database error creating transportation:", error);
      throw error;
    }
  }

  /**
  * Updates an existing transportation record.
  *
  * @purpose Modify an existing transportation entry in the database.
  *
  * @param {number} id - The ID of the transportation record to update.
  * @param {Partial<InsertTransportation>} data - The fields to update in the transportation record.
  * @returns {Promise<Transportation | undefined>} - A promise that resolves to the updated transportation record, or `undefined` if not found.
  * @throws {Error} Throws an error if the database update operation fails.
  * @sideEffects Updates a record in the `transportation` table.
  *
  * @example
  * const updatedTransport = await updateTransportation(1, { driverName: 'Jane Smith' });
  * console.log(updatedTransport);
  */
  async updateTransportation(
    id: number,
    data: Partial<InsertTransportation>
  ): Promise<Transportation | undefined> {
    const result = await db
      .update(transportation)
      .set(data)
      .where(eq(transportation.id, id))
      .returning();
    return result[0];
  }


  /**
  * Deletes a transportation record by its ID.
  *
  * @purpose Remove a transportation record from the database.
  *
  * @param {number} id - The ID of the transportation record to delete.
  * @returns {Promise<boolean>} - A promise that resolves to `true` if the record was deleted, or `false` if not found.
  * @throws {Error} Throws an error if the database delete operation fails.
  * @sideEffects Deletes a record from the `transportation` table.
  *
  * @example
  * const isDeleted = await deleteTransportation(2);
  * console.log(isDeleted ? 'Transportation deleted successfully.' : 'Transportation not found.');
  */
  async deleteTransportation(id: number): Promise<boolean> {
    const result = await db
      .delete(transportation)
      .where(eq(transportation.id, id))
      .returning();
    return result.length > 0;
  }

  // Transportation mode methods
  async getTransportationModes(): Promise<TransportationMode[]> {
    return await db.select().from(transportationMode);
  }

  async createTransportationMode(data: InsertTransportationMode): Promise<TransportationMode> {
    try {
      const result = await db.insert(transportationMode).values({
        ...data,
        // createdAt: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
  * Updates an existing transportation mode record.
  *
  * @purpose Modify a transportation mode entry in the database with new data.
  *
  * @param {number} id - The ID of the transportation mode record to update.
  * @param {Partial<InsertTransportationMode>} data - The fields to update in the transportation mode record.
  * @returns {Promise<TransportationMode | undefined>} - A promise that resolves to the updated transportation mode record, 
          or `undefined` if no record was found with the given ID.
  * @throws {Error} Throws an error if the database update operation fails.
  * @sideEffects Updates a record in the `transportationMode` table.
  *
  * @example
  * const updatedMode = await updateTransportationMode(3, { modeName: 'Private Bus', capacity: 50 });
  * console.log(updatedMode);
  */
  async updateTransportationMode(id: number, data: Partial<InsertTransportationMode>): Promise<TransportationMode | undefined> {
    const result = await db.update(transportationMode)
      .set(data)
      .where(eq(transportationMode.id, id))
      .returning();
    return result[0];
  }

  /**
  * Deletes a transportation mode record by its ID.
  *
  * @purpose Remove a specific transportation mode record from the database.
  *
  * @param {number} id - The ID of the transportation mode record to delete.
  * @returns {Promise<boolean>} - A promise that resolves to `true` if the record was deleted, 
                  or `false` if no matching record was found.
  * @throws {Error} Throws an error if the database delete operation fails.
  * @sideEffects Deletes a record from the `transportationMode` table.
  *
  * @example
  * const isDeleted = await deleteTransportationMode(5);
  * console.log(isDeleted ? 'Transportation mode deleted successfully.' : 'Transportation mode not found.');
  */
  async deleteTransportationMode(id: number): Promise<boolean> {
    const result = await db.delete(transportationMode).where(eq(transportationMode.id, id)).returning();
    return result.length > 0;
  }

  // Inventory methods
  /**
  * Retrieves all inventory records.
  *
  * @purpose Fetch all inventory items from the database.
  * 
  * @returns {Promise<Inventory[]>} - A promise that resolves to an array of inventory records.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const inventoryList = await getInventory();
  * console.log(inventoryList);
  */
  async getInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }


  /**
  * Creates a new inventory record.
  *
  * @purpose Insert a new inventory item into the database.
  *
  * @param {InsertInventory} data - The inventory data to insert.
  * @returns {Promise<Inventory>} - A promise that resolves to the newly created inventory record.
  * @throws {Error} Throws an error if the database insert operation fails.
  * @sideEffects Inserts a new record into the `inventory` table.
  *
  * @example
  * const newInventory = await createInventory({
  *   itemName: 'Projector',
  *   quantity: 10,
  *   location: 'Lab 3'
  * });
  * console.log(newInventory);
  */
  async createInventory(data: InsertInventory): Promise<Inventory> {
    try {
      const result = await db
        .insert(inventory)
        .values({
          ...data,
          createdAt: new Date(),
        })
        .returning();
      // console.log("Inventory creation result:", result);
      return result[0];
    } catch (error) {
      console.error("Database error creating inventory:", error);
      throw error;
    }
  }

  /**
  * Updates an existing inventory record.
  *
  * @purpose Modify fields of a specific inventory item.
  *
  * @param {number} id - The ID of the inventory record to update.
  * @param {Partial<InsertInventory>} data - The fields to update in the inventory record.
  * @returns {Promise<Inventory | undefined>} - A promise that resolves to the updated inventory record, or `undefined` if not found.
  * @throws {Error} Throws an error if the database update operation fails.
  * @sideEffects Updates a record in the `inventory` table.
  *
  * @example
  * const updatedInventory = await updateInventory(2, { quantity: 15 });
  * console.log(updatedInventory);
  */
  async updateInventory(
    id: number,
    data: Partial<InsertInventory>
  ): Promise<Inventory | undefined> {
    const result = await db
      .update(inventory)
      .set(data)
      .where(eq(inventory.id, id))
      .returning();
    return result[0];
  }


  /**
  * Deletes an inventory record by ID.
  *
  * @purpose Remove a specific inventory record from the database.
  *
  * @param {number} id - The ID of the inventory record to delete.
  * @returns {Promise<boolean>} - A promise that resolves to `true` if deletion was successful, or `false` otherwise.
  * @throws {Error} Throws an error if the database delete operation fails.
  * @sideEffects Deletes a record from the `inventory` table.
  *
  * @example
  * const isDeleted = await deleteInventory(5);
  * console.log(isDeleted ? 'Inventory deleted.' : 'Inventory not found.');
  */
  async deleteInventory(id: number): Promise<boolean> {
    const result = await db
      .delete(inventory)
      .where(eq(inventory.id, id))
      .returning();
    return result.length > 0;
  }

  // Stock Item Methods

  /**
  * Retrieves a stock item by its ID.
  *
  * @purpose Fetch a specific stock item record from the database.
  *
  * @param {number} id - The ID of the stock item to retrieve.
  * @returns {Promise<StockItem | undefined>} - A promise that resolves to the stock item record, or `undefined` if not found.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const stockItem = await getStockItem(1);
  * console.log(stockItem);
  */
  async getStockItem(id: number): Promise<StockItem | undefined> {
    const result = await db.select().from(stockItem).where(eq(stockItem.id, id));
    return result[0];
  }

  /**
  * Retrieves all stock items.
  *
  * @purpose Fetch all stock items from the database.
  * 
  * @returns {Promise<StockItem[]>} - A promise that resolves to an array of all stock item records.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const items = await getStockItems();
  * console.log(items);
  */
  async getStockItems(): Promise<StockItem[]> {
    return await db.select().from(stockItem);
  }


  /**
  * Creates a new stock item record.
  *
  * @purpose Insert a new stock item into the database.
  *
  * @param {InsertStockItem} data - The data for the new stock item.
  * @returns {Promise<StockItem>} - A promise that resolves to the newly created stock item record.
  * @throws {Error} Throws an error if the database insert operation fails.
  * @sideEffects Inserts a new record into the `stockItem` table.
  *
  * @example
  * const newStock = await createStockItem({
  *   itemName: 'HDMI Cable',
  *   quantity: 100,
  *   price: 10
  * });
  * console.log(newStock);
  */
  async createStockItem(data: InsertStockItem): Promise<StockItem> {
    try {
      const result = await db.insert(stockItem).values({
        ...data,
      }).returning();
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
  * Updates an existing stock item.
  *
  * @purpose Modify fields of a stock item record in the database.
  *
  * @param {number} id - The ID of the stock item to update.
  * @param {Partial<InsertStockItem>} data - The fields to update.
  * @returns {Promise<StockItem | undefined>} - A promise that resolves to the updated stock item record, or `undefined` if not found.
  * @throws {Error} Throws an error if the database update operation fails.
  * @sideEffects Updates a record in the `stockItem` table.
  *
  * @example
  * const updatedStock = await updateStockItem(3, { quantity: 120 });
  * console.log(updatedStock);
  */
  async updateStockItem(id: number, data: Partial<InsertStockItem>): Promise<StockItem | undefined> {
    const result = await db.update(stockItem)
      .set(data)
      .where(eq(stockItem.id, id))
      .returning();
    return result[0];
  }


  /**
  * Deletes a stock item record by ID.
  *
  * @purpose Remove a stock item from the database.
  *
  * @param {number} id - The ID of the stock item to delete.
  * @returns {Promise<boolean>} - A promise that resolves to `true` if the record was deleted, or `false` otherwise.
  * @throws {Error} Throws an error if the database delete operation fails.
  * @sideEffects Deletes a record from the `stockItem` table.
  *
  * @example
  * const isDeleted = await deleteStockItem(2);
  * console.log(isDeleted ? 'Stock item deleted.' : 'Stock item not found.');
  */
  async deleteStockItem(id: number): Promise<boolean> {
    const result = await db.delete(stockItem).where(eq(stockItem.id, id)).returning();
    return result.length > 0;
  }

  // Student Inventory Methods

  /**
  * Retrieves a specific student inventory record by its ID.
  *
  * @purpose Fetch a single student inventory record from the database using its ID.
  *
  * @param {number} id - The unique identifier of the student inventory record to retrieve.
  * @returns {Promise<StudentInventory | undefined>} - A promise that resolves to the student inventory record, or `undefined` if not found.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const studentInv = await getStudentInventory(1);
  * console.log(studentInv);
  */
  async getStudentInventory(id: number): Promise<StudentInventory | undefined> {
    const result = await db.select().from(studentInventory).where(eq(studentInventory.id, id));
    return result[0];
  }

  /**
  * Retrieves all student inventory records.
  *
  * @purpose Fetch all student inventory records from the database.
  *
  * @returns {Promise<StudentInventory[]>} - A promise that resolves to an array of all student inventory records.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const allStudentInventory = await getAllStudentInventory();
  * console.log(allStudentInventory);
  */
  async getAllStudentInventory(): Promise<StudentInventory[]> {
    return await db.select().from(studentInventory);
  }

  /**
  * Retrieves all inventory records assigned to a specific student.
  *
  * @purpose Fetch all inventory records linked to a particular student by their student ID.
  *
  * @param {number} studentId - The ID of the student whose inventory records should be retrieved.
  * @returns {Promise<StudentInventory[]>} - A promise that resolves to an array of student inventory records.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const studentItems = await getStudentInventoryByStudent(12);
  * console.log(studentItems);
  */
  async getStudentInventoryByStudent(studentId: number): Promise<StudentInventory[]> {
    return await db.select().from(studentInventory).where(eq(studentInventory.studentId, studentId));
  }

  /**
  * Creates a new student inventory record.
  *
  * @purpose Assign an inventory item to a student by creating a new record in the database.
  *
  * @param {InsertStudentInventory} data - The data object containing the student ID, inventory ID, and quantity.
  * @returns {Promise<StudentInventory>} - A promise that resolves to the newly created student inventory record.
  * @throws {Error} Throws an error if the database insert operation fails.
  * @sideEffects Inserts a new record into the `studentInventory` table.
  *
  * @example
  * const newRecord = await createStudentInventory({
  *   studentId: 5,
  *   inventoryId: 10,
  *   quantity: 2
  * });
  * console.log(newRecord);
  */
  async createStudentInventory(data: InsertStudentInventory): Promise<StudentInventory> {
    try {
      const result = await db.insert(studentInventory).values({
        ...data,
        studentId: data.studentId,
        inventoryId: data.inventoryId,
        quantity: data.quantity,
      }).returning();
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates an existing student inventory record.
   *
   * @purpose Modify a specific student inventory record in the database.
   *
   * @param {number} id - The ID of the student inventory record to update.
   * @param {Partial<InsertStudentInventory>} data - The fields to update in the student inventory record.
   * @returns {Promise<StudentInventory | undefined>} - A promise that resolves to the updated record, or `undefined` if not found.
   * @throws {Error} Throws an error if the database update operation fails.
   * @sideEffects Updates a record in the `studentInventory` table.
   *
   * @example
   * const updatedRecord = await updateStudentInventory(3, { quantity: 5 });
   * console.log(updatedRecord);
   */
  async updateStudentInventory(id: number, data: Partial<InsertStudentInventory>): Promise<StudentInventory | undefined> {
    const result = await db.update(studentInventory)
      .set(data)
      .where(eq(studentInventory.id, id))
      .returning();
    return result[0];
  }

  /**
  * Deletes a student inventory record by its ID.
  *
  * @purpose Remove a specific student inventory record from the database.
  * 
  * @param {number} id - The ID of the student inventory record to delete.
  * @returns {Promise<boolean>} - A promise that resolves to `true` if deletion was successful, or `false` otherwise.
  * @throws {Error} Throws an error if the database delete operation fails.
  * @sideEffects Deletes a record from the `studentInventory` table.
  *
  * @example
  * const isDeleted = await deleteStudentInventory(4);
  * console.log(isDeleted ? 'Student inventory deleted.' : 'Record not found.');
  */
  async deleteStudentInventory(id: number): Promise<boolean> {
    const result = await db.delete(studentInventory).where(eq(studentInventory.id, id)).returning();
    return result.length > 0;
  }

  // Attendance methods

  /**
  * Retrieves a specific attendance record by its ID.
  *
  * @purpose Fetch a single attendance record from the database using its unique identifier.
  * 
  * @param {number} id - The unique ID of the attendance record to retrieve.
  * @returns {Promise<Attendance | undefined>} - A promise that resolves to the attendance record if found, otherwise `undefined`.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const attendanceRecord = await getAttendance(1);
  * console.log(attendanceRecord);
  */
  async getAttendance(id: number): Promise<Attendance | undefined> {
    const result = await db
      .select()
      .from(attendance)
      .where(eq(attendance.id, id));
    return result[0];
  }

  /**
  * Retrieves all attendance records for a specific student, including batch and student details.
  *
  * @purpose Fetch attendance records of a specific student, joined with related batch and student data.
  * 
  * @param {number} studentId - The unique ID of the student.
  * @returns {Promise<any[]>} - A promise that resolves to an array of attendance records, each containing:
  *  - batchName
  *  - date
  *  - status
  *  - firstName, middleName, lastName
  *  - studentId
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const studentAttendance = await getAttendanceByStudent(12);
  * console.log(studentAttendance);
  */
  async getAttendanceByStudent(studentId: number): Promise<any[]> {
    return await db
      .select({
        batchName: batches.name,
        date: attendance.date,
        status: attendance.status,
        firstName: students.firstName,
        middleName: students.middleName,
        studentId: students.id,
        lastName: students.lastName,
      })
      .from(attendance)
      .innerJoin(batches, eq(batches.id, attendance.batchId))
      .innerJoin(students, eq(students.id, attendance.studentId))
      .where(eq(students.id, studentId));
  }

  /**
  * Retrieves all attendance records for a specific batch.
  *
  * @purpose Fetch all attendance records for a given batch using its ID.
  * 
  * @param {number} batchId - The unique identifier of the batch.
  * @returns {Promise<Attendance[]>} - A promise that resolves to an array of attendance records.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const batchAttendance = await getAttendanceByBatch(5);
  * console.log(batchAttendance);
  */
  async getAttendanceByBatch(batchId: number): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.batchId, batchId));
  }

  /**
  * Retrieves attendance records for a specific batch on a given date.
  *
  * @purpose Fetch all attendance records for a given batch on a specific date.
  * 
  * @param {number} batchId - The ID of the batch.
  * @param {Date} date - The date for which to retrieve attendance records.
  * @returns {Promise<Attendance[]>} - A promise that resolves to an array of attendance records matching the batch and date.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  * 
  * @example
  * const attendanceOnDate = await getAttendanceByBatchAndDate(3, new Date('2025-10-05'));
  * console.log(attendanceOnDate);
  */
  async getAttendanceByBatchAndDate(batchId: number, date: Date) {
    const formattedDate = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

    return await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.batchId, batchId),
          eq(attendance.date, formattedDate)
        )
      );
  }

  /**
  * Retrieves all attendance records for a specific date.
  *
  * @purpose Fetch all attendance records across all batches and students for a given date.
  * 
  * @param {Date} date - The date for which attendance records should be retrieved.
  * @returns {Promise<Attendance[]>} - A promise that resolves to an array of attendance records for that date.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const attendanceRecords = await getAttendanceByDate(new Date('2025-10-06'));
  * console.log(attendanceRecords);
  */
  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split("T")[0];
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.date, dateStr));
  }


  /**
  * Creates a new attendance record in the database.
  *
  * @purpose Add a new attendance record for a student in a specific batch and date.
  * 
  * @param {InsertAttendance} data - The data object containing details such as:
  *  - date
  *  - status
  *  - studentId
  *  - batchId
  *  - optional: compensationBatchName, compensationDate
  * @returns {Promise<Attendance>} - A promise that resolves to the newly created attendance record.
  * @throws {Error} Throws an error if the database insert operation fails.
  * @sideEffects Inserts a new record into the `attendance` table.
  *
  * @example
  * const newAttendance = await createAttendance({
  *   date: new Date('2025-10-07'),
  *   status: 'present',
  *   studentId: 8,
  *   batchId: 2
  * });
  * console.log(newAttendance);
  */
  async createAttendance(data: InsertAttendance): Promise<Attendance> {
    const result = await db.insert(attendance).values({
      date: data.date,
      status: data.status,
      studentId: data.studentId,
      batchId: data.batchId,
      compensationBatchName: data.compensationBatchName || null,
      compensationDate: data.compensationDate || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  /**
  * Updates an existing attendance record.
  *
  * @purpose Modify an existing attendance entry in the database with new information.
  *
  * @param {number} id - The unique identifier of the attendance record to update.
  * @param {Partial<Attendance>} attendanceData - The fields of the attendance record to update.
  * @returns {Promise<Attendance | undefined>} - A promise that resolves to the updated attendance record, 
           or `undefined` if no record was found with the given ID.
  * @throws {Error} Throws an error if the database update operation fails.
  * @sideEffects Updates a record in the `attendance` table and sets a new `updatedAt` timestamp.
  * 
  * @example
  * const updatedRecord = await updateAttendance(5, { status: 'absent' });
  * console.log(updatedRecord);
  */
  async updateAttendance(id: number, attendanceData: Partial<Attendance>): Promise<Attendance | undefined> {
    const result = await db.update(attendance)
      .set({
        ...attendanceData,
        updatedAt: new Date()
      })
      .where(eq(attendance.id, id))
      .returning();
    return result[0];
  }

  /**
  * Deletes an attendance record by its ID.
  *
  * @purpose Remove a specific attendance record from the database.
  * 
  * @param {number} id - The unique identifier of the attendance record to delete.
  * @returns {Promise<boolean>} - A promise that resolves to `true` if the record was deleted, 
              or `false` if no matching record was found.
  * @throws {Error} Throws an error if the database delete operation fails.
  * @sideEffects Permanently removes a record from the `attendance` table.
  *
  * @example
  * const deleted = await deleteAttendance(7);
  * console.log(deleted ? 'Deleted successfully.' : 'No record found.');
  */
  async deleteAttendance(id: number): Promise<boolean> {
    const result = await db
      .delete(attendance)
      .where(eq(attendance.id, id))
      .returning();
    return result.length > 0;
  }

  /**
  * Retrieves a specific payment record by its ID.
  *
  * @purpose Fetch a payment record from the database using its unique identifier.
  * 
  * @param {number} id - The unique ID of the payment record.
  * @returns {Promise<Payment | undefined>} - A promise that resolves to the payment record, 
              or `undefined` if not found.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const payment = await getPayment(12);
  * console.log(payment);
  */
  async getPayment(id: number): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id));
    return result[0];
  }


  /**
  * Retrieves a payment record by its associated invoice ID.
  *
  * @purpose Fetch a payment record linked to a specific invoice.
  * 
  * @param {string} invoiceId - The invoice ID associated with the payment.
  * @returns {Promise<Payment | undefined>} - A promise that resolves to the payment record, 
            or `undefined` if not found.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const payment = await getPaymentByInvoiceId('INV-1023');
  * console.log(payment);
  */
  async getPaymentByInvoiceId(invoiceId: string): Promise<Payment | undefined> {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId));
    return result[0];
  }


  /**
  * Retrieves the student ID associated with a specific invoice ID.
  *
  * @purpose Identify which student is linked to a specific invoice.
  * 
  * @param {string} invoiceId - The invoice ID used to find the corresponding student.
  * @returns {Promise<number | null>} - A promise that resolves to the student's ID if found, 
              or `null` if no matching record exists.
  * @throws {Error} Throws an error if the database query fails.
  * @sideEffects None.
  *
  * @example
  * const studentId = await getStudentIdByInvoiceId('INV-2024');
  * console.log(studentId); // Output: 15 or null
  */
  async getStudentIdByInvoiceId(invoiceId: string): Promise<number | null> {
    const result = await db
      .select({ studentId: payments.studentId })
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .limit(1);

    return result.length > 0 ? result[0].studentId : null;
  }

  /**
   * Retrieves all payment records from the database.
   *
   * @purpose Fetch all payment entries stored in the system.
   * 
   * @returns {Promise<Payment[]>} - A promise that resolves to an array of all payment records.
   * @throws {Error} Throws an error if the database query fails.
   * @sideEffects None.
   * 
   * @example
   * const allPayments = await getPayments();
   * console.log(allPayments);
   */
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }


  /**
  * Fetch aggregated payment-related data for a single student.
  *
  * @purpose Build a combined view of a student's payments, course fees, inventory items, and transportation summaries by joining multiple tables and sub-queries. Intended for use in reporting/invoice previews.
  * 
  * @param {number} studentId - The database ID of the student to fetch payments and related details for.
  * @returns {Promise<any[]>} - A promise that resolves to an array with zero or one object (depending on DB joins)
  *                            containing combined fields. Each returned object may include:
  *                            - id, studentId, firstName, middleName, lastName, registrationFee
  *                            - invoiceId, paymentAmount, paymentDate, paymentMethod, paymentStatus
  *                            - enrollmentId, courseName, courseMonths, courseDiscountValue, courseTotalFees
  *                            - items, quantity, itemDiscountValue, itemTotalAmount  (from inventory)
  *                            - transportDuration, transportationDiscountValue, transportationTotalAmount
  * @throws {Error} Throws if any of the underlying DB queries fail.
  * @sideEffects None — performs read-only queries (selects and sub-selects).
  *
  * @example
  * const rows = await getPaymentsByStudent(15);
  * if (rows.length === 0) {
  *   console.log('No payment data for this student.');
  * } else {
  *   console.log(rows[0].invoiceId, rows[0].courseName, rows[0].itemTotalAmount);
  * }
  */
  async getPaymentsByStudent(studentId: number): Promise<any[]> {
    const itemData = db
      .select({
        studentId: studentInventory.studentId,
        items: inventory.items,
        quantity: studentInventory.quantity,
        itemDiscountValue: studentInventory.discountValue,
        itemTotalAmount: studentInventory.totalAmount,
      })
      .from(studentInventory)
      .innerJoin(inventory, eq(inventory.id, studentInventory.inventoryId))
      .as('item_data');

    const transportData = db
      .select({
        studentId: transportation.studentId,
        transportDuration: transportation.durationMonths,
        transportationDiscountValue: transportation.discountValue,
        transportationTotalAmount: transportation.totalAmount,
      })
      .from(transportation)
      .as('transport_data');

    return await db
      .select({
        id: students.id,
        studentId: students.studentId,
        firstName: students.firstName,
        middleName: students.middleName,
        lastName: students.lastName,
        registrationFee: students.registrationFee,

        invoiceId: payments.invoiceId,
        paymentAmount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        paymentStatus: payments.status,

        enrollmentId: enrollments.id,
        courseName: courses.name,
        courseMonths: studentCourseFee.durationMonths,
        courseDiscountValue: studentCourseFee.discountValue,
        courseTotalFees: studentCourseFee.totalFee,

        items: sql`${itemData}.items`,
        quantity: sql`${itemData}.quantity`,
        itemDiscountValue: sql`${itemData}.item_discount_value`,
        itemTotalAmount: sql`${itemData}.item_total_amount`,

        transportDuration: sql`${transportData}.transport_duration`,
        transportationDiscountValue: sql`${transportData}.transportation_discount_value`,
        transportationTotalAmount: sql`${transportData}.transportation_total_amount`,
      })
      .from(students)
      .leftJoin(payments, eq(payments.studentId, students.id))
      .leftJoin(enrollments, eq(enrollments.studentId, students.id))
      .leftJoin(courses, eq(courses.id, enrollments.courseId))
      .leftJoin(studentCourseFee, eq(studentCourseFee.enrollmentId, enrollments.id))
      .leftJoin(itemData, eq(itemData.studentId, students.id))
      .leftJoin(transportData, eq(transportData.studentId, students.id))
      .where(eq(students.id, studentId));
  }


  /**
  * Build a fully structured invoice for a given student and invoice ID.
  *
  * @purpose Compose an invoice object that includes student info, payment info, and a detailed list of line items (courses, inventory items, transportation, registration fee) plus a summary (totals, discounts, VAT, grand total).
  * 
  * @param {number} studentId - Database ID of the student for whom the invoice will be built.
  * @param {string} invoiceId - Invoice identifier used to locate the payment record (e.g. 'INV-2025-001').
  * @returns {Promise<any | null>} - A promise that resolves to an invoice object with the shape:
  *                                  {
  *                                    invoiceNumber: string,
  *                                    issueDate?: Date,
  *                                    paymentMethod?: string,
  *                                    billTo: { name: string, address?: string | null },
  *                                    lineItems: Array<{ si_no: number, description: string, quantity: number, price: number, discount: string | number, lineTotal: number }>,
  *                                    summary: { totalPrice: number, discount: number, vatAmount: number, grandTotal: number }
  *                                  }
  * @throws {Error} Throws if any of the DB queries fail while fetching courses, inventory, transportation, or base info.
  * @sideEffects None — read-only. Uses multiple SELECTs and joins to assemble the invoice.
  *
  * @example
  * const invoice = await getInvoiceDetails(15, 'INV-2025-001');
  * if (!invoice) {
  *   console.log('Invoice not found for student or invoiceId.');
  * } else {
  *   console.log(invoice.invoiceNumber, invoice.summary.grandTotal);
  *   invoice.lineItems.forEach(li => console.log(li.si_no, li.description, li.lineTotal));
  * }
  */
  async getInvoiceDetails(studentId: number, invoiceId: string): Promise<any> {
    // 1. Get base student, payment, and summary fee info
    const baseInfoQuery = await db
      .select({
        student: students,
        payment: payments,
        summary: studentEnrollmentFees,
      })
      .from(students)
      .where(eq(students.id, studentId))
      .leftJoin(payments, and(eq(payments.studentId, students.id), eq(payments.invoiceId, invoiceId)))
      .leftJoin(studentEnrollmentFees, eq(studentEnrollmentFees.studentId, students.id));

    if (!baseInfoQuery.length) {
      return null;
    }
    const { student, payment, summary } = baseInfoQuery[0];

    // 2. Initialize an array to hold all line items for the invoice
    const lineItems = [];

    // 3. Fetch Course Line Items
    const courseItems = await db
      .select({
        description: courses.name,
        price: courses.fee,
        discount: studentCourseFee.discountValue,
        discountType: studentCourseFee.discountType,
        durationMonths: studentCourseFee.durationMonths,
        totalFee: studentCourseFee.totalFee,
      })
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId))
      .innerJoin(courses, eq(courses.id, enrollments.courseId))
      .innerJoin(studentCourseFee, eq(studentCourseFee.enrollmentId, enrollments.id));

    courseItems.forEach(course => {
      const discountFormatted = course.discountType === 'percentage'
        ? `${parseFloat(course.discount ?? "0")}%`
        : parseFloat(course.discount ?? "0").toFixed(2);

      lineItems.push({
        description: course.description,
        quantity: course.durationMonths,
        price: parseFloat(course.price ?? "0"),
        discount: discountFormatted,
        lineTotal: parseFloat(course.totalFee ?? "0"),
      });
    });

    // 4. Fetch Inventory Line Items (e.g., T-shirts)
    const inventoryItems = await db
      .select({
        description: inventory.items,
        quantity: studentInventory.quantity,
        price: inventory.amount, // Assuming inventory table has a base price per unit
        discount: studentInventory.discountValue,
        discountType: studentInventory.discountType,
        totalAmount: studentInventory.totalAmount,
      })
      .from(studentInventory)
      .where(eq(studentInventory.studentId, studentId))
      .innerJoin(inventory, eq(inventory.id, studentInventory.inventoryId));

    inventoryItems.forEach(item => {
      const discountFormatted = item.discountType === 'percentage'
        ? `${parseFloat(item.discount ?? "0")}%`
        : parseFloat(item.discount ?? "0").toFixed(2);
      lineItems.push({
        description: item.description,
        quantity: item.quantity,
        price: item.price, // Price per unit
        discount: discountFormatted,
        lineTotal: parseFloat(item.totalAmount ?? "0"),
      });
    });

    // 5. Fetch Transportation Line Item
    const transportRecord = await db.select({
      durationMonths: transportation.durationMonths,
      totalAmount: transportation.totalAmount,
      discountValue: transportation.discountValue,
      mode: transportationMode.mode,
      rate: transportationMode.rate,
      discountType: transportation.discountType,
    }).from(transportation)
      .where(eq(transportation.studentId, studentId))
      .innerJoin(transportationMode, eq(transportationMode.id, transportation.modeId));

    transportRecord.forEach(transportation => {
      const discountFormatted = transportation.discountType === 'percentage'
        ? `${parseFloat(transportation.discountValue ?? "0")}%`
        : parseFloat(transportation.discountValue ?? "0").toFixed(2);
      lineItems.push({
        description: 'Transportation - ' + transportation.mode,
        quantity: transportation.durationMonths,
        price: transportation.rate,
        discount: discountFormatted,
        lineTotal: parseFloat(transportation.totalAmount ?? "0"),
      });
    });

    // 6. Fetch Registration Fee Line Item
    if (student && parseFloat(student.registrationFee ?? "0") > 0) {
      lineItems.push({
        description: 'Registration fee',
        quantity: 1,
        price: parseFloat(student.registrationFee ?? "0"),
        discount: 0,
        lineTotal: parseFloat(student.registrationFee ?? "0"),
      });
    }

    // 7. Assemble the final, structured invoice object
    const finalInvoice = {
      invoiceNumber: payment?.invoiceId || invoiceId,
      issueDate: payment?.paymentDate,
      paymentMethod: payment?.paymentMethod,
      billTo: {
        name: `${student.firstName} ${student.middleName} ${student.lastName}`.trim(),
        address: student.phone, // Assuming student table has an 'address' field
      },
      // Add a sequential serial number (SI NO) to each line item
      lineItems: lineItems.map((item, index) => ({
        si_no: index + 1,
        ...item,
      })),
      // Use the pre-calculated totals from the `student_enrollment_fees` table
      summary: {
        totalPrice: summary ? parseFloat(summary.totalPayable ?? "0") : 0,
        discount: summary ? parseFloat(summary.totalDiscount ?? "0") : 0,
        vatAmount: summary ? parseFloat(summary.vatAmount ?? "0") : 0,
        grandTotal: summary ? parseFloat(summary.grandTotal ?? "0") : 0,
      }
    };

    return finalInvoice;
  }

  /**
  * Retrieve all payments filtered by their current status.
  *
  * @purpose Fetch a list of payment records from the database that match a given status
  *          (e.g., 'paid', 'pending', 'cancelled').
  * 
  * @param {string} status - The payment status to filter records by.
  * @returns {Promise<Payment[]>} - A promise that resolves to an array of `Payment` objects matching the specified status.
  *                                 Returns an empty array if no payments match.
  * @throws {Error} Throws if a database query or connection error occurs.
  * @sideEffects None — performs a read-only SELECT query.
  *
  * @example
  * const pendingPayments = await getPaymentsByStatus('pending');
  * console.log(`Found ${pendingPayments.length} pending payments.`);
  */
  async getPaymentsByStatus(status: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.status, status));
  }

  /**
  * Insert a new payment record into the database.
  *
  * @purpose Create a new payment entry with details such as amount, method, and remarks.
  *          Automatically sets the `createdAt` field to the current date/time.
  * 
  * @param {InsertPayment} payment - The payment data to insert. Must include all required payment fields
  *                                  such as `studentId`, `amount`, `invoiceId`, etc.
  * @returns {Promise<Payment>} - A promise that resolves to the created `Payment` object (including auto-generated fields like ID).
  * @throws {Error} Throws if the insert operation fails or if required fields are missing.
  * @sideEffects Modifies the database by adding a new record to the `payments` table.
  *
  * @example
  * const newPayment = await createPayment({
  *   studentId: 101,
  *   invoiceId: 'INV-2025-005',
  *   amount: 1200,
  *   status: 'paid',
  *   paymentMethod: 'credit_card',
  *   remarks: 'Full payment received',
  * });
  * console.log('Created payment:', newPayment);
  */
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db
      .insert(payments)
      .values({
        ...payment,
        paymentMethod: payment.paymentMethod || null,
        remarks: payment.remarks || null,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }


  /**
  * Update an existing payment record by ID.
  *
  * @purpose Modify one or more fields of an existing payment record (e.g., update amount, status, or remarks).
  * 
  * @param {number} id - The unique identifier of the payment record to update.
  * @param {Partial<Payment>} payment - An object containing the fields to update.
  * @returns {Promise<Payment | undefined>} - A promise that resolves to the updated `Payment` object, or `undefined`
  *                                           if no payment record with the given ID exists.
  * @throws {Error} Throws if the database update fails or if the `id` is invalid.
  * @sideEffects Modifies the database by updating a record in the `payments` table.
  *
  * @example
  * const updatedPayment = await updatePayment(10, { status: 'paid', remarks: 'Payment confirmed' });
  * if (updatedPayment) {
  *   console.log('Updated payment status to:', updatedPayment.status);
  * }
  */
  async updatePayment(
    id: number,
    payment: Partial<Payment>
  ): Promise<Payment | undefined> {
    const result = await db
      .update(payments)
      .set(payment)
      .where(eq(payments.id, id))
      .returning();
    return result[0];
  }


  /**
  * Delete a payment record from the database.
  *
  * @purpose Permanently remove a payment entry identified by its ID.
  * 
  * @param {number} id - The unique identifier of the payment record to delete.
  * @returns {Promise<boolean>} - A promise that resolves to `true` if the payment was deleted successfully,
  *                               or `false` if no record was found with the given ID.
  * @throws {Error} Throws if the delete operation fails due to a database error.
  * @sideEffects Permanently removes a record from the `payments` table.
  *
  * @example
  * const deleted = await deletePayment(12);
  * console.log(deleted ? 'Payment deleted successfully' : 'Payment not found');
  */
  async deletePayment(id: number): Promise<boolean> {
    const result = await db
      .delete(payments)
      .where(eq(payments.id, id))
      .returning();
    return result.length > 0;
  }

  // Invoices methods

  /**
  * Retrieve all invoices.
  *
  * @purpose Fetch every invoice record from the database.
  * 
  * @returns {Promise<Invoice[]>} - A promise that resolves to an array of `Invoice` records (may be empty).
  * @throws {Error} Throws if the database SELECT query fails.
  * @sideEffects None — read-only SELECT.
  *
  * @example
  * const all = await getInvoices();
  * console.log(`Found ${all.length} invoices`);
  */
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices);
  }


  /**
  * Retrieve a single invoice by its numeric ID.
  *
  * @purpose Fetch a single `Invoice` record using its primary key.
  * 
  * @param {number} id - The numeric ID of the invoice to retrieve.
  * @returns {Promise<Invoice | undefined>} - A promise that resolves to the `Invoice` if found, otherwise `undefined`.
  * @throws {Error} Throws if the database SELECT query fails.
  * @sideEffects None — read-only SELECT.
  *
  * @example
  * const inv = await getInvoice(12);
  * if (!inv) console.log('Invoice not found');
  * else console.log(inv.invoiceNumber, inv.totalAmount);
  */
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const result = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return result[0];
  }


  /**
  * Retrieve a structured invoice object including its line items and billing details.
  * @purpose Build a full invoice representation (invoice header, bill-to, line items, summary, status)
  *          by joining the `invoices`, `invoiceItems`, and `students` tables.
  * 
  * @param {number} invoiceId - The numeric ID of the invoice (in `invoices.id`) to fetch with items.
  * @returns {Promise<{
  *   invoiceNumber: string,
   *   issueDate?: string | Date,
   *   billTo: { name: string, address: string },
   *   lineItems: Array<{
   *     si_no: number,
   *     description?: string,
   *     quantity?: number,
   *     price: number,
   *     discount: string | number,
   *     discountValue: number,
   *     lineTotal: number
   *   }>,
   *   summary: { totalPrice: number, discount: number, vatAmount: number, grandTotal: number },
   *   status?: string
   * } | null>} - A promise resolving to the structured invoice object, or `null` if the invoice was not found.
   * @throws {Error} Throws if any of the underlying DB queries fail.
   * @sideEffects None — read-only SELECTs and JOINs.
   *
   * @example
   * const detailed = await getInvoiceWithItems(7);
   * if (!detailed) {
   *   console.log('Invoice not found');
   * } else {
   *   console.log(detailed.invoiceNumber, `Total: ${detailed.summary.grandTotal}`);
   *   detailed.lineItems.forEach(li => console.log(li.si_no, li.description, li.lineTotal));
   * }
   */
  async getInvoiceWithItems(invoiceId: number) {
    const results = await db
      .select({
        invoice: invoices,
        item: invoiceItems,
        student: students
      })
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .leftJoin(invoiceItems, eq(invoiceItems.invoiceId, invoices.id))
      .innerJoin(students, eq(students.id, invoices.studentId));

    if (!results.length) return null;

    const { invoice, student } = results[0];

    const items = results[0].item ? results.map(r => r.item) : [];

    const fullName = `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim().replace(/\s+/g, ' ');

    return {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      billTo: {
        name: fullName,
        address: student.phone || "",
      },
      lineItems: items.map((item, index) => ({
        si_no: index + 1,
        description: item?.description,
        quantity: item?.quantity,
        price: parseFloat(item?.unitPrice || "0"),
        discount: item?.discountType === "percentage"
          ? `${parseFloat(item?.discountValue || "0")}%`
          : parseFloat(item?.discountValue || "0").toFixed(2),
        discountValue: parseFloat(item?.unitPrice || "0") - parseFloat(item?.total || "0"),
        lineTotal: parseFloat(item?.total || "0"),
      })),
      summary: {
        totalPrice: parseFloat(invoice.subTotal),
        discount: parseFloat(invoice.discountAmount),
        vatAmount: parseFloat(invoice.vatAmount),
        grandTotal: parseFloat(invoice.totalAmount),
      },
      status: invoice.status
    };
  }


  /**
  * Create one or more manual invoices for a student using business logic
  *
  * @purpose
  *   Generate invoices in a single DB transaction by:
  *   1. Validating the student is active.
  *   2. For each month group building invoice line items (registration, inventory, course fees,
  *      transport) and calculating subtotal, discounts, VAT, and grand total.
  *
  * @param {number} studentId - ID of the student for whom to create invoices.
  * @param {number} [extraDiscount=0] - Optional additional discount (amount) to apply on the first invoice
  *                                     created for a student (applied once when appropriate).
  *
  * @returns {Promise<Invoice[]>} - A promise that resolves to an array of created `Invoice` records
  *                                 (the DB-returned rows from the `invoices` insert). Each object
  *                                 represents one invoice created inside this transaction.
  *
  * @throws {Error}
  *   - If the student is not found or is not active.
  *   - If no invoices were generated (e.g. because there were no items to invoice).
  *   - If any DB operation inside the transaction fails (transaction will roll back).
  *
  * @sideEffects
  *   - Inserts into `invoices` tables.
  *   - Reads from `students`, `studentInventory`, `inventory`, `enrollments`, `studentCourseFee`,
  *     `courses`, `transportation`, `transportationMode`, and `invoiceItems` (to count previous transport invoices).
  *   - All writes are performed inside a transaction; on any error the transaction is rolled back.
  *
  * @example
  * // Create invoices for student #42, add an extra discount of 25 
  * try {
  *   const created = await createManualInvoiceWithLogic(42, 25);
  *   console.log(`Created ${created.length} invoices:`, created.map(i => i.invoiceNumber));
  * } catch (err) {
  *   console.error('Invoice generation failed:', err);
  * }
  */
  async createManualInvoiceWithLogic(studentId: number, extraDiscount: number = 0) {
    return await db.transaction(async (tx) => {
      const today = new Date();

      const student = await tx.query.students.findFirst({
        where: eq(students.id, studentId),
      });

      if (!student || student.status !== 'active') {
        throw new Error(`Student with ID ${studentId} not found or is not active.`);
      }

      const existingInvoices = await tx
        .select({ id: invoices.id })
        .from(invoices)
        .where(eq(invoices.studentId, studentId))
        .limit(1);

      const isFirstOverallInvoice = existingInvoices.length === 0;

      const enrollmentData = await tx
        .select({
          courseName: courses.name,
          originalFee: courses.fee,
          discountType: studentCourseFee.discountType,
          discountValue: studentCourseFee.discountValue,
          monthOfYear: studentCourseFee.monthsOfYear,
        })
        .from(enrollments)
        .innerJoin(studentCourseFee, eq(enrollments.id, studentCourseFee.enrollmentId))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(and(eq(enrollments.studentId, studentId), eq(enrollments.status, 'active')));

      if (enrollmentData.length === 0) {
        throw new Error("No active enrollments found to generate invoices.");
      }

      const enrollmentsByMonth: Record<string, typeof enrollmentData> = {};

      for (const enr of enrollmentData) {
        let monthsWithYears: string[] = [];

        try {
          const raw = enr.monthOfYear || '';

          // Convert from: {"January","February"} to ['January', 'February']
          monthsWithYears = raw
            .replace(/[{}"]/g, '') // remove braces and quotes
            .split(',')
            .map(m => m.trim())
            .filter(Boolean);
        } catch (err) {
          console.error("Failed to parse monthOfYear:", enr.monthOfYear);
          continue;
        }

        for (const monthWithYear of monthsWithYears) {
          if (!enrollmentsByMonth[monthWithYear]) {
            enrollmentsByMonth[monthWithYear] = [];
          }
          enrollmentsByMonth[monthWithYear].push(enr);
        }
      }

      const createdInvoices = [];
      let invoiceCounter = 0;

      for (const monthWithYear of Object.keys(enrollmentsByMonth)) {
        // console.log("📦 Raw month key:", monthWithYear);
        const isFirstInvoiceInThisRun = invoiceCounter === 0;

        let subTotal = 0;
        let totalDiscounts = 0;
        const invoiceItemsData: any[] = [];

        const currentMonthIndex = today.getMonth(); // 0-based (0 = Jan, 6 = July)
        const currentYear = today.getFullYear();

        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Inside the loop (for each `month` in `enrollmentsByMonth`)
        const [monthName, yearStr] = monthWithYear.trim().split(' ');
        const targetMonthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
        const targetYear = parseInt(yearStr);

        if (targetMonthIndex === -1 || isNaN(targetYear)) {
          throw new Error(`Invalid month name or year: ${monthWithYear}`);
        }

        let issueDate: Date;

        // If the month is the same as current month, use today
        if (
          isFirstInvoiceInThisRun &&
          isFirstOverallInvoice &&
          targetMonthIndex === currentMonthIndex &&
          targetYear === currentYear
        ) {
          issueDate = today;
        } else {
          // Set issueDate to 1st of the target month
          // If target month is before current month, it must be for next year
          issueDate = new Date(targetYear, targetMonthIndex, 1);
        }
        const dueDate = new Date(issueDate.getFullYear(), issueDate.getMonth(), 10);

        const invoiceNumber = `INV-${format(issueDate, 'yyyyMMdd')}-${studentId}`;

        if (isFirstOverallInvoice && isFirstInvoiceInThisRun) {
          // A. Registration Fee
          if (student.registrationFee && Number(student.registrationFee) > 0) {
            const fee = Number(student.registrationFee);
            subTotal += fee;
            invoiceItemsData.push({
              description: 'Registration Fee',
              itemType: 'registration_fee',
              unitPrice: fee.toFixed(2),
              quantity: 1,
              total: fee.toFixed(2),
            });
          }

          // B. Inventory Items
          const inventoryData = await tx
            .select({
              name: inventory.items,
              quantity: studentInventory.quantity,
              amount: inventory.amount,
              discountValue: studentInventory.discountValue,
              discountType: studentInventory.discountType,
            })
            .from(studentInventory)
            .innerJoin(inventory, eq(studentInventory.inventoryId, inventory.id))
            .where(eq(studentInventory.studentId, studentId));

          for (const item of inventoryData) {
            const itemTotal = Number(item.amount) * item.quantity;
            let discountAmount = 0;
            if (item.discountType === 'amount') {
              discountAmount = Number(item.discountValue || 0);
            } else if (item.discountType === 'percentage' && item.discountValue) {
              discountAmount = (itemTotal * Number(item.discountValue)) / 100;
            }

            totalDiscounts += discountAmount;
            subTotal += itemTotal;
            invoiceItemsData.push({
              description: item.name,
              itemType: 'inventory_fee',
              discountType: item.discountType,
              discountValue: item.discountValue,
              quantity: item.quantity,
              unitPrice: itemTotal.toFixed(2),
              total: (itemTotal - discountAmount).toFixed(2),
            });
          }
        }

        const monthlyEnrollments = enrollmentsByMonth[monthWithYear];
        for (const enr of monthlyEnrollments) {
          const monthlyFee = Number(enr.originalFee);
          let discountAmount = 0;

          if (enr.discountType === 'percentage' && enr.discountValue) {
            discountAmount = (monthlyFee * Number(enr.discountValue)) / 100;
          } else if (enr.discountType === 'amount') {
            discountAmount = Number(enr.discountValue);
          }

          totalDiscounts += discountAmount;
          subTotal += monthlyFee;
          invoiceItemsData.push({
            description: `${enr.courseName}`,
            itemType: 'course_fee',
            discountType: enr.discountType,
            discountValue: enr.discountValue,
            unitPrice: monthlyFee.toFixed(2),
            quantity: 1,
            total: (monthlyFee - discountAmount).toFixed(2),
          });
        }

        const previousTransportInvoicesCount = await tx
          .select({ count: sql`COUNT(*)`.as('count') })
          .from(invoiceItems)
          .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
          .where(
            and(
              eq(invoices.studentId, studentId),
              eq(invoiceItems.itemType, 'transport_fee')
            )
          )
          .then((res) => Number(res[0]?.count ?? 0));

        const transportData = await tx
          .select({
            mode: transportationMode.mode,
            rate: transportationMode.rate,
            discountType: transportation.discountType,
            discountValue: transportation.discountValue,
            durationMonths: transportation.durationMonths,
          })
          .from(transportation)
          .innerJoin(transportationMode, eq(transportation.modeId, transportationMode.id))
          .where(and(eq(transportation.studentId, studentId), eq(transportation.status, 'active')));

        if (transportData.length > 0) {
          const t = transportData[0];
          const rate = Number(t.rate);
          let discountAmount = 0;
          // const transportTotal = Number(t.durationMonths) * rate;
          const duration = Number(t.durationMonths);
          const transportTotal = rate;

          if (previousTransportInvoicesCount < duration) {
            if (t.discountType === 'percentage') {
              const splitPercentage = duration > 1
                ? Number(t.discountValue) / duration
                : Number(t.discountValue);
              discountAmount = (rate * splitPercentage) / 100;
            } else if (t.discountType === 'amount') {
              const splitAmount = duration > 1
                ? Number(t.discountValue) / duration
                : Number(t.discountValue);
              discountAmount = Number(splitAmount);
            }
          }

          subTotal += transportTotal;
          totalDiscounts += discountAmount;
          invoiceItemsData.push({
            description: `Transportation - ${t.mode}`,
            itemType: 'transport_fee',
            discountType: t.discountType,
            discountValue: discountAmount,
            unitPrice: rate.toFixed(2),
            quantity: 1,
            total: (transportTotal - discountAmount).toFixed(2),
          });
        }

        if (invoiceItemsData.length === 0) {
          console.warn(`No invoice items to generate for student ${studentId} for month ${monthWithYear}. Skipping.`);
          continue;
        }

        totalDiscounts = totalDiscounts + (isFirstOverallInvoice && isFirstInvoiceInThisRun ? extraDiscount : 0);
        const totalAfterDiscount = subTotal - totalDiscounts;
        const vatAmount = totalAfterDiscount * 0.05;
        const grandTotal = totalAfterDiscount;

        if (isFirstOverallInvoice && isFirstInvoiceInThisRun) {
          extraDiscount = Number(extraDiscount) || 0;
          if (extraDiscount > 0) {
            invoiceItemsData.push({
              description: 'Extra Discount',
              itemType: 'extra_discount',
              discountType: 'amount',
              discountValue: extraDiscount,
              unitPrice: extraDiscount,
              quantity: 1,
              total: extraDiscount.toFixed(2),
            });
          }
        }

        const [newInvoice] = await tx.insert(invoices).values({
          invoiceNumber,
          studentId,
          issueDate: format(issueDate, 'yyyy-MM-dd'),
          dueDate: format(dueDate, 'yyyy-MM-dd'),
          amountPaid: "0.00",
          subTotal: subTotal.toFixed(2),
          discountAmount: totalDiscounts.toFixed(2),
          extraDiscount: extraDiscount.toFixed(2),
          totalAmount: grandTotal.toFixed(2),
          vatAmount: vatAmount.toFixed(2),
          status: "unpaid",
        }).returning();

        await tx.insert(invoiceItems).values(
          invoiceItemsData.map(item => ({
            ...item,
            invoiceId: newInvoice.id,
          }))
        );

        createdInvoices.push(newInvoice);
        invoiceCounter++;
      }

      if (createdInvoices.length === 0) {
        throw new Error("No invoices were generated for this student.");
      }

      return createdInvoices;
    });
  }


  /**
  * Generate a new invoice for the current month for a given student.
  *
  * @purpose
  * Create a transaction-safe invoice for the student that includes:
  * - Registration fee (if first invoice)
  * - Inventory items (if first invoice)
  * - Active course fees (monthly)
  *
  * @param {number} studentId - The unique ID of the student for whom the invoice is generated.
  * @returns {Promise<Invoice>} - A promise that resolves to the newly created invoice record.
  * @throws {Error} Throws if:
  *   - The student does not exist or is not active
  *   - No active enrollments are found for the student
  *   - Database operations fail during the transaction
  *
  * @sideEffects
  * - Creates a new invoice in the `invoices` table
  * - Modifies the database within a transaction to ensure atomicity
  *
  * @example
  * try {
  *   const invoice = await createCurrentMonthInvoice(101);
  *   console.log(`Invoice ${invoice.invoiceNumber} created with total amount ${invoice.totalAmount}`);
  * } catch (err) {
  *   console.error('Failed to create invoice:', err.message);
  * }
  */
  async createCurrentMonthInvoice(studentId: number) {
    return await db.transaction(async (tx) => {
      const today = new Date();
      const issueDate = new Date(today.getFullYear(), today.getMonth(), 1); // first day of current month
      const dueDate = new Date(today.getFullYear(), today.getMonth(), 10); // 10th day

      const student = await tx.query.students.findFirst({
        where: eq(students.id, studentId),
      });

      if (!student || student.status !== 'active') {
        throw new Error(`Student with ID ${studentId} not found or is not active.`);
      }

      const invoiceNumber = `INV-${format(issueDate, 'yyyyMMdd')}-${studentId}`;

      // Check if invoice already exists for this month
      const existingInvoice = await tx.query.invoices.findFirst({
        where: eq(invoices.invoiceNumber, invoiceNumber),
      });

      if (existingInvoice) {
        throw new Error(`Invoice already exists for ${format(issueDate, 'MMMM yyyy')}.`);
      }

      // Get all active enrollments (no month filtering)
      const enrollmentData = await tx
        .select({
          courseName: courses.name,
          originalFee: courses.fee,
          // skip discount fields here
        })
        .from(enrollments)
        .innerJoin(studentCourseFee, eq(enrollments.id, studentCourseFee.enrollmentId))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(and(eq(enrollments.studentId, studentId), eq(enrollments.status, 'active')));

      if (enrollmentData.length === 0) {
        throw new Error(`No active enrollments found for student ${studentId}.`);
      }

      const isFirstInvoice = (await tx
        .select({ id: invoices.id })
        .from(invoices)
        .where(eq(invoices.studentId, studentId))
      ).length === 0;

      let subTotal = 0;
      const invoiceItemsData: any[] = [];

      // Registration fee if first invoice
      if (isFirstInvoice && student.registrationFee && Number(student.registrationFee) > 0) {
        const fee = Number(student.registrationFee);
        subTotal += fee;
        invoiceItemsData.push({
          description: 'Registration Fee',
          itemType: 'registration_fee',
          unitPrice: fee.toFixed(2),
          quantity: 1,
          total: fee.toFixed(2),
        });
      }

      // Inventory items if first invoice
      if (isFirstInvoice) {
        const inventoryData = await tx
          .select({
            name: inventory.items,
            quantity: studentInventory.quantity,
            amount: inventory.amount,
            // skip discount fields
          })
          .from(studentInventory)
          .innerJoin(inventory, eq(studentInventory.inventoryId, inventory.id))
          .where(eq(studentInventory.studentId, studentId));

        for (const item of inventoryData) {
          const itemTotal = Number(item.amount) * item.quantity;
          subTotal += itemTotal;
          invoiceItemsData.push({
            description: item.name,
            itemType: 'inventory_fee',
            quantity: item.quantity,
            unitPrice: item.amount?.toFixed(2),
            total: itemTotal.toFixed(2),
          });
        }
      }

      // Course fees without discount
      for (const enr of enrollmentData) {
        const monthlyFee = Number(enr.originalFee);
        subTotal += monthlyFee;

        invoiceItemsData.push({
          description: enr.courseName,
          itemType: 'course_fee',
          quantity: 1,
          unitPrice: monthlyFee.toFixed(2),
          total: monthlyFee.toFixed(2),
        });
      }

      // Transportation fees without discount
      const transportData = await tx
        .select({
          mode: transportationMode.mode,
          rate: transportationMode.rate,
          durationMonths: transportation.durationMonths,
        })
        .from(transportation)
        .innerJoin(transportationMode, eq(transportation.modeId, transportationMode.id))
        .where(and(eq(transportation.studentId, studentId), eq(transportation.status, 'active')));

      if (transportData.length > 0) {
        const t = transportData[0];
        const rate = Number(t.rate);
        const duration = Number(t.durationMonths);

        // Count how many transport invoices already issued
        const previousTransportInvoicesCount = await tx
          .select({ count: sql`COUNT(*)`.as('count') })
          .from(invoiceItems)
          .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
          .where(
            and(
              eq(invoices.studentId, studentId),
              eq(invoiceItems.itemType, 'transport_fee')
            )
          )
          .then((res) => Number(res[0]?.count ?? 0));

        if (previousTransportInvoicesCount < duration) {
          subTotal += rate;
          invoiceItemsData.push({
            description: `Transportation - ${t.mode}`,
            itemType: 'transport_fee',
            quantity: 1,
            unitPrice: rate.toFixed(2),
            total: rate.toFixed(2),
          });
        }
      }

      if (invoiceItemsData.length === 0) {
        throw new Error(`No invoice items found for student ${studentId} for ${format(issueDate, 'MMMM yyyy')}.`);
      }

      const vatAmount = subTotal * 0.05;
      const grandTotal = subTotal; // no discounts, so total = subtotal

      const [newInvoice] = await tx.insert(invoices).values({
        invoiceNumber,
        studentId,
        issueDate: format(issueDate, 'yyyy-MM-dd'),
        dueDate: format(dueDate, 'yyyy-MM-dd'),
        amountPaid: "0.00",
        subTotal: subTotal.toFixed(2),
        discountAmount: "0.00", // no discount
        totalAmount: grandTotal.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        status: "unpaid",
      }).returning();

      await tx.insert(invoiceItems).values(
        invoiceItemsData.map(item => ({
          ...item,
          invoiceId: newInvoice.id,
        }))
      );

      return newInvoice;
    });
  }

  /**
  * Cancel an existing invoice by setting its status to 'cancelled'.
  *
  * @purpose Mark an invoice as cancelled in the database.
  * 
  * @param {number} invoiceId - The unique ID of the invoice to cancel.
  * @returns {Promise<number>} - A promise that resolves to the number of rows affected by the update.
  *                              Typically, `1` if the invoice was found and updated, `0` if no matching invoice exists.
  * @throws {Error} Throws if the database update operation fails.
  * @sideEffects Updates the `status` field of the `invoices` table for the given invoice ID.
  *
  * @example
  * try {
  *   const rowsUpdated = await cancelInvoice(42);
  *   if (rowsUpdated > 0) console.log('Invoice cancelled successfully');
  *   else console.log('Invoice not found');
  * } catch (err) {
  *   console.error('Failed to cancel invoice:', err.message);
  * }
  */
  async cancelInvoice(invoiceId: number) {
    console.log(`Cancelling invoice with ID: ${invoiceId}`);
    
  // Update invoice status to 'cancelled'
  const result = await db
    .update(invoices)
    .set({ status: "cancelled" })
    .where(eq(invoices.id, invoiceId));
  
  return result; // returns number of rows affected
}

  // Employee methods

  /**
  * Fetch an employee by internal database ID.
  *
  * @purpose Retrieve a single employee record from the database by its unique ID.
  * 
  * @param {number} id - The unique database ID of the employee.
  * @returns {Promise<Employee | undefined>} - The employee record if found, otherwise undefined.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const employee = await getEmployee(1);
  * console.log(employee?.firstName);
  */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const result = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    return result[0];
  }

  /**
  * Fetch an employee by their company-assigned employee ID.
  *
  * @purpose Retrieve an employee record using the company's employee identifier.
  * 
  * @param {string} employeeId - The employee's unique company ID.
  * @returns {Promise<Employee | undefined>} - The employee record if found, otherwise undefined.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const employee = await getEmployeeByEmployeeId("EMP123");
  * console.log(employee?.firstName);
  */
  async getEmployeeByEmployeeId(
    employeeId: string
  ): Promise<Employee | undefined> {
    const result = await db
      .select()
      .from(employees)
      .where(eq(employees.employeeId, employeeId));
    return result[0];
  }

  /**
  * Fetch all employees.
  *
  * @purpose Retrieve a list of all employees in the system.
  * 
  * @returns {Promise<Employee[]>} - An array of all employee records.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const allEmployees = await getEmployees();
  * console.log(allEmployees.length);
  */
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  /**
  * Fetch employees by position.
  *
  * @purpose Retrieve employees who hold a specific position in the organization.
  * 
  * @param {string} position - The job position to filter employees by.
  * @returns {Promise<Employee[]>} - An array of employees holding the specified position.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const managers = await getEmployeesByPosition("Manager");
  */
  async getEmployeesByPosition(position: string): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(eq(employees.position, position));
  }

  /**
  * Fetch employees by branch.
  *
  * @purpose Retrieve employees working in a specific branch of the organization.
  * 
  * @param {string} branch - The branch name to filter employees by.
  * @returns {Promise<Employee[]>} - An array of employees in the specified branch.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const branchEmployees = await getEmployeesByBranch("New York");
  */
  async getEmployeesByBranch(branch: string): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(eq(employees.branch, branch));
  }

  /**
  * Create a new employee record.
  *
  * @purpose Insert a new employee into the database.
  * 
  * @param {InsertEmployee} employee - The employee data to insert.
  * @returns {Promise<Employee>} - The newly created employee record.
  * @throws {Error} If the database insert operation fails.
  * @sideEffects Inserts a new employee record into the `employees` table.
  * 
  * @example
  * const newEmployee = await createEmployee({
  *   employeeId: "EMP456",
  *   firstName: "John",
  *   lastName: "Doe",
  *   position: "Developer",
  *   branch: "NY",
  * });
  */
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await db
      .insert(employees)
      .values({
        ...employee,
        status: employee.status || "active",
        bankAccount: employee.bankAccount || null,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  /**
  * Update an existing employee record.
  *
  * @purpose Modify an employee's information in the database.
  * 
  * @param {number} id - The unique database ID of the employee to update.
  * @param {Partial<Employee>} employee - Partial data to update for the employee.
  * @returns {Promise<Employee | undefined>} - The updated employee record, or undefined if not found.
  * @throws {Error} If the database update operation fails.
  * @sideEffects Updates the employee record in the `employees` table.
  * 
  * @example
  * const updatedEmployee = await updateEmployee(1, { position: "Senior Developer" });
  */
  async updateEmployee(
    id: number,
    employee: Partial<Employee>
  ): Promise<Employee | undefined> {
    const result = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return result[0];
  }

  /**
  * Delete an employee record.
  *
  * @purpose Remove an employee from the database.
  * 
  * @param {number} id - The unique database ID of the employee to delete.
  * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
  * @throws {Error} If the database delete operation fails.
  * @sideEffects Deletes the employee record from the `employees` table.
  * 
  * @example
  * const success = await deleteEmployee(1);
  * if (success) console.log("Employee deleted");
  */
  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db
      .delete(employees)
      .where(eq(employees.id, id))
      .returning();
    return result.length > 0;
  }

  /**
  * Fetch a payroll record by its ID.
  *
  * @purpose Retrieve a single payroll record from the database by ID.
  * 
  * @param {number} id - The unique ID of the payroll record.
  * @returns {Promise<Payroll | undefined>} - The payroll record if found, otherwise undefined.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const payroll = await getPayroll(1);
  * console.log(payroll?.employeeId);
  */
  async getPayroll(id: number): Promise<Payroll | undefined> {
    const result = await db.select().from(payrolls).where(eq(payrolls.id, id));
    return result[0];
  }

  /**
  * Fetch all payroll records.
  *
  * @purpose Retrieve all payroll records from the database.
  * 
  * @returns {Promise<Payroll[]>} - An array of all payroll records.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const allPayrolls = await getPayrolls();
  * console.log(allPayrolls.length);
  */
  async getPayrolls(): Promise<Payroll[]> {
    return await db.select().from(payrolls);
  }

  /**
  * Fetch payroll records for a specific employee.
  *
  * @purpose Retrieve all payroll records associated with a particular employee.
  * 
  * @param {number} employeeId - The ID of the employee.
  * @returns {Promise<Payroll[]>} - An array of payroll records for the employee.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const payrolls = await getPayrollsByEmployee(5);
  */
  async getPayrollsByEmployee(employeeId: number): Promise<Payroll[]> {
    return await db
      .select()
      .from(payrolls)
      .where(eq(payrolls.employeeId, employeeId));
  }

  /**
  * Fetch payroll records by month.
  *
  * @purpose Retrieve all payroll records for a specific month.
  * 
  * @param {string} month - The month in format 'YYYY-MM' or other valid string.
  * @returns {Promise<Payroll[]>} - An array of payroll records for the month.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const payrolls = await getPayrollsByMonth("2025-10");
  */
  async getPayrollsByMonth(month: string): Promise<Payroll[]> {
    return await db.select().from(payrolls).where(eq(payrolls.month, month));
  }

  /**
  * Create a new payroll record.
  *
  * @purpose Insert a new payroll entry into the database.
  *
  * @param {InsertPayroll} payroll - The payroll data to insert.
  * @returns {Promise<Payroll>} - The newly created payroll record.
  * @throws {Error} If the database insert operation fails.
  * @sideEffects Inserts a new record into the `payrolls` table.
  * 
  * @example
  * const newPayroll = await createPayroll({
  *   employeeId: 5,
  *   month: "2025-10",
  *   amount: "2000.00",
  * });
  */
  async createPayroll(payroll: InsertPayroll): Promise<Payroll> {
    const result = await db
      .insert(payrolls)
      .values({
        ...payroll,
        status: payroll.status || "pending",
        paymentDate: payroll.paymentDate || null,
        remarks: payroll.remarks || null,
        incentives: payroll.incentives || null,
        deductions: payroll.deductions || null,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  /**
  * Update an existing payroll record.
  *
  * @purpose Modify payroll details for an existing payroll entry.
  * 
  * @param {number} id - The unique ID of the payroll record to update.
  * @param {Partial<Payroll>} payroll - Partial payroll data to update.
  * @returns {Promise<Payroll | undefined>} - The updated payroll record, or undefined if not found.
  * @throws {Error} If the database update operation fails.
  * @sideEffects Updates the payroll record in the `payrolls` table.
  * 
  * @example
  * const updatedPayroll = await updatePayroll(1, { status: "paid" });
  */
  async updatePayroll(
    id: number,
    payroll: Partial<Payroll>
  ): Promise<Payroll | undefined> {
    const result = await db
      .update(payrolls)
      .set(payroll)
      .where(eq(payrolls.id, id))
      .returning();
    return result[0];
  }

  /**
  * Delete a payroll record.
  *
  * @purpose Remove a payroll record from the database.
  * 
  * @param {number} id - The unique ID of the payroll record to delete.
  * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
  * @throws {Error} If the database delete operation fails.
  * @sideEffects Deletes the payroll record from the `payrolls` table.
  * 
  * @example
  * const success = await deletePayroll(1);
  * if (success) console.log("Payroll deleted");
  */
  async deletePayroll(id: number): Promise<boolean> {
    const result = await db
      .delete(payrolls)
      .where(eq(payrolls.id, id))
      .returning();
    return result.length > 0;
  }

  // Message methods

  /**
  * Fetch a message by its ID.
  *
  * @purpose Retrieve a single message record from the database by ID.
  * 
  * @param {number} id - The unique ID of the message.
  * @returns {Promise<Message | undefined>} - The message record if found, otherwise undefined.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const message = await getMessage(1);
  * console.log(message?.content);
  */
  async getMessage(id: number): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id));
    return result[0];
  }

  /**
  * Fetch all messages.
  *
  * @purpose Retrieve all message records from the database.
  * 
  * @returns {Promise<Message[]>} - An array of all messages.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const allMessages = await getMessages();
  * console.log(allMessages.length);
  */
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  /**
  * Fetch messages sent by a specific sender.
  *
  * @purpose Retrieve all messages sent by a particular user.
  * 
  * @param {number} senderId - The ID of the sender.
  * @returns {Promise<Message[]>} - An array of messages sent by the sender.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const sentMessages = await getMessagesBySender(5);
  */
  async getMessagesBySender(senderId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.senderId, senderId));
  }

  /**
  * Fetch messages received by a specific receiver.
  *
  * @purpose Retrieve all messages received by a particular user.
  * 
  * @param {number} receiverId - The ID of the receiver.
  * @returns {Promise<Message[]>} - An array of messages received by the receiver.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const receivedMessages = await getMessagesByReceiver(5);
  */
  async getMessagesByReceiver(receiverId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.receiverId, receiverId));
  }

  /**
  * Create a new message.
  *
  * @purpose Insert a new message record into the database.
  * 
  * @param {InsertMessage} message - The message data to insert.
  * @returns {Promise<Message>} - The newly created message record.
  * @throws {Error} If the database insert operation fails.
  * @sideEffects Inserts a new record into the `messages` table with `sentAt` timestamp and default status 'unread'.
  * 
  * @example
  * const newMessage = await createMessage({
  *   senderId: 1,
  *   receiverId: 2,
  *   content: "Hello!"
  * });
  */
  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db
      .insert(messages)
      .values({
        ...message,
        sentAt: new Date(),
        readAt: null,
        status: "unread",
      })
      .returning();
    return result[0];
  }

  /**
  * Update an existing message.
  *
  * @purpose Modify message details for an existing message record.
  * 
  * @param {number} id - The unique ID of the message to update.
  * @param {Partial<Message>} message - Partial message data to update.
  * @returns {Promise<Message | undefined>} - The updated message record, or undefined if not found.
  * @throws {Error} If the database update operation fails.
  * @sideEffects Updates the message record in the `messages` table.
  * 
  * @example
  * const updatedMessage = await updateMessage(1, { status: "read", readAt: new Date() });
  */
  async updateMessage(
    id: number,
    message: Partial<Message>
  ): Promise<Message | undefined> {
    const result = await db
      .update(messages)
      .set(message)
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  }

  /**
  * Delete a message.
  *
  * @purpose Remove a message record from the database.
  * 
  * @param {number} id - The unique ID of the message to delete.
  * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
  * @throws {Error} If the database delete operation fails.
  * @sideEffects Deletes the message record from the `messages` table.
  * 
  * @example
  * const success = await deleteMessage(1);
  * if (success) console.log("Message deleted");
  */
  async deleteMessage(id: number): Promise<boolean> {
    const result = await db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning();
    return result.length > 0;
  }

  // Branch methods

  /**
  * Fetch a branch by its ID along with its associated brands.
  *
  * @purpose Retrieve a single branch record and its associated branch brands.
  * 
  * @param {number} id - The unique ID of the branch.
  * @returns {Promise<Branch & { branchBrands: BranchBrand[] } | undefined>} - Branch record with an array of associated branch brands.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const branch = await getBranch(1);
  * console.log(branch?.branchBrands);
  */
  async getBranch(id: number): Promise<Branch & { branchBrands: BranchBrand[] } | undefined> {
    const result = await db.select().from(branches).where(eq(branches.id, id));
    const branchBrandsResult = await db.select().from(branchBrands).where(eq(branchBrands.branchId, id));
    return {
      ...result[0],
      branchBrands: branchBrandsResult,
    };
  }

  /**
  * Fetch all branches along with their associated brand IDs.
  *
  * @purpose Retrieve all branches with a list of brand IDs associated with each branch.
  * 
  * @returns {Promise<(Branch & { brandIds: number[] })[]>} - Array of branches with brand IDs.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const branches = await getBranches();
  * console.log(branches[0].brandIds);
  */
  async getBranches(): Promise<(Branch & { brandIds: number[] })[]> {
    const branchesResult = await db.select().from(branches);
    const branchBrandsResult = await db.select().from(branchBrands);

    return branchesResult.map(branch => ({
      ...branch,
      brandIds: branchBrandsResult
        .filter(bb => bb.branchId === branch.id)
        .map(bb => bb.brandId),
    }));
  }

  /**
  * Fetch a branch by its name.
  *
  * @purpose Retrieve a single branch record based on its name.
  * 
  * @param {string} name - The name of the branch.
  * @returns {Promise<Branch | undefined>} - Branch record if found, otherwise undefined.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const branch = await getBranchByName("Downtown Branch");
  */
  async getBranchByName(name: string): Promise<Branch | undefined> {
    const result = await db
      .select()
      .from(branches)
      .where(eq(branches.name, name));
    return result[0];
  }

  /**
  * Create a new branch.
  *
  * @purpose Insert a new branch record into the database.
  * 
  * @param {InsertBranch} branch - The branch data to insert.
  * @returns {Promise<Branch>} - The newly created branch record.
  * @throws {Error} If the database insert operation fails.
  * @sideEffects Inserts a new record into the `branches` table with a `createdAt` timestamp.
  * 
  * @example
  * const newBranch = await createBranch({ name: "Uptown", status: "active" });
  */
  async createBranch(branch: InsertBranch): Promise<Branch> {
    const result = await db.insert(branches).values({
      ...branch,
      // brandId: Number(branch.brandId),
      status: branch.status || "active",
      manager: branch.manager || null,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  /**
  * Update an existing branch.
  *
  * @purpose Modify details of an existing branch record.
  * 
  * @param {number} id - The unique ID of the branch to update.
  * @param {Partial<Branch>} branch - Partial branch data to update.
  * @returns {Promise<Branch | undefined>} - The updated branch record, or undefined if not found.
  * @throws {Error} If the database update operation fails.
  * @sideEffects Updates the branch record in the `branches` table.
  * 
  * @example
  * const updatedBranch = await updateBranch(1, { manager: "John Doe" });
  */
  async updateBranch(id: number, branch: Partial<Branch>): Promise<Branch | undefined> {
    const result = await db.update(branches)
      .set(branch)
      .where(eq(branches.id, id))
      .returning();
    return result[0];
  }


  /**
  * Delete a branch.
  *
  * @purpose Remove a branch record from the database.
  * 
  * @param {number} id - The unique ID of the branch to delete.
  * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
  * @throws {Error} If the database delete operation fails.
  * @sideEffects Deletes the branch record from the `branches` table.
  * 
  * @example
  * const success = await deleteBranch(1);
  * if (success) console.log("Branch deleted successfully");
  */
  async deleteBranch(id: number): Promise<boolean> {
    const result = await db
      .delete(branches)
      .where(eq(branches.id, id))
      .returning();
    return result.length > 0;
  }

  // Branch-brand methods

  /**
  * Fetch all branch-brand associations.
  *
  * @purpose Retrieve all branch-brand records from the database.
  * 
  * @returns {Promise<BranchBrand[]>} - Array of all branch-brand associations.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const brands = await getBranchBrands();
  */
  async getBranchBrands(): Promise<BranchBrand[]> {
    return await db.select().from(branchBrands);
  }

  /**
  * Create a new branch-brand association.
  *
  * @purpose Insert a new branch-brand record into the database.
  * 
  * @param {InsertBranchBrand} data - The data for the branch-brand association.
  * @returns {Promise<BranchBrand>} - The newly created branch-brand record.
  * @throws {Error} If the database insert operation fails.
  * @sideEffects Inserts a new record into the `branchBrands` table with a `createdAt` timestamp.
  * 
  * @example
  * const newBranchBrand = await createBranchBrand({ branchId: 1, brandId: 2 });
  */
  async createBranchBrand(data: InsertBranchBrand): Promise<BranchBrand> {
    const result = await db
      .insert(branchBrands)
      .values({ ...data, createdAt: new Date() })
      .returning();
    return result[0];
  }


  /**
  * Delete all brand associations for a specific branch.
  *
  * @purpose Remove all branch-brand records for a given branch.
  * 
  * @param {number} branchId - The ID of the branch whose brand associations will be deleted.
  * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
  * @throws {Error} If the database delete operation fails.
  * @sideEffects Deletes branch-brand records in the `branchBrands` table for the given branch.
  * 
  * @example
  * const success = await deleteBranchBrand(1);
  */
  async deleteBranchBrand(branchId: number): Promise<boolean> {
    const result = await db
      .delete(branchBrands)
      .where(and(eq(branchBrands.branchId, branchId)))
      .returning();
    return result.length > 0;
  }

  //  Student Payment methods

  /**
  * Create a new student payment record.
  *
  * @purpose Insert a new payment record for a student into the database.
  * 
  * @param {InsertStudentPayment} data - The student payment details.
  * @returns {Promise<StudentPayment>} - The newly created student payment record.
  * @throws {Error} If the database insert operation fails.
  * @sideEffects Inserts a new record into the `studentPayments` table with a `createdAt` timestamp.
  * 
  * @example
  * const payment = await createStudentPayment({ studentId: 1, amount: 1000, paymentMethod: 'cash' });
  */
  async createStudentPayment(data: InsertStudentPayment): Promise<StudentPayment> {
    const result = await db
      .insert(studentPayments)
      .values({ ...data, createdAt: new Date() })
      .returning();
    return result[0];
  }


  /**
  * Fetch all student payments.
  *
  * @purpose Retrieve all payment records made by students.
  * 
  * @returns {Promise<StudentPayment[]>} - Array of student payments.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const payments = await getStudentPayments();
  */
  async getStudentPayments(): Promise<StudentPayment[]> {
    return await db.select().from(studentPayments);
  }


  /**
  * Fetch a specific student payment by its ID.
  *
  * @purpose Retrieve a single student payment record.
  * 
  * @param {number} id - The unique ID of the student payment.
  * @returns {Promise<StudentPayment | undefined>} - The student payment record, or undefined if not found.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const payment = await getStudentPayment(1);
  */
  async getStudentPayment(id: number): Promise<StudentPayment | undefined> {
    const result = await db.select().from(studentPayments).where(eq(studentPayments.id, id));
    return result[0];
  }


  /**
  * Update an existing student payment.
  *
  * @purpose Modify details of a student payment record.
  * 
  * @param {number} id - The unique ID of the student payment to update.
  * @param {Partial<InsertStudentPayment>} data - Partial data to update.
  * @returns {Promise<StudentPayment | undefined>} - The updated student payment record, or undefined if not found.
  * @throws {Error} If the database update operation fails.
  * @sideEffects Updates the student payment record in the `studentPayments` table.
  * 
  * @example
  * const updatedPayment = await updateStudentPayment(1, { amount: 1200 });
  */
  async updateStudentPayment(id: number, data: Partial<InsertStudentPayment>): Promise<StudentPayment | undefined> {
    const result = await db.update(studentPayments).set(data).where(eq(studentPayments.id, id)).returning();
    return result[0];
  }

  /**
  * Delete a student payment.
  *
  * @purpose Remove a student payment record from the database.
  * 
  * @param {number} id - The unique ID of the student payment to delete.
  * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
  * @throws {Error} If the database delete operation fails.
  * @sideEffects Deletes the student payment record from the `studentPayments` table.
  * 
  * @example
  * const success = await deleteStudentPayment(1);
  */
  async deleteStudentPayment(id: number): Promise<boolean> {
    const result = await db
      .delete(studentPayments)
      .where(eq(studentPayments.id, id))
      .returning();
    return result.length > 0;
  }

  /**
  * Generate a new unique payment ID.
  *
  * @purpose To create a sequential, unique payment identifier for student payments.
  * 
  * @returns {Promise<string>} - A new payment ID in the format `PAY-<number>`.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const newPaymentId = await generatePaymentId(); // e.g., 'PAY-102'
  */
  async generatePaymentId(): Promise<string> {
    const result = await db
      .select({ paymentId: studentPayments.paymentId })
      .from(studentPayments)
      .orderBy(desc(studentPayments.paymentId))
      .limit(1);

    let nextNumber = 101;

    if (result.length > 0) {
      const match = result[0].paymentId.match(/PAY-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextNumber = lastNumber + 1;
      }
    }

    return `PAY-${nextNumber}`;
  }


  /**
  * Generate a new unique receipt ID.
  *
  * @purpose To create a sequential, unique receipt identifier.
  * 
  * @returns {Promise<string>} - A new receipt ID in the format `REC-<number>`.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const newReceiptId = await generateReceiptId(); // e.g., 'REC-102'
  */
  async generateReceiptId(): Promise<string> {
    const result = await db
      .select({ receiptNumber: receipts.receiptNumber })
      .from(receipts)
      .orderBy(desc(receipts.receiptNumber))
      .limit(1);

    let nextNumber = 101;

    if (result.length > 0) {
      const match = result[0].receiptNumber.match(/REC-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextNumber = lastNumber + 1;
      }
    }

    return `REC-${nextNumber}`;
  }


  /**
  * Fetch all invoices for a specific student.
  *
  * @purpose Retrieve all invoice records associated with a given student.
  * 
  * @param {number} studentId - The ID of the student.
  * @returns {Promise<Invoice[]>} - Array of invoices for the student.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const invoices = await getInvoicesByStudent(1);
  */
  async getInvoicesByStudent(studentId: number): Promise<Invoice[]> {
    const result = await db
      .select()
      .from(invoices)
      .where(eq(invoices.studentId, studentId));
    return result;
  }


  /**
  * Fetch all unpaid invoices in the system.
  *
  * @purpose Retrieve a list of invoices with status 'unpaid' for follow-up or reporting.
  * 
  * @returns {Promise<{ studentId: number; invoiceNumber: string; totalAmount: number }[]>} - Array of unpaid invoice summaries.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const unpaidInvoices = await getUnpaidInvoices();
  */
  async getUnpaidInvoices(): Promise<{ studentId: number; invoiceNumber: string; totalAmount: number }[]> {
    const result = await db
      .select({
        studentId: invoices.studentId,
        invoiceNumber: invoices.invoiceNumber,
        totalAmount: sql<number>`invoices.total_amount::int`
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.status, 'unpaid'),
        )
      );

    return result;
  }

  /**
  * Get all unpaid or partially paid invoices for a specific student.
  *
  * @purpose Retrieve invoices for a student that still have outstanding balances.
  * 
  * @param {number} studentId - The ID of the student.
  * @returns {Promise<{ studentId: number; invoiceNumber: string; totalAmount: number }[]>}
  *   Array of objects with studentId, invoiceNumber, and remaining totalAmount.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const unpaidInvoices = await getUnpaidInvoicesByStudent(1);
  */
  async getUnpaidInvoicesByStudent(studentId: number): Promise<{ studentId: number; invoiceNumber: string; totalAmount: number }[]> {
    const result = await db
      .select({
        studentId: invoices.studentId,
        invoiceNumber: invoices.invoiceNumber,
        totalAmount: sql<number>`invoices.total_amount-invoices.amount_paid`
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.studentId, studentId),
          or(eq(invoices.status, 'unpaid'), eq(invoices.status, 'partially_paid'))
        )
      );

    return result;
  }


  /**
  * Get the list of students who have invoices issued in a specific month and year.
  *
  * @purpose Determine which students have invoices for reporting or billing purposes.
  * 
  * @param {number[]} studentIds - Array of student IDs to check.
  * @param {number} month - Month (1-12) to filter invoices.
  * @param {number} year - Year to filter invoices.
  * @returns {Promise<number[]>} Array of student IDs with invoices in the specified month/year.
  * @throws {Error} If the database query fails.
  * @sideEffects None
  * 
  * @example
  * const billedStudents = await getStudentsWithInvoices([1,2,3], 10, 2025);
  */
  async getStudentsWithInvoices(studentIds: number[], month: number, year: number): Promise<number[]> {
    // Use raw SQL for EXTRACT(MONTH) and EXTRACT(YEAR)
    const rows = await db
      .select({
        studentId: invoices.studentId,
      })
      .from(invoices)
      .where(
        and(
          inArray(invoices.studentId, studentIds),
          sql`EXTRACT(MONTH FROM ${invoices.issueDate}) = ${month}`,
          sql`EXTRACT(YEAR FROM ${invoices.issueDate}) = ${year}`
        )
      )
      .groupBy(invoices.studentId);

    return rows.map(row => row.studentId);
  }


  /**
  * Get a summary of a student's outstanding financials.
  *
  * @purpose Calculate total invoiced amount, paid amount, credits applied, and remaining outstanding balance.
  * 
  * @param {number} studentId - The ID of the student.
  * @returns {Promise<{ total: number; paid: number; outstandingAmount: number; creditAmount: number }>}
  * @sideEffects None – purely reads data from invoices and creditNotes tables.
  * 
  * @example
  * const summary = await getOutstandingSummary(1);
  * // returns { total: 1000, paid: 600, outstandingAmount: 300, creditAmount: 100 }
  */
  async getOutstandingSummary(studentId: number): Promise<{ total: number; paid: number; outstandingAmount: number; creditAmount: number }> {
    const invoiceData = await db
      .select({
        totalAmount: sql<number>`SUM(${invoices.totalAmount})`,
        amountPaid: sql<number>`SUM(${invoices.amountPaid})`,
      })
      .from(invoices)
      .where(eq(invoices.studentId, studentId))
      .then((res) => res[0]);

    // 2. Get credit note totals of account type
    const creditData = await db
      .select({
        creditAmount: sql<number>`SUM(${creditNotes.amount})`,
      })
      .from(creditNotes)
      .where(
        and(
          eq(creditNotes.studentId, studentId),
          eq(creditNotes.appliedToType, "own account")
        )
      )
      .then((res) => res[0]);

    // 3. Compute values safely
    const totalAmount = invoiceData?.totalAmount ?? 0;
    const amountPaid = invoiceData?.amountPaid ?? 0;
    const creditAmount = creditData?.creditAmount ?? 0;

    const outstandingAmount = totalAmount - amountPaid - creditAmount;

    // 4. Return final result
    return {
      total: totalAmount,
      paid: amountPaid,
      creditAmount,
      outstandingAmount,
    };
  }

  // Payment item methods

  
/**
 * Get all payment items.
 *
 * @purpose Fetch all payment items for configuration or reporting.
 * 
 * @param {void} - No parameters required.
 * @returns {Promise<PaymentItem[]>} - Array of PaymentItem objects.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * const paymentItems = await storage.getPaymentItems();
 */
  async getPaymentItems(): Promise<PaymentItem[]> {
    return await db.select().from(paymentItems);
  }


  /**
  * Get a specific payment item by ID.
  *
  * @purpose Retrieve details of a single payment item.
  *
  * @param {number} id - ID of the payment item.
  * @returns {Promise<PaymentItem | undefined>}
  * @sideEffects None
  * @throws None
  * 
  * @example
  * const paymentItem = await storage.getPaymentItem(1);
  */
  async getPaymentItem(id: number): Promise<PaymentItem | undefined> {
    const result = await db
      .select()
      .from(paymentItems)
      .where(eq(paymentItems.id, id));
    return result[0];
  }

  /**
  * Create a new payment item.
  * 
  * @purpose Add a new payment item for future invoices or receipts.
  *
  * @param {InsertPaymentItem} paymentItem - Data to insert.
  * @returns {Promise<PaymentItem>}
  * @sideEffects Inserts a new record into the paymentItems table.
  * @throws None
  * 
  * @example
  * const newPaymentItem = await storage.createPaymentItem({ name: 'Lesson Fee', amount: 100 });
  */
  async createPaymentItem(paymentItem: InsertPaymentItem): Promise<PaymentItem> {
    const result = await db
      .insert(paymentItems)
      .values({
        ...paymentItem,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  // Receipt methods

  /**
  * Get all receipts.
  * @purpose Retrieve all receipts issued.
  * 
  * @returns {Promise<Receipt[]>}
  * @sideEffects None
  * @throws None
  * 
  * @example
  * const receipts = await storage.getReceipts();
  */
  async getReceipts(): Promise<Receipt[]> {
    return await db.select().from(receipts);
  }


  /**
  * Get a specific receipt by ID.
  * 
  * @purpose Fetch details of a single receipt.
  *
  * @param {number} id - ID of the receipt.
  * @returns {Promise<Receipt | undefined>}
  * @sideEffects None
  * @throws None
  * 
  * @example
  * const receipt = await storage.getReceipt(1);
  */
  async getReceipt(id: number): Promise<Receipt | undefined> {
    const result = await db
      .select()
      .from(receipts)
      .where(eq(receipts.id, id));
    return result[0];
  }

  /**
  * Get a receipt along with the student's full name by receipt number.
  *
  * @purpose Combine receipt data with the associated student's name for display or reporting.
  * 
  * @param {string} receiptNumber - The receipt number.
  * @returns {Promise<{...receipt, studentName: string}>}
  * @sideEffects None
  * @throws None
  * 
  * @example
  * const receipt = await storage.getReceiptByReceiptNumber('REC-12345');
  */
  async getReceiptByReceiptNumber(receiptNumber: string) {
    const result = await db
      .select({
        receipt: receipts,
        // firstName: students.firstName,
        // middleName: students.middleName,
        // lastName: students.lastName,
        student: students
      })
      .from(receipts)
      .innerJoin(studentPayments, eq(receipts.paymentId, studentPayments.paymentId))
      .innerJoin(students, eq(studentPayments.studentId, students.id))
      .where(eq(receipts.receiptNumber, receiptNumber));

    const { receipt, student } = result[0];

    const fullName = `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim().replace(/\s+/g, ' ');

    return {
      ...receipt,
      studentName: fullName,
    };
  }

  /**
  * Create a new receipt.
  *
  * @purpose Record a new receipt in the system for a payment.
  * 
  * @param {InsertReceipt} receipt - Receipt data to insert.
  * @returns {Promise<Receipt>}
  * @sideEffects Inserts a new record into the `receipts` table.
  * @throws None
  * 
  * @example
  * const newReceipt = await storage.createReceipt({
  *   receiptNumber: 'REC-12345',
  *   paymentId: 1,
  *   amount: 100,
  *   createdAt: new Date(),
  * });
  */
  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const result = await db
      .insert(receipts)
      .values({
        ...receipt,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  // Credit notes

  /**
  * Get all credit notes.
  *
  * @purpose Retrieve all credit notes for reporting or processing.
  * 
  * @returns {Promise<CreditNote[]>}
  * @sideEffects None – purely reads from `creditNotes`.
  * @throws None
  * 
  * @example
  * const creditNotes = await storage.getCreditNotes();
  */
  async getCreditNotes(): Promise<CreditNote[]> {
    return await db.select().from(creditNotes);
  }

  /**
  * Get a single credit note by ID.
  *
  * @purpose Fetch a specific credit note.
  * 
  * @param {number} id - Credit note ID.
  * @returns {Promise<CreditNote | undefined>}
  * @sideEffects None – read-only operation.
  * @throws None
  * 
  * @example
  * const creditNote = await storage.getCreditNote(1);
  */
  async getCreditNote(id: number): Promise<CreditNote | undefined> {
    const result = await db.select().from(creditNotes).where(eq(creditNotes.id, id));
    return result[0];
  }


  /**
  * Get a credit note along with the student's full name and associated invoice number by credit note number.
  *
  * @purpose Combine credit note info with student details and linked invoice for display/reporting.
  * 
  * @param {string} creditNoteNumber - Unique credit note number.
  * @returns {Promise<{ creditNote: CreditNote; studentName: string; invoiceNumber: string }>}
  * @sideEffects None – purely reads data from `creditNotes`, `students`, and `invoices`.
  * @throws Will throw an error if no matching credit note is found.
  * 
  * @example
  * const creditNote = await storage.getCreditNoteByCreditNoteNumber('CN-12345');
  */
  async getCreditNoteByCreditNoteNumber(creditNoteNumber: string) {
    const result = await db
      .select({
        creditNote: creditNotes,
        // firstName: students.firstName,
        // middleName: students.middleName,
        // lastName: students.lastName,
        student: students,
        invoice: invoices
      })
      .from(creditNotes)
      .innerJoin(students, eq(creditNotes.studentId, students.id))
      .leftJoin(invoices, eq(creditNotes.appliedInvoiceId, invoices.id))
      .where(eq(creditNotes.creditNoteNumber, creditNoteNumber));

    if (!result || result.length === 0) {
      throw new Error("No data returned — result is empty or undefined.");
    }

    const { creditNote, student, invoice } = result[0];

    const fullName = `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim().replace(/\s+/g, ' ');

    return {
      ...creditNote,
      studentName: fullName,
      invoiceNumber: invoice ? invoice.invoiceNumber : "-",
    };
  }

  /**
 * Get credit notes for all students of a given parent, optionally filtered by statuses.
 *
 * @purpose Fetch all credit notes for children of a parent for reporting or account reconciliation.
 * 
 * @param {number} parentId - The ID of the parent.
 * @param {string[]} [statuses] - Optional array of credit note statuses to filter by.
 * @returns {Promise<any[]>} - Returns credit notes along with student info and invoice number.
 * @sideEffects None – purely reads from `creditNotes`, `students`, and `invoices`.
 * 
 * @example
 * const creditNotes = await storage.getCreditNotesByParentId(1, ['pending', 'applied']);
 */
  async getCreditNotesByParentId(parentId: number, statuses?: string[]) {
    const whereClause = [
      eq(students.parentId, parentId),
      statuses && statuses.length > 0 ? inArray(creditNotes.status, statuses) : undefined,
    ].filter(Boolean);

    const result = await db
      .select({
        creditNotes: creditNotes,
        studentId: students.studentId,
        firstName: students.firstName,
        middleName: students.middleName,
        lastName: students.lastName,
        invoiceNumber: invoices.invoiceNumber,
      })
      .from(creditNotes)
      .innerJoin(students, eq(creditNotes.studentId, students.id))
      .leftJoin(invoices, eq(creditNotes.appliedInvoiceId, invoices.id))
      .where(and(...whereClause))
      .orderBy(creditNotes.id);

    return result;
  }


  /**
  * Create a new credit note.
  *
  * @purpose Record a credit note for a student, optionally applied against an invoice.
  * 
  * @param {InsertCreditNote} creditNote - The credit note data to insert.
  * @returns {Promise<CreditNote>} - The newly created credit note with an auto-generated number.
  * @sideEffects Inserts a new record into the `creditNotes` table.
  * @notes Generates a unique `creditNoteNumber` sequentially using the last inserted record.
  * 
  * @example
  * const newCreditNote = await storage.createCreditNote({
  *   studentId: 1,
  *   amount: 100,
  *   appliedInvoiceId: 1,
  *   appliedToType: 'against invoice',
  *   status: 'pending',
  * });
  */
  async createCreditNote(creditNote: InsertCreditNote): Promise<CreditNote> {
    // 1. Get the latest creditNoteNumber (ordered by created date or ID)
    const lastCreditNote = await db
      .select()
      .from(creditNotes)
      .orderBy(desc(creditNotes.id)) // or use createdAt if needed
      .limit(1);

    // 2. Generate next number
    let nextNumber = 101; // default start
    if (lastCreditNote.length > 0 && lastCreditNote[0].creditNoteNumber) {
      const lastNumber = parseInt(
        lastCreditNote[0].creditNoteNumber.replace("CN-", "")
      );
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const creditNoteNumber = `CN-${nextNumber}`;

    // 3. Insert new credit note
    const result = await db
      .insert(creditNotes)
      .values({
        ...creditNote,
        appliedInvoiceId: creditNote.appliedToType === 'against invoice' && creditNote.appliedInvoiceId
          ? creditNote.appliedInvoiceId
          : null,
        creditNoteNumber,
        createdAt: new Date(),
      })
      .returning();

    return result[0];
  }
}