import { db } from "./db";
import { eq, and, or, like } from "drizzle-orm";
import { format } from "date-fns";
import session from "express-session";
import {
  users,
  User,
  InsertUser,
  courses,
  Course,
  InsertCourse,
  batches,
  Batch,
  InsertBatch,
  students,
  Student,
  InsertStudent,
  parents,
  Parent,
  InsertParent,
  enrollments,
  Enrollment,
  InsertEnrollment,
  attendance,
  Attendance,
  InsertAttendance,
  payments,
  Payment,
  InsertPayment,
  employees,
  Employee,
  InsertEmployee,
  payrolls,
  Payroll,
  InsertPayroll,
  messages,
  Message,
  InsertMessage,
  branches,
  Branch,
  InsertBranch,
  studio,
  Studio,
  InsertStudio,
  brands,
  Brand,
  InsertBrand,
} from "@shared/schema";
import createMemoryStore from "memorystore";

// Initialize in-memory session store of 24 hours
/**
 * @constant
 * @name MemoryStore
 * @purpose Creates an in-memory session store suitable for development, testing,
 *          or environments where session data does not need to persist across
 *          application restarts. It's built using `memorystore` and integrated
 *          with the `express-session` module.
 * @type {session.Store}
 * @example
 * // Used when configuring express-session:
 * app.use(session({
 *   store: new MemoryStore({ checkPeriod: 86400000 }),
 *   secret: 'mysecret',
 *   resave: false,
 *   saveUninitialized: false
 * }));
 */
const MemoryStore = createMemoryStore(session);

// Import database storage
import { DatabaseStorage } from "./storage-db";

/**
 * @interface IStorage
 * @purpose Defines the contract for all storage implementations within the application.
 *          Any class that implements IStorage must provide the specified properties
 *          and methods, ensuring a consistent interface for managing various
 *          application data, including session information. This allows for
 *          interchangeable storage backends (e.g., in-memory, database).
 *
 * @properties
 * @property {session.Store} sessionStore - A session store implementation that
 *           adheres to the `express-session` store interface. It is responsible
 *           for reading, writing, and managing session data.
 *
 * @example
 * // A class implementing this interface would look like:
 * // class MyCustomStorage implements IStorage {
 * //   sessionStore: session.Store;
 * //   constructor() {
 * //     this.sessionStore = new MySessionStore();
 * //   }
 * //   // ... other methods defined by IStorage
 * // }
 */
export interface IStorage {
  /**
   * Session store for express-session middleware
   * Type: session.Store
   * Side Effects: Required for session persistence
   */
  sessionStore: session.Store;

  /**
   * User-related methods
   */

  /**
   * Get a single user by ID.
   * @param id - The unique identifier of the user
   * @returns Promise resolving to a User object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const user = await storage.getUser(1);
   */
  getUser(id: number): Promise<User | undefined>;

  /**
   * @purpose Get all users.
   * @returns Promise resolving to an array of User objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const users = await storage.getUsers();
   */
  getUsers(): Promise<User[]>;

  /**
   * @purpose Get a user by their username.
   * @param username - Username string
   * @returns Promise resolving to a User object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const user = await storage.getUserByUsername('john_doe');
   */
  getUserByUsername(username: string): Promise<User | undefined>;

  /**
   * @purpose Get all users having a specific role.
   * @param role - Role string (e.g., 'admin', 'student', 'teacher')
   * @returns Promise resolving to an array of User objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const admins = await storage.getUsersByRole('admin');
   */
  getUsersByRole(role: string): Promise<User[]>;

  /**
   * @purpose Create a new user.
   * @param user - InsertUser object containing user data
   * @returns Promise resolving to the newly created User object
   * @throws Database error if creation fails
   * @sideEffects Writes a new user to the database
   * @example
   * const newUser = await storage.createUser({ username: 'jane', password: 'hashedPass', fullName: 'Jane Doe', role: 'student' });
   */
  createUser(user: InsertUser): Promise<User>;

  /**
   * @purpose Update an existing user.
   * @param id - User ID
   * @param user - Partial<User> object containing fields to update
   * @returns Promise resolving to updated User or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing user in the database
   * @example
   * const updatedUser = await storage.updateUser(1, { fullName: 'John Updated' });
   */
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  /**
   * @purpose Delete a user by ID.
   * @param id - User ID
   * @returns Promise resolving to true if deletion succeeded, false if user not found
   * @throws Database error if deletion fails
   * @sideEffects Removes user from database
   * @example
   * const success = await storage.deleteUser(1);
   */
  deleteUser(id: number): Promise<boolean>;

  /**
   * @purpose Update a user's password.
   * @param username - Username of the user
   * @param newPassword - New hashed password string
   * @returns Promise resolving to true if update succeeded, false if user not found
   * @throws Database error if update fails
   * @sideEffects Modifies user's password in database
   * @example
   * const success = await storage.updateUserPassword('john_doe', 'newHashedPassword');
   */
  updateUserPassword(username: string, newPassword: string): Promise<boolean>; // Added function

  /**
   * Course-related methods
   */

  /**
   * @purpose Get a course by ID.
   * @param id - Course ID
   * @returns Promise resolving to a Course object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const course = await storage.getCourse(1);
   */
  getCourse(id: number): Promise<Course | undefined>;

  /**
   * @purpose Get all courses.
   * @returns Promise resolving to an array of Course objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const courses = await storage.getCourses();
   */
  getCourses(): Promise<Course[]>;

  /**
   * @purpose Get courses by category.
   * @param category - Category name (e.g., 'Music', 'Dance')
   * @returns Promise resolving to an array of Course objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const danceCourses = await storage.getCoursesByCategory('Dance');
   */
  getCoursesByCategory(category: string): Promise<Course[]>;

  /**
   * @purpose Create a new course.
   * @param course - InsertCourse object containing course data
   * @returns Promise resolving to newly created Course object
   * @throws Database error if creation fails
   * @sideEffects Writes a new course to the database
   * @example
   * const newCourse = await storage.createCourse({ name: 'Hip Hop', category: 'Dance', fee: 200 });
   */
  createCourse(course: InsertCourse): Promise<Course>;

  /**
   * @purpose Update an existing course.
   * @param id - Course ID
   * @param course - Partial<Course> object containing fields to update
   * @returns Promise resolving to updated Course or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing course in the database
   * @example
   * const updatedCourse = await storage.updateCourse(1, { fee: 250 });
   */
  updateCourse(
    id: number,
    course: Partial<Course>,
  ): Promise<Course | undefined>;

  /**
   * @purpose Delete a course by ID.
   * @param id - Course ID
   * @returns Promise resolving to true if deletion succeeded, false if course not found
   * @throws Database error if deletion fails
   * @sideEffects Removes course from database
   * @example
   * const success = await storage.deleteCourse(1);
   */
  deleteCourse(id: number): Promise<boolean>;

  /**
   * Batch-related methods
   */

  /**
   * @purpose Get a batch by ID.
   * @param id - Batch ID
   * @returns Promise resolving to a Batch object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const batch = await storage.getBatch(1);
   */
  getBatch(id: number): Promise<Batch | undefined>;

  /**
   * @purpose Get all batches.
   * @returns Promise resolving to an array of Batch objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const batches = await storage.getBatches();
   */
  getBatches(): Promise<Batch[]>;

  /**
   * @purpose Get batches by course ID.
   * @param courseId - Course ID
   * @returns Promise resolving to an array of Batch objects for the course
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const danceBatches = await storage.getBatchesByCourse(2);
   */
  getBatchesByCourse(courseId: number): Promise<Batch[]>;

  /**
   * @purpose Get batches taught by a specific teacher.
   * @param teacherId - Teacher ID
   * @returns Promise resolving to an array of Batch objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const teacherBatches = await storage.getBatchesByTeacher(5);
   */
  getBatchesByTeacher(teacherId: number): Promise<Batch[]>;

  /**
   * @purpose Get batches belonging to a specific branch.
   * @param branch - Branch name or ID
   * @returns Promise resolving to an array of Batch objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const branchBatches = await storage.getBatchesByBranch('Downtown');
   */
  getBatchesByBranch(branch: string): Promise<Batch[]>;

  /**
   * @purpose Create a new batch.
   * @param batch - InsertBatch object containing batch data
   * @returns Promise resolving to the newly created Batch object
   * @throws Database error if creation fails
   * @sideEffects Writes a new batch to the database
   * @example
   * const newBatch = await storage.createBatch({ courseId: 2, teacherId: 5, name: 'Morning Batch' });
   */
  createBatch(batch: InsertBatch): Promise<Batch>;

  /**
   * @purpose Update an existing batch.
   * @param id - Batch ID
   * @param batch - Partial<Batch> object containing fields to update
   * @returns Promise resolving to the updated Batch or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing batch in the database
   * @example
   * const updatedBatch = await storage.updateBatch(1, { name: 'Evening Batch' });
   */
  updateBatch(id: number, batch: Partial<Batch>): Promise<Batch | undefined>;

  /**
   * @purpose Delete a batch by ID.
   * @param id - Batch ID
   * @returns Promise resolving to true if deletion succeeded, false if batch not found
   * @throws Database error if deletion fails
   * @sideEffects Removes batch from database
   * @example
   * const success = await storage.deleteBatch(1);
   */
  deleteBatch(id: number): Promise<boolean>;

  /**
   * Brand-related methods
   */

  /**
   * @purpose Create a new brand.
   * @param brand - InsertBrand object containing brand data
   * @returns Promise resolving to the newly created Brand object
   * @throws Database error if creation fails
   * @sideEffects Writes a new brand to the database
   * @example
   * const newBrand = await storage.createBrand({ name: 'Institution', description: 'Dance Studio' });
   */
  createBrand(brand: InsertBrand): Promise<Brand>;

  /**
   * @purpose Update an existing brand.
   * @param id - Brand ID
   * @param brand - Partial<Brand> object containing fields to update
   * @returns Promise resolving to the updated Brand or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing brand in the database
   * @example
   * const updatedBrand = await storage.updateBrand(1, { description: 'Updated description' });
   */
  updateBrand(id: number, brand: Partial<Brand>): Promise<Brand | undefined>;

  /**
   * @purpose Delete a brand by ID.
   * @param id - Brand ID
   * @returns Promise resolving to true if deletion succeeded, false if brand not found
   * @throws Database error if deletion fails
   * @sideEffects Removes brand from database
   * @example
   * const success = await storage.deleteBrand(1);
   */
  deleteBrand(id: number): Promise<boolean>;

  /**
   * Studio-related methods
   */

  /**
   * @purpose Create a new studio.
   * @param studio - InsertStudio object containing studio data
   * @returns Promise resolving to the newly created Studio object
   * @throws Database error if creation fails
   * @sideEffects Writes a new studio to the database
   * @example
   * const newStudio = await storage.createStudio({ name: 'Downtown Studio', branch: 'Main' });
   */
  createStudio(studio: InsertStudio): Promise<Studio>;
  // getStudios(): Promise<Studio[]>;

  /**
   * Student-related methods
   */

  /**
   * @purpose Get a student by internal ID.
   * @param id - Student ID
   * @returns Promise resolving to a Student object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const student = await storage.getStudent(1);
   */
  getStudent(id: number): Promise<Student | undefined>;

  /**
   * @purpose Get a student by student ID string (like 'STU001').
   * @param studentId - Student ID string
   * @returns Promise resolving to a Student object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const student = await storage.getStudentByStudentId('STU001');
   */
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;

  /**
   * @purpose Get all students.
   * @returns Promise resolving to an array of Student objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const students = await storage.getStudents();
   */
  getStudents(): Promise<Student[]>;

  /**
   * @purpose Get all students belonging to a parent.
   * @param parentId - Parent ID
   * @returns Promise resolving to an array of Student objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const children = await storage.getStudentsByParent(1);
   */
  getStudentsByParent(parentId: number): Promise<Student[]>;

  /**
   * @purpose Get all students belonging to a branch.
   * @param branch - Branch name or ID
   * @returns Promise resolving to an array of Student objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const students = await storage.getStudentsByBranch('Downtown');
   */
  getStudentsByBranch(branch: string): Promise<Student[]>;

  /**
   * @purpose Get all students enrolled in a specific batch.
   * @param batchId - Batch ID string
   * @returns Promise resolving to an array of Student objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const students = await storage.getStudentsByBatch('B001');
   */
  getStudentsByBatch(batchId: string): Promise<Student[]>;

  /**
   * @purpose Create a new student.
   * @param student - InsertStudent object containing student data
   * @returns Promise resolving to the newly created Student object
   * @throws Database error if creation fails
   * @sideEffects Writes a new student to the database
   * @example
   * const newStudent = await storage.createStudent({ name: 'John Doe', branch: 'Downtown' });
   */
  createStudent(student: InsertStudent): Promise<Student>;

  /**
   * @purpose Update an existing student.
   * @param id - Student ID
   * @param student - Partial<Student> object containing fields to update
   * @returns Promise resolving to updated Student or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing student in the database
   * @example
   * const updatedStudent = await storage.updateStudent(1, { fullName: 'Alice Updated' });
   */
  updateStudent(
    id: number,
    student: Partial<Student>,
  ): Promise<Student | undefined>;

  /**
   * @purpose Delete a student by ID.
   * @param id - Student ID
   * @returns Promise resolving to true if deletion succeeded, false if student not found
   * @throws Database error if deletion fails
   * @sideEffects Removes student from database
   * @example
   * const success = await storage.deleteStudent(1);
   */
  deleteStudent(id: number): Promise<boolean>;

  /**
   * Parent-related methods
   */

  /**
   * @purpose Get a parent by ID.
   * @param id - Parent ID
   * @returns Promise resolving to a Parent object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const parent = await storage.getParent(1);
   */
  getParent(id: number): Promise<Parent | undefined>;

  /**
   * @purpose Get all parents.
   * @returns Promise resolving to an array of Parent objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const parents = await storage.getParents();
   */
  getParents(): Promise<Parent[]>;
  // getParentByParentId(parentId: string): Promise<Parent | undefined>;

  /**
   * @purpose Create a new parent.
   * @param parent - InsertParent object containing parent data
   * @returns Promise resolving to the newly created Parent object
   * @throws Database error if creation fails
   * @sideEffects Writes a new parent to the database
   * @example
   * const newParent = await storage.createParent({ fullName: 'John Doe', phone: '1234567890' });
   */
  createParent(parent: InsertParent): Promise<Parent>;

  /**
   * @purpose Update an existing parent.
   * @param id - Parent ID
   * @param parent - Partial<Parent> object containing fields to update
   * @returns Promise resolving to updated Parent or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing parent in the database
   * @example
   * const updatedParent = await storage.updateParent(1, { phone: '0987654321' });
   */
  updateParent(
    id: number,
    parent: Partial<Parent>,
  ): Promise<Parent | undefined>;

  /**
   * @purpose Delete a parent by ID.
   * @param id - Parent ID
   * @returns Promise resolving to true if deletion succeeded, false if parent not found
   * @throws Database error if deletion fails
   * @sideEffects Removes parent from database
   * @example
   * const success = await storage.deleteParent(1);
   */
  deleteParent(id: number): Promise<boolean>;

  /**
   * Enrollment-related methods
   */

  /**
   * @purpose Get an enrollment by ID.
   * @param id - Enrollment ID
   * @returns Promise resolving to an Enrollment object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const enrollment = await storage.getEnrollment(1);
   */
  getEnrollment(id: number): Promise<Enrollment | undefined>;

  /**
   * @purpose Get all enrollments.
   * @returns Promise resolving to an array of Enrollment objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const enrollments = await storage.getEnrollments();
   */
  getEnrollments(): Promise<Enrollment[]>;

  /**
   * @purpose Get enrollments for a specific student.
   * @param studentId - Student ID
   * @returns Promise resolving to an array of Enrollment objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const studentEnrollments = await storage.getEnrollmentsByStudent(1);
   */
  getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]>;

  /**
   * @purpose Get enrollments for a specific batch.
   * @param batchId - Batch ID
   * @returns Promise resolving to an array of Enrollment objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const batchEnrollments = await storage.getEnrollmentsByBatch(1);
   */
  getEnrollmentsByBatch(batchId: number): Promise<Enrollment[]>;

  /**
   * @purpose Create a new enrollment.
   * @param enrollment - InsertEnrollment object containing enrollment data
   * @returns Promise resolving to the newly created Enrollment object
   * @throws Database error if creation fails
   * @sideEffects Writes a new enrollment to the database
   * @example
   * const newEnrollment = await storage.createEnrollment({ studentId: 1, batchId: 2, dateEnrolled: new Date() });
   */
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;

  /**
   * @purpose Update an existing enrollment.
   * @param id - Enrollment ID
   * @param enrollment - Partial<Enrollment> object containing fields to update
   * @returns Promise resolving to updated Enrollment or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing enrollment in the database
   * @example
   * const updatedEnrollment = await storage.updateEnrollment(1, { dateEnrolled: new Date() });
   */
  updateEnrollment(
    id: number,
    enrollment: Partial<Enrollment>,
  ): Promise<Enrollment | undefined>;

  /**
   * @purpose Delete an enrollment by ID.
   * @param id - Enrollment ID
   * @returns Promise resolving to true if deletion succeeded, false if enrollment not found
   * @throws Database error if deletion fails
   * @sideEffects Removes enrollment from the database
   * @example
   * const success = await storage.deleteEnrollment(1);
   */
  deleteEnrollment(id: number): Promise<boolean>;

  /**
   * Attendance-related methods
   */

  /**
   * @purpose Get attendance record by ID.
   * @param id - Attendance ID
   * @returns Promise resolving to an Attendance object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const attendance = await storage.getAttendance(1);
   */
  getAttendance(id: number): Promise<Attendance | undefined>;

  /**
   * @purpose Get attendance records for a specific student.
   * @param studentId - Student ID
   * @returns Promise resolving to an array of Attendance objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const studentAttendance = await storage.getAttendanceByStudent(1);
   */
  getAttendanceByStudent(studentId: number): Promise<Attendance[]>;

  /**
   * @purpose Get attendance records for a specific batch.
   * @param batchId - Batch ID
   * @returns Promise resolving to an array of Attendance objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const batchAttendance = await storage.getAttendanceByBatch(2);
   */
  getAttendanceByBatch(batchId: number): Promise<Attendance[]>;

  /**
   * @purpose Get attendance records for a specific date.
   * @param date - Date
   * @returns Promise resolving to an array of Attendance objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const attendanceByDate = await storage.getAttendanceByDate(new Date());
   */
  getAttendanceByDate(date: Date): Promise<Attendance[]>;

  /**
   * @purpose Create a new attendance record.
   * @param attendance - InsertAttendance object containing attendance data
   * @returns Promise resolving to the newly created Attendance object
   * @throws Database error if creation fails
   * @sideEffects Writes a new attendance record to the database
   * @example
   * const newAttendance = await storage.createAttendance({ studentId: 1, batchId: 2, date: new Date(), status: 'Present' });
   */
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;

  /**
   * @purpose Update an existing attendance record.
   * @param id - Attendance ID
   * @param attendance - Partial<Attendance> object containing fields to update
   * @returns Promise resolving to updated Attendance or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing attendance record in the database
   * @example
   * const updatedAttendance = await storage.updateAttendance(1, { status: 'Absent' });
   */
  updateAttendance(
    id: number,
    attendance: Partial<Attendance>,
  ): Promise<Attendance | undefined>;

  /**
   * @purpose Delete an attendance record by ID.
   * @param id - Attendance ID
   * @returns Promise resolving to true if deletion succeeded, false if attendance not found
   * @throws Database error if deletion fails
   * @sideEffects Removes attendance record from the database
   * @example
   * const success = await storage.deleteAttendance(1);
   */
  deleteAttendance(id: number): Promise<boolean>;

  /**
   * Payment-related methods
   */

  /**
   * @purpose Get a payment by ID.
   * @param id - Payment ID
   * @returns Promise resolving to a Payment object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const payment = await storage.getPayment(1);
   */
  getPayment(id: number): Promise<Payment | undefined>;

  /**
   * @purpose Get a payment by invoice ID.
   * @param invoiceId - Invoice ID string
   * @returns Promise resolving to a Payment object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const payment = await storage.getPaymentByInvoiceId("INV-2025-001");
   */
  getPaymentByInvoiceId(invoiceId: string): Promise<Payment | undefined>;

  /**
   * @purpose Get all payments.
   * @returns Promise resolving to an array of Payment objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const allPayments = await storage.getPayments();
   */
  getPayments(): Promise<Payment[]>;

  /**
   * @purpose Get payments for a specific student.
   * @param studentId - Student ID
   * @returns Promise resolving to an array of Payment objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const studentPayments = await storage.getPaymentsByStudent(1);
   */
  getPaymentsByStudent(studentId: number): Promise<Payment[]>;

  /**
   * @purpose Get payments filtered by status (e.g., "paid", "unpaid").
   * @param status - Status string
   * @returns Promise resolving to an array of Payment objects matching the status
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const unpaidPayments = await storage.getPaymentsByStatus("unpaid");
   */
  getPaymentsByStatus(status: string): Promise<Payment[]>;

  /**
   * @purpose Create a new payment record.
   * @param payment - InsertPayment object containing payment data
   * @returns Promise resolving to the newly created Payment object
   * @throws Database error if creation fails
   * @sideEffects Writes a new payment record to the database
   * @example
   * const newPayment = await storage.createPayment({ studentId: 1, amount: 200, status: "unpaid", invoiceNumber: "INV-2025-001" });
   */
  createPayment(payment: InsertPayment): Promise<Payment>;

  /**
   * @purpose Update an existing payment.
   * @param id - Payment ID
   * @param payment - Partial<Payment> object containing fields to update
   * @returns Promise resolving to updated Payment or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing payment record in the database
   * @example
   * const updatedPayment = await storage.updatePayment(1, { status: "paid" });
   */
  updatePayment(
    id: number,
    payment: Partial<Payment>,
  ): Promise<Payment | undefined>;

  /**
   * @purpose Delete a payment by ID.
   * @param id - Payment ID
   * @returns Promise resolving to true if deletion succeeded, false if payment not found
   * @throws Database error if deletion fails
   * @sideEffects Removes payment record from the database
   * @example
   * const success = await storage.deletePayment(1);
   */
  deletePayment(id: number): Promise<boolean>;

  /**
   * Employee-related methods
   */

  /**
   * @purpose Get an employee by ID.
   * @param id - Employee ID (numeric)
   * @returns Promise resolving to an Employee object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const employee = await storage.getEmployee(1);
   */
  getEmployee(id: number): Promise<Employee | undefined>;

  /**
   * @purpose Get an employee by their employee code/ID (string).
   * @param employeeId - Employee code, e.g., "EMP001"
   * @returns Promise resolving to an Employee object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const employee = await storage.getEmployeeByEmployeeId("EMP001");
   */
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;

  /**
   * @purpose Get all employees.
   * @returns Promise resolving to an array of Employee objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const employees = await storage.getEmployees();
   */
  getEmployees(): Promise<Employee[]>;

  /**
   * @purpose Get employees filtered by position/role.
   * @param position - Employee position/title (e.g., "Teacher", "Manager")
   * @returns Promise resolving to an array of Employee objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const teachers = await storage.getEmployeesByPosition("Teacher");
   */
  getEmployeesByPosition(position: string): Promise<Employee[]>;

  /**
   * @purpose Get employees filtered by branch.
   * @param branch - Branch name (e.g., "Branch A", "Branch B")
   * @returns Promise resolving to an array of Employee objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const branchEmployees = await storage.getEmployeesByBranch("Branch A");
   */
  getEmployeesByBranch(branch: string): Promise<Employee[]>;

  /**
   * @purpose Create a new employee record.
   * @param employee - InsertEmployee object containing employee data
   * @returns Promise resolving to the newly created Employee object
   * @throws Database error if creation fails
   * @sideEffects Writes a new employee record to the database
   * @example
   * const newEmployee = await storage.createEmployee({ employeeId: "EMP005", fullName: "John Doe", position: "Teacher", branch: "Downtown" });
   */
  createEmployee(employee: InsertEmployee): Promise<Employee>;

  /**
   * @purpose Update an existing employee record.
   * @param id - Employee ID
   * @param employee - Partial<Employee> object containing fields to update
   * @returns Promise resolving to updated Employee object or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing employee record in the database
   * @example
   * const updatedEmployee = await storage.updateEmployee(1, { position: "Senior Teacher" });
   */
  updateEmployee(
    id: number,
    employee: Partial<Employee>,
  ): Promise<Employee | undefined>;

  /**
   * @purpose Delete an employee by ID.
   * @param id - Employee ID
   * @returns Promise resolving to true if deletion succeeded, false if employee not found
   * @throws Database error if deletion fails
   * @sideEffects Removes employee record from the database
   * @example
   * const success = await storage.deleteEmployee(1);
   */
  deleteEmployee(id: number): Promise<boolean>;

  /**
   * Payroll-related methods
   */

  /**
   * @purpose Get a payroll record by ID.
   * @param id - Payroll ID (numeric)
   * @returns Promise resolving to a Payroll object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const payroll = await storage.getPayroll(1);
   */
  getPayroll(id: number): Promise<Payroll | undefined>;

  /**
   * @purpose Get all payroll records.
   * @returns Promise resolving to an array of Payroll objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const allPayrolls = await storage.getPayrolls();
   */
  getPayrolls(): Promise<Payroll[]>;

  /**
   * @purpose Get payroll records for a specific employee.
   * @param employeeId - Employee ID
   * @returns Promise resolving to an array of Payroll objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const employeePayrolls = await storage.getPayrollsByEmployee(1);
   */
  getPayrollsByEmployee(employeeId: number): Promise<Payroll[]>;

  /**
   * @purpose Get payroll records for a specific month.
   * @param month - Month (e.g., "January", "February")
   * @returns Promise resolving to an array of Payroll objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const monthlyPayrolls = await storage.getPayrollsByMonth("January");
   */
  getPayrollsByMonth(month: string): Promise<Payroll[]>;

  /**
   * @purpose Create a new payroll record.
   * @param payroll - InsertPayroll object containing payroll data
   * @returns Promise resolving to the newly created Payroll object
   * @throws Database error if creation fails
   * @sideEffects Writes a new payroll record to the database
   * @example
   * const newPayroll = await storage.createPayroll({ employeeId: 1, month: "2025-10", amount: 5000 });
   */
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;

  /**
   * @purpose Update an existing payroll record.
   * @param id - Payroll ID
   * @param payroll - Partial<Payroll> object containing fields to update
   * @returns Promise resolving to updated Payroll object or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing payroll record in the database
   * @example
   * const updatedPayroll = await storage.updatePayroll(1, { amount: 5200 });
   */
  updatePayroll(
    id: number,
    payroll: Partial<Payroll>,
  ): Promise<Payroll | undefined>;

  /**
   * @purpose Delete a payroll record by ID.
   * @param id - Payroll ID
   * @returns Promise resolving to true if deletion succeeded, false if payroll not found
   * @throws Database error if deletion fails
   * @sideEffects Removes payroll record from the database
   * @example
   * const success = await storage.deletePayroll(1);
   */
  deletePayroll(id: number): Promise<boolean>;

  /**
   * Message-related methods
   */

  /**
   * @purpose Get a message by ID.
   * @param id - Message ID (numeric)
   * @returns Promise resolving to a Message object or undefined if not found
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const message = await storage.getMessage(1);
   */
  getMessage(id: number): Promise<Message | undefined>;

  /**
   * @purpose Get all messages.
   * @returns Promise resolving to an array of Message objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const allMessages = await storage.getMessages();
   */
  getMessages(): Promise<Message[]>;

  /**
   * @purpose Get messages sent by a specific sender.
   * @param senderId - Sender user ID
   * @returns Promise resolving to an array of Message objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const sentMessages = await storage.getMessagesBySender(1);
   */
  getMessagesBySender(senderId: number): Promise<Message[]>;

  /**
   * @purpose Get messages received by a specific receiver.
   * @param receiverId - Receiver user ID
   * @returns Promise resolving to an array of Message objects
   * @throws Database error if query fails
   * @sideEffects None
   * @example
   * const receivedMessages = await storage.getMessagesByReceiver(2);
   */
  getMessagesByReceiver(receiverId: number): Promise<Message[]>;

  /**
   * @purpose Create a new message.
   * @param message - InsertMessage object containing message data
   * @returns Promise resolving to the newly created Message object
   * @throws Database error if creation fails
   * @sideEffects Writes a new message record to the database
   * @example
   * const newMessage = await storage.createMessage({ senderId: 1, receiverId: 2, content: "Hello!" });
   */
  createMessage(message: InsertMessage): Promise<Message>;

  /**
   * @purpose Update an existing message.
   * @param id - Message ID
   * @param message - Partial<Message> object containing fields to update
   * @returns Promise resolving to the updated Message object or undefined if not found
   * @throws Database error if update fails
   * @sideEffects Modifies an existing message record in the database
   * @example
   * const updatedMessage = await storage.updateMessage(1, { content: "Updated text" });
   */
  updateMessage(
    id: number,
    message: Partial<Message>,
  ): Promise<Message | undefined>;

  /**
   * @purpose Delete a message by ID.
   * @param id - Message ID
   * @returns Promise resolving to true if deletion succeeded, false if message not found
   * @throws Database error if deletion fails
   * @sideEffects Removes message record from the database
   * @example
   * const success = await storage.deleteMessage(1);
   */
  deleteMessage(id: number): Promise<boolean>;

  /**
   * Branch-related methods
   */

  /**
   * @purpose Retrieve a branch by its unique ID.
   * @param id - The numeric ID of the branch.
   * @returns Promise resolving to a Branch object if found, or undefined otherwise.
   * @throws Database error if the query fails.
   * @sideEffects None.
   * @example
   * const branch = await storage.getBranch(1);
   */
  getBranch(id: number): Promise<Branch | undefined>;

  /**
   * @purpose Retrieve all branches in the system.
   * @returns Promise resolving to an array of Branch objects.
   * @throws Database error if the query fails.
   * @sideEffects None.
   * @example
   * const branches = await storage.getBranches();
   */
  getBranches(): Promise<Branch[]>;

  /**
   * @purpose Retrieve a branch by its name.
   * @param name - The name of the branch.
   * @returns Promise resolving to a Branch object if found, or undefined otherwise.
   * @throws Database error if the query fails.
   * @sideEffects None.
   * @example
   * const branch = await storage.getBranchByName("Main Branch");
   */
  getBranchByName(name: string): Promise<Branch | undefined>;

  /**
   * @purpose Create a new branch.
   * @param branch - InsertBranch object containing details of the new branch.
   * @returns Promise resolving to the newly created Branch object
   * @throws Database error if creation fails
   * @sideEffects Writes a new branch record to the database
   * @example
   * const newBranch = await storage.createBranch({ name: "New Branch", location: "New Location" });
   */
  createBranch(branch: InsertBranch): Promise<Branch>;

  /**
   * @purpose Update an existing branch record.
   * @param id - The numeric ID of the branch to update.
   * @param branch - Partial<Branch> object containing fields to update.
   * @returns Promise resolving to the updated Branch object, or undefined if the branch does not exist.
   * @throws Database error if update fails.
   * @sideEffects Modifies an existing branch record in the database.
   * @example
   * const updatedBranch = await storage.updateBranch(1, { phone: "9123456789" });
   */
  updateBranch(
    id: number,
    branch: Partial<Branch>,
  ): Promise<Branch | undefined>;

  /**
   * @purpose Delete a branch by its ID.
   * @param id - The numeric ID of the branch to delete.
   * @returns Promise resolving to true if deletion succeeded, false if branch not found.
   * @throws Database error if deletion fails.
   * @sideEffects Permanently removes the branch record from the database.
   * @example
   * const delete = await storage.deleteBranch(1);
   */
  deleteBranch(id: number): Promise<boolean>;
}

/**
 * @purpose Simple placeholder function for password hashing.
 *
 * @param password - The plain text password to hash.
 * @returns Promise resolving to the hashed password string (currently just returns the input password).
 * @throws None.
 * @sideEffects None.
 * @example
 * const hashed = await hashPassword("myPassword123");
 * console.log(hashed); // Output: "myPassword123"
 */
async function hashPassword(password: string): Promise<string> {
  return password; // Simple direct return for testing purposes
}

/**
 * @class MemStorage
 * @purpose Implements the IStorage interface using in-memory data structures
 *          (Maps) to store application data and session information. This class
 *          serves as a temporary, non-persistent storage solution, ideal for
 *          development, testing, or scenarios where data persistence across
 *          application restarts is not required.
 *
 * @properties
 * @property {Map<number, User>} usersMap - Stores user objects, keyed by their ID.
 * @property {Map<number, Course>} coursesMap - Stores course objects, keyed by their ID.
 * @property {Map<number, Batch>} batchesMap - Stores batch objects, keyed by their ID.
 * @property {Map<number, Studio>} studioMap - Stores studio objects, keyed by their ID.
 * @property {Map<number, Student>} studentsMap - Stores student objects, keyed by their ID.
 * @property {Map<number, Parent>} parentsMap - Stores parent objects, keyed by their ID.
 * @property {Map<number, Enrollment>} enrollmentsMap - Stores enrollment objects, keyed by their ID.
 * @property {Map<number, Attendance>} attendanceMap - Stores attendance records, keyed by their ID.
 * @property {Map<number, Payment>} paymentsMap - Stores payment records, keyed by their ID.
 * @property {Map<number, Employee>} employeesMap - Stores employee objects, keyed by their ID.
 * @property {Map<number, Payroll>} payrollsMap - Stores payroll records, keyed by their ID.
 * @property {Map<number, Message>} messagesMap - Stores message objects, keyed by their ID.
 * @property {Map<number, Branch>} branchesMap - Stores branch objects, keyed by their ID.
 * @property {Map<number, Brand>} brandsMap - Stores brand objects, keyed by their ID.
 * @property {session.Store} sessionStore - An in-memory session store for managing session data,
 *           typically used with session middleware.
 * @property {number} userCurrentId - Counter for generating unique User IDs.
 * @property {number} courseCurrentId - Counter for generating unique Course IDs.
 * @property {number} batchCurrentId - Counter for generating unique Batch IDs.
 * @property {number} studentCurrentId - Counter for generating unique Student IDs.
 * @property {number} studioCurrentId - Counter for generating unique Studio IDs.
 * @property {number} enrollmentCurrentId - Counter for generating unique Enrollment IDs.
 * @property {number} attendanceCurrentId - Counter for generating unique Attendance IDs.
 * @property {number} paymentCurrentId - Counter for generating unique Payment IDs.
 * @property {number} employeeCurrentId - Counter for generating unique Employee IDs.
 * @property {number} payrollCurrentId - Counter for generating unique Payroll IDs.
 * @property {number} messageCurrentId - Counter for generating unique Message IDs.
 * @property {number} branchCurrentId - Counter for generating unique Branch IDs.
 * @property {number} brandCurrentId - Counter for generating unique Brand IDs.
 * @property {number} parentCurrentId - Counter for generating unique Parent IDs.
 *
 * @example
 * // Example of initializing MemStorage (typically done once in your app setup)
 * const storage = new MemStorage();
 * // This 'storage.sessionStore' can then be used by an express-session middleware.
 * app.use(session({
 *   store: storage.sessionStore,
 *   secret: 'your_secret_key',
 *   resave: false,
 *   saveUninitialized: false,
 * }));
 *
 * // Example of accessing stored data (assuming IStorage defines methods for this)
 * // const newUser = await storage.createUser({ name: "John Doe" });
 * // const retrievedUser = await storage.getUserById(newUser.id);
 */
export class MemStorage implements IStorage {
  /** Map storing user records keyed by numeric ID. */
  private usersMap: Map<number, User>;

  /** Map storing course records keyed by numeric ID. */
  private coursesMap: Map<number, Course>;

  /** Map storing batch records keyed by numeric ID. */
  private batchesMap: Map<number, Batch>;

  /** Map storing studio records keyed by numeric ID. */
  private studioMap: Map<number, Studio>;

  /** Map storing student records keyed by numeric ID. */
  private studentsMap: Map<number, Student>;

  /** Map storing parent records keyed by numeric ID. */
  private parentsMap: Map<number, Parent>;

  /** Map storing enrollment records keyed by numeric ID. */
  private enrollmentsMap: Map<number, Enrollment>;

  /** Map storing attendance records keyed by numeric ID. */
  private attendanceMap: Map<number, Attendance>;

  /** Map storing payment records keyed by numeric ID. */
  private paymentsMap: Map<number, Payment>;

  /** Map storing employee records keyed by numeric ID. */
  private employeesMap: Map<number, Employee>;

  /** Map storing payroll records keyed by numeric ID. */
  private payrollsMap: Map<number, Payroll>;

  /** Map storing message records keyed by numeric ID. */
  private messagesMap: Map<number, Message>;

  /** Map storing branch records keyed by numeric ID. */
  private branchesMap: Map<number, Branch>;

  /** Map storing brand records keyed by numeric ID. */
  private brandsMap: Map<number, Brand>;

  /** Express session store for in-memory session management. */
  sessionStore: session.Store;

  /** Auto-increment counters for entity IDs. */
  private userCurrentId: number = 1;
  private courseCurrentId: number = 1;
  private batchCurrentId: number = 1;
  private studentCurrentId: number = 1;
  private studioCurrentId: number = 1;
  private enrollmentCurrentId: number = 1;
  private attendanceCurrentId: number = 1;
  private paymentCurrentId: number = 1;
  private employeeCurrentId: number = 1;
  private payrollCurrentId: number = 1;
  private messageCurrentId: number = 1;
  private branchCurrentId: number = 1;
  private brandCurrentId: number = 1;
  private parentCurrentId: number = 1;

  /**
   * @purpose Initializes the in-memory storage and sets up maps for all entities.
   *
   * @param sessionStore - Optional session store instance for managing sessions.
   * @throws None.
   * @sideEffects Allocates memory for entity maps and ID counters.
   * @example
   * const memStorage = new MemStorage();
   * const user = await memStorage.createUser({ username: "john", password: "1234" });
   */
  constructor() {
    this.usersMap = new Map();
    this.coursesMap = new Map();
    this.batchesMap = new Map();
    this.studentsMap = new Map();
    this.studioMap = new Map();
    this.parentsMap = new Map();
    this.enrollmentsMap = new Map();
    this.attendanceMap = new Map();
    this.paymentsMap = new Map();
    this.employeesMap = new Map();
    this.payrollsMap = new Map();
    this.messagesMap = new Map();
    this.branchesMap = new Map();
    this.brandsMap = new Map();

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Seed data
    // this.seedData();
  }

  /**
   * Retrieves a user by their numeric ID.
   *
   * @purpose Fetches a single user record from in-memory storage.
   * @param id - The unique numeric ID of the user.
   * @returns A Promise that resolves to the User object if found, otherwise undefined.
   * @throws None.
   * @sideEffects None.
   * @example
   * const user = await storage.getUser(1);
   * console.log(user?.username); // Output: "john_doe"
   */
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  /**
   * Retrieves a user by their username.
   *
   * @purpose Finds and returns a user based on their username.
   * @param username - The username of the user to retrieve.
   * @returns A Promise resolving to the User object if found, otherwise undefined.
   * @throws None.
   * @sideEffects None.
   * @example
   * const user = await storage.getUserByUsername("john_doe");
   * console.log(user?.id); // Output: 1
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  /**
   * Retrieves all users from memory.
   *
   * @purpose Returns a list of all users stored in memory.
   * @param None.
   * @returns A Promise resolving to an array of all User objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const allUsers = await storage.getUsers();
   * console.log(allUsers.length); // Output: 5
   */
  async getUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  /**
   * Retrieves users filtered by their role.
   *
   * @purpose Fetches users who match a specific role (e.g., "admin", "teacher").
   * @param role - The role string to filter users by.
   * @returns A Promise resolving to an array of users with the specified role.
   * @throws None.
   * @sideEffects None.
   * @example
   * const admins = await storage.getUsersByRole("admin");
   * console.log(admins.map(a => a.username)); // Output: ["admin1", "admin2"]
   */

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.usersMap.values()).filter(
      (user) => user.role === role,
    );
  }

  /**
   * Creates a new user and stores it in memory.
   *
   * @purpose Adds a new user record to in-memory storage.
   * @param user - The user data to insert (InsertUser type).
   * @returns A Promise resolving to the created User object with a generated ID and timestamps.
   * @throws None.
   * @sideEffects Increments the internal user ID counter and updates the users map.
   * @example
   * const newUser = await storage.createUser({
   *   username: "alice",
   *   password: "securePass123",
   *   role: "teacher"
   * });
   * console.log(newUser.id); // Output: 2
   */
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      role: user.role ?? "user",
      phone: user.phone ?? null,
      address: user.address ?? null,
      branch: user.branch ?? null,
      resetToken: null,
      resetTokenExpires: null,
      // profilePicture: user.profilePicture ?? null,
    };
    this.usersMap.set(id, newUser);
    return newUser;
  }

  /**
   * Updates an existing user's details.
   *
   * @purpose Modifies and saves an existing user's data in memory.
   * @param id - The unique numeric ID of the user to update.
   * @param user - Partial user data to update.
   * @returns A Promise resolving to the updated User object if found, otherwise undefined.
   * @throws None.
   * @sideEffects Modifies the existing user entry in the users map.
   * @example
   * const updatedUser = await storage.updateUser(1, { phone: "1234567890" });
   * console.log(updatedUser?.phone); // Output: "1234567890"
   */
  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.usersMap.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...user };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * Deletes a user by their ID.
   *
   * @purpose Removes a user record from the in-memory storage.
   * @param id - The unique numeric ID of the user to delete.
   * @returns A Promise resolving to `true` if the user was successfully deleted, otherwise `false`.
   * @throws None.
   * @sideEffects Permanently removes the user entry from `usersMap`.
   * @example
   * const isDeleted = await storage.deleteUser(2);
   * console.log(isDeleted); // Output: true
   */
  async deleteUser(id: number): Promise<boolean> {
    return this.usersMap.delete(id);
  }

  /**
   * Updates a user's password using their username.
   *
   * @purpose Changes and securely updates a user's password in the in-memory storage.
   * @param username - The username of the user whose password is to be updated.
   * @param newPassword - The new password to set for the user.
   * @returns A Promise resolving to `true` if the password was successfully updated, otherwise `false` if the user was not found.
   * @throws None.
   * @sideEffects Updates the user's password in `usersMap`. May modify the stored hash if a password hashing mechanism is implemented.
   * @example
   * const success = await storage.updateUserPassword("alice", "newSecurePassword123");
   * console.log(success); // Output: true
   */
  async updateUserPassword(
    username: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    if (!user) return false;

    const hashedPassword = await hashPassword(newPassword);
    const updatedUser = { ...user, password: hashedPassword };
    this.usersMap.set(user.id, updatedUser);
    return true;
  }

  /**
   * Retrieves a single course by its unique ID.
   *
   * @purpose Fetches a course record from memory storage using the provided ID.
   * @param id - The unique numeric ID of the course to retrieve.
   * @returns A Promise resolving to the `Course` object if found, otherwise `undefined`.
   * @throws None.
   * @sideEffects None.
   * @example
   * const course = await storage.getCourse(1);
   * console.log(course?.name); // Output: "Contemporary Dance"
   */
  async getCourse(id: number): Promise<Course | undefined> {
    return this.coursesMap.get(id);
  }

  /**
   * Retrieves all courses available in the system.
   *
   * @purpose Returns all course records stored in memory.
   * @returns A Promise resolving to an array of `Course` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const allCourses = await storage.getCourses();
   * console.log(allCourses.length); // Output: 5
   */
  async getCourses(): Promise<Course[]> {
    return Array.from(this.coursesMap.values());
  }

  /**
   * Retrieves all courses belonging to a specific category.
   *
   * @purpose Filters and returns all courses that match the provided category.
   * @param category - The category name used to filter courses (e.g., "Dance", "Music").
   * @returns A Promise resolving to an array of matching `Course` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const danceCourses = await storage.getCoursesByCategory("Dance");
   * console.log(danceCourses.map(c => c.name)); // Output: ["Ballet", "Hip-Hop"]
   */
  async getCoursesByCategory(category: string): Promise<Course[]> {
    return Array.from(this.coursesMap.values()).filter(
      (course) => course.category === category,
    );
  }

  /**
   * Creates and stores a new course record in memory.
   *
   * @purpose Adds a new course entry with a unique ID and timestamp to the in-memory database.
   * @param course - The course data to insert, following the `InsertCourse` structure.
   * @returns A Promise resolving to the newly created `Course` object.
   * @throws None.
   * @sideEffects Increments `courseCurrentId` and modifies the `coursesMap` storage.
   * @example
   * const newCourse = await storage.createCourse({ name: "Jazz Basics", category: "Dance" });
   * console.log(newCourse.id); // Output: 3
   */
  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseCurrentId++;
    const newCourse: Course = { ...course, id, createdAt: new Date() };
    this.coursesMap.set(id, newCourse);
    return newCourse;
  }

  /**
   * Updates an existing course record by ID.
   *
   * @purpose Modifies details of an existing course in memory.
   * @param id - The unique numeric ID of the course to update.
   * @param course - A partial `Course` object containing fields to update.
   * @returns A Promise resolving to the updated `Course` object, or `undefined` if not found.
   * @throws None.
   * @sideEffects Mutates the existing course entry in `coursesMap`.
   * @example
   * const updated = await storage.updateCourse(2, { name: "Advanced Hip-Hop" });
   * console.log(updated?.name); // Output: "Advanced Hip-Hop"
   */
  async updateCourse(
    id: number,
    course: Partial<Course>,
  ): Promise<Course | undefined> {
    const existingCourse = this.coursesMap.get(id);
    if (!existingCourse) return undefined;

    const updatedCourse = { ...existingCourse, ...course };
    this.coursesMap.set(id, updatedCourse);
    return updatedCourse;
  }

  /**
   * Deletes a course record by ID.
   *
   * @purpose Removes a course entry from the in-memory database.
   * @param id - The unique numeric ID of the course to delete.
   * @returns A Promise resolving to `true` if deletion succeeded, otherwise `false`.
   * @throws None.
   * @sideEffects Permanently removes the course entry from `coursesMap`.
   * @example
   * const deleted = await storage.deleteCourse(4);
   * console.log(deleted); // Output: true
   */
  async deleteCourse(id: number): Promise<boolean> {
    return this.coursesMap.delete(id);
  }

  /**
   * Retrieves a batch by its unique ID.
   *
   * @purpose Fetches a single batch record from in-memory storage using its ID.
   * @param id - The unique numeric identifier of the batch to retrieve.
   * @returns A Promise resolving to the `Batch` object if found, otherwise `undefined`.
   * @throws None.
   * @sideEffects None.
   * @example
   * const batch = await storage.getBatch(1);
   * console.log(batch?.name); // Output: "Morning Ballet Batch"
   */
  async getBatch(id: number): Promise<Batch | undefined> {
    return this.batchesMap.get(id);
  }

  /**
   * Retrieves all batches available in memory.
   *
   * @purpose Returns a list of all batches stored in memory.
   * @returns A Promise resolving to an array of `Batch` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const allBatches = await storage.getBatches();
   * console.log(allBatches.length); // Output: 10
   */
  async getBatches(): Promise<Batch[]> {
    return Array.from(this.batchesMap.values());
  }

  /**
   * Retrieves all batches associated with a specific course.
   *
   * @purpose Filters and returns all batches belonging to a given course ID.
   * @param courseId - The numeric ID of the course to filter batches by.
   * @returns A Promise resolving to an array of matching `Batch` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const courseBatches = await storage.getBatchesByCourse(2);
   * console.log(courseBatches.map(b => b.name)); // Output: ["Evening Jazz", "Weekend Jazz"]
   */
  async getBatchesByCourse(courseId: number): Promise<Batch[]> {
    return Array.from(this.batchesMap.values()).filter(
      (batch) => batch.courseId === courseId,
    );
  }

  /**
   * Retrieves all batches handled by a specific teacher.
   *
   * @purpose Returns all batch records assigned to a given teacher ID.
   * @param teacherId - The numeric ID of the teacher to filter batches by.
   * @returns A Promise resolving to an array of `Batch` objects assigned to the teacher.
   * @throws None.
   * @sideEffects None.
   * @example
   * const teacherBatches = await storage.getBatchesByTeacher(5);
   * console.log(teacherBatches.length); // Output: 3
   */
  async getBatchesByTeacher(teacherId: number): Promise<Batch[]> {
    return Array.from(this.batchesMap.values()).filter(
      (batch) => batch.teacherId === teacherId,
    );
  }

  /**
   * Retrieves all batches associated with a specific branch.
   *
   * @purpose Returns a list of all batches belonging to a given branch.
   * @param branch - The branch name to filter batches by (e.g., "Downtown").
   * @returns A Promise resolving to an array of matching `Batch` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const branchBatches = await storage.getBatchesByBranch("Main Branch");
   * console.log(branchBatches.map(b => b.name)); // Output: ["Evening Hip-Hop", "Morning Jazz"]
   */
  async getBatchesByBranch(branch: string): Promise<Batch[]> {
    return Array.from(this.batchesMap.values()).filter(
      (batch) => batch.branch === branch,
    );
  }

  /**
   * Creates a new batch record in memory.
   *
   * @purpose Adds a new batch with an auto-incremented ID and default status if not provided.
   * @param batch - The batch data to insert, following the `InsertBatch` type structure.
   * @returns A Promise resolving to the newly created `Batch` object.
   * @throws None.
   * @sideEffects Increments `batchCurrentId` and mutates `batchesMap` by adding a new record.
   * @example
   * const newBatch = await storage.createBatch({
   *   name: "Evening Contemporary",
   *   courseId: 3,
   *   teacherId: 2,
   *   branch: "Downtown"
   * });
   * console.log(newBatch.id); // Output: 4
   */
  async createBatch(batch: InsertBatch): Promise<Batch> {
    const id = this.batchCurrentId++;
    const newBatch: Batch = {
      ...batch,
      id,
      createdAt: new Date(),
      status: batch.status ?? "active",
      roomNumber: batch.roomNumber ?? null,
    };
    this.batchesMap.set(id, newBatch);
    return newBatch;
  }

  /**
   * Updates an existing batch record.
   *
   * @purpose Modifies one or more fields of an existing batch by its ID.
   * @param id - The unique numeric ID of the batch to update.
   * @param batch - A partial `Batch` object containing the updated fields.
   * @returns A Promise resolving to the updated `Batch` object, or `undefined` if not found.
   * @throws None.
   * @sideEffects Mutates an existing record in `batchesMap`.
   * @example
   * const updatedBatch = await storage.updateBatch(3, { status: "inactive" });
   * console.log(updatedBatch?.status); // Output: "inactive"
   */
  async updateBatch(
    id: number,
    batch: Partial<Batch>,
  ): Promise<Batch | undefined> {
    const existingBatch = this.batchesMap.get(id);
    if (!existingBatch) return undefined;

    const updatedBatch = { ...existingBatch, ...batch };
    this.batchesMap.set(id, updatedBatch);
    return updatedBatch;
  }

  /**
   * Deletes a batch record from memory.
   *
   * @purpose Removes a batch entry from the in-memory data store.
   * @param id - The unique numeric ID of the batch to delete.
   * @returns A Promise resolving to `true` if the batch was successfully deleted, otherwise `false`.
   * @throws None.
   * @sideEffects Permanently removes the batch from `batchesMap`.
   * @example
   * const isDeleted = await storage.deleteBatch(2);
   * console.log(isDeleted); // Output: true
   */
  async deleteBatch(id: number): Promise<boolean> {
    return this.batchesMap.delete(id);
  }

  /**
   * Retrieves a brand by its unique ID.
   *
   * @purpose Fetches a specific brand record from in-memory storage by its ID.
   * @param id - The unique numeric identifier of the brand to retrieve.
   * @returns A Promise resolving to the `Brand` object if found, otherwise `undefined`.
   * @throws None.
   * @sideEffects None.
   * @example
   * const brand = await storage.getBrand(1);
   * console.log(brand?.name); // Output: "Innova Studios"
   */
  async getBrand(id: number): Promise<Brand | undefined> {
    return this.brandsMap.get(id);
  }

  /**
   * Retrieves all brand records from memory.
   *
   * @purpose Returns a complete list of all stored brands.
   * @returns A Promise resolving to an array of `Brand` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const brands = await storage.getBrands();
   * console.log(brands.length); // Output: 5
   */
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brandsMap.values());
  }

  /**
   * Creates a new brand record in memory.
   *
   * @purpose Adds a new brand entry with an auto-incremented ID and creation timestamp.
   * @param brand - The brand data to insert, following the `InsertBrand` type structure.
   * @returns A Promise resolving to the newly created `Brand` object.
   * @throws None.
   * @sideEffects Increments `brandCurrentId` and mutates `brandsMap` by adding a new record.
   * @example
   * const newBrand = await storage.createBrand({
   *   name: "Innova Dance Academy",
   *   description: "Premium dance education brand"
   * });
   * console.log(newBrand.id); // Output: 2
   */
  async createBrand(brand: InsertBrand): Promise<Brand> {
    const id = this.brandCurrentId++;
    const newBrand: Brand = {
      id,
      name: brand.name,
      description: brand.description ?? "",
      createdAt: new Date(),
    };
    this.brandsMap.set(id, newBrand);
    return newBrand;
  }

  /**
   * Updates an existing brand record.
   *
   * @purpose Modifies details of an existing brand (e.g., name or description).
   * @param id - The unique numeric ID of the brand to update.
   * @param brand - A partial `Brand` object containing updated fields.
   * @returns A Promise resolving to the updated `Brand` object, or `undefined` if the brand does not exist.
   * @throws None.
   * @sideEffects Mutates the corresponding record in `brandsMap`.
   * @example
   * const updatedBrand = await storage.updateBrand(1, { name: "Innova Pro Studio" });
   * console.log(updatedBrand?.name); // Output: "Innova Pro Studio"
   */
  async updateBrand(
    id: number,
    brand: Partial<Brand>,
  ): Promise<Brand | undefined> {
    const existingBrand = this.brandsMap.get(id);
    if (!existingBrand) return undefined;

    const updatedBrand = { ...existingBrand, ...brand };
    this.brandsMap.set(id, updatedBrand);
    return updatedBrand;
  }

  /**
   * Deletes a brand record from memory.
   *
   * @purpose Permanently removes a brand entry from the in-memory store.
   * @param id - The unique numeric ID of the brand to delete.
   * @returns A Promise resolving to `true` if the brand was successfully deleted, otherwise `false`.
   * @throws None.
   * @sideEffects Mutates `brandsMap` by removing the specified record.
   * @example
   * const isDeleted = await storage.deleteBrand(3);
   * console.log(isDeleted); // Output: true
   */
  async deleteBrand(id: number): Promise<boolean> {
    return this.brandsMap.delete(id);
  }

  /**
   * Creates a new studio record in memory.
   *
   * @purpose Adds a new studio entry to the in-memory storage with an auto-incremented ID.
   * @param studio - The studio data to insert, conforming to the `InsertStudio` type.
   * @returns A Promise resolving to the newly created `Studio` object.
   * @throws None.
   * @sideEffects
   * - Increments the `batchCurrentId` counter (likely a bug; should increment `studioCurrentId` instead).
   * - Mutates `studioMap` by adding a new studio record.
   * @example
   * const newStudio = await storage.createStudio({
   *   name: "Innova Dance Studio",
   *   description: "A creative dance training space."
   * });
   * console.log(newStudio.id); // Output: 1
   */
  async createStudio(studio: InsertStudio): Promise<Studio> {
    const id = this.studioCurrentId++;
    const newStudio: Studio = {
      id: this.studioCurrentId,
      name: studio.name,
      description: studio.description ?? "",
    };
    this.studioMap.set(id, newStudio);
    return newStudio;
  }

  /**
   * Retrieves all studio records from memory.
   *
   * @purpose Returns a complete list of all studios currently stored in memory.
   * @returns A Promise resolving to an array of `Studio` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const studios = await storage.getStudio();
   * console.log(studios.length); // Output: 3
   */
  async getStudio(): Promise<Studio[]> {
    return Array.from(this.studioMap.values());
  }

  /**
   * Retrieves a student by their unique ID.
   *
   * @purpose Fetch a student record from in-memory storage based on the student’s internal ID.
   * @param id - The numeric unique identifier of the student.
   * @returns A Promise resolving to the `Student` object if found, otherwise `undefined`.
   * @throws None.
   * @sideEffects None.
   * @example
   * const student = await storage.getStudent(1);
   * console.log(student?.firstName); // Output: "Alice"
   */
  async getStudent(id: number): Promise<Student | undefined> {
    return this.studentsMap.get(id);
  }

  /**
   * Retrieves a student by their custom student ID.
   *
   * @purpose Find a student using their unique `studentId` field rather than numeric ID.
   * @param studentId - The alphanumeric student identifier.
   * @returns A Promise resolving to the `Student` object if found, otherwise `undefined`.
   * @throws None.
   * @sideEffects None.
   * @example
   * const student = await storage.getStudentByStudentId("STU-001");
   * console.log(student?.id); // Output: 3
   */
  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.studentsMap.values()).find(
      (student) => student.studentId === studentId,
    );
  }

  /**
   * Retrieves all students.
   *
   * @purpose Fetch all student records stored in memory.
   * @returns A Promise resolving to an array of `Student` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const students = await storage.getStudents();
   * console.log(students.length); // Output: 25
   */
  async getStudents(): Promise<Student[]> {
    return Array.from(this.studentsMap.values());
  }

  /**
   * Retrieves students associated with a specific parent.
   *
   * @purpose Get all students who belong to the specified parent.
   * @param parentId - The unique ID of the parent.
   * @returns A Promise resolving to an array of `Student` objects linked to the parent.
   * @throws None.
   * @sideEffects None.
   * @example
   * const children = await storage.getStudentsByParent(4);
   * console.log(children.map(s => s.firstName)); // Output: ["John", "Lisa"]
   */
  async getStudentsByParent(parentId: number): Promise<Student[]> {
    return Array.from(this.studentsMap.values()).filter(
      (student) => student.parentId === parentId,
    );
  }

  /**
   * Retrieves students enrolled in batches of a specific branch.
   *
   * @purpose Find all students linked to batches that belong to the given branch.
   * @param branch - The name of the branch (e.g., "Downtown").
   * @returns A Promise resolving to an array of `Student` objects enrolled under that branch.
   * @throws None.
   * @sideEffects Performs multiple in-memory lookups across batches and enrollments.
   * @example
   * const students = await storage.getStudentsByBranch("Main Branch");
   * console.log(students.length); // Output: 12
   */
  async getStudentsByBranch(branch: string): Promise<Student[]> {
    // Get enrollments for the branch's batches
    const branchBatches = Array.from(this.batchesMap.values()).filter(
      (batch) => batch.branch === branch,
    );
    const branchBatchIds = branchBatches.map((batch) => batch.id);

    // Get students enrolled in these batches
    const enrollments = Array.from(this.enrollmentsMap.values()).filter(
      (enrollment) => branchBatchIds.includes(enrollment.batchId),
    );
    const studentIds = enrollments.map((enrollment) => enrollment.studentId);

    return Array.from(this.studentsMap.values()).filter((student) =>
      studentIds.includes(student.id),
    );
  }

  /**
   * Retrieves students belonging to a specific batch.
   *
   * @purpose Fetch all students enrolled in a given batch.
   * @param batchId - The numeric or string identifier of the batch.
   * @returns A Promise resolving to an array of `Student` objects in the batch.
   * @throws None.
   * @sideEffects Reads data from both `enrollmentsMap` and `studentsMap`.
   * @example
   * const students = await storage.getStudentsByBatch("5");
   * console.log(students.map(s => s.firstName)); // Output: ["Aria", "Leo"]
   */
  async getStudentsByBatch(batchId: string): Promise<Student[]> {
    // Get enrollments for this batch
    const enrollments = Array.from(this.enrollmentsMap.values()).filter(
      (enrollment) => enrollment.batchId === Number(batchId),
    );
    const studentIds = enrollments.map((enrollment) => enrollment.studentId);

    return Array.from(this.studentsMap.values()).filter((student) =>
      studentIds.includes(student.id),
    );
  }

  /**
   * Creates a new student record in memory.
   *
   * @purpose Add a new student to the in-memory data store with defaults for missing optional fields.
   * @param student - The student details to insert.
   * @returns A Promise resolving to the newly created `Student` object.
   * @throws None.
   * @sideEffects
   * - Increments `studentCurrentId`.
   * - Mutates `studentsMap` by adding the new student.
   * @example
   * const student = await storage.createStudent({
   *   firstName: "Maya",
   *   lastName: "Sharma",
   *   studentId: "STU-004",
   *   course: "Contemporary Dance"
   * });
   * console.log(student.id); // Output: 10
   */
  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.studentCurrentId++;
    const newStudent: Student = {
      ...student,
      id,
      middleName: student.middleName ?? null,
      createdAt: new Date(),
      dateOfBirth: student.dateOfBirth ?? null,
      age: student.age ?? null,
      gender: student.gender ?? null,
      residenceAddress: student.residenceAddress ?? null,
      street: student.street ?? null,
      community: student.community ?? null,
      flatNo: student.flatNo ?? null,
      phone: student.phone ?? null,
      whatsappNo: student.whatsappNo ?? null,
      parentId: student.parentId ?? null,
      email: student.email ?? null,
      userId: student.userId ?? null,
      isReRegistering: student.isReRegistering ?? "no",
      registrationDate: student.registrationDate ?? null,
      registrationFee: student.registrationFee ?? null,
      course: student.course ?? null,
      branch: student.branch ?? null,
      status: student.status ?? "active",
    };
    this.studentsMap.set(id, newStudent);
    return newStudent;
  }

  /**
   * Updates an existing student’s record.
   *
   * @purpose Modify an existing student entry with partial updates.
   * @param id - The numeric ID of the student to update.
   * @param student - A partial `Student` object containing fields to update.
   * @returns A Promise resolving to the updated `Student` object or `undefined` if not found.
   * @throws None.
   * @sideEffects Mutates `studentsMap` to replace the existing student with updated data.
   * @example
   * const updated = await storage.updateStudent(2, { status: "inactive" });
   * console.log(updated?.status); // Output: "inactive"
   */
  async updateStudent(
    id: number,
    student: Partial<Student>,
  ): Promise<Student | undefined> {
    const existingStudent = this.studentsMap.get(id);
    if (!existingStudent) return undefined;

    const updatedStudent = { ...existingStudent, ...student };
    this.studentsMap.set(id, updatedStudent);
    return updatedStudent;
  }

  /**
   * Deletes a student record from memory.
   *
   * @purpose Remove a student from the in-memory store by ID.
   * @param id - The numeric ID of the student to delete.
   * @returns A Promise resolving to `true` if deletion succeeded, otherwise `false`.
   * @throws None.
   * @sideEffects Mutates `studentsMap` by removing a record.
   * @example
   * const deleted = await storage.deleteStudent(5);
   * console.log(deleted); // Output: true
   */
  async deleteStudent(id: number): Promise<boolean> {
    return this.studentsMap.delete(id);
  }

  /**
   * Retrieves a parent by their unique ID.
   *
   * @purpose Fetch a specific parent record from in-memory storage based on its numeric ID.
   * @param id - The unique numeric identifier of the parent.
   * @returns A Promise resolving to the `Parent` object if found, otherwise `undefined`.
   * @throws None.
   * @sideEffects None.
   * @example
   * const parent = await storage.getParent(1);
   * console.log(parent?.firstName); // Output: "Sophia"
   */
  async getParent(id: number): Promise<Parent | undefined> {
    return this.parentsMap.get(id);
  }

  /**
   * Retrieves all parents.
   *
   * @purpose Fetch all parent records stored in memory.
   * @param none
   * @returns A Promise resolving to an array of all `Parent` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const parents = await storage.getParents();
   * console.log(parents.length); // Output: 15
   */
  async getParents(): Promise<Parent[]> {
    return Array.from(this.parentsMap.values());
  }

  /**
   * Creates a new parent record in memory.
   *
   * @purpose Add a new parent entry to the in-memory data store with default values for optional fields.
   * @param parent - The `InsertParent` object containing the parent’s details.
   * @returns A Promise resolving to the newly created `Parent` object.
   * @throws None.
   * @sideEffects
   * - Increments `parentCurrentId`.
   * - Mutates `parentsMap` by adding a new record.
   * @example
   * const parent = await storage.createParent({
   *   firstName: "Mark",
   *   lastName: "Johnson",
   *   email: "mark@example.com"
   * });
   * console.log(parent.id); // Output: 2
   */
  async createParent(parent: InsertParent): Promise<Parent> {
    const id = this.parentCurrentId++;
    const newParent: Parent = {
      ...parent,
      id,
      middleName: parent.middleName ?? null,
      password: parent.password ?? null,
      phone: parent.phone ?? null,
      whatsappNo: parent.whatsappNo ?? null,
      email: parent.email ?? null,
      street: parent.street ?? null,
      community: parent.community ?? null,
      residenceAddress: parent.residenceAddress ?? null,
      flatNo: parent.flatNo ?? null,
      status: parent.status ?? "active",
      createdAt: new Date(),
    };
    this.parentsMap.set(id, newParent);
    return newParent;
  }

  /**
   * Updates an existing parent’s record.
   *
   * @purpose Modify an existing parent entry with partial updates.
   * @param id - The unique numeric ID of the parent to update.
   * @param parent - A partial `Parent` object containing the updated fields.
   * @returns A Promise resolving to the updated `Parent` object, or `undefined` if not found.
   * @throws None.
   * @sideEffects Mutates `parentsMap` by replacing an existing record with updated data.
   * @example
   * const updatedParent = await storage.updateParent(1, { phone: "9876543210" });
   * console.log(updatedParent?.phone); // Output: "9876543210"
   */
  async updateParent(
    id: number,
    parent: Partial<Parent>,
  ): Promise<Parent | undefined> {
    const existingParent = this.parentsMap.get(id);
    if (!existingParent) return undefined;

    const updatedParent = { ...existingParent, ...parent };
    this.parentsMap.set(id, updatedParent);
    return updatedParent;
  }

  /**
   * Deletes a parent record from memory.
   *
   * @purpose Remove a parent from the in-memory data store based on their ID.
   * @param id - The unique numeric ID of the parent to delete.
   * @returns A Promise resolving to `true` if deletion succeeded, otherwise `false`.
   * @throws None.
   * @sideEffects Mutates `parentsMap` by removing the specified record.
   * @example
   * const deleted = await storage.deleteParent(3);
   * console.log(deleted); // Output: true
   */
  async deleteParent(id: number): Promise<boolean> {
    return this.parentsMap.delete(id);
  }

  /**
   * Retrieves an enrollment by its unique ID.
   *
   * @purpose Fetch a specific enrollment record from memory based on its numeric ID.
   * @param id - The unique numeric identifier of the enrollment.
   * @returns A Promise resolving to the `Enrollment` object if found, otherwise `undefined`.
   * @throws None.
   * @sideEffects None.
   * @example
   * const enrollment = await storage.getEnrollment(1);
   * console.log(enrollment?.studentId); // Output: 5
   */
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    return this.enrollmentsMap.get(id);
  }

  /**
   * Retrieves all enrollments.
   *
   * @purpose Fetch all enrollment records stored in memory.
   * @param none
   * @returns A Promise resolving to an array of all `Enrollment` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const enrollments = await storage.getEnrollments();
   * console.log(enrollments.length); // Output: 20
   */
  async getEnrollments(): Promise<Enrollment[]> {
    return Array.from(this.enrollmentsMap.values());
  }

  /**
   * Retrieves enrollments for a specific student.
   *
   * @purpose Fetch all enrollment records associated with a given student ID.
   * @param studentId - The unique numeric ID of the student.
   * @returns A Promise resolving to an array of `Enrollment` objects for the student.
   * @throws None.
   * @sideEffects None.
   * @example
   * const studentEnrollments = await storage.getEnrollmentsByStudent(5);
   * console.log(studentEnrollments.length); // Output: 3
   */
  async getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollmentsMap.values()).filter(
      (enrollment) => enrollment.studentId === studentId,
    );
  }

  /**
   * Retrieves enrollments for a specific batch.
   *
   * @purpose Fetch all enrollment records associated with a given batch ID.
   * @param batchId - The unique numeric ID of the batch.
   * @returns A Promise resolving to an array of `Enrollment` objects for the batch.
   * @throws None.
   * @sideEffects None.
   * @example
   * const batchEnrollments = await storage.getEnrollmentsByBatch(2);
   * console.log(batchEnrollments.length); // Output: 10
   */
  async getEnrollmentsByBatch(batchId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollmentsMap.values()).filter(
      (enrollment) => enrollment.batchId === batchId,
    );
  }

  /**
   * Creates a new enrollment record in memory.
   *
   * @purpose Add a new enrollment entry to the in-memory data store with default values for optional fields.
   * @param enrollment - The `InsertEnrollment` object containing the enrollment details.
   * @returns A Promise resolving to the newly created `Enrollment` object.
   * @throws None.
   * @sideEffects
   * - Increments `enrollmentCurrentId`.
   * - Mutates `enrollmentsMap` by adding a new record.
   * @example
   * const newEnrollment = await storage.createEnrollment({
   *   studentId: 5,
   *   batchId: 2,
   *   status: "active"
   * });
   * console.log(newEnrollment.id); // Output: 12
   */
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentCurrentId++;
    const newEnrollment: Enrollment = {
      ...enrollment,
      id,
      createdAt: new Date(),
      status: enrollment.status || "active",
      enrollmentDate: enrollment.enrollmentDate ?? null,
      // durationMonths: enrollment.durationMonths ?? 1,
    };
    this.enrollmentsMap.set(id, newEnrollment);
    return newEnrollment;
  }

  /**
   * Updates an existing enrollment record.
   *
   * @purpose Modify an existing enrollment entry with partial updates.
   * @param id - The unique numeric ID of the enrollment to update.
   * @param enrollment - A partial `Enrollment` object containing the updated fields.
   * @returns A Promise resolving to the updated `Enrollment` object, or `undefined` if not found.
   * @throws None.
   * @sideEffects Mutates `enrollmentsMap` by replacing an existing record with updated data.
   * @example
   * const updatedEnrollment = await storage.updateEnrollment(12, { status: "completed" });
   * console.log(updatedEnrollment?.status); // Output: "completed"
   */
  async updateEnrollment(
    id: number,
    enrollment: Partial<Enrollment>,
  ): Promise<Enrollment | undefined> {
    const existingEnrollment = this.enrollmentsMap.get(id);
    if (!existingEnrollment) return undefined;

    const updatedEnrollment = { ...existingEnrollment, ...enrollment };
    this.enrollmentsMap.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  /**
   * Deletes an enrollment record from memory.
   *
   * @purpose Remove an enrollment from the in-memory data store based on its ID.
   * @param id - The unique numeric ID of the enrollment to delete.
   * @returns A Promise resolving to `true` if deletion succeeded, otherwise `false`.
   * @throws None.
   * @sideEffects Mutates `enrollmentsMap` by removing the specified record.
   * @example
   * const deleted = await storage.deleteEnrollment(12);
   * console.log(deleted); // Output: true
   */
  async deleteEnrollment(id: number): Promise<boolean> {
    return this.enrollmentsMap.delete(id);
  }

  /**
   * Retrieves an attendance record by its unique ID.
   *
   * @purpose Fetch a specific attendance entry from memory based on its numeric ID.
   * @param id - The unique numeric identifier of the attendance record.
   * @returns A Promise resolving to the `Attendance` object if found, otherwise `undefined`.
   * @throws None.
   * @sideEffects None.
   * @example
   * const record = await storage.getAttendance(1);
   * console.log(record?.status); // Output: "present"
   */
  async getAttendance(id: number): Promise<Attendance | undefined> {
    return this.attendanceMap.get(id);
  }

  /**
   * Retrieves all attendance records for a specific student.
   *
   * @purpose Fetch all attendance entries associated with a student ID.
   * @param studentId - The unique numeric ID of the student.
   * @returns A Promise resolving to an array of `Attendance` objects for that student.
   * @throws None.
   * @sideEffects None.
   * @example
   * const studentRecords = await storage.getAttendanceByStudent(5);
   * console.log(studentRecords.length); // Output: 12
   */
  async getAttendanceByStudent(studentId: number): Promise<Attendance[]> {
    return Array.from(this.attendanceMap.values()).filter(
      (attendance) => attendance.studentId === studentId,
    );
  }

  /**
   * Retrieves all attendance records for a specific batch.
   *
   * @purpose Fetch all attendance entries associated with a batch ID.
   * @param batchId - The unique numeric ID of the batch.
   * @returns A Promise resolving to an array of `Attendance` objects for that batch.
   * @throws None.
   * @sideEffects None.
   * @example
   * const batchRecords = await storage.getAttendanceByBatch(2);
   * console.log(batchRecords.length); // Output: 20
   */
  async getAttendanceByBatch(batchId: number): Promise<Attendance[]> {
    return Array.from(this.attendanceMap.values()).filter(
      (attendance) => attendance.batchId === batchId,
    );
  }

  /**
   * Retrieves all attendance records for a specific date.
   *
   * @purpose Fetch attendance entries recorded on a particular date.
   * @param date - The date to filter attendance records by.
   * @returns A Promise resolving to an array of `Attendance` objects for that date.
   * @throws None.
   * @sideEffects None.
   * @example
   * const todayRecords = await storage.getAttendanceByDate(new Date("2025-10-07"));
   * console.log(todayRecords.length); // Output: 15
   */
  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    return Array.from(this.attendanceMap.values()).filter(
      (attendance) =>
        format(new Date(attendance.date), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd"),
    );
  }

  /**
   * Creates a new attendance record in memory.
   *
   * @purpose Add a new attendance entry to the in-memory data store with default values.
   * @param attendance - The `InsertAttendance` object containing the attendance details.
   * @returns A Promise resolving to the newly created `Attendance` object.
   * @throws None.
   * @sideEffects
   * - Increments `attendanceCurrentId`.
   * - Mutates `attendanceMap` by adding a new record.
   * @example
   * const newAttendance = await storage.createAttendance({
   *   studentId: 5,
   *   batchId: 2,
   *   status: "present"
   * });
   * console.log(newAttendance.id); // Output: 12
   */
  async createAttendance(attendance: InsertAttendance): Promise<Attendance> {
    const id = this.attendanceCurrentId++;
    const newAttendance: Attendance = {
      ...attendance,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      compensationBatchName: attendance.compensationBatchName || null,
      compensationDate: attendance.compensationDate || null,
    };
    this.attendanceMap.set(id, newAttendance);
    return newAttendance;
  }

  /**
   * Updates an existing attendance record.
   *
   * @purpose Modify an existing attendance entry with partial updates.
   * @param id - The unique numeric ID of the attendance to update.
   * @param attendance - A partial `Attendance` object containing updated fields.
   * @returns A Promise resolving to the updated `Attendance` object, or `undefined` if not found.
   * @throws None.
   * @sideEffects Mutates `attendanceMap` by replacing an existing record with updated data.
   * @example
   * const updated = await storage.updateAttendance(12, { status: "absent" });
   * console.log(updated?.status); // Output: "absent"
   */
  async updateAttendance(
    id: number,
    attendance: Partial<Attendance>,
  ): Promise<Attendance | undefined> {
    const existingAttendance = this.attendanceMap.get(id);
    if (!existingAttendance) return undefined;

    const updatedAttendance = {
      ...existingAttendance,
      ...attendance,
      updatedAt: new Date(),
    };
    this.attendanceMap.set(id, updatedAttendance);
    return updatedAttendance;
  }

  /**
   * Deletes an attendance record from memory.
   *
   * @purpose Remove an attendance entry from the in-memory store based on its ID.
   * @param id - The unique numeric ID of the attendance record to delete.
   * @returns A Promise resolving to `true` if deletion succeeded, otherwise `false`.
   * @throws None.
   * @sideEffects Mutates `attendanceMap` by removing the specified record.
   * @example
   * const deleted = await storage.deleteAttendance(12);
   * console.log(deleted); // Output: true
   */
  async deleteAttendance(id: number): Promise<boolean> {
    return this.attendanceMap.delete(id);
  }

  /**
   * Retrieves a payment record by its unique ID.
   *
   * @purpose Fetch a specific payment entry from memory based on its numeric ID.
   * @param id - The unique numeric identifier of the payment record.
   * @returns A Promise resolving to the `Payment` object if found, otherwise `undefined`.
   * @throws None.
   * @sideEffects None.
   * @example
   * const payment = await storage.getPayment(1);
   * console.log(payment?.amount); // Output: 500
   */
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.paymentsMap.get(id);
  }

  /**
   * Retrieves a payment record by its invoice ID.
   *
   * @purpose Fetch a specific payment entry from memory based on its invoice ID.
   * @param invoiceId - The unique invoice identifier of the payment record.
   * @returns A Promise resolving to the `Payment` object if found, otherwise `undefined`.
   * @throws None.
   * @sideEffects None.
   * @example
   * const payment = await storage.getPaymentByInvoiceId("INV-1001");
   * console.log(payment?.status); // Output: "paid"
   */
  async getPaymentByInvoiceId(invoiceId: string): Promise<Payment | undefined> {
    return Array.from(this.paymentsMap.values()).find(
      (payment) => payment.invoiceId === invoiceId,
    );
  }

  /**
   * Retrieves all payment records.
   *
   * @purpose Fetch all payment entries from memory.
   * @returns A Promise resolving to an array of `Payment` objects.
   * @throws None.
   * @sideEffects None.
   * @example
   * const allPayments = await storage.getPayments();
   * console.log(allPayments.length); // Output: 25
   */
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.paymentsMap.values());
  }

  /**
   * Retrieves all payment records for a specific student.
   *
   * @purpose Fetch all payment entries associated with a student ID.
   * @param studentId - The unique numeric ID of the student.
   * @returns A Promise resolving to an array of `Payment` objects for that student.
   * @throws None.
   * @sideEffects None.
   * @example
   * const studentPayments = await storage.getPaymentsByStudent(5);
   * console.log(studentPayments.length); // Output: 10
   */
  async getPaymentsByStudent(studentId: number): Promise<Payment[]> {
    return Array.from(this.paymentsMap.values()).filter(
      (payment) => payment.studentId === studentId,
    );
  }

  /**
   * Retrieves all payment records with a specific status.
   *
   * @purpose Fetch all payment entries that match a given status.
   * @param status - The status string (e.g., "paid", "pending").
   * @returns A Promise resolving to an array of `Payment` objects with the given status.
   * @throws None.
   * @sideEffects None.
   * @example
   * const pendingPayments = await storage.getPaymentsByStatus("pending");
   * console.log(pendingPayments.length); // Output: 7
   */
  async getPaymentsByStatus(status: string): Promise<Payment[]> {
    return Array.from(this.paymentsMap.values()).filter(
      (payment) => payment.status === status,
    );
  }

  /**
   * Creates a new payment record in memory.
   *
   * @purpose Add a new payment entry to the in-memory data store with default values.
   * @param payment - The `InsertPayment` object containing the payment details.
   * @returns A Promise resolving to the newly created `Payment` object.
   * @throws None.
   * @sideEffects
   * - Increments `paymentCurrentId`.
   * - Mutates `paymentsMap` by adding a new record.
   * @example
   * const newPayment = await storage.createPayment({
   *   studentId: 5,
   *   invoiceId: "INV-1002",
   *   amount: 500,
   *   status: "paid"
   * });
   * console.log(newPayment.id); // Output: 12
   */
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentCurrentId++;
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: new Date(),
      remarks: payment.remarks || null,
      paymentMethod: payment.paymentMethod || null,
    };
    this.paymentsMap.set(id, newPayment);
    return newPayment;
  }

  /**
   * Updates an existing payment record.
   *
   * @purpose Modify an existing payment entry with partial updates.
   * @param id - The unique numeric ID of the payment to update.
   * @param payment - A partial `Payment` object containing updated fields.
   * @returns A Promise resolving to the updated `Payment` object, or `undefined` if not found.
   * @throws None.
   * @sideEffects Mutates `paymentsMap` by replacing an existing record with updated data.
   * @example
   * const updatedPayment = await storage.updatePayment(12, { status: "pending" });
   * console.log(updatedPayment?.status); // Output: "pending"
   */
  async updatePayment(
    id: number,
    payment: Partial<Payment>,
  ): Promise<Payment | undefined> {
    const existingPayment = this.paymentsMap.get(id);
    if (!existingPayment) return undefined;

    const updatedPayment = { ...existingPayment, ...payment };
    this.paymentsMap.set(id, updatedPayment);
    return updatedPayment;
  }

  /**
   * Deletes a payment record from memory.
   *
   * @purpose Remove a payment entry from the in-memory store based on its ID.
   * @param id - The unique numeric ID of the payment record to delete.
   * @returns A Promise resolving to `true` if deletion succeeded, otherwise `false`.
   * @throws None.
   * @sideEffects Mutates `paymentsMap` by removing the specified record.
   * @example
   * const deleted = await storage.deletePayment(12);
   * console.log(deleted); // Output: true
   */
  async deletePayment(id: number): Promise<boolean> {
    return this.paymentsMap.delete(id);
  }

  /**
   * Retrieves an employee record by its unique numeric ID.
   *
   * @purpose Fetch a specific employee from memory by ID.
   * @param id - Unique numeric identifier of the employee.
   * @returns A Promise resolving to the `Employee` object if found, otherwise `undefined`.
   * @throws None
   * @sideEffects None
   * @example
   * const employee = await storage.getEmployee(1);
   * console.log(employee?.name);
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employeesMap.get(id);
  }

  /**
   * Retrieves an employee record by its employee ID string.
   *
   * @purpose Fetch a specific employee from memory by their employee ID.
   * @param employeeId - Unique string identifier of the employee.
   * @returns A Promise resolving to the `Employee` object if found, otherwise `undefined`.
   * @throws None
   * @sideEffects None
   * @example
   * const employee = await storage.getEmployeeByEmployeeId("EMP-1001");
   * console.log(employee?.position);
   */
  async getEmployeeByEmployeeId(
    employeeId: string,
  ): Promise<Employee | undefined> {
    return Array.from(this.employeesMap.values()).find(
      (employee) => employee.employeeId === employeeId,
    );
  }

  /**
   * Retrieves all employee records.
   *
   * @purpose Fetch all employees from memory.
   * @returns A Promise resolving to an array of `Employee` objects.
   * @throws None
   * @sideEffects None
   * @example
   * const allEmployees = await storage.getEmployees();
   * console.log(allEmployees.length);
   */
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employeesMap.values());
  }

  /**
   * Retrieves employees by their position.
   *
   * @purpose Fetch employees who hold a specific position.
   * @param position - Job title or position string.
   * @returns A Promise resolving to an array of `Employee` objects matching the position.
   * @throws None
   * @sideEffects None
   * @example
   * const teachers = await storage.getEmployeesByPosition("Teacher");
   * console.log(teachers.length);
   */
  async getEmployeesByPosition(position: string): Promise<Employee[]> {
    return Array.from(this.employeesMap.values()).filter(
      (employee) => employee.position === position,
    );
  }

  /**
   * Retrieves employees by their branch.
   *
   * @purpose Fetch employees working in a specific branch.
   * @param branch - Branch name string.
   * @returns A Promise resolving to an array of `Employee` objects for that branch.
   * @throws None
   * @sideEffects None
   * @example
   * const branchEmployees = await storage.getEmployeesByBranch("Downtown");
   * console.log(branchEmployees.length);
   */
  async getEmployeesByBranch(branch: string): Promise<Employee[]> {
    return Array.from(this.employeesMap.values()).filter(
      (employee) => employee.branch === branch,
    );
  }

  /**
   * Creates a new employee record.
   *
   * @purpose Add a new employee to the in-memory store with default fields.
   * @param employee - `InsertEmployee` object containing employee details.
   * @returns A Promise resolving to the newly created `Employee` object.
   * @throws None
   * @sideEffects
   * - Increments `employeeCurrentId`.
   * - Mutates `employeesMap` by adding a new record.
   * @example
   * const newEmployee = await storage.createEmployee({
   *   employeeId: "EMP-1002",
   *   firstName: "John",
   *   lastName: "Doe",
   *   position: "Teacher",
   *   branch: "Downtown",
   *   street: "123 Main St",
   *   community: "Community",
   *   flatNumber: "123",
   *   middleName: "Doe",
   *   status: "active",
   *   bankAccount: "1234567890",
   *   email: "john.doe@example.com",
   *   specialization: "Music",
   *   ifscIbanBsb: "1234567890"
   * });
   * console.log(newEmployee.id);
   */
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.employeeCurrentId++;
    const newEmployee: Employee = {
      ...employee,
      id,
      street: employee.street || null,
      community: employee.community || null,
      flatNumber: employee.flatNumber || null,
      middleName: employee.middleName || null,
      createdAt: new Date(),
      status: employee.status || "active",
      bankAccount: employee.bankAccount || null,
      email: employee.email ?? null,
      specialization: employee.specialization || null,
      ifscIbanBsb: employee.ifscIbanBsb || null,
    };
    this.employeesMap.set(id, newEmployee);
    return newEmployee;
  }

  /**
   * Updates an existing employee record.
   *
   * @purpose Modify an employee entry with partial updates.
   * @param id - Unique numeric ID of the employee.
   * @param employee - Partial `Employee` object containing updated fields.
   * @returns A Promise resolving to the updated `Employee` object, or `undefined` if not found.
   * @throws None
   * @sideEffects Mutates `employeesMap` by replacing the existing record.
   * @example
   * const updatedEmployee = await storage.updateEmployee(1, { status: "inactive" });
   * console.log(updatedEmployee?.status);
   */
  async updateEmployee(
    id: number,
    employee: Partial<Employee>,
  ): Promise<Employee | undefined> {
    const existingEmployee = this.employeesMap.get(id);
    if (!existingEmployee) return undefined;

    const updatedEmployee = { ...existingEmployee, ...employee };
    this.employeesMap.set(id, updatedEmployee);
    return updatedEmployee;
  }

  /**
   * Deletes an employee record.
   *
   * @purpose Remove an employee from memory based on ID.
   * @param id - Unique numeric ID of the employee.
   * @returns A Promise resolving to `true` if deletion succeeded, otherwise `false`.
   * @throws None
   * @sideEffects Mutates `employeesMap` by removing the specified record.
   * @example
   * const deleted = await storage.deleteEmployee(1);
   * console.log(deleted); // true
   */
  async deleteEmployee(id: number): Promise<boolean> {
    return this.employeesMap.delete(id);
  }

  /**
   * Retrieves a payroll record by its unique numeric ID.
   *
   * @purpose Fetch a specific payroll from memory by ID.
   * @param id - Unique numeric identifier of the payroll.
   * @returns A Promise resolving to the `Payroll` object if found, otherwise `undefined`.
   * @throws None
   * @sideEffects None
   * @example
   * const payroll = await storage.getPayroll(1);
   * console.log(payroll?.status);
   */
  async getPayroll(id: number): Promise<Payroll | undefined> {
    return this.payrollsMap.get(id);
  }

  /**
   * Retrieves all payroll records.
   *
   * @purpose Fetch all payroll entries from memory.
   * @returns A Promise resolving to an array of `Payroll` objects.
   * @throws None
   * @sideEffects None
   * @example
   * const allPayrolls = await storage.getPayrolls();
   * console.log(allPayrolls.length);
   */
  async getPayrolls(): Promise<Payroll[]> {
    return Array.from(this.payrollsMap.values());
  }

  /**
   * Retrieves payroll records for a specific employee.
   *
   * @purpose Fetch all payroll entries for a given employee.
   * @param employeeId - Numeric ID of the employee.
   * @returns A Promise resolving to an array of `Payroll` objects for that employee.
   * @throws None
   * @sideEffects None
   * @example
   * const employeePayrolls = await storage.getPayrollsByEmployee(1);
   * console.log(employeePayrolls.length);
   */
  async getPayrollsByEmployee(employeeId: number): Promise<Payroll[]> {
    return Array.from(this.payrollsMap.values()).filter(
      (payroll) => payroll.employeeId === employeeId,
    );
  }

  /**
   * Retrieves payroll records for a specific month.
   *
   * @purpose Fetch all payroll entries for a given month.
   * @param month - Month string in a recognizable format (e.g., "2025-10").
   * @returns A Promise resolving to an array of `Payroll` objects for that month.
   * @throws None
   * @sideEffects None
   * @example
   * const octoberPayrolls = await storage.getPayrollsByMonth("2025-10");
   * console.log(octoberPayrolls.length);
   */
  async getPayrollsByMonth(month: string): Promise<Payroll[]> {
    return Array.from(this.payrollsMap.values()).filter(
      (payroll) => payroll.month === month,
    );
  }

  /**
   * Creates a new payroll record.
   *
   * @purpose Add a new payroll entry to the in-memory store with default fields.
   * @param payroll - `InsertPayroll` object containing payroll details.
   * @returns A Promise resolving to the newly created `Payroll` object.
   * @throws None
   * @sideEffects
   * - Increments `payrollCurrentId`.
   * - Mutates `payrollsMap` by adding a new record.
   * @example
   * const newPayroll = await storage.createPayroll({
   *   employeeId: 1,
   *   month: "2025-10",
   *   amount: 5000
   * });
   * console.log(newPayroll.id);
   */
  async createPayroll(payroll: InsertPayroll): Promise<Payroll> {
    const id = this.payrollCurrentId++;
    const newPayroll: Payroll = {
      ...payroll,
      id,
      createdAt: new Date(),
      paymentDate: payroll.paymentDate
        ? new Date(payroll.paymentDate).toISOString()
        : null,
      status: payroll.status || "pending",
      incentives: payroll.incentives || "0",
      deductions: payroll.deductions || "0",
      remarks: payroll.remarks || null,
    };
    this.payrollsMap.set(id, newPayroll);
    return newPayroll;
  }

  /**
   * Updates an existing payroll record.
   *
   * @purpose Modify a payroll entry with partial updates.
   * @param id - Unique numeric ID of the payroll.
   * @param payroll - Partial `Payroll` object containing updated fields.
   * @returns A Promise resolving to the updated `Payroll` object, or `undefined` if not found.
   * @throws None
   * @sideEffects Mutates `payrollsMap` by replacing the existing record.
   * @example
   * const updatedPayroll = await storage.updatePayroll(1, { status: "paid" });
   * console.log(updatedPayroll?.status);
   */
  async updatePayroll(
    id: number,
    payroll: Partial<Payroll>,
  ): Promise<Payroll | undefined> {
    const existingPayroll = this.payrollsMap.get(id);
    if (!existingPayroll) return undefined;

    const updatedPayroll = { ...existingPayroll, ...payroll };
    this.payrollsMap.set(id, updatedPayroll);
    return updatedPayroll;
  }

  /**
   * Deletes a payroll record.
   *
   * @purpose Remove a payroll entry from memory based on ID.
   * @param id - Unique numeric ID of the payroll.
   * @returns A Promise resolving to `true` if deletion succeeded, otherwise `false`.
   * @throws None
   * @sideEffects Mutates `payrollsMap` by removing the specified record.
   * @example
   * const deleted = await storage.deletePayroll(1);
   * console.log(deleted); // true
   */
  async deletePayroll(id: number): Promise<boolean> {
    return this.payrollsMap.delete(id);
  }

  /**
   * Retrieves a message by its unique numeric ID.
   *
   * @purpose Fetch a specific message from memory by ID.
   * @param id - Unique numeric identifier of the message.
   * @returns A Promise resolving to the `Message` object if found, otherwise `undefined`.
   * @throws None
   * @sideEffects None
   * @example
   * const msg = await storage.getMessage(1);
   * console.log(msg?.content);
   */
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messagesMap.get(id);
  }

  /**
   * Retrieves all messages.
   *
   * @purpose Fetch all message entries from memory.
   * @returns A Promise resolving to an array of `Message` objects.
   * @throws None
   * @sideEffects None
   * @example
   * const allMessages = await storage.getMessages();
   * console.log(allMessages.length);
   */
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messagesMap.values());
  }

  /**
   * Retrieves messages sent by a specific sender.
   *
   * @purpose Fetch all messages from a given sender.
   * @param senderId - Numeric ID of the sender.
   * @returns A Promise resolving to an array of `Message` objects sent by that sender.
   * @throws None
   * @sideEffects None
   * @example
   * const sentMessages = await storage.getMessagesBySender(1);
   * console.log(sentMessages.length);
   */
  async getMessagesBySender(senderId: number): Promise<Message[]> {
    return Array.from(this.messagesMap.values()).filter(
      (message) => message.senderId === senderId,
    );
  }

  /**
   * Retrieves messages received by a specific receiver.
   *
   * @purpose Fetch all messages for a given receiver.
   * @param receiverId - Numeric ID of the receiver.
   * @returns A Promise resolving to an array of `Message` objects received by that receiver.
   * @throws None
   * @sideEffects None
   * @example
   * const receivedMessages = await storage.getMessagesByReceiver(2);
   * console.log(receivedMessages.length);
   */
  async getMessagesByReceiver(receiverId: number): Promise<Message[]> {
    return Array.from(this.messagesMap.values()).filter(
      (message) => message.receiverId === receiverId,
    );
  }

  /**
   * Creates a new message.
   *
   * @purpose Add a new message entry to the in-memory store.
   * @param message - `InsertMessage` object containing message details.
   * @returns A Promise resolving to the newly created `Message` object.
   * @throws None
   * @sideEffects
   * - Increments `messageCurrentId`.
   * - Mutates `messagesMap` by adding a new record.
   * @example
   * const newMsg = await storage.createMessage({
   *   senderId: 1,
   *   receiverId: 2,
   *   content: "Hello!"
   * });
   * console.log(newMsg.id);
   */
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const newMessage: Message = {
      ...message,
      id,
      sentAt: new Date(),
      status: "sent",
      readAt: null,
    };
    this.messagesMap.set(id, newMessage);
    return newMessage;
  }

  /**
   * Updates an existing message.
   *
   * @purpose Modify a message entry with partial updates.
   * @param id - Unique numeric ID of the message.
   * @param message - Partial `Message` object containing updated fields.
   * @returns A Promise resolving to the updated `Message` object, or `undefined` if not found.
   * @throws None
   * @sideEffects Mutates `messagesMap` by replacing the existing record.
   * @example
   * const updatedMsg = await storage.updateMessage(1, { status: "read", readAt: new Date() });
   * console.log(updatedMsg?.status);
   */
  async updateMessage(
    id: number,
    message: Partial<Message>,
  ): Promise<Message | undefined> {
    const existingMessage = this.messagesMap.get(id);
    if (!existingMessage) return undefined;

    const updatedMessage = { ...existingMessage, ...message };
    this.messagesMap.set(id, updatedMessage);
    return updatedMessage;
  }

  /**
   * Deletes a message.
   *
   * @purpose Remove a message entry from memory based on ID.
   * @param id - Unique numeric ID of the message.
   * @returns A Promise resolving to `true` if deletion succeeded, otherwise `false`.
   * @throws None
   * @sideEffects Mutates `messagesMap` by removing the specified record.
   * @example
   * const deleted = await storage.deleteMessage(1);
   * console.log(deleted); // true
   */
  async deleteMessage(id: number): Promise<boolean> {
    return this.messagesMap.delete(id);
  }

  /**
   * Retrieves a branch by its unique numeric ID.
   *
   * @purpose Fetch a specific branch from memory by ID.
   * @param id - Unique numeric identifier of the branch.
   * @returns A Promise resolving to the `Branch` object if found, otherwise `undefined`.
   * @throws None
   * @sideEffects None
   * @example
   * const branch = await storage.getBranch(1);
   * console.log(branch?.name);
   */
  async getBranch(id: number): Promise<Branch | undefined> {
    return this.branchesMap.get(id);
  }

  /**
   * Retrieves all branches.
   *
   * @purpose Fetch all branch entries from memory.
   * @returns A Promise resolving to an array of `Branch` objects.
   * @throws None
   * @sideEffects None
   * @example
   * const allBranches = await storage.getBranches();
   * console.log(allBranches.length);
   */
  async getBranches(): Promise<Branch[]> {
    return Array.from(this.branchesMap.values());
  }

  /**
   * Retrieves a branch by its name.
   *
   * @purpose Fetch a branch using its name.
   * @param name - The name of the branch.
   * @returns A Promise resolving to the `Branch` object if found, otherwise `undefined`.
   * @throws None
   * @sideEffects None
   * @example
   * const branch = await storage.getBranchByName("Downtown Studio");
   * console.log(branch?.manager);
   */
  async getBranchByName(name: string): Promise<Branch | undefined> {
    return Array.from(this.branchesMap.values()).find(
      (branch) => branch.name === name,
    );
  }

  /**
   * Creates a new branch.
   *
   * @purpose Add a new branch entry to the in-memory store.
   * @param branch - `InsertBranch` object containing branch details.
   * @returns A Promise resolving to the newly created `Branch` object.
   * @throws None
   * @sideEffects
   * - Increments `branchCurrentId`.
   * - Mutates `branchesMap` by adding a new record.
   * @example
   * const newBranch = await storage.createBranch({
   *   name: "Downtown Studio",
   *   manager: "Alice Johnson"
   * });
   * console.log(newBranch.id);
   */
  async createBranch(branch: InsertBranch): Promise<Branch> {
    const id = this.branchCurrentId++;
    const newBranch: Branch = {
      ...branch,
      id,
      createdAt: new Date(),
      manager: branch.manager || null,
      status: branch.status || "active",
    };
    this.branchesMap.set(id, newBranch);
    return newBranch;
  }

  /**
   * Updates an existing branch.
   *
   * @purpose Modify a branch entry with partial updates.
   * @param id - Unique numeric ID of the branch.
   * @param branch - Partial `Branch` object containing updated fields.
   * @returns A Promise resolving to the updated `Branch` object, or `undefined` if not found.
   * @throws None
   * @sideEffects Mutates `branchesMap` by replacing the existing record.
   * @example
   * const updatedBranch = await storage.updateBranch(1, { manager: "Bob Smith" });
   * console.log(updatedBranch?.manager);
   */
  async updateBranch(
    id: number,
    branch: Partial<Branch>,
  ): Promise<Branch | undefined> {
    const existingBranch = this.branchesMap.get(id);
    if (!existingBranch) return undefined;

    const updatedBranch = { ...existingBranch, ...branch };
    this.branchesMap.set(id, updatedBranch);
    return updatedBranch;
  }

  /**
   * Deletes a branch.
   *
   * @purpose Remove a branch entry from memory based on ID.
   * @param id - Unique numeric ID of the branch.
   * @returns A Promise resolving to `true` if deletion succeeded, otherwise `false`.
   * @throws None
   * @sideEffects Mutates `branchesMap` by removing the specified record.
   * @example
   * const deleted = await storage.deleteBranch(1);
   * console.log(deleted); // true
   */
  async deleteBranch(id: number): Promise<boolean> {
    return this.branchesMap.delete(id);
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
