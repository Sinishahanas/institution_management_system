import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import {
  parents,
  User,
  users,
  invoices,
  students,
  employees,
  roles,
  studentInventory,
  studentCourseFee,
  stockItem,
  studentEnrollmentFees,
  transportation as transportationTable,
  enrollments as enrollmentsTable,
} from "@shared/schema";
import { sendEmail } from "./email/emailNotification";
import { db } from "./db";
import { and, eq, gt, sql } from "drizzle-orm";
import crypto from "crypto";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { format } from "date-fns";

dotenv.config();

/**
 * Registers all routes and authentication middlewares.
 *
 * @purpose Sets up authentication and middleware for role-based access control
 *
 * @param app Express application instance
 * @returns Promise<Server> - the HTTP server
 * @throws Throws error if route registration fails
 * @sideEffects Sets up authentication and middleware for role-based access control
 *
 * @example
 * const server = await registerRoutes(app);
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  /**
   * Middleware to check if user is authenticated
   *
   * @purpose Ensure the user is logged in before accessing protected routes
   *
   * @param req Request object
   * @param res Response object
   * @param next Next function
   * @returns Calls next() if authenticated, otherwise responds with 401
   * @throws none
   * @sideEffects none
   *
   * @example
   * app.get('/protected', isAuthenticated, (req, res) => res.send('ok'));
   */
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  /**
   * Middleware to check if user is admin
   *
   * @purpose Allow only admin users to access the route
   *
   * @param req Request object
   * @param res Response object
   * @param next Next function
   * @returns Calls next() if admin, otherwise responds with 403
   * @throws none
   * @sideEffects none
   *
   * @example
   * app.post('/admin/create', isAdmin, (req, res) => { ... });
   */
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbiddennn" });
  };

  /**
   * Middleware to check if user is branch admin
   *
   * @purpose Allow only branch_admin users to access the route
   *
   * @param req Request object
   * @param res Response object
   * @param next Next function
   * @returns Calls next() if branch_admin, otherwise responds with 403
   * @throws none
   * @sideEffects none
   *
   * @example
   * app.post('/branch/data', isBranchAdmin, (req, res) => { ... });
   */
  const isBranchAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "branch_admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  /**
   * Middleware to check if user is admin or branch admin
   *
   * @purpose Allow only admin or branch_admin users to access the route
   *
   * @param req Request object
   * @param res Response object
   * @param next Next function
   * @returns Calls next() if authorized, otherwise responds with 403
   * @throws none
   * @sideEffects none
   *
   * @example
   * app.put('/update', isAdminOrBranchAdmin, (req, res) => { ... });
   */
  const isAdminOrBranchAdmin = (req: any, res: any, next: any) => {
    if (
      req.isAuthenticated() &&
      (req.user.role === "admin" || req.user.role === "branch_admin")
    ) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  /**
   * Middleware to check if user is teacher
   *
   * @purpose Allow only teacher users to access the route
   *
   * @param req Request object
   * @param res Response object
   * @param next Next function
   * @returns Calls next() if teacher, otherwise responds with 403
   * @throws none
   * @sideEffects none
   *
   * @example
   * app.get('/teacher/dashboard', isTeacher, (req, res) => { ... });
   */
  const isTeacher = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "teacher") {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  /**
   * Middleware to check if user is parent
   *
   * @purpose Allow only parent users to access the route
   *
   * @param req Request object
   * @param res Response object
   * @param next Next function
   * @returns Calls next() if parent, otherwise responds with 403
   * @throws none
   * @sideEffects none
   *
   * @example
   * app.get('/parent/dashboard', isParent, (req, res) => { ... });
   */
  const isParent = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "parent") {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  /**
   * Middleware to check if user is student
   *
   * @purpose Allow only student users to access the route
   *
   * @param req Request object
   * @param res Response object
   * @param next Next function
   * @returns Calls next() if student, otherwise responds with 403
   * @throws none
   * @sideEffects none
   *
   * @example
   * app.get('/student/dashboard', isStudent, (req, res) => { ... });
   */
  const isStudent = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "student") {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  /**
   * Middleware to check if a user has a specific permission for a module.
   *
   * @purpose Allow only users with the specified permission to access the route
   *
   * @param module - The module name to check permissions for (e.g., "students", "payments")
   * @param action - The action to check for (e.g., "view", "edit", "delete")
   * @returns Express middleware function
   * @throws none directly; responds with 401, 403, or 500 depending on checks
   * @sideEffects None outside of HTTP responses
   *
   * @example
   * app.post('/api/students/create', hasPermission('students', 'create'), (req, res) => { ... });
   */
  const hasPermission = (module: string, action: string) => {
    return async (req: any, res: any, next: any) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const userRoleName = req.user.role;
        const roleData = await db
          .select()
          .from(roles)
          .where(eq(roles.name, userRoleName))
          .limit(1);

        if (roleData.length === 0) {
          return res.status(403).json({ message: "Role definition not found" });
        }

        const permissionsData = roleData[0].permissions as Record<
          string,
          string[]
        >;

        if (
          permissionsData &&
          permissionsData[module] &&
          permissionsData[module].includes(action)
        ) {
          return next();
        }

        return res
          .status(403)
          .json({ message: "Forbidden: insufficient permissions" });
      } catch (error) {
        console.error("Permission middleware error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    };
  };

  /**
   * GET /api/dashboard/stats
   *
   * Returns summary statistics for the dashboard.
   *
   * @purpose Retrieve total revenue, pending payments, student counts, and active batch counts
   *
   * @param req - Express Request object (requires authenticated user)
   * @param res - Express Response object
   * @returns JSON object with totalRevenue, pendingPayments, totalStudents, activeStudents, activeBatches
   * @throws Responds with 500 if an internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/dashboard/stats').then(res => res.json()).then(data => console.log(data));
   */
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as { role: string; branch: string };
      const { role, branch } = user;

      // Use enriched student data with branch
      let students = await storage.getStudentsWithBranch();
      let payments = await storage.getInvoices();
      let batches = await storage.getBatches();

      // For branch_admin, filter only students from their branch
      if (role === "branch_admin") {
        students = students.filter((s) => s.branch_name === branch);

        const studentIds = students.map((s) => s.student_id);
        payments = payments.filter((p) => studentIds.includes(p.studentId));
        batches = batches.filter((b) => b.branch === branch);
      }

      const totalRevenue = payments
        .filter((p) => p.status === "paid" || p.status === "partially_paid")
        .reduce((acc, p) => acc + Number(p.totalAmount), 0);

      const pendingPayments = payments
        .filter((p) => p.status === "unpaid")
        .reduce((acc, p) => {
          const amount =
            p.status === "partially_paid"
              ? Number(p.totalAmount) - Number(p.amountPaid)
              : Number(p.totalAmount);
          return acc + amount;
        }, 0);

      const totalStudents = students.length;
      const activeStudents = students.filter(
        (s) => s.status === "active",
      ).length;
      const activeBatches = batches.filter((b) => b.status === "active").length;

      res.json({
        totalRevenue,
        pendingPayments,
        totalStudents,
        activeStudents,
        activeBatches,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/dashboard/revenue-data
   * Returns revenue data per month for the dashboard charts.
   *
   * @purpose Provide month-wise revenue statistics for visualization
   *
   * @param req - Express Request object (requires authenticated user)
   * @param res - Express Response object
   * @returns JSON array of objects with month and revenue fields
   * @throws Responds with 500 if an internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/dashboard/revenue-data').then(res => res.json()).then(data => console.log(data));
   */
  app.get("/api/dashboard/revenue-data", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      const revenueData = [
        { month: "Jul", revenue: 823450 },
        { month: "Aug", revenue: 756230 },
        { month: "Sep", revenue: 845120 },
        { month: "Oct", revenue: 901540 },
        { month: "Nov", revenue: 948920 },
        { month: "Dec", revenue: 875630 },
        { month: "Jan", revenue: 856740 },
        { month: "Feb", revenue: 923450 },
        { month: "Mar", revenue: 978650 },
        { month: "Apr", revenue: 1025480 },
        { month: "May", revenue: 987650 },
        { month: "Jun", revenue: 923450 },
      ];

      res.json(revenueData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/dashboard/student-distribution
   * Returns the number of students enrolled in each course category (music, dance, art) and the total.
   *
   * @purpose Provide student distribution stats for dashboard visualization
   *
   * @param req - Express Request object (requires authenticated user)
   * @param res - Express Response object
   * @returns JSON object with music, dance, art, and total student counts
   * @throws Responds with 500 if an internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/dashboard/student-distribution').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/dashboard/student-distribution",
    isAuthenticated,
    async (req, res) => {
      try {
        const courseCategories = ["music", "dance", "art"];
        const courses = await storage.getCourses();
        const enrollments = await storage.getEnrollments();

        const distribution = {
          music: 0,
          dance: 0,
          art: 0,
          total: 0,
        };

        // Get course IDs for each category
        const musicCourseIds = courses
          .filter((course) => course.category === "music")
          .map((course) => course.id);
        const danceCourseIds = courses
          .filter((course) => course.category === "dance")
          .map((course) => course.id);
        const artCourseIds = courses
          .filter((course) => course.category === "art")
          .map((course) => course.id);

        // Count students in each category
        for (const enrollment of enrollments) {
          const batch = await storage.getBatch(enrollment.batchId);
          if (batch) {
            if (musicCourseIds.includes(batch.courseId)) {
              distribution.music++;
            } else if (danceCourseIds.includes(batch.courseId)) {
              distribution.dance++;
            } else if (artCourseIds.includes(batch.courseId)) {
              distribution.art++;
            }
            distribution.total++;
          }
        }

        res.json(distribution);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/dashboard/recent-transactions
   * Returns the 5 most recent payment transactions with associated student and course info.
   *
   * @purpose Display recent payment transactions for dashboard overview
   *
   * @param req - Express Request object (requires authenticated user)
   * @param res - Express Response object
   * @returns JSON array of recent transactions with studentName, invoiceId, courseName, paymentDate, amount, status
   * @throws Responds with 500 if an internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/dashboard/recent-transactions').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/dashboard/recent-transactions",
    isAuthenticated,
    async (req, res) => {
      try {
        const payments = await storage.getPayments();
        const recentPayments = payments
          .sort((a, b) => {
            return (
              new Date(b.paymentDate).getTime() -
              new Date(a.paymentDate).getTime()
            );
          })
          .slice(0, 5);

        const transactions = [];
        for (const payment of recentPayments) {
          const student = await storage.getStudent(payment.studentId);
          if (student) {
            const enrollments = await storage.getEnrollmentsByStudent(
              student.id,
            );
            let courseName = "Unknown Course";

            if (enrollments.length > 0) {
              const batch = await storage.getBatch(enrollments[0].batchId);
              if (batch) {
                const course = await storage.getCourse(batch.courseId);
                if (course) {
                  courseName = course.name;
                }
              }
            }

            transactions.push({
              studentId: student.studentId,
              studentName: `${student.firstName} ${student.lastName}`,
              invoiceId: payment.invoiceId,
              courseName,
              paymentDate: payment.paymentDate,
              amount: payment.amount,
              status: payment.status,
            });
          }
        }

        res.json(transactions);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/dashboard/today-classes
   * Returns the list of active classes scheduled for today with teacher and student info.
   *
   * @purpose Show today's scheduled classes for the dashboard
   *
   * @param req - Express Request object (requires authenticated user)
   * @param res - Express Response object
   * @returns JSON array with batchName, courseCategory, startTime, endTime, day, location, teacherName, studentCount
   * @throws Responds with 500 if an internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/dashboard/today-classes').then(res => res.json()).then(data => console.log(data));
   */
  app.get("/api/dashboard/today-classes", isAuthenticated, async (req, res) => {
    try {
      const batches = await storage.getBatches(); // batches include schedules
      const today = new Date();
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const todayDay = dayNames[today.getDay()];

      const todayClasses = [];

      for (const batch of batches) {
        if (batch.status !== "active") continue;

        // Filter schedules for today
        const todaySchedules = batch.schedules.filter(
          (schedule) => schedule.day === todayDay,
        );

        for (const schedule of todaySchedules) {
          const course = await storage.getCourse(batch.courseId);
          const teacher = await storage.getEmployeeByEmployeeId(
            "EMP00" + batch.teacherId,
          );
          const enrollments = await storage.getEnrollmentsByBatch(batch.id);

          if (course && teacher) {
            const user = await storage.getUser(teacher.userId);
            todayClasses.push({
              batchName: batch.name,
              courseCategory: course.category,
              startTime: schedule.startTime,
              day: schedule.day,
              endTime: schedule.endTime,
              location: batch.roomNumber,
              teacherName: user ? user.fullName : "Unknown Teacher",
              studentCount: enrollments.length,
            });
          }
        }
      }

      res.json(todayClasses);
    } catch (error) {
      console.error("Error fetching today's classes:", error);
      res.status(500).json({ error: "Failed to fetch today's classes" });
    }
  });

  /**
   * GET /api/courses
   * Fetches all courses.
   *
   * @purpose Retrieve all courses from storage
   *
   * @param req - Express Request object (requires authenticated user with "view" permission for courses)
   * @param res - Express Response object
   * @returns JSON array of course objects
   * @throws Responds with 500 if an internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/courses').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/courses",
    hasPermission("courses", "view"),
    async (req, res) => {
      try {
        const courses = await storage.getCourses();
        res.json(courses);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/courses/:id
   * Fetch a single course by ID.
   *
   * @purpose Retrieve specific course by ID
   *
   * @param req - Express Request object (requires authenticated user with "view" permission for courses), req.params.id as course ID
   * @param res - Express Response object
   * @returns JSON object of the course
   * @throws Responds with 404 if course not found, 500 if internal error
   * @sideEffects None
   *
   * @example
   * fetch('/api/courses/1').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/courses/:id",
    hasPermission("courses", "view"),
    async (req, res) => {
      try {
        const course = await storage.getCourse(parseInt(req.params.id));
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
        res.json(course);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/courses
   * Create a new course.
   *
   * @purpose Add a new course to storage
   *
   * @param req - Express Request object (requires authenticated user with "create" permission for courses), req.body as course data
   * @param res - Express Response object
   * @returns JSON object of the created course
   * @throws Responds with 500 if internal error
   * @sideEffects Adds a new course record in storage
   *
   * @example
   * fetch('/api/courses', { method: 'POST', body: JSON.stringify(courseData), headers: { 'Content-Type': 'application/json' } });
   */
  app.post(
    "/api/courses",
    hasPermission("courses", "create"),
    async (req, res) => {
      try {
        const course = await storage.createCourse(req.body);
        res.status(201).json(course);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * PUT /api/courses/:id
   * Update an existing course by ID.
   *
   * @purpose Modify an existing course
   *
   * @param req - Express Request object (requires authenticated user with "edit" permission for courses), req.params.id as course ID, req.body as updated course data
   * @param res - Express Response object
   * @returns JSON object of the updated course
   * @throws Responds with 404 if course not found, 500 if internal error
   * @sideEffects Updates the course record in storage
   *
   * @example
   * fetch('/api/courses/1', { method: 'PUT', body: JSON.stringify(updatedData), headers: { 'Content-Type': 'application/json' } });
   */
  app.put(
    "/api/courses/:id",
    isAuthenticated,
    hasPermission("courses", "edit"),
    async (req, res) => {
      try {
        const updatedCourse = await storage.updateCourse(
          parseInt(req.params.id),
          req.body,
        );
        if (!updatedCourse) {
          return res.status(404).json({ message: "Course not found" });
        }
        res.json(updatedCourse);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/courses/:id
   * Delete a course by ID.
   *
   * @purpose Remove a course from storage
   *
   * @param req - Express Request object (requires authenticated user with "delete" permission for courses), req.params.id as course ID
   * @param res - Express Response object
   * @returns Status 204 on successful deletion
   * @throws Responds with 404 if course not found, 500 if internal error
   * @sideEffects Deletes the course record from storage
   *
   * @example
   * fetch('/api/courses/1', { method: 'DELETE' });
   */
  app.delete(
    "/api/courses/:id",
    hasPermission("courses", "delete"),
    async (req, res) => {
      try {
        const deleted = await storage.deleteCourse(parseInt(req.params.id));
        if (!deleted) {
          return res.status(404).json({ message: "Course not found" });
        }
        res.sendStatus(204);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/departments
   * Fetch all departments.
   *
   * @purpose Retrieve all departments from storage
   *
   * @param req - Express Request object (requires authenticated user with "view" permission for departments)
   * @param res - Express Response object
   * @returns JSON array of department objects
   * @throws Responds with 500 if internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/departments').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/departments",
    isAuthenticated,
    hasPermission("departments", "view"),
    async (req, res) => {
      try {
        const departments = await storage.getDepartments();
        res.json(departments);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/departments/:id
   * Fetch a single department by ID.
   *
   * @purpose Retrieve a specific department by ID
   *
   * @param req - Express Request object (requires authenticated user with "view" permission), req.params.id as department ID
   * @param res - Express Response object
   * @returns JSON object of the department
   * @throws Responds with 404 if department not found, 500 if internal error
   * @sideEffects None
   *
   * @example
   * fetch('/api/departments/1').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/departments/:id",
    isAuthenticated,
    hasPermission("departments", "view"),
    async (req, res) => {
      try {
        const department = await storage.getDepartment(parseInt(req.params.id));
        if (!department) {
          return res.status(404).json({ message: "Department not found" });
        }
        res.json(department);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/departments
   * Create a new department.
   *
   * @purpose Add a new department to storage
   *
   * @param req - Express Request object (requires admin or branch admin user with "create" permission), req.body as department data
   * @param res - Express Response object
   * @returns JSON object of the created department
   * @throws Responds with 500 if internal error occurs
   * @sideEffects Adds a new department record in storage
   *
   * @example
   * fetch('/api/departments', { method: 'POST', body: JSON.stringify(departmentData), headers: { 'Content-Type': 'application/json' } });
   */
  app.post(
    "/api/departments",
    isAdminOrBranchAdmin,
    hasPermission("departments", "create"),
    async (req, res) => {
      try {
        const department = await storage.createDepartment(req.body);
        res.json(department);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * PUT /api/departments/:id
   * Update an existing department by ID.
   *
   * @purpose Modify an existing department
   *
   * @param req - Express Request object (requires admin or branch admin user with "edit" permission), req.params.id as department ID, req.body as updated department data
   * @param res - Express Response object
   * @returns JSON object of the updated department
   * @throws Responds with 500 if internal error occurs
   * @sideEffects Updates the department record in storage
   *
   * @example
   * fetch('/api/departments/1', { method: 'PUT', body: JSON.stringify(updatedData), headers: { 'Content-Type': 'application/json' } });
   */
  app.put(
    "/api/departments/:id",
    isAdminOrBranchAdmin,
    hasPermission("departments", "edit"),
    async (req, res) => {
      try {
        const department = await storage.updateDepartment(
          parseInt(req.params.id),
          req.body,
        );
        res.json(department);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/departments/:id
   * Delete a department by ID.
   *
   * @purpose Remove a department from storage
   *
   * @param req - Express Request object (requires admin or branch admin user with "delete" permission), req.params.id as department ID
   * @param res - Express Response object
   * @returns Status 204 on successful deletion
   * @throws Responds with 404 if department not found, 500 if internal error
   * @sideEffects Deletes the department record from storage
   *
   * @example
   * fetch('/api/departments/1', { method: 'DELETE' });
   */
  app.delete(
    "/api/departments/:id",
    isAdminOrBranchAdmin,
    hasPermission("departments", "delete"),
    async (req, res) => {
      try {
        const deleted = await storage.deleteDepartment(parseInt(req.params.id));
        if (!deleted) {
          return res.status(404).json({ message: "Department not found" });
        }
        res.sendStatus(204);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/brands
   * Fetch all brands.
   *
   * @purpose Retrieve all brands from storage
   *
   * @param req - Express Request object (requires admin or branch admin with "view" permission)
   * @param res - Express Response object
   * @returns JSON array of brand objects
   * @throws Responds with 500 if internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/brands').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/brands",
    isAdminOrBranchAdmin,
    hasPermission("brands", "view"),
    async (req, res) => {
      try {
        const brands = await storage.getBrands();
        res.json(brands);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/brands/:id
   * Fetch a single brand by ID.
   *
   * @purpose Retrieve a specific brand by ID
   *
   * @param req - Express Request object (requires admin or branch admin with "view" permission), req.params.id as brand ID
   * @param res - Express Response object
   * @returns JSON object of the brand
   * @throws Responds with 404 if brand not found, 500 if internal error
   * @sideEffects None
   *
   * @example
   * fetch('/api/brands/1').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/brands/:id",
    isAdminOrBranchAdmin,
    hasPermission("brands", "view"),
    async (req, res) => {
      try {
        const brand = await storage.getBrand(parseInt(req.params.id));
        if (!brand) {
          return res.status(404).json({ message: "Brand not found" });
        }
        res.json(brand);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/brands
   * Create a new brand.
   *
   * @purpose Add a new brand to storage
   *
   * @param req - Express Request object (requires admin or branch admin with "create" permission), req.body as brand data
   * @param res - Express Response object
   * @returns JSON object of the created brand
   * @throws Responds with 500 if internal error occurs
   * @sideEffects Adds a new brand record in storage
   *
   * @example
   * fetch('/api/brands', { method: 'POST', body: JSON.stringify(brandData), headers: { 'Content-Type': 'application/json' } });
   */
  app.post(
    "/api/brands",
    isAdminOrBranchAdmin,
    hasPermission("brands", "create"),
    async (req, res) => {
      try {
        const brand = await storage.createBrand(req.body);
        res.json(brand);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * PUT /api/brands/:id
   * Update an existing brand by ID.
   *
   * @purpose Modify an existing brand
   *
   * @param req - Express Request object (requires admin or branch admin with "edit" permission), req.params.id as brand ID, req.body as updated brand data
   * @param res - Express Response object
   * @returns JSON object of the updated brand
   * @throws Responds with 500 if internal error occurs
   * @sideEffects Updates the brand record in storage
   *
   * @example
   * fetch('/api/brands/1', { method: 'PUT', body: JSON.stringify(updatedData), headers: { 'Content-Type': 'application/json' } });
   */
  app.put(
    "/api/brands/:id",
    isAdminOrBranchAdmin,
    hasPermission("brands", "edit"),
    async (req, res) => {
      try {
        const brand = await storage.updateBrand(
          parseInt(req.params.id),
          req.body,
        );
        res.json(brand);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/brands/:id
   * Delete a brand by ID.
   *
   * @purpose Remove a brand from storage
   *
   * @param req - Express Request object (requires admin or branch admin with "delete" permission), req.params.id as brand ID
   * @param res - Express Response object
   * @returns Status 204 on successful deletion
   * @throws Responds with 404 if brand not found, 500 if internal error
   * @sideEffects Deletes the brand record from storage
   *
   * @example
   * fetch('/api/brands/1', { method: 'DELETE' });
   */
  app.delete(
    "/api/brands/:id",
    isAdminOrBranchAdmin,
    hasPermission("brands", "delete"),
    async (req, res) => {
      try {
        const deleted = await storage.deleteBrand(parseInt(req.params.id));
        if (!deleted) {
          return res.status(404).json({ message: "Brand not found" });
        }
        res.sendStatus(204);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/schedules
   * Fetch all schedules.
   *
   * @purpose Retrieve all schedules from storage
   *
   * @param req - Express Request object (requires admin or branch admin)
   * @param res - Express Response object
   * @returns JSON array of schedule objects
   * @throws Responds with 500 if internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/schedules').then(res => res.json()).then(data => console.log(data));
   */
  app.get("/api/schedules", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/schedules/:id
   * Fetch a single schedule by ID.
   *
   * @purpose Retrieve a specific schedule by ID
   *
   * @param req - Express Request object (requires authentication), req.params.id as schedule ID
   * @param res - Express Response object
   * @returns JSON object of the schedule
   * @throws Responds with 500 if internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/schedules/1').then(res => res.json()).then(data => console.log(data));
   */
  app.get("/api/schedules/:id", isAuthenticated, async (req, res) => {
    try {
      const schedule = await storage.getSchedule(parseInt(req.params.id));
      res.json(schedule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/schedules
   * Create a new schedule.
   *
   * @purpose Add a new schedule to storage
   *
   * @param req - Express Request object (requires admin or branch admin), req.body as schedule data
   * @param res - Express Response object
   * @returns JSON object of the created schedule
   * @throws Responds with 500 if internal error occurs
   * @sideEffects Adds a new schedule record in storage
   *
   * @example
   * fetch('/api/schedules', { method: 'POST', body: JSON.stringify(scheduleData), headers: { 'Content-Type': 'application/json' } });
   */
  app.post("/api/schedules", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const schedule = await storage.createSchedule(req.body);
      res.json(schedule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/schedules/:id
   * Update an existing schedule by ID.
   *
   * @purpose Modify an existing schedule
   *
   * @param req - Express Request object (requires authentication), req.params.id as schedule ID, req.body as updated schedule data
   * @param res - Express Response object
   * @returns JSON object of the updated schedule
   * @throws Responds with 500 if internal error occurs
   * @sideEffects Updates the schedule record in storage
   *
   * @example
   * fetch('/api/schedules/1', { method: 'PUT', body: JSON.stringify(updatedData), headers: { 'Content-Type': 'application/json' } });
   */
  app.put("/api/schedules/:id", isAuthenticated, async (req, res) => {
    try {
      const schedule = await storage.updateSchedule(
        parseInt(req.params.id),
        req.body,
      );
      res.json(schedule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * DELETE /api/batch/schedules/:id
   * Delete a batch schedule by ID.
   *
   * @purpose Remove a batch schedule from storage
   *
   * @param req - Express Request object (requires admin or branch admin), req.params.id as batch schedule ID
   * @param res - Express Response object
   * @returns Status 204 on successful deletion
   * @throws Responds with 404 if schedule not found, 500 if internal error
   * @sideEffects Deletes the batch schedule record from storage
   *
   * @example
   * fetch('/api/batch/schedules/1', { method: 'DELETE' });
   */
  app.delete(
    "/api/batch/schedules/:id",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const deleted = await storage.deleteBatchSchedule(
          parseInt(req.params.id),
        );
        if (!deleted) {
          return res.status(404).json({ message: "Schedule not found" });
        }
        res.sendStatus(204);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/schedules/:id
   * Delete a schedule by ID.
   *
   * @purpose Remove a schedule from storage
   *
   * @param req - Express Request object (requires admin or branch admin), req.params.id as schedule ID
   * @param res - Express Response object
   * @returns Status 204 on successful deletion
   * @throws Responds with 404 if schedule not found, 500 if internal error
   * @sideEffects Deletes the schedule record from storage
   *
   * @example
   * fetch('/api/schedules/1', { method: 'DELETE' });
   */
  app.delete("/api/schedules/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSchedule(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/studio
   * Fetch all studios.
   * 
   * @purpose Retrieve all studios from storage
   * 
   * @param req - Express Request object (requires authentication and "studio" view permission)
   * @param res - Express Response object
   * @returns JSON array of studio objects
   * @throws Responds with 500 if internal error occurs
   * @sideEffects None

  * @example
   * fetch('/api/studio').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/studio",
    isAuthenticated,
    hasPermission("studio", "view"),
    async (req, res) => {
      try {
        const studios = await storage.getStudios();
        res.json(studios);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/studio/:id
   * Fetch a single studio by ID.
   *
   * @purpose Retrieve a specific studio by ID
   *
   * @param req - Express Request object (requires authentication and "studio" view permission), req.params.id as studio ID
   * @param res - Express Response object
   * @returns JSON object of the studio
   * @throws Responds with 500 if internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/studio/1').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/studio/:id",
    isAuthenticated,
    hasPermission("studio", "view"),
    async (req, res) => {
      try {
        const studio = await storage.getStudio(parseInt(req.params.id));
        res.json(studio);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/studio
   * Create a new studio.
   *
   * @purpose Add a new studio to storage
   *
   * @param req - Express Request object (requires authentication and "studio" create permission), req.body as studio data
   * @param res - Express Response object
   * @returns JSON object of the created studio
   * @throws Responds with 500 if internal error occurs
   * @sideEffects Adds a new studio record in storage
   *
   * @example
   * fetch('/api/studio', { method: 'POST', body: JSON.stringify(studioData), headers: { 'Content-Type': 'application/json' } });
   */
  app.post(
    "/api/studio",
    isAuthenticated,
    hasPermission("studio", "create"),
    async (req, res) => {
      try {
        const studio = await storage.createStudio(req.body);
        res.status(201).json(studio);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * PUT /api/studio/:id
   * Update an existing studio by ID.
   *
   * @purpose Modify an existing studio
   *
   * @param req - Express Request object (requires authentication and "studio" edit permission), req.params.id as studio ID, req.body as updated studio data
   * @param res - Express Response object
   * @returns JSON object of the updated studio
   * @throws Responds with 500 if internal error occurs
   * @sideEffects Updates the studio record in storage
   *
   * @example
   * fetch('/api/studio/1', { method: 'PUT', body: JSON.stringify(updatedData), headers: { 'Content-Type': 'application/json' } });
   */
  app.put(
    "/api/studio/:id",
    isAuthenticated,
    hasPermission("studio", "edit"),
    async (req, res) => {
      try {
        const result = await storage.updateStudio(
          parseInt(req.params.id),
          req.body,
        );
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/studio/:id
   * Delete a studio by ID.
   *
   * @purpose Remove a studio from storage
   *
   * @param req - Express Request object (requires authentication and "studio" delete permission), req.params.id as studio ID
   * @param res - Express Response object
   * @returns Status 204 on successful deletion
   * @throws Responds with 404 if studio not found, 500 if internal error
   * @sideEffects Deletes the studio record from storage
   *
   * @example
   * fetch('/api/studio/1', { method: 'DELETE' });
   */
  app.delete(
    "/api/studio/:id",
    isAuthenticated,
    hasPermission("studio", "delete"),
    async (req, res) => {
      try {
        const deleted = await storage.deleteStudio(parseInt(req.params.id));
        if (!deleted) {
          return res.status(404).json({ message: "studio not found" });
        }
        res.sendStatus(204);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  // Batches routes
  // app.get("/api/batches", isAuthenticated, async (req, res) => {
  //   try {
  //     const batches = await storage.getBatches();
  //     res.json(batches);
  //   } catch (error: any) {
  //     res.status(500).json({ message: error.message });
  //   }
  // });

  /**
   * GET /api/batches
   * Fetch all batches
   *
   * @purpose Retrieve all batches
   *
   * @param req - Express Request object (requires authentication and "batches" view permission)
   * @param res - Express Response object
   * @returns JSON array of batch objects
   * @throws Responds with 500 if internal error occurs
   * @sideEffects None
   *
   * @example
   * fetch('/api/batches').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/batches",
    isAuthenticated,
    hasPermission("batches", "view"),
    async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const { role, branch } = req.user;

        let batches;

        if (role === "branch_admin") {
          batches = await storage.getBatchesByBranch(branch!);
        } else {
          batches = await storage.getBatches();
        }

        res.json(batches);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/batches/teacher
   * Fetch batches assigned to the authenticated teacher.
   * @purpose Retrieve batches assigned to the current teacher
   *
   * @param req - Express Request object (requires authentication, user role must be "teacher")
   * @param res - Express Response object
   * @returns JSON array of batch objects
   * @throws 403 if user is not a teacher, 404 if teacher not found, 500 if internal error
   * @sideEffects None
   *
   * @example
   * fetch('/api/batches/teacher').then(res => res.json()).then(data => console.log(data));
   */
  app.get("/api/batches/teacher", isAuthenticated, async (req, res) => {
    try {
      if (req.user && req.user.role === "teacher") {
        // Find the employee record for this teacher
        const employees = await storage.getEmployees();
        const employee = employees.find((emp) => emp.userId === req.user?.id);

        if (employee) {
          // Get batches where this teacher is assigned
          const allBatches = await storage.getBatches();
          const teacherBatches = allBatches.filter(
            (batch) => batch.teacherId === employee.id,
          );
          res.json(teacherBatches);
        } else {
          res.status(404).json({ message: "Teacher not found" });
        }
      } else {
        res.status(403).json({ message: "Not authorized" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/batches/:id
   * Fetch a specific batch by ID.
   *
   * @purpose Retrieve a specific batch by ID
   *
   * @param req - Express Request object (requires authentication and "batches" view permission), req.params.id as batch ID
   * @param res - Express Response object
   * @returns JSON object of the batch
   * @throws 404 if batch not found, 500 if internal error
   * @sideEffects None
   *
   * @example
   * fetch('/api/batches/123').then(res => res.json()).then(data => console.log(data));
   */
  app.get(
    "/api/batches/:id",
    isAuthenticated,
    hasPermission("batches", "view"),
    async (req, res) => {
      try {
        const batch = await storage.getBatch(parseInt(req.params.id));
        if (!batch) {
          return res.status(404).json({ message: "Batch not found" });
        }
        res.json(batch);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/batches/filter
   * Fetch batches filtered by course ID and branch.
   *
   * @purpose Retrieve batches filtered by course ID and branch
   *
   * @param req - Express Request object, expects query parameters courseId and branch
   * @param res - Express Response object
   * @returns JSON array of filtered batch objects
   * @throws 400 if required query parameters missing, 500 if internal error
   * @sideEffects None
   *
   * @example
   * fetch('/api/batches/filter?courseId=1&branch=Main').then(res => res.json()).then(data => console.log(data));
   */
  app.get("/api/batches/filter", async (req, res) => {
    try {
      const courseId = Number(req.query.courseId);
      const branch = req.query.branch as string;

      if (!courseId || !branch) {
        return res
          .status(400)
          .json({ error: "courseId and branch are required query parameters" });
      }

      const filteredBatches = await storage.getBatchesByCourse(courseId);
      res.json(filteredBatches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/batches/course
   * Fetch batches filtered by course ID.
   *
   * @purpose Retrieve batches filtered by course ID
   *
   * @param req - Express Request object, expects query parameter courseId
   * @param res - Express Response object
   * @returns JSON array of filtered batch objects
   * @throws 400 if courseId missing, 500 if internal error
   * @sideEffects None
   *
   * @example
   * fetch('/api/batches/course?courseId=1').then(res => res.json()).then(data => console.log(data));
   */
  app.get("/api/batches/course", async (req, res) => {
    try {
      const courseId = Number(req.query.courseId);

      if (!courseId) {
        return res.status(400).json({ error: "courseId is required" });
      }

      const filteredBatches = await storage.getBatchesByCourse(courseId);
      res.json(filteredBatches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/batches
   * Create a new batch.
   *
   * @purpose Add a new batch with auto-generated name
   *
   * @param req - Express Request object (requires authentication, admin/branch_admin, "batches" create permission), req.body as batch data
   * @param res - Express Response object
   * @returns JSON object of created batch
   * @throws 404 if course or branch not found, 500 if internal error
   * @sideEffects Adds a new batch record in storage
   *
   * @example
   * fetch('/api/batches', { method: 'POST', body: JSON.stringify(batchData), headers: { 'Content-Type': 'application/json' } });
   */
  app.post(
    "/api/batches",
    isAdminOrBranchAdmin,
    hasPermission("batches", "create"),
    async (req, res) => {
      try {
        const course = await storage.getCourse(req.body.courseId);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }

        const branches = await storage.getBranches();
        const branch = branches.find((b) => b.name === req.body.branch);
        if (!branch) {
          return res.status(404).json({ message: "Branch not found" });
        }

        const existingBatches = await storage.getBatches();
        const branchBatches = existingBatches.filter(
          (b) => b.branch === branch.name,
        );

        const courseCode = course.code.toUpperCase();
        const branchCode = branch.code.toUpperCase();

        const prefix = `${branchCode}${courseCode}`;
        console.log("Batch creation debug:", {
          requestBody: req.body,
          course,
          branch,
          existingBatches: branchBatches.map((b) => ({
            name: b.name,
            branch: b.branch,
            startsWithPrefix: b.name.toUpperCase().startsWith(prefix),
          })),
          prefix,
        });

        const matchingBatches = branchBatches
          .filter((b) => b.name.toUpperCase().startsWith(prefix))
          .map((b) => parseInt(b.name.slice(prefix.length)))
          .filter((n) => !isNaN(n));

        const serialNum = (
          matchingBatches.length > 0 ? Math.max(...matchingBatches) + 1 : 1001
        ).toString();

        const batchName = `${branchCode}${courseCode}${serialNum}`;

        const batchData = {
          ...req.body,
          name: batchName,
          branch: branch.name,
        };

        const batch = await storage.createBatch(batchData);
        res.status(201).json(batch);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * PUT /api/batches/:id
   * Update an existing batch by ID.
   *
   * @purpose Update a batch's details
   *
   * @param req - Express Request object (requires authentication and "batches" edit permission), req.params.id as batch ID, req.body as update data
   * @param res - Express Response object
   * @returns JSON object of the updated batch
   * @throws 400 if batch ID is invalid, 404 if batch not found, 500 if update fails or internal error
   * @sideEffects Updates a batch record in storage
   *
   * @example
   * fetch('/api/batches/123', { method: 'PUT', body: JSON.stringify(updateData), headers: { 'Content-Type': 'application/json' } });
   */
  app.put(
    "/api/batches/:id",
    isAuthenticated,
    hasPermission("batches", "edit"),
    async (req, res) => {
      try {
        console.log("User:", req.user?.role);
        console.log("Batch update body:", req.body);

        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid batch ID" });
        }

        const batch = await storage.getBatch(id);
        if (!batch) {
          return res.status(404).json({ message: "Batch not found" });
        }

        const updatedBatch = await storage.updateBatch(id, req.body);
        if (!updatedBatch) {
          return res.status(500).json({ message: "Failed to update batch" });
        }

        res.json(updatedBatch);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/batches/:id
   * Delete a batch by ID.
   *
   * @purpose Remove a batch from storage
   *
   * @param req - Express Request object (requires admin/branch_admin and "batches" delete permission), req.params.id as batch ID
   * @param res - Express Response object
   * @returns 204 No Content on successful deletion
   * @throws 400 if batch ID is invalid, 404 if batch not found, 500 if deletion fails or internal error
   * @sideEffects Deletes a batch record in storage
   *
   * @example
   * fetch('/api/batches/123', { method: 'DELETE' });
   */
  app.delete(
    "/api/batches/:id",
    isAdminOrBranchAdmin,
    hasPermission("batches", "delete"),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid batch ID" });
        }

        const batch = await storage.getBatch(id);
        if (!batch) {
          return res.status(404).json({ message: "Batch not found" });
        }

        const deleted = await storage.deleteBatch(id);
        if (!deleted) {
          return res.status(500).json({ message: "Failed to delete batch" });
        }

        res.sendStatus(204);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/students
   * Retrieve a list of students.
   *
   * @purpose Fetch all students or filtered by batch, parent, or branch
   *
   * @param req - Express Request object (requires authentication and "students" view permission)
   *                  Optional query: batchId
   * @param res - Express Response object
   * @returns JSON array of student objects
   * @throws 500 if internal server error
   * @sideEffects None
   *
   * @example fetch('/api/students'); fetch('/api/students?batchId=1');
   */
  app.get(
    "/api/students",
    isAuthenticated,
    hasPermission("students", "view"),
    async (req, res) => {
      try {
        const { batchId } = req.query;

        // If batchId is provided, return students for that batch
        if (batchId) {
          const students = await storage.getStudentsByBatch(batchId as string);
          return res.json(students);
        }

        // If user is parent, return only their students
        if (req.user && req.user.role === "parent") {
          const students = await storage.getStudentsByParent(req.user.id);
          return res.json(students);
        }

        if (req.user && req.user.role === "branch_admin") {
          const students = await storage.getStudentsByBranch(
            req.user.branch as string,
          );
          return res.json(students);
        }

        const students = await storage.getStudents();
        res.json(students);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/students/not-joined
   * Retrieve students who have not joined any batches.
   *
   * @purpose Fetch students without any batch enrollments
   *
   * @param req - Express Request object (requires authentication and "students" view permission)
   * @param res - Express Response object
   * @returns JSON array of student objects
   * @throws 500 if internal server error
   * @sideEffects None
   *
   * @example fetch('/api/students/not-joined');
   */
  app.get(
    "/api/students/not-joined",
    isAuthenticated,
    hasPermission("students", "view"),
    async (req, res) => {
      try {
        const students = await storage.getNotJoinedStudents();
        res.json(students);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/students-with-parents
   * Retrieve students along with their parent information.
   *
   * @purpose Fetch students with associated parent data
   *
   * @param req - Express Request object (requires authentication)
   * @param res - Express Response object
   * @returns JSON array of student-parent objects
   * @throws 401 if user not authenticated, 500 if internal server error
   * @sideEffects None
   *
   * @example fetch('/api/students-with-parents');
   */
  app.get("/api/students-with-parents", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const students = await storage.getStudentsWithParents(req.user.id);
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/students/course-count
   * Retrieve the number of courses each student is enrolled in.
   *
   * @purpose Get course counts per student
   *
   * @param req - Express Request object (requires authentication)
   * @param res - Express Response object
   * @returns JSON array with course count info
   * @throws 401 if user not authenticated, 500 if internal server error
   * @sideEffects None
   *
   * @example fetch('/api/students/course-count');
   */
  app.get("/api/students/course-count", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const students = await storage.getStudentCourseCount(req.user.id);
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/students/course
   * Retrieve detailed course information for students.
   *
   * @purpose Get course details for students
   *
   * @param req - Express Request object (requires authentication)
   * @param res - Express Response object
   * @returns JSON array with course details
   * @throws 401 if user not authenticated, 500 if internal server error
   * @sideEffects None
   *
   * @example fetch('/api/students/course');
   */
  app.get("/api/students/course", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const students = await storage.getStudentCourseDetails(req.user.id);
      console.log(students, ".................");

      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/students/:id
   * Retrieve a single student by ID.
   *
   * @purpose Fetch a specific student's information
   *
   * @param req - Express Request object (requires authentication and "students" view permission), req.params.id as student ID
   * @param res - Express Response object
   * @returns JSON object of the student
   * @throws 403 if parent tries to access other students, 404 if student not found, 500 if internal server error
   * @sideEffects None
   *
   * @example fetch('/api/students/123');
   */
  app.get(
    "/api/students/:id",
    isAuthenticated,
    hasPermission("students", "view"),
    async (req, res) => {
      try {
        const student = await storage.getStudent(parseInt(req.params.id));
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        // Check if parent is requesting their own student
        if (
          req.user &&
          req.user.role === "parent" &&
          student.parentId !== req.user.id
        ) {
          return res.status(403).json({ message: "Forbidden" });
        }

        res.json(student);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/student-count
   * Retrieve the number of students in a specific batch.
   *
   * @purpose Count students in a batch
   *
   * @param req - Express Request object (requires authentication), req.query.batchId as batch ID
   * @param res - Express Response object
   * @returns JSON object { studentCount: number }
   * @throws 400 if batchId is invalid, 500 if internal server error
   * @sideEffects None
   *
   * @example fetch('/api/student-count?batchId=1');
   */
  app.get("/api/student-count", isAuthenticated, async (req, res) => {
    const batchId = parseInt(req.query.batchId as string);

    if (isNaN(batchId)) {
      return res.status(400).json({ error: "Invalid batchId" });
    }

    try {
      const count = await storage.getStudentCountByBatch(batchId);
      res.json({ studentCount: count });
    } catch (error) {
      console.error("Error fetching student count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * POST /api/students
   * Create a new student.
   *
   * @purpose Add a new student to the system
   *
   * @param req - Express Request object (requires admin/branch_admin and "students" create permission), req.body contains student data
   * @param res - Express Response object
   * @returns JSON object of the created student
   * @throws 500 if internal server error
   * @sideEffects Inserts a student record into storage
   *
   * @example fetch('/api/students', { method: 'POST', body: JSON.stringify(studentData), headers: { 'Content-Type': 'application/json' } });
   */
  app.post(
    "/api/students",
    isAdminOrBranchAdmin,
    hasPermission("students", "create"),
    async (req, res) => {
      try {
        // console.log("Sending to /api/students:", req.body);
        const student = await storage.createStudent(req.body);
        res.status(201).json(student);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * PUT /api/students/:id
   * Update an existing student by ID.
   *
   * @purpose Update a student's details
   *
   * @param req - Express Request object (requires admin/branch_admin and "students" edit permission), req.params.id as student ID, req.body as update data
   * @param res - Express Response object
   * @returns JSON object of the updated student
   * @throws 404 if student not found, 500 if internal error
   * @sideEffects Updates a student record in storage
   *
   * @example fetch('/api/students/123', { method: 'PUT', body: JSON.stringify(updateData), headers: { 'Content-Type': 'application/json' } });
   */
  app.put(
    "/api/students/:id",
    isAdminOrBranchAdmin,
    hasPermission("students", "edit"),
    async (req, res) => {
      try {
        const updatedStudent = await storage.updateStudent(
          parseInt(req.params.id),
          req.body,
        );
        if (!updatedStudent) {
          return res.status(404).json({ message: "Student not found" });
        }
        res.json(updatedStudent);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * PATCH /api/students/:studentId
   * Partial update of a student's ID.
   *
   * @purpose Update only the student ID field
   *
   * @param req - Express Request object (requires authentication and admin/branch_admin), req.params.studentId as student ID
   * @param res - Express Response object
   * @returns JSON object of the updated student
   * @throws 400 if studentId missing, 404 if student not found, 500 if internal error
   * @sideEffects Updates a student's ID in storage
   *
   * @example fetch('/api/students/123', { method: 'PATCH', body: JSON.stringify({ studentId: 'S001' }), headers: { 'Content-Type': 'application/json' } });
   */
  app.patch(
    "/api/students/:studentId",
    isAuthenticated,
    isAdminOrBranchAdmin,
    async (req, res) => {
      const { studentId } = req.params;

      try {
        // Validate inputs
        if (!studentId) {
          return res.status(400).json({ error: "Missing studentId" });
        }

        // Run your DB update logic (adjust table/column names as needed)
        const updatedStudent = await db
          .update(students)
          .set({ studentId })
          .where(eq(students.studentId, studentId))
          .returning();

        if (!updatedStudent.length) {
          return res.status(404).json({ error: "Student not found" });
        }

        res.json(updatedStudent[0]);
      } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ error: "Failed to update student" });
      }
    },
  );

  /**
   * DELETE /api/students/:id
   * Delete a student by ID.
   *
   * @purpose Remove a student from storage
   *
   * @param req - Express Request object (requires admin/branch_admin and "students" delete permission), req.params.id as student ID
   * @param res - Express Response object
   * @returns 204 No Content on success
   * @throws 404 if student not found, 500 if deletion fails
   * @sideEffects Deletes a student record
   *
   * @example fetch('/api/students/123', { method: 'DELETE' });
   */
  app.delete(
    "/api/students/:id",
    isAdminOrBranchAdmin,
    hasPermission("students", "delete"),
    async (req, res) => {
      try {
        const deleted = await storage.deleteStudent(parseInt(req.params.id));
        if (!deleted) {
          return res.status(404).json({ message: "Student not found" });
        }
        res.sendStatus(204);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/students/enroll-transactional
   * Transactional route for student enrollment, including student creation/update, enrollments, inventory, transportation, and fee summary.
   *
   * @purpose Perform multiple enrollment-related operations atomically
   *
   * @param req - Express Request object (requires admin/branch_admin), req.body contains studentData, enrollments, inventoryItems, transportation, feeSummary
   * @param res - Express Response object
   * @returns JSON object of the enrolled student
   * @throws 500 if transaction fails, rolls back all operations
   * @sideEffects Inserts/updates multiple tables in a transaction
   *
   * @example fetch('/api/students/enroll-transactional', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
   */
  app.post(
    "/api/students/enroll-transactional",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const {
          studentIdToUpdate,
          studentData,
          enrollments,
          inventoryItems,
          transportation,
          feeSummary,
        } = req.body;

        const enrolledStudent = await db.transaction(async (tx) => {
          const updatedStudent = studentIdToUpdate
            ? await tx
                .update(students)
                .set({ ...studentData, updatedAt: new Date() })
                .where(eq(students.id, studentIdToUpdate))
                .returning()
                .then((res) => res[0])
            : await tx
                .insert(students)
                .values({ ...studentData, createdAt: new Date() })
                .returning()
                .then((res) => res[0]);

          // console.log("updatedStudent", updatedStudent);

          if (!updatedStudent || !updatedStudent.id) {
            throw new Error("Failed to insert or update student");
          }

          // console.log("enrollments", enrollments);

          for (const item of enrollments) {
            const inserted = (await tx
              .insert(enrollmentsTable)
              .values({
                studentId: updatedStudent.id,
                ...item.enrollment,
              })
              .returning()) as { id: number }[];

            const [newEnrollment] = inserted;

            if (!newEnrollment) {
              throw new Error("Failed to create enrollment record");
            }

            if (item.fee) {
              await tx.insert(studentCourseFee).values({
                enrollmentId: newEnrollment.id,
                ...item.fee,
              });
            }
          }

          // console.log("inventoryItems", inventoryItems);

          for (const item of inventoryItems) {
            console.log(
              "Updating stockItem:",
              item.inventoryId,
              "Quantity to subtract:",
              item.quantity,
            );
            await tx.insert(studentInventory).values({
              studentId: updatedStudent.id,
              inventoryId: item.inventoryId,
              quantity: item.quantity,
              discountType: item.discountType,
              discountValue: item.discountValue,
              totalAmount: item.totalAmount,
            });

            console.log(
              "Updating stockItem:",
              item.inventoryId,
              "Quantity to subtract:",
              item.quantity,
            );
            const updatedStockItem = await tx
              .update(stockItem)
              .set({
                stockQuantity: sql`${stockItem.stockQuantity} - ${item.quantity}`,
              })
              .where(eq(stockItem.stockItemId, item.inventoryId));

            console.log("Updated stockItem:", updatedStockItem);
          }

          // console.log("transportation", transportation);
          if (transportation) {
            await tx
              .insert(transportationTable)
              .values({ studentId: updatedStudent.id, ...transportation });
          }

          if (feeSummary) {
            await tx.insert(studentEnrollmentFees).values({
              studentId: updatedStudent.id,
              ...feeSummary,
            });
          }

          return updatedStudent;
        });

        res.status(201).json(enrolledStudent);
      } catch (error: any) {
        console.error(
          "Enrollment transaction failed and was rolled back:",
          error,
        );
        res.status(500).json({
          message:
            error.message ||
            "An error occurred during enrollment. No data was saved.",
        });
      }
    },
  );

  /**
   * GET /api/parents
   * Fetch all parents.
   *
   * @purpose Retrieve all parent records
   *
   * @param req - Express Request (requires authentication and "parents" view permission)
   * @param res - Express Response
   * @returns JSON array of parent objects
   * @throws 500 if database retrieval fails
   * @sideEffects None
   *
   * @example fetch('/api/parents').then(res => res.json());
   */
  app.get(
    "/api/parents",
    isAuthenticated,
    hasPermission("parents", "view"),
    async (req, res) => {
      try {
        const parents = await storage.getParents();
        res.json(parents);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/parents/:id
   * Fetch a parent by ID.
   *
   * @purpose Retrieve details of a specific parent
   *
   * @param req - Express Request with param :id (parent ID)
   * @param res - Express Response
   * @returns JSON object of parent
   * @throws 404 if not found, 500 on database error
   * @sideEffects None
   *
   * @example fetch('/api/parents/10').then(res => res.json());
   */

  app.get("/api/parents/:id", isAuthenticated, async (req, res) => {
    try {
      const parent = await storage.getParent(parseInt(req.params.id));
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      res.json(parent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/parents/user/:id
   * Fetch a parent by associated user ID.
   *
   * @purpose Retrieve parent linked to a given user account
   *
   * @param req - Express Request with param :id (user ID)
   * @param res - Express Response
   * @returns JSON object of parent
   * @throws 404 if not found, 500 on database error
   * @sideEffects None
   *
   * @example fetch('/api/parents/user/5').then(res => res.json());
   */
  app.get("/api/parents/user/:id", isAuthenticated, async (req, res) => {
    try {
      const parent = await storage.getParentByUserId(parseInt(req.params.id));
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      res.json(parent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/parents/dashboard
   * Parent dashboard summary (children count).
   *
   * @purpose Provide dashboard data for parent user (e.g., children count)
   *
   * @param req - Express Request (requires authentication and "parents" view permission)
   * @param res - Express Response
   * @returns JSON object { count: number }
   * @throws 400 if userId missing, 404 if parent record not found, 500 on error
   * @sideEffects None
   *
   * @example fetch('/api/parents/dashboard').then(res => res.json());
   */
  app.get(
    "/api/parents/dashboard",
    isAuthenticated,
    hasPermission("parents", "view"),
    async (req, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
        }

        // Get the parent record for this user
        const [parent] = await db
          .select()
          .from(parents)
          .where(eq(parents.userId, userId));

        if (!parent) {
          return res.status(404).json({ message: "Parent record not found" });
        }

        const childrenCount = await storage.getStudentCountByParentId(
          parent.id,
        );
        return res.json({ count: childrenCount });
      } catch (error) {
        console.error("Error fetching parent dashboard:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  /**
   * GET /api/student-parents
   * Fetch students linked to the authenticated parent.
   *
   * @purpose Retrieve students belonging to a logged-in parent
   *
   * @param req - Express Request (requires authentication)
   * @param res - Express Response
   * @returns JSON array of students
   * @throws 401 if unauthorized, 500 on database error
   * @sideEffects None
   *
   * @example fetch('/api/student-parents').then(res => res.json());
   */
  app.get("/api/student-parents", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const students = await storage.getStudentCountByParentId(req.user.id);
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/attendance/parent
   * Fetch attendance records for a parent's children.
   *
   * @purpose Get attendance details filtered by parent user ID and optional student ID
   *
   * @param req - Express Request (requires authentication), query params: userId (number), studentId (optional string)
   * @param res - Express Response
   * @returns JSON array of attendance records
   * @throws 400 if invalid userId, 500 on database error
   * @sideEffects None
   *
   * @example fetch('/api/attendance/parent?userId=3&studentId=12').then(res => res.json());
   */
  app.get("/api/attendance/parent", isAuthenticated, async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    const studentId = req.query.studentId as string | undefined;

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid parent user ID" });
    }

    try {
      // console.log('Fetching attendance for:', { userId, studentId });
      const result = await storage.getAttendanceByParentUserId(
        userId,
        studentId,
      );
      res.json(result);
    } catch (error) {
      console.error("Error fetching parent attendance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * GET /api/attendance
   * Fetch attendance records by batch and date.
   *
   * @purpose Retrieve attendance for a specific batch and date
   *
   * @param req - Express Request (requires authentication and "attendance" view permission), query params: batchId (number), date (string)
   * @param res - Express Response
   * @returns JSON array of attendance records
   * @throws 400 if invalid params, 500 on database error
   * @sideEffects None
   *
   * @example fetch('/api/attendance?batchId=2&date=2024-05-10').then(res => res.json());
   */
  app.get(
    "/api/attendance",
    isAuthenticated,
    hasPermission("attendance", "view"),
    async (req, res) => {
      const batchId = parseInt(req.query.batchId as string);
      const dateString = req.query.date as string;

      if (isNaN(batchId) || !dateString) {
        return res.status(400).json({ error: "Invalid batchId or date" });
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      try {
        const records = await storage.getAttendanceByBatchAndDate(
          batchId,
          date,
        );
        res.json(records);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  /**
   * GET /api/attendance/:studentId
   * Fetch attendance records for a specific student.
   *
   * @purpose Retrieve attendance records for a given student
   *
   * @param req - Express Request (requires authentication), param: studentId (number)
   * @param res - Express Response
   * @returns JSON array of attendance data
   * @throws 400 if invalid studentId, 500 on database error
   * @sideEffects None
   *
   * @example fetch('/api/attendance/5').then(res => res.json());
   */
  app.get("/api/attendance/:studentId", isAuthenticated, async (req, res) => {
    const studentId = parseInt(req.params.studentId);

    if (isNaN(studentId)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    try {
      const result = await storage.getAttendanceByBatch(studentId);
      res.json(result);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * POST /api/parents
   * Create a new parent and send reset password email.
   *
   * @purpose Add a new parent record and send password reset email
   *
   * @param req - Express Request (requires admin/branch_admin and "parents" create permission), req.body contains parent data
   * @param res - Express Response
   * @returns JSON object of created parent
   * @throws 500 on creation or email error
   * @sideEffects Inserts parent, updates user table, sends email with reset token
   *
   * @example fetch('/api/parents', { method: 'POST', body: JSON.stringify(parentData), headers: { 'Content-Type': 'application/json' } });
   */
  app.post(
    "/api/parents",
    isAdminOrBranchAdmin,
    hasPermission("parents", "create"),
    async (req, res) => {
      try {
        const parent = await storage.createParent(req.body);
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        await db
          .update(users)
          .set({ resetToken, resetTokenExpires })
          .where(eq(users.email, parent.email!));
        const resetLink = `${process.env.VITE_API_BASE_URL}/reset/${resetToken}`;
        sendEmail(
          "resetParentPassword",
          parent?.email!,
          "Reset Parent Account Password",
          {
            name: parent.firstName,
            userName: parent.username,
            password: parent.password,
            resetLink,
          },
        );
        res.status(201).json(parent);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/parent/reset-password
   * Reset parent account password using a valid reset token.
   *
   * @purpose Allow parent to securely reset password via emailed token
   *
   * @param req - Express Request containing body with `token` (string) and `password` (string)
   * @param res - Express Response
   * @returns JSON message confirming password reset
   * @throws 400 if token or password missing or token expired, 500 on DB or hashing errors
   * @sideEffects Updates user password hash, clears reset token fields, updates parent record password (plain)
   *
   * @example
   * fetch('/api/parent/reset-password', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ token: 'abcd1234', password: 'NewPass123' })
   * });
   */
  app.post("/api/parent/reset-password", async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.resetToken, token),
            gt(users.resetTokenExpires, new Date()),
          ),
        );

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await hashPassword(password);
      await db
        .update(users)
        .set({
          password: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
        })
        .where(eq(users.id, user.id));
      await db
        .update(parents)
        .set({ password })
        .where(eq(parents.userId, user.id));

      res.status(200).json({ message: "Password reset successful" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  /**
   * PUT /api/parents/:id
   * Update a parent record by ID.
   *
   * @purpose Modify existing parent details
   *
   * @param req - Express Request (requires admin or branch admin permissions)
   * @param res - Express Response
   * @returns JSON object of updated parent
   * @throws 404 if not found, 500 on database error
   * @sideEffects Updates parent data in the database
   *
   * @example
   * fetch('/api/parents/12', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ firstName: 'Updated', phone: '9876543210' })
   * });
   */
  app.put(
    "/api/parents/:id",
    isAdminOrBranchAdmin,
    hasPermission("parents", "edit"),
    async (req, res) => {
      try {
        const updatedParent = await storage.updateParent(
          parseInt(req.params.id),
          req.body,
        );
        if (!updatedParent) {
          return res.status(404).json({ message: "Parent not found" });
        }
        res.json(updatedParent);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/parents/:id
   * Delete a parent record by ID.
   *
   * @purpose Remove a parent record from the system
   *
   * @param req - Express Request (requires admin or branch admin)
   * @param res - Express Response
   * @returns HTTP 204 on success, 404 if not found
   * @throws 500 on database deletion failure
   * @sideEffects Permanently deletes parent record
   *
   * @example fetch('/api/parents/7', { method: 'DELETE' });
   */
  app.delete(
    "/api/parents/:id",
    isAdminOrBranchAdmin,
    hasPermission("parents", "delete"),
    async (req, res) => {
      try {
        const deleted = await storage.deleteParent(parseInt(req.params.id));
        if (!deleted) {
          return res.status(404).json({ message: "Parent not found" });
        }
        res.sendStatus(204);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/invoices/parent/:parentId
   * Fetch invoices associated with a specific parent.
   *
   * @purpose Retrieve all invoices related to a parent, optionally filtered by status
   *
   * @param req - Express Request (requires authentication), param: parentId (number), optional query: status (comma-separated string)
   * @param res - Express Response
   * @returns JSON array of invoice objects
   * @throws 400 if invalid parent ID, 500 on database errors
   * @sideEffects None
   *
   * @example
   * fetch('/api/invoices/parent/10?status=paid,pending').then(res => res.json());
   */
  app.get(
    "/api/invoices/parent/:parentId",
    isAuthenticated,
    async (req, res) => {
      const parentId = parseInt(req.params.parentId, 10);

      if (isNaN(parentId)) {
        return res.status(400).json({ error: "Invalid parent ID" });
      }

      const statusParam = req.query.status;
      let statuses: string[] | undefined;
      if (typeof statusParam === "string") {
        statuses = statusParam.split(",");
      }

      try {
        const invoices = await storage.getInvoicesByParentId(
          parentId,
          statuses,
        );
        res.status(200).json(invoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  /**
   * GET /api/studentCourseFees
   * Retrieve all student course fee records.
   *
   * @purpose Fetch all student course fees from the database
   *
   * @param req - Express Request (requires authentication)
   * @param res - Express Response
   * @returns JSON array of all student course fee objects
   * @throws 500 on database or server errors
   * @sideEffects None
   *
   * @example fetch('/api/studentCourseFees').then(res => res.json());
   */
  app.get("/api/studentCourseFees", isAuthenticated, async (req, res) => {
    try {
      const studentCourseFees = await storage.getStudentCourseFees();
      res.json(studentCourseFees);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/studentCourseFees/:enrollmentId
   * Retrieve student course fee details for a specific enrollment.
   *
   * @purpose Fetch course fee details linked to a specific enrollment ID
   *
   * @param req - Express Request with `params.enrollmentId` (number)
   * @param res - Express Response
   * @returns JSON array or object of student course fee records
   * @throws 500 on database or server errors
   * @sideEffects None
   *
   * @example fetch('/api/studentCourseFees/42').then(res => res.json());
   */
  app.get(
    "/api/studentCourseFees/:enrollmentId",
    isAuthenticated,
    async (req, res) => {
      try {
        const studentCourseFees = await storage.getStudentCourseFees();
        res.json(studentCourseFees);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/studentCourseFees
   * Create a new student course fee record.
   *
   * @purpose Add a new student course fee entry to the database
   *
   * @param req - Express Request containing student course fee data in body
   * @param res - Express Response
   * @returns JSON object of created student course fee with ID
   * @throws 500 on validation or database error
   * @sideEffects Inserts new record into database
   *
   * @example
   * fetch('/api/studentCourseFees', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ enrollmentId: 10, amount: 5000 })
   * });
   */
  app.post("/api/studentCourseFees", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const studentCourseFee = await storage.createStudentCourseFee(req.body);
      res.status(201).json(studentCourseFee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/studentCourseFees/:id
   * Update a student course fee record by ID.
   *
   * @purpose Modify an existing student course fee entry
   *
   * @param req - Express Request containing ID param and update body
   * @param res - Express Response
   * @returns JSON object of updated student course fee
   * @throws 404 if not found, 500 on database error
   * @sideEffects Updates record in database
   *
   * @example
   * fetch('/api/studentCourseFees/5', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ amount: 5500 })
   * });
   */
  app.put(
    "/api/studentCourseFees/:id",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const updatedStudentCourseFee = await storage.updateStudentCourseFee(
          parseInt(req.params.id),
          req.body,
        );
        if (!updatedStudentCourseFee) {
          return res
            .status(404)
            .json({ message: "Student Course Fee not found" });
        }
        res.json(updatedStudentCourseFee);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/studentCourseFees/:id
   * Delete a student course fee record by ID.
   *
   * @purpose Permanently remove a student course fee record
   *
   * @param req - Express Request with `params.id`
   * @param res - Express Response
   * @returns HTTP 204 on success, 404 if not found
   * @throws 500 on database error
   * @sideEffects Deletes record from database
   *
   * @example fetch('/api/studentCourseFees/7', { method: 'DELETE' });
   */
  app.delete(
    "/api/studentCourseFees/:id",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const deleted = await storage.deleteStudentCourseFee(
          parseInt(req.params.id),
        );
        if (!deleted) {
          return res
            .status(404)
            .json({ message: "Student Course Fee not found" });
        }
        res.sendStatus(204);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/enrollments
   * Retrieve all enrollment records.
   *
   * @purpose Fetch all student enrollments
   *
   * @param req - Express Request (authenticated)
   * @param res - Express Response
   * @returns JSON array of enrollments
   * @throws 500 on database or server errors
   * @sideEffects None
   *
   * @example fetch('/api/enrollments').then(res => res.json());
   */
  app.get("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const enrollments = await storage.getEnrollments();
      res.json(enrollments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/enrollments/active
   * Retrieve all active enrollments.
   *
   * @purpose Get list of currently active enrollments
   *
   * @param req - Express Request (authenticated)
   * @param res - Express Response
   * @returns JSON array of active enrollment objects
   * @throws 500 on database error
   * @sideEffects None
   *
   * @example fetch('/api/enrollments/active').then(res => res.json());
   */
  app.get("/api/enrollments/active", isAuthenticated, async (req, res) => {
    try {
      const enrollments = await storage.getActiveEnrollments();
      res.json(enrollments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/parents/:id/active-enrollments
   * Retrieve the active enrollment count for a specific parent.
   *
   * @purpose Fetch count of a parent’s active student enrollments
   *
   * @param req - Express Request with parent ID param
   * @param res - Express Response
   * @returns JSON object { activeEnrollmentCount: number }
   * @throws 500 on server error
   * @sideEffects None
   *
   * @example fetch('/api/parents/15/active-enrollments').then(res => res.json());
   */
  app.get(
    "/api/parents/:id/active-enrollments",
    isAuthenticated,
    isParent,
    async (req, res) => {
      try {
        const parentId = parseInt(req.params.id);
        const count =
          await storage.getActiveEnrollmentCountByParentId(parentId);
        res.json({ activeEnrollmentCount: count });
      } catch (error: any) {
        console.error("Error fetching active enrollments:", error);
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/enrollments/batch/:batchId
   * Retrieve enrollments associated with a specific batch.
   *
   * @purpose Fetch unique enrollments linked to a batch
   *
   * @param req - Express Request with `batchId` param
   * @param res - Express Response
   * @returns JSON array of enrollments for the given batch
   * @throws 400 if invalid batch ID, 500 on database error
   * @sideEffects None
   *
   * @example fetch('/api/enrollments/batch/22').then(res => res.json());
   */
  app.get("/api/enrollments/batch/:batchId", async (req, res) => {
    try {
      const batchId = parseInt(req.params.batchId);
      if (isNaN(batchId)) {
        return res.status(400).json({ message: "Invalid batch ID" });
      }

      const enrollments = await storage.getUniqueEnrollmentsByBatch(batchId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching filtered enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  /**
   * POST /api/enrollments
   * Create a new enrollment record.
   *
   * @purpose Add a new enrollment entry to the system
   *
   * @param req - Express Request object (requires admin or branch_admin). Body: enrollment data (studentId, batchId, startDate, etc.)
   * @param res - Express Response object
   * @returns JSON object of the created enrollment (HTTP 201)
   * @throws 500 on validation/database error
   * @sideEffects Inserts a new enrollment record in storage
   *
   * @example
   * fetch('/api/enrollments', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ studentId: 12, batchId: 34, startDate: '2025-10-01' })
   * });
   */
  app.post("/api/enrollments", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const enrollment = await storage.createEnrollment(req.body);
      res.status(201).json(enrollment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/enrollments/deactivate
   * @purpose Deactivate one or more enrollments for a student in a given batch (bulk deactivation).
   *
   * @param req - Express Request object (requires admin or branch_admin). Body: { studentId: number, batchId: number }
   * @param res - Express Response object
   * @returns JSON object with message, updatedCount, and enrollments array
   * @throws 400 if studentId or batchId missing; 500 on database/internal error
   * @sideEffects Updates enrollment records (status/state) in storage
   *
   * @example
   * fetch('/api/enrollments/deactivate', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ studentId: 12, batchId: 34 })
   * });
   */
  app.put(
    "/api/enrollments/deactivate",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const { studentId, batchId } = req.body;

        // Validate request
        if (!studentId || !batchId) {
          return res
            .status(400)
            .json({ message: "studentId and batchId are required" });
        }

        const updatedEnrollments = await storage.deactivateStudentEnrollments(
          studentId,
          batchId,
        );

        res.json({
          message: "Student enrollments deactivated successfully",
          updatedCount: updatedEnrollments.length,
          enrollments: updatedEnrollments,
        });
      } catch (error: any) {
        console.error("Failed to deactivate enrollments:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  /**
   * PUT /api/enrollments/:id
   * Update a specific enrollment by ID.
   *
   * @purpose Modify an existing enrollment record (dates, status, batch, etc.)
   *
   * @param req - Express Request object (requires admin or branch_admin). Params: id (enrollment ID). Body: fields to update.
   * @param res - Express Response object
   * @returns JSON object of the updated enrollment
   * @throws 400 if enrollment ID is invalid, 404 if enrollment not found, 500 on update/database error
   * @sideEffects Updates the enrollment record in storage
   *
   * @example
   * fetch('/api/enrollments/123', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ status: 'inactive', endDate: '2025-10-15' })
   * });
   */
  app.put("/api/enrollments/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid enrollment ID" });
      }

      const enrollment = await storage.getEnrollment(id);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      const updatedEnrollment = await storage.updateEnrollment(id, req.body);
      if (!updatedEnrollment) {
        return res.status(500).json({ message: "Failed to update enrollment" });
      }

      res.json(updatedEnrollment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/transportation
   * Fetch all transportation records.
   *
   * @purpose Retrieve all transportation entries from the database.
   *
   * @param req - Express Request object (requires authentication and "transportation:view" permission)
   * @param res - Express Response object
   * @returns JSON array of transportation records.
   * @throws 500 if a database or internal error occurs.
   * @sideEffects None
   *
   * @example
   * fetch('/api/transportation')
   *   .then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.get(
    "/api/transportation",
    isAuthenticated,
    hasPermission("transportation", "view"),
    async (req, res) => {
      try {
        const transportation = await storage.getTransportations();
        res.json(transportation);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/transportation/:id
   * Fetch a single transportation record by ID.
   *
   * @purpose Retrieve specific transportation details by ID.
   *
   * @param req - Express Request object with params.id (transportation ID)
   * @param res - Express Response object
   * @returns JSON object of transportation details.
   * @throws 404 if record not found, 500 on internal error.
   * @sideEffects None
   *
   * @example
   * fetch('/api/transportation/5')
   *   .then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.get(
    "/api/transportation/:id",
    isAuthenticated,
    hasPermission("transportation", "view"),
    async (req, res) => {
      try {
        const transportation = await storage.getTransportation(
          parseInt(req.params.id),
        );
        if (!transportation) {
          return res
            .status(404)
            .json({ message: "Transportation record not found" });
        }
        res.json(transportation);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/transportation
   * Create a new transportation record.
   *
   * @purpose Add a new transportation record to the system.
   *
   * @param req - Express Request object with body containing transportation details (e.g., mode, route, fee, etc.)
   * @param res - Express Response object
   * @returns JSON object of the created transportation record.
   * @throws 500 on validation or storage error.
   * @sideEffects Inserts a new transportation record into the database.
   *
   * @example
   * fetch('/api/transportation', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ modeId: 1, route: 'Downtown', fee: 250 })
   * });
   */
  app.post(
    "/api/transportation",
    isAuthenticated,
    hasPermission("transportation", "create"),
    async (req, res) => {
      try {
        // console.log("Received transportation data:", req.body);
        const transportation = await storage.createTransportation(req.body);
        // console.log("Created transportation record:", transportation);
        res.json(transportation);
      } catch (error: any) {
        console.error("Failed to create transportation:", error);
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/transportationModes
   * Fetch all available transportation modes.
   *
   * @purpose Retrieve the list of transportation modes (e.g., Bus, Van, Carpool).
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @returns JSON array of transportation modes.
   * @throws 500 on storage or database error.
   * @sideEffects None
   *
   * @example
   * fetch('/api/transportationModes')
   *   .then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.get(
    "/api/transportationModes",
    isAuthenticated,
    hasPermission("transportation", "view"),
    async (req, res) => {
      try {
        const transportationModes = await storage.getTransportationModes();
        res.json(transportationModes);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/transportationMode
   * Create a new transportation mode.
   *
   * @purpose Add a new transportation mode to the system (e.g., Bus, Van, Train).
   *
   * @param req - Express Request object with body containing mode details (e.g., name, description)
   * @param res - Express Response object
   * @returns JSON object of the created transportation mode.
   * @throws 500 on validation or database error.
   * @sideEffects Inserts a new transportation mode into the database.
   *
   * @example
   * fetch('/api/transportationMode', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ name: 'Bus', description: 'Standard school bus' })
   * });
   */
  app.post(
    "/api/transportationMode",
    isAuthenticated,
    hasPermission("transportation", "create"),
    async (req, res) => {
      try {
        const transportationMode = await storage.createTransportationMode(
          req.body,
        );
        res.status(201).json(transportationMode);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * PUT /api/transportationMode/:id
   * Update a transportation mode by ID.
   *
   * @purpose Modify an existing transportation mode record.
   *
   * @param req - Express Request object with params.id (mode ID) and body containing updated mode details
   * @param res - Express Response object
   * @returns JSON object of the updated transportation mode.
   * @throws 500 on database or update error.
   * @sideEffects Updates an existing transportation mode in the database.
   *
   * @example
   * fetch('/api/transportationMode/3', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ name: 'Mini Bus', description: 'Small capacity transport' })
   * });
   */
  app.put(
    "/api/transportationMode/:id",
    isAuthenticated,
    hasPermission("transportation", "edit"),
    async (req, res) => {
      try {
        const updatedTransportationMode =
          await storage.updateTransportationMode(
            parseInt(req.params.id),
            req.body,
          );
        res.json(updatedTransportationMode);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/transportationMode/:id
   * Delete a transportation mode by ID.
   *
   * @purpose Remove a transportation mode from the system.
   *
   * @param req - Express Request object with params.id (mode ID)
   * @param res - Express Response object
   * @returns JSON confirmation message upon successful deletion.
   * @throws 500 on database or deletion error.
   * @sideEffects Deletes a transportation mode record from the database.
   *
   * @example
   * fetch('/api/transportationMode/4', { method: 'DELETE' });
   */
  app.delete(
    "/api/transportationMode/:id",
    isAuthenticated,
    hasPermission("transportation", "delete"),
    async (req, res) => {
      try {
        await storage.deleteTransportationMode(parseInt(req.params.id));
        res.json({ message: "Transportation mode deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/student_enrollment_fees
   * Fetch all student enrollment fee records.
   *
   * @purpose Retrieve a list of all student enrollment fees.
   *
   * @param req - Express Request object (requires authentication)
   * @param res - Express Response object
   * @returns JSON array of enrollment fee records.
   * @throws 500 if a database or internal server error occurs.
   * @sideEffects None
   *
   * @example
   * fetch('/api/student_enrollment_fees')
   *   .then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.get("/api/student_enrollment_fees", isAuthenticated, async (req, res) => {
    try {
      const enrollmentFees = await storage.getStudentEnrollmentFees();
      res.json(enrollmentFees);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/student_enrollment_fees/:id
   * Fetch a specific student enrollment fee by ID.
   *
   * @purpose Retrieve detailed information about a specific enrollment fee.
   *
   * @param req - Express Request object with params.id (enrollment fee ID)
   * @param res - Express Response object
   * @returns JSON object of the enrollment fee record.
   * @throws 404 if not found, 500 on internal server error.
   * @sideEffects None
   *
   * @example
   * fetch('/api/student_enrollment_fees/10')
   *   .then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.get(
    "/api/student_enrollment_fees/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const enrollmentFee = await storage.getStudentEnrollmentFees();
        if (!enrollmentFee) {
          return res.status(404).json({ message: "Enrollment fee not found" });
        }
        res.json(enrollmentFee);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/student_enrollment_fees
   * Create a new student enrollment fee record.
   *
   * @purpose Add a new student enrollment fee record to the system.
   *
   * @param req - Express Request object containing enrollment fee details in the body.
   * @param res - Express Response object
   * @returns JSON object of the newly created enrollment fee record.
   * @throws 500 if creation or validation fails.
   * @sideEffects Inserts a new record into the database.
   *
   * @example
   * fetch('/api/student_enrollment_fees', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ studentId: 1, amount: 500, date: '2025-01-01' })
   * });
   */
  app.post(
    "/api/student_enrollment_fees",
    isAuthenticated,
    async (req, res) => {
      try {
        const enrollmentFee = await storage.createStudentEnrollmentFees(
          req.body,
        );
        res.status(201).json(enrollmentFee);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * PUT /api/student_enrollment_fees/:id
   * Update a student enrollment fee record by ID.
   *
   * @purpose Modify an existing student enrollment fee record.
   *
   * @param req - Express Request object with params.id and body containing updated details.
   * @param res - Express Response object
   * @returns JSON object of the updated enrollment fee.
   * @throws 500 if the update operation fails.
   * @sideEffects Updates an existing record in the database.
   *
   * @example
   * fetch('/api/student_enrollment_fees/10', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ amount: 600 })
   * });
   */
  app.put(
    "/api/student_enrollment_fees/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        const enrollmentFee = await storage.updateStudentEnrollmentFees(
          parseInt(req.params.id),
          req.body,
        );
        res.json(enrollmentFee);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/student_enrollment_fees/:id
   * Delete a student enrollment fee record by ID.
   *
   * @purpose Permanently remove a student enrollment fee record.
   *
   * @param req - Express Request object with params.id (enrollment fee ID)
   * @param res - Express Response object
   * @returns 204 No Content on successful deletion.
   * @throws 500 if a database or deletion error occurs.
   * @sideEffects Deletes a record from the database.
   *
   * @example
   * fetch('/api/student_enrollment_fees/10', { method: 'DELETE' });
   */
  app.delete(
    "/api/student_enrollment_fees/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        await storage.deleteStudentEnrollmentFees(parseInt(req.params.id));
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/inventory
   * Fetch all inventory items.
   *
   * @purpose Retrieve a list of all items in the inventory.
   *
   * @param req - Express Request object (requires authentication and "inventory:view" permission)
   * @param res - Express Response object
   * @returns JSON array containing all inventory records.
   * @throws 500 if a database or internal server error occurs.
   * @sideEffects None
   *
   * @example
   * fetch('/api/inventory')
   *   .then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.get(
    "/api/inventory",
    isAuthenticated,
    hasPermission("inventory", "view"),
    async (req, res) => {
      try {
        const inventory = await storage.getInventory();
        res.json(inventory);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/inventory
   * Create a new inventory item.
   *
   * @purpose Add a new item to the inventory database.
   *
   * @param req - Express Request object containing the inventory data in the body.
   * @param res - Express Response object
   * @returns JSON object of the newly created inventory record.
   * @throws 500 if record creation fails or validation error occurs.
   * @sideEffects Inserts a new record into the database.
   *
   * @example
   * fetch('/api/inventory', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ name: 'Laptop', quantity: 10, category: 'Electronics' })
   * });
   */
  app.post(
    "/api/inventory",
    isAuthenticated,
    hasPermission("inventory", "create"),
    async (req, res) => {
      try {
        const inventory = await storage.createInventory(req.body);
        res.status(201).json(inventory);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * PUT /api/inventory/:id
   * Update an existing inventory item by ID.
   *
   * @purpose Modify details of a specific inventory record.
   *
   * @param req - Express Request object with params.id (inventory ID) and body containing updated data.
   * @param res - Express Response object
   * @returns JSON object of the updated inventory record.
   * @throws 500 if the update fails due to database or validation issues.
   * @sideEffects Updates an existing record in the database.
   *
   * @example
   * fetch('/api/inventory/5', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ quantity: 15 })
   * });
   */
  app.put(
    "/api/inventory/:id",
    isAuthenticated,
    hasPermission("inventory", "edit"),
    async (req, res) => {
      try {
        const inventory = await storage.updateInventory(
          parseInt(req.params.id),
          req.body,
        );
        res.json(inventory);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * DELETE /api/inventory/:id
   * Delete an inventory item by ID.
   *
   * @purpose Permanently remove an item from the inventory.
   *
   * @param req - Express Request object with params.id (inventory ID)
   * @param res - Express Response object
   * @returns JSON object confirming the deleted inventory record.
   * @throws 500 if the deletion operation fails.
   * @sideEffects Deletes a record from the database.
   *
   * @example
   * fetch('/api/inventory/5', { method: 'DELETE' });
   */
  app.delete(
    "/api/inventory/:id",
    isAuthenticated,
    hasPermission("inventory", "delete"),
    async (req, res) => {
      try {
        const inventory = await storage.deleteInventory(
          parseInt(req.params.id),
        );
        res.json(inventory);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/stock-item/:id
   * Fetch a single stock item by ID.
   *
   * @purpose Retrieve details of a specific stock item (inventory sub-item).
   *
   * @param req - Express Request object; params.id = stock item ID (number). Requires authentication.
   * @param res - Express Response object
   * @returns JSON object of the stock item.
   * @throws 400 if params.id is invalid (not explicitly handled here), 500 on internal/database error.
   * @sideEffects none
   *
   * @example
   * fetch('/api/stock-item/12', { headers: { Authorization: 'Bearer ...' } })
   *   .then(r => r.json()).then(item => console.log(item));
   */
  app.get("/api/stock-item/:id", isAuthenticated, async (req, res) => {
    try {
      const stockItem = await storage.getStockItem(parseInt(req.params.id));
      res.json(stockItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/stock-item
   * Fetch all stock items.
   *
   * @purpose Retrieve a list of all stock items.
   *
   * @param req - Express Request object. Requires authentication.
   * @param res - Express Response object
   * @returns JSON array of stock item objects.
   * @throws 500 on internal/database error.
   * @sideEffects none
   *
   * @example
   * fetch('/api/stock-item', { headers: { Authorization: 'Bearer ...' } })
   *   .then(r => r.json()).then(items => console.log(items));
   */
  app.get("/api/stock-item", isAuthenticated, async (req, res) => {
    try {
      const stockItem = await storage.getStockItems();
      res.json(stockItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/stock-item
   * Create a new stock item.
   *
   * @purpose Add a new stock item to inventory.
   *
   * @param req - Express Request object. Body: stock item data (name, sku, stockQuantity, price, etc.). Requires authentication.
   * @param res - Express Response object
   * @returns JSON object of the created stock item (HTTP 201).
   * @throws 500 on validation or database error.
   * @sideEffects Inserts a new stock item record into storage.
   *
   * @example
   * fetch('/api/stock-item', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ name: 'Guitar', sku: 'GTR-001', stockQuantity: 10, price: 1200 })
   * });
   */
  app.post("/api/stock-item", isAuthenticated, async (req, res) => {
    try {
      const stockItem = await storage.createStockItem(req.body);
      res.status(201).json(stockItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/stock-item/:id
   * Update an existing stock item by ID.
   *
   * @purpose Modify fields of an existing stock item (e.g., quantity, price, metadata).
   *
   * @param req - Express Request object. Params: id (stock item ID). Body: updated fields. Requires authentication.
   * @param res - Express Response object
   * @returns JSON object of the updated stock item.
   * @throws 400 if id is invalid (not explicitly checked here), 500 on update/database error.
   * @sideEffects Updates the stock item record in storage. Converts incoming createdAt/updatedAt strings to Date objects for DB.
   *
   * @example
   * fetch('/api/stock-item/12', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ stockQuantity: 8, updatedAt: '2025-10-05T12:00:00Z' })
   * });
   */
  app.put("/api/stock-item/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = req.body;

      // Convert date strings to Date objects for Drizzle
      const data = {
        ...input,
        ...(input.createdAt && { createdAt: new Date(input.createdAt) }),
        ...(input.updatedAt && { updatedAt: new Date(input.updatedAt) }),
      };

      const stockItem = await storage.updateStockItem(id, data);
      res.json(stockItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * DELETE /api/stock-item/:id
   * Delete a stock item by ID.
   *
   * @purpose Permanently remove a stock item from inventory.
   *
   * @param req - Express Request object. Params: id (stock item ID). Requires authentication.
   * @param res - Express Response object
   * @returns JSON object of deletion result or confirmation (status may vary by implementation).
   * @throws 500 on database or deletion error.
   * @sideEffects Deletes the stock item record from storage.
   *
   * @example
   * fetch('/api/stock-item/12', { method: 'DELETE', headers: { Authorization: 'Bearer ...' } });
   */
  app.delete("/api/stock-item/:id", isAuthenticated, async (req, res) => {
    try {
      const stockItem = await storage.deleteStockItem(parseInt(req.params.id));
      res.json(stockItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/studentInventory/:id
   * Fetch student inventory for a specific student inventory record by ID.
   *
   * @purpose Retrieve a single student-inventory record (items assigned to a student)
   *
   * @param req - Express Request object (requires authentication). Params: id (studentInventory ID)
   * @param res - Express Response object
   * @returns JSON object of the student inventory record
   * @throws 400 if id is invalid (not explicitly handled here), 500 if database/internal error
   * @sideEffects none
   *
   * @example
   * fetch('/api/studentInventory/12', { headers: { Authorization: 'Bearer ...' } })
   *   .then(res => res.json()).then(item => console.log(item));
   */
  app.get("/api/studentInventory/:id", isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.getStudentInventory(
        parseInt(req.params.id),
      );
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/studentInventory
   * Fetch all student inventory records.
   * 
   * @purpose Retrieve all student inventory entries across all students
   * 
   * @param req - Express Request object (requires authentication)
   * @param res - Express Response object
   * @returns JSON array of student-inventory records
   * @throws 500 if database/internal error
   * @sideEffects none

  * @example
   * fetch('/api/studentInventory', { headers: { Authorization: 'Bearer ...' } })
   *   .then(res => res.json()).then(list => console.log(list));
   */
  app.get("/api/studentInventory", isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.getAllStudentInventory();
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/studentInventory
   * Create a new student inventory entry (assign item(s) to a student).
   *
   * @purpose Add an inventory assignment for a student
   *
   * @param req - Express Request object (requires authentication). Body: student inventory data (studentId, inventoryId, quantity, totalAmount, discount, etc.)
   * @param res - Express Response object
   * @returns JSON object of the created student-inventory record (HTTP 201)
   * @throws 500 if validation or database error occurs
   * @sideEffects Inserts a new student-inventory record (may also affect stock levels elsewhere if implemented)
   *
   * @example
   * fetch('/api/studentInventory', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ studentId: 5, inventoryId: 3, quantity: 1, totalAmount: 120.00 })
   * });
   */
  app.post("/api/studentInventory", isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.createStudentInventory(req.body);
      res.status(201).json(inventory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/studentInventory/:id
   * Update an existing student inventory record by ID.
   *
   * @purpose Modify an existing student-inventory assignment (e.g., change quantity, discount, totalAmount)
   *
   * @param req - Express Request object (requires authentication). Params: id (studentInventory ID). Body: fields to update.
   * @param res - Express Response object
   * @returns JSON object of the updated student-inventory record
   * @throws 400 if id is invalid (not explicitly handled here), 404 if not found (depends on storage implementation), 500 on database/internal error
   * @sideEffects Updates the student-inventory record (may also affect stock levels elsewhere if implemented)
   *
   * @example
   * fetch('/api/studentInventory/12', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ quantity: 2, totalAmount: 240.00 })
   * });
   */
  app.put("/api/studentInventory/:id", isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.updateStudentInventory(
        parseInt(req.params.id),
        req.body,
      );
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * DELETE /api/studentInventory/:id
   * Delete a student inventory record by ID.
   *
   * @purpose Remove an inventory assignment from a student
   *
   * @param req - Express Request object (requires authentication). Params: id (studentInventory ID)
   * @param res - Express Response object
   * @returns JSON object or confirmation of deletion (implementation-specific)
   * @throws 500 if deletion fails or internal error occurs
   * @sideEffects Deletes the student-inventory record (may also restore stock levels elsewhere if implemented)
   *
   * @example
   * fetch('/api/studentInventory/12', { method: 'DELETE', headers: { Authorization: 'Bearer ...' } });
   */
  app.delete("/api/studentInventory/:id", isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.deleteStudentInventory(
        parseInt(req.params.id),
      );
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/attendance/student/:studentId
   * Fetch attendance records for a specific student.
   *
   * @purpose Return attendance history for a student; enforce access control so parents can only view their own children
   *
   * @param req - Express Request object (requires authentication). Params: studentId (number)
   * @param res - Express Response object
   * @returns JSON array of attendance records for the specified student
   * @throws 404 if student not found, 403 if a parent tries to access another parent's child, 500 on internal/database error
   * @sideEffects none
   *
   * @example
   * fetch('/api/attendance/student/12', { headers: { Authorization: 'Bearer ...' } })
   *   .then(res => res.json()).then(records => console.log(records));
   */
  app.get(
    "/api/attendance/student/:studentId",
    isAuthenticated,
    async (req, res) => {
      try {
        const student = await storage.getStudent(
          parseInt(req.params.studentId),
        );
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        // Check if parent is requesting their own student's attendance
        if (
          req.user &&
          req.user.role === "parent" &&
          student.parentId !== req.user.id
        ) {
          return res.status(403).json({ message: "Forbidden" });
        }

        const attendance = await storage.getAttendanceByStudent(
          parseInt(req.params.studentId),
        );
        res.json(attendance);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/attendance
   * Create/mark attendance records (bulk).
   *
   * @purpose Allow authorized users (teachers and admins) to mark attendance for one or more students
   *
   * @param req - Express Request object (requires authentication). Body: array of attendance records, each must include studentId, batchId, date, status
   * @param res - Express Response object
   * @returns JSON array of saved attendance records (HTTP 201)
   * @throws 400 if payload is not an array or any record is missing required fields, 403 if user not a teacher/admin, 500 on internal/database error
   * @sideEffects Inserts attendance records into storage
   *
   * @example
   * fetch('/api/attendance', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify([
   *     { studentId: 12, batchId: 34, date: '2025-10-01', status: 'present' },
   *     { studentId: 13, batchId: 34, date: '2025-10-01', status: 'absent' }
   *   ])
   * });
   */
  app.post("/api/attendance", isAuthenticated, async (req, res) => {
    try {
      // Only teachers and admin can mark attendance
      if (
        !req.user ||
        (req.user.role !== "admin" && req.user.role !== "teacher")
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const attendanceRecords = req.body;
      if (!Array.isArray(attendanceRecords)) {
        return res
          .status(400)
          .json({ message: "Invalid attendance data format" });
      }

      // Validate each record
      for (const record of attendanceRecords) {
        if (
          !record.studentId ||
          !record.batchId ||
          !record.date ||
          !record.status
        ) {
          return res.status(400).json({
            message:
              "Each attendance record must have studentId, batchId, date, and status",
          });
        }
      }

      const savedAttendance = await Promise.all(
        attendanceRecords.map((record) => storage.createAttendance(record)),
      );

      res.status(201).json(savedAttendance);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/attendance/compensate
   * Add compensation details for an attendance record (e.g., make-up class info).
   *
   * @purpose Record compensation/makeup class details against a missed attendance entry
   *
   * @param req - Express Request object. Body: { attendanceId: number, compensationDate: string|Date, compensationBatchName: string }
   * @param res - Express Response object
   * @returns JSON object { success: true } on success
   * @throws 400 if required fields are missing, 500 on internal/database error
   * @sideEffects Updates an attendance record with compensation information
   *
   * @example
   * fetch('/api/attendance/compensate', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ attendanceId: 123, compensationDate: '2025-10-10', compensationBatchName: 'BRANCHMUS1001' })
   * });
   */
  app.post("/api/attendance/compensate", async (req, res) => {
    try {
      const { attendanceId, compensationDate, compensationBatchName } =
        req.body;

      if (!attendanceId || !compensationDate || !compensationBatchName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Update the attendance record with compensation details
      await storage.updateAttendanceCompensation(
        attendanceId,
        compensationDate,
        compensationBatchName,
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating compensation:", error);
      res.status(500).json({ error: "Failed to update compensation" });
    }
  });

  /**
   * PUT /api/attendance/:id
   * Update an attendance record, optionally including compensation details.
   *
   * @purpose Allows updating a single attendance record. If a compensationBatchName is provided, it treats the update as a compensation entry; otherwise, it's a regular attendance update.
   *
   * @param req - Express Request object. Params: id (attendance record ID). Body: { compensationDate: string|Date, compensationBatchName?: string }
   * @param res - Express Response object
   * @returns JSON object { success: true } on success
   * @throws 400 if required fields are missing, 500 on internal/database error
   * @sideEffects Updates an attendance record in storage
   *
   * @example
   * fetch('/api/attendance/123', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ compensationDate: '2025-10-10', compensationBatchName: 'BRANCHMUS1001' })
   * });
   */
  app.put("/api/attendance/:id", async (req, res) => {
    try {
      const attendanceId = req.params.id;
      const { compensationDate, compensationBatchName } = req.body;

      if (!attendanceId || !compensationDate) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (compensationBatchName) {
        // Update with compensation details
        await storage.updateAttendanceCompensation(
          parseInt(attendanceId),
          compensationDate,
          compensationBatchName,
        );
      } else {
        // Regular attendance update
        await storage.updateAttendance(
          parseInt(attendanceId),
          compensationDate,
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ error: "Failed to update attendance" });
    }
  });

  /**
   * GET /api/payments
   * Fetch payment records. Parents see only their children's payments; admins/teachers see all.
   *
   * @purpose Returns a filtered list of payments based on the user's role
   *
   * @param req - Express Request object (requires authentication)
   * @param res - Express Response object
   * @returns JSON array of payment objects
   * @throws 500 on internal/database error
   * @sideEffects none
   *
   * @example
   * fetch('/api/payments', { headers: { Authorization: 'Bearer ...' } })
   *   .then(res => res.json())
   *   .then(payments => console.log(payments));
   */
  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      if (req.user && req.user.role === "parent") {
        const students = await storage.getStudentsByParent(req.user.id);
        const studentIds = students.map((student) => student.id);
        const allPayments = await storage.getPayments();
        const payments = allPayments.filter((payment) =>
          studentIds.includes(payment.studentId),
        );
        return res.json(payments);
      }

      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/payments/invoice/:invoiceId
   * Fetch detailed payment and invoice data by invoice ID
   *
   * @purpose Returns invoice details along with associated student info
   *
   * @param req - Express Request object. Params: invoiceId
   * @param res - Express Response object
   * @returns JSON object containing invoice details
   * @throws 404 if invoice or student not found, 500 on internal error
   * @sideEffects none
   *
   * @example
   * fetch('/api/payments/invoice/123', { headers: { Authorization: 'Bearer ...' } })
   *   .then(res => res.json())
   *   .then(invoice => console.log(invoice));
   */
  app.get(
    "/api/payments/invoice/:invoiceId",
    isAuthenticated,
    async (req, res) => {
      try {
        const { invoiceId } = req.params;

        const studentId = await storage.getStudentIdByInvoiceId(invoiceId);
        if (!studentId) {
          return res.status(404).json({ message: "Invoice not found." });
        }

        const invoiceData = await storage.getInvoiceDetails(
          studentId,
          invoiceId,
        );

        if (!invoiceData) {
          return res
            .status(404)
            .json({ message: "Could not assemble invoice details." });
        }

        res.json(invoiceData);
      } catch (err: any) {
        console.error("Error fetching invoice:", err);
        res.status(500).json({ message: "An internal server error occurred." });
      }
    },
  );

  /**
   * POST /api/payments
   * Create a new payment record
   *
   * @purpose Allows admins or branch admins to create a new payment record
   *
   * @param req - Express Request object. Body: payment details
   * @param res - Express Response object
   * @returns JSON object of the created payment
   * @throws 400 if required fields are missing, 500 on internal/database error
   * @sideEffects Creates a new payment record in the database
   *
   * @example
   * fetch('/api/payments', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ ... })
   * })
   *   .then(res => res.json())
   *   .then(payment => console.log(payment));
   */
  app.post("/api/payments", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const payment = await storage.createPayment(req.body);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/payments/:id
   * Update an existing payment record
   *
   * @purpose Allows admins or branch admins to update payment details
   *
   * @param req - Express Request object. Params: id. Body: updated payment fields
   * @param res - Express Response object
   * @returns JSON object of the updated payment
   * @throws 404 if payment not found, 500 on internal/database error
   * @sideEffects Updates an existing payment record in the database
   *
   * @example
   * fetch('/api/payments/123', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ ... })
   * })
   *   .then(res => res.json())
   *   .then(payment => console.log(payment));
   */
  app.put("/api/payments/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const updatedPayment = await storage.updatePayment(
        parseInt(req.params.id),
        req.body,
      );
      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(updatedPayment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/invoices
   * Fetch all invoices (admin/branch admin only)
   *
   * @purpose Return a list of all invoices in the system
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @returns JSON array of invoice objects
   * @throws 500 on internal/database error
   * @sideEffects none
   *
   * @example
   * fetch('/api/invoices', { headers: { Authorization: 'Bearer ...' } })
   *   .then(res => res.json())
   *   .then(invoices => console.log(invoices));
   */
  app.get("/api/invoices", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/invoices/:id
   * Fetch a single invoice with its associated items
   *
   * @purpose Returns a single invoice along with its line items/details
   *
   * @param req - Express Request object. Params: id
   * @param res - Express Response object
   * @returns JSON object of invoice with items
   * @throws 404 if invoice not found
   * @sideEffects none
   *
   * @example
   * fetch('/api/invoices/123', { headers: { Authorization: 'Bearer ...' } })
   *   .then(res => res.json())
   *   .then(invoice => console.log(invoice));
   */
  app.get("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.getInvoiceWithItems(
        parseInt(req.params.id),
      );
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PATCH /api/invoices/:invoiceNumber
   * Update the status and amount paid of an invoice
   *
   * @purpose Update invoice payment status and accumulate amount paid
   *
   * @param req - Express Request object. Params: invoiceNumber (string). Body: { status: string, amount_paid: number }
   * @param res - Express Response object
   * @returns JSON of updated invoice
   * @throws 400 if missing status or amount_paid, 404 if invoice not found, 500 on internal error
   * @sideEffects Updates an existing invoice record in the database
   *
   * @example
   * fetch('/api/invoices/123', {
   *   method: 'PATCH',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ status: 'paid', amount_paid: 100 })
   * })
   *   .then(res => res.json())
   *   .then(invoice => console.log(invoice));
   */
  app.patch(
    "/api/invoices/:invoiceNumber",
    isAdminOrBranchAdmin,
    async (req, res) => {
      const { invoiceNumber } = req.params;
      const { status, amount_paid } = req.body;

      try {
        if (!status || amount_paid === undefined) {
          return res
            .status(400)
            .json({ error: "Missing status or amount_paid" });
        }

        const existingInvoice = await db
          .select()
          .from(invoices)
          .where(eq(invoices.invoiceNumber, invoiceNumber))
          .limit(1);

        if (!existingInvoice.length) {
          return res.status(404).json({ error: "Invoice not found" });
        }

        const currentAmountPaid = Number(existingInvoice[0].amountPaid || 0);
        const newAmountPaid = currentAmountPaid + Number(amount_paid);

        const updatedInvoice = await db
          .update(invoices)
          .set({ status, amountPaid: newAmountPaid.toString() })
          .where(eq(invoices.invoiceNumber, invoiceNumber))
          .returning();

        if (!updatedInvoice.length) {
          return res.status(404).json({ error: "Invoice not found" });
        }

        res.json(updatedInvoice[0]);
      } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({ error: "Failed to update invoice" });
      }
    },
  );

  /**
   * POST /api/invoices
   * Create a new invoice for a student (manual or current month).
   *
   * @purpose Generate invoices either manually or for the current month with optional extra discount
   *
   * @param req - Express Request object. Body: { studentId: number, mode?: "manual" | "current", extraDiscount?: number }
   * @param res - Express Response object
   * @returns JSON of created invoice
   * @throws 400 if studentId is missing, 500 on internal error
   * @sideEffects Creates a new invoice record in the database
   *
   * @example
   * fetch('/api/invoices', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ studentId: 123, mode: 'manual', extraDiscount: 10 })
   * })
   *   .then(res => res.json())
   *   .then(invoice => console.log(invoice));
   */
  app.post("/api/invoices", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const { studentId, mode = "manual", extraDiscount = 0 } = req.body;

      if (!studentId) {
        return res.status(400).json({ message: "studentId is required" });
      }

      let result;

      if (mode === "current") {
        result = await storage.createCurrentMonthInvoice(studentId);
      } else {
        result = await storage.createManualInvoiceWithLogic(
          studentId,
          extraDiscount,
        );
      }

      res.status(201).json(result);
    } catch (error: any) {
      console.error("Invoice generation error:", error);
      res.status(500).json({
        message:
          error.message ||
          "An internal server error occurred during invoice generation.",
      });
    }
  });

  /**
   * PUT /api/invoices/cancel/:id
   * Cancel an existing invoice.
   *
   * @purpose Mark an invoice as cancelled
   *
   * @param req - Express Request object. Params: id (invoice ID number)
   * @param res - Express Response object
   * @returns { message: string } if successful
   * @throws 400 if invalid invoice ID, 404 if invoice not found or already cancelled, 500 on internal error
   * @sideEffects Updates an existing invoice record in the database
   *
   * @example
   * fetch('/api/invoices/cancel/123', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(result => console.log(result));
   */
  app.put("/api/invoices/cancel/:id", async (req, res) => {
    const invoiceId = Number(req.params.id);
    // This console.log also needs backticks (`) to work correctly
    console.log(`🛑 Cancel invoice called: ${invoiceId}`);

    if (!invoiceId) {
      return res.status(400).json({ error: "Invalid invoice ID" });
    }

    try {
      const result = await storage.cancelInvoice(invoiceId);
      console.log(`🛑 Cancel invoice result: ${result}`);
      if (result) {
        res.status(200).json({ message: "Invoice cancelled successfully" });
      } else {
        res
          .status(404)
          .json({ error: "Invoice not found or already cancelled" });
      }
    } catch (error: any) {
      console.error("❌ Failed to cancel invoice:", error);
      res.status(500).json({ error: "Failed to cancel invoice" });
    }
  });

  /**
   * GET /api/invoicesByStudent/:studentId
   * Get all invoices for a specific student.
   *
   * @purpose Retrieve invoices for a given student
   *
   * @param req - Express Request object. Params: studentId (number)
   * @param res - Express Response object
   * @returns Array of invoices
   * @throws 500 on internal error
   * @sideEffects none
   *
   * @example
   * fetch('/api/invoicesByStudent/123', {
   *   method: 'GET',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(invoices => console.log(invoices));
   */
  app.get(
    "/api/invoicesByStudent/:studentId",
    isAuthenticated,
    async (req, res) => {
      try {
        const studentId = parseInt(req.params.studentId);
        const invoices = await storage.getInvoicesByStudent(studentId);
        res.json(invoices);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/invoices/check
   * Check which students already have invoices for a given month and year.
   *
   * @purpose Prevent duplicate invoices by identifying students with existing invoices
   *
   * @param req - Express Request object. Body: { studentIds: number[], month: number, year: number }
   * @param res - Express Response object
   * @returns Array of students with invoices
   * @throws 400 if invalid/missing parameters, 500 on internal error
   * @sideEffects none
   *
   * @example
   * fetch('/api/invoices/check', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ studentIds: [123, 456], month: 10, year: 2023 })
   * })
   *   .then(res => res.json())
   *   .then(students => console.log(students));
   */
  app.post("/api/invoices/check", async (req, res) => {
    // console.log("Request body:", req.body);
    const { studentIds, month, year } = req.body;

    if (!Array.isArray(studentIds) || !month || !year) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }

    try {
      const studentsWithInvoices = await storage.getStudentsWithInvoices(
        studentIds,
        month,
        year,
      );
      res.json(studentsWithInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  /**
   * GET /api/receipts
   * Retrieve all receipts.
   *
   * @purpose Fetch all receipts for admin/branch admin
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @returns Array of receipts
   * @throws 500 on internal error
   * @sideEffects none
   *
   * @example
   * fetch('/api/receipts', {
   *   method: 'GET',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(receipts => console.log(receipts));
   */
  app.get("/api/receipts", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const receipts = await storage.getReceipts();
      res.json(receipts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/receipts/:id
   * Retrieve a receipt by its receipt number.
   *
   * @purpose Fetch details of a specific receipt
   *
   * @param req - Express Request object. Params: id (receipt number)
   * @param res - Express Response object
   * @returns JSON of receipt
   * @throws 404 if receipt not found, 500 on internal error
   * @sideEffects none
   *
   * @example fetch('/api/receipts/123', {
   *   method: 'GET',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(receipt => console.log(receipt));
   */
  app.get("/api/receipts/:id", isAuthenticated, async (req, res) => {
    try {
      const receipt = await storage.getReceiptByReceiptNumber(req.params.id);
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      res.json(receipt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/receipts/:id
   * Retrieve a receipt by its receipt number.
   *
   * @purpose Fetch details of a specific receipt
   *
   * @param req - Express Request object. Params: id (receipt number)
   * @param res - Express Response object
   * @returns JSON of receipt
   * @throws 404 if receipt not found, 500 on internal error
   * @sideEffect None
   *
   * @example fetch('/api/receipts/123', {
   *   method: 'GET',
   *   headers: {
   *     'Content-Type': 'application/json',
   *     Authorization: 'Bearer <token>'
   *   }
   * })
   *   .then(res => res.json())
   *   .then(receipt => console.log(receipt));
   *
   */
  app.post("/api/receipts", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const receiptNumber = await storage.generateReceiptId();
      const receipt = await storage.createReceipt({
        ...req.body,
        receiptNumber,
      });
      res.status(201).json(receipt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/generate-receipt-number
   * Generate a new, unique receipt number.
   *
   * @purpose Provide a new receipt number for creating receipts
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @returns JSON object containing the generated receipt number: { receiptNumber: string }
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/generate-receipt-number', {
   *   method: 'GET',
   *   headers: {
   *     'Content-Type': 'application/json',
   *     Authorization: 'Bearer <token>'
   *   }
   * })
   *   .then(res => res.json())
   *   .then(data => console.log(data.receiptNumber));
   */
  app.get(
    "/api/generate-receipt-number",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const receiptNumber = await storage.generateReceiptId();
        res.json({ receiptNumber });
      } catch (error) {
        res.status(500).json({ message: error });
      }
    },
  );

  /**
   * GET /api/employees
   * Retrieve a list of all employees.
   *
   * @purpose Fetch all employee records
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @returns JSON array of employee objects
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/employees', {
   *   method: 'GET',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' }
   * })
   *   .then(res => res.json())
   *   .then(employees => console.log(employees));
   */
  app.get("/api/employees", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/employees/:id
   * Retrieve a single employee by ID.
   *
   * @purpose Fetch details of a specific employee
   *
   * @param req - Express Request object. Params: id (employee ID)
   * @param res - Express Response object
   * @returns JSON object of the employee
   * @throws 404 if employee not found, 500 on internal error
   * @sideEffect None
   *
   * @example fetch('/api/employees/123', {
   *   method: 'GET',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' }
   * })
   *   .then(res => res.json())
   *   .then(employee => console.log(employee));
   */
  app.get("/api/employees/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const employee = await storage.getEmployee(parseInt(req.params.id));
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/employees
   * Create a new employee and send a password reset email.
   *
   * @purpose Add a new employee record and allow them to set a password
   *
   * @param req - Express Request object. Body: employee details (name, email, userName, etc.)
   * @param res - Express Response object
   * @returns JSON object of the created employee
   * @throws 500 on internal server error
   * @sideEffect Sends a password reset email to the new employee
   *
   * @example fetch('/api/employees', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' },
   *   body: JSON.stringify({ firstName: 'John', lastName: 'Doe', email: 'john@example.com', userName: 'johndoe' })
   * })
   *   .then(res => res.json())
   *   .then(employee => console.log(employee));
   */
  app.post("/api/employees", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const employee = await storage.createEmployee(req.body);

      // Generate reset token for employee
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Update user with reset token
      await db
        .update(users)
        .set({ resetToken, resetTokenExpires })
        .where(eq(users.email, employee.email!));

      // Create reset link
      const resetLink = `${process.env.VITE_API_BASE_URL}/reset/${resetToken}`;

      // Send password reset email to employee
      sendEmail(
        "resetEmployeePassword", // You'll need to create this email template
        employee?.email!,
        "Reset Employee Account Password",
        {
          name: employee.firstName,
          userName: employee.userName,
          password: employee.password,
          resetLink,
        },
      );

      res.status(201).json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/employees/:id
   * Update an existing employee record by ID.
   *
   * @purpose Modify details of an existing employee
   *
   * @param req - Express Request object. Params: id (employee ID), Body: updated employee details
   * @param res - Express Response object
   * @returns JSON object of the updated employee
   * @throws 404 if employee not found, 500 on internal error
   * @sideEffect None
   *
   * @example fetch('/api/employees/123', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' },
   *   body: JSON.stringify({ firstName: 'Jane', lastName: 'Doe' })
   * })
   *   .then(res => res.json())
   *   .then(updatedEmployee => console.log(updatedEmployee));
   */
  app.put("/api/employees/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const updatedEmployee = await storage.updateEmployee(
        parseInt(req.params.id),
        req.body,
      );

      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(updatedEmployee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * DELETE /api/employees/:id
   * Delete an employee by ID.
   *
   * @purpose Remove an employee record from the system
   *
   * @param req - Express Request object. Params: id (employee ID)
   * @param res - Express Response object
   * @returns 204 No Content on success
   * @throws 404 if employee not found, 500 on internal error
   * @sideEffect Deletes the employee record from the database
   *
   * @example fetch('/api/employees/123', {
   *   method: 'DELETE',
   *   headers: { 'Authorization': 'Bearer <token>' }
   * })
   *   .then(res => console.log(res.status));
   */
  app.delete("/api/employees/:id", isAdminOrBranchAdmin, async (req, res) => {
    console.log("DELETE /api/employees called with ID:", req.params.id); // Add this
    try {
      const employeeId = parseInt(req.params.id);
      console.log("Parsed ID:", employeeId); // Verify parsing

      const deleted = await storage.deleteEmployee(employeeId);
      console.log("Delete result:", deleted); // Check storage result

      if (!deleted) {
        console.log("Employee not found");
        return res.status(404).json({ message: "Employee not found" });
      }

      console.log("Employee deleted successfully");
      return res.sendStatus(204);
    } catch (error: any) {
      console.error("Delete error:", error);
      return res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/employee/reset-password
   * Reset an employee's password using a reset token.
   *
   * @purpose Update an employee's password securely after verifying a token
   *
   * @param req - Express Request object. Body: { token: string, password: string }
   * @param res - Express Response object
   * @returns 200 JSON message "Password reset successful"
   * @throws 400 if token or password missing or invalid, 500 on internal error
   * @sideEffect Updates the employee password in both users and employees tables
   *
   * @example fetch('/api/employee/reset-password', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ token: '<token>', password: 'newPassword123' })
   * })
   *   .then(res => res.json())
   *   .then(result => console.log(result));
   */
  app.post("/api/employee/reset-password", async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    try {
      // Find user with valid reset token
      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.resetToken, token),
            gt(users.resetTokenExpires, new Date()),
          ),
        );

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(password);

      // Update user password and clear reset token
      await db
        .update(users)
        .set({
          password: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
        })
        .where(eq(users.id, user.id));

      // Update employee password (assuming you have an employees table)
      await db
        .update(employees)
        .set({ password })
        .where(eq(employees.userId, user.id));

      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  /**
   * POST /api/employee/send-reset-email
   * Send a password reset email to an existing employee.
   *
   * @purpose Trigger password reset workflow for an employee
   *
   * @param req - Express Request object. Body: { email: string }
   * @param res - Express Response object
   * @returns 200 JSON message "Reset email sent successfully"
   * @throws 400 if email missing, 404 if employee not found, 500 on internal error
   * @sideEffect Sends a password reset email and updates reset token in the database
   *
   * @example fetch('/api/employee/send-reset-email', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' },
   *   body: JSON.stringify({ email: 'employee@example.com' })
   * })
   *   .then(res => res.json())
   *   .then(result => console.log(result));
   */
  app.post(
    "/api/employee/send-reset-email",
    isAdminOrBranchAdmin,
    async (req, res) => {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      try {
        // Find employee by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!user) {
          return res.status(404).json({ message: "Employee not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

        // Update user with reset token
        await db
          .update(users)
          .set({ resetToken, resetTokenExpires })
          .where(eq(users.id, user.id));

        // Get employee details for email
        const [employee] = await db
          .select()
          .from(employees)
          .where(eq(employees.userId, user.id));

        const resetLink = `${process.env.VITE_API_BASE_URL}/reset/${resetToken}`;

        // Send reset email
        sendEmail(
          "resetEmployeePassword",
          email,
          "Reset Employee Account Password",
          {
            name: employee.firstName,
            userName: user.username,
            resetLink,
          },
        );

        res.status(200).json({ message: "Reset email sent successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send reset email" });
      }
    },
  );

  /**
   * PUT /api/employees/:id
   * Update an employee's details by ID.
   *
   * @purpose Modify an employee record in the system
   *
   * @param req - Express Request object. Params: id (employee ID), Body: employee fields to update
   * @param res - Express Response object
   * @returns JSON of the updated employee
   * @throws 404 if employee not found, 500 on internal error
   * @sideEffect Updates employee data in the database
   *
   * @example fetch('/api/employees/123', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' },
   *   body: JSON.stringify({ firstName: 'John', lastName: 'Doe' })
   * })
   *   .then(res => res.json())
   *   .then(employee => console.log(employee));
   */
  app.put("/api/employees/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const updatedEmployee = await storage.updateEmployee(
        parseInt(req.params.id),
        req.body,
      );
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(updatedEmployee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/payrolls
   * Retrieve all payroll records.
   *
   * @purpose Fetch a list of all payrolls
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @returns JSON array of payrolls
   * @throws 500 on internal error
   * @sideEffect Retrieves payroll data from the database
   *
   * @example fetch('/api/payrolls', { headers: { Authorization: 'Bearer <token>' } })
   *   .then(res => res.json())
   *   .then(payrolls => console.log(payrolls));
   */
  app.get("/api/payrolls", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const payrolls = await storage.getPayrolls();
      res.json(payrolls);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/payrolls/employee/:employeeId
   * Retrieve payrolls for a specific employee.
   *
   * @purpose Fetch payroll records filtered by employee
   *
   * @param req - Express Request object. Params: employeeId
   * @param res - Express Response object
   * @returns JSON array of payrolls for the employee
   * @throws 500 on internal error
   * @sideEffect Retrieves payroll data from the database
   *
   * @example fetch('/api/payrolls/employee/123', { headers: { Authorization: 'Bearer <token>' } })
   *   .then(res => res.json())
   *   .then(payrolls => console.log(payrolls));
   */
  app.get(
    "/api/payrolls/employee/:employeeId",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const payrolls = await storage.getPayrollsByEmployee(
          parseInt(req.params.employeeId),
        );
        res.json(payrolls);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/payrolls
   * Create a new payroll record.
   *
   * @purpose Add a new payroll entry to the system
   *
   * @param req - Express Request object. Body: payroll details
   * @param res - Express Response object
   * @returns JSON of the created payroll
   * @throws 500 on internal error
   * @sideEffect Inserts a new payroll record into the database
   *
   * @example fetch('/api/payrolls', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' },
   *   body: JSON.stringify({ employeeId: 123, amount: 5000, month: 'September' })
   * })
   *   .then(res => res.json())
   *   .then(payroll => console.log(payroll));
   */
  app.post("/api/payrolls", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const payroll = await storage.createPayroll(req.body);
      res.status(201).json(payroll);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/payrolls/:id
   * Update a payroll record by ID.
   *
   * @purpose Modify an existing payroll entry
   *
   * @param req - Express Request object. Params: id (payroll ID), Body: payroll fields to update
   * @param res - Express Response object
   * @returns JSON of the updated payroll
   * @throws 404 if payroll not found, 500 on internal error
   * @sideEffect Updates payroll data in the database
   *
   * @example fetch('/api/payrolls/456', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' },
   *   body: JSON.stringify({ amount: 5500 })
   * })
   *   .then(res => res.json())
   *   .then(payroll => console.log(payroll));
   */
  app.put("/api/payrolls/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const updatedPayroll = await storage.updatePayroll(
        parseInt(req.params.id),
        req.body,
      );
      if (!updatedPayroll) {
        return res.status(404).json({ message: "Payroll not found" });
      }
      res.json(updatedPayroll);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/messages
   * Retrieve all messages for the authenticated user.
   *
   * @purpose Fetch both received and sent messages for the logged-in user
   *
   * @param req - Express Request object. Requires authenticated user (req.user)
   * @param res - Express Response object
   * @returns JSON object with `received` and `sent` arrays of messages
   * @throws 401 if user is not authenticated, 500 on internal error
   * @sideEffect None
   *
   * @example fetch('/api/messages', {
   *   headers: { Authorization: 'Bearer <token>' }
   * })
   *   .then(res => res.json())
   *   .then(messages => console.log(messages));
   */
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const receivedMessages = await storage.getMessagesByReceiver(req.user.id);
      const sentMessages = await storage.getMessagesBySender(req.user.id);

      res.json({ received: receivedMessages, sent: sentMessages });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/messages
   * Send a new message from the authenticated user.
   *
   * @purpose Create and store a new message in the system
   *
   * @param req - Express Request object. Body: message details (receiverId, content, etc.). Requires authenticated user (req.user)
   * @param res - Express Response object
   * @returns JSON of the created message
   * @throws 401 if user is not authenticated, 500 on internal error
   * @sideEffect Inserts a new message into the database
   *
   * @example fetch('/api/messages', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' },
   *   body: JSON.stringify({ receiverId: 2, content: 'Hello!' })
   * })
   *   .then(res => res.json())
   *   .then(message => console.log(message));
   */
  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const message = await storage.createMessage({
        ...req.body,
        senderId: req.user.id,
      });
      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/messages/:id/read
   * Mark a specific message as read by the receiver.
   *
   * @purpose Update message status to "read" and set the read timestamp
   *
   * @param req - Express Request object. Params: id (message ID). Requires authenticated user (req.user)
   * @param res - Express Response object
   * @returns JSON of the updated message
   * @throws 401 if user is not authenticated, 403 if user is not the receiver, 404 if message not found, 500 on internal error
   * @sideEffect Updates the `readAt` timestamp and `status` field of the message in the database
   *
   * @example fetch('/api/messages/123/read', {
   *   method: 'PUT',
   *   headers: { Authorization: 'Bearer <token>' }
   * })
   *   .then(res => res.json())
   *   .then(updatedMessage => console.log(updatedMessage));
   */
  app.put("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const message = await storage.getMessage(parseInt(req.params.id));
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only the receiver can mark a message as read
      if (message.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedMessage = await storage.updateMessage(
        parseInt(req.params.id),
        {
          readAt: new Date(),
          status: "read",
        },
      );

      res.json(updatedMessage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/branches
   * Retrieve all branches.
   *
   * @purpose Fetch a list of all branches in the system
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @returns JSON array of branch objects
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/branches', {
   *   headers: { 'Content-Type': 'application/json' }
   * })
   *   .then(res => res.json())
   *   .then(branches => console.log(branches));
   */
  app.get("/api/branches", async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/branches/:id
   * Retrieve a single branch by ID.
   *
   * @purpose Fetch details of a specific branch
   *
   * @param req - Express Request object. Params: id (branch ID)
   * @param res - Express Response object
   * @returns JSON of branch
   * @throws 404 if branch not found, 500 on internal error
   * @sideEffect None
   *
   * @example fetch('/api/branches/1', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(branch => console.log(branch));
   */
  app.get("/api/branches/:id", isAuthenticated, async (req, res) => {
    try {
      const branch = await storage.getBranch(parseInt(req.params.id));
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(branch);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/branches
   * Create a new branch.
   *
   * @purpose Add a new branch to the system
   *
   * @param req - Express Request object. Body: branch details
   * @param res - Express Response object
   * @returns JSON of the created branch
   * @throws 500 on internal error
   * @sideEffect Inserts a new branch record into the database
   *
   * @example fetch('/api/branches', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ name: 'New Branch', location: 'City' })
   * })
   *   .then(res => res.json())
   *   .then(branch => console.log(branch));
   */
  app.post("/api/branches", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const branch = await storage.createBranch(req.body);
      res.status(201).json(branch);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/branches/:id
   * Update an existing branch.
   *
   * @purpose Modify details of a branch
   *
   * @param req - Express Request object. Params: id (branch ID). Body: branch details to update
   * @param res - Express Response object
   * @returns JSON of the updated branch
   * @throws 404 if branch not found, 500 on internal error
   * @sideEffect Updates the branch record in the database
   *
   * @example fetch('/api/branches/1', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ name: 'Updated Branch' })
   * })
   *   .then(res => res.json())
   *   .then(branch => console.log(branch));
   */
  app.put("/api/branches/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const updatedBranch = await storage.updateBranch(
        parseInt(req.params.id),
        req.body,
      );
      if (!updatedBranch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(updatedBranch);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * DELETE /api/branches/:id
   * Delete a branch by ID.
   *
   * @purpose Remove a branch from the system
   *
   * @param req - Express Request object. Params: id (branch ID)
   * @param res - Express Response object
   * @returns 204 status on successful deletion
   * @throws 400 if invalid branch ID, 404 if branch not found, 500 on internal error
   * @sideEffect Deletes the branch record from the database
   *
   * @example fetch('/api/branches/1', {
   *   method: 'DELETE',
   *   headers: { Authorization: 'Bearer ...' }
   * })
   *   .then(res => console.log(res.status));
   */
  app.delete("/api/branches/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid branch ID" });
      }

      const branch = await storage.getBranch(id);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      const deleted = await storage.deleteBranch(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete branch" });
      }

      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/branch_brands
   * Retrieve all branch-brand mappings.
   *
   * @purpose Fetch a list of all branch-brand associations
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @returns JSON array of branch-brand objects
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/branch_brands', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(branchBrands => console.log(branchBrands));
   */
  app.get("/api/branch_brands", isAuthenticated, async (req, res) => {
    try {
      const branchBrands = await storage.getBranchBrands();
      res.json(branchBrands);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/branch_brands
   * Create a new branch-brand mapping.
   *
   * @purpose Add a new association between a branch and a brand
   *
   * @param req - Express Request object. Body: branch-brand details
   * @param res - Express Response object
   * @returns JSON of the created branch-brand object
   * @throws 500 on internal error
   * @sideEffect Inserts a new branch-brand record into the database
   *
   * @example fetch('/api/branch_brands', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ branchId: 1, brandId: 2 })
   * })
   *   .then(res => res.json())
   *   .then(branchBrand => console.log(branchBrand));
   */
  app.post("/api/branch_brands", isAuthenticated, async (req, res) => {
    try {
      const branchBrands = await storage.createBranchBrand(req.body);
      res.status(201).json(branchBrands);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * DELETE /api/branch_brands/:id
   * Delete a branch-brand mapping by ID.
   *
   * @purpose Remove an association between a branch and a brand
   *
   * @param req - Express Request object. Params: id (branch-brand ID)
   * @param res - Express Response object
   * @returns 204 status on successful deletion
   * @throws 400 if invalid ID, 404 if not found, 500 on internal error
   * @sideEffect Deletes the branch-brand record from the database
   *
   * @example fetch('/api/branch_brands/1', {
   *   method: 'DELETE',
   *   headers: { Authorization: 'Bearer ...' }
   * })
   *   .then(res => console.log(res.status));
   */
  app.delete("/api/branch_brands/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid branch-brand ID" });
      }

      const branchBrand = await storage.getBranchBrands();
      if (!branchBrand) {
        return res.status(404).json({ message: "Branch-brand not found" });
      }

      const deleted = await storage.deleteBranchBrand(id);
      if (!deleted) {
        return res
          .status(500)
          .json({ message: "Failed to delete branch-brand" });
      }

      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/student/courses
   * Retrieve all courses for the authenticated student.
   *
   * @purpose Fetch the list of courses the student is enrolled in, including schedule and progress
   *
   * @param req - Express Request object (requires authenticated student)
   * @param res - Express Response object
   * @returns JSON array of course objects with details like name, category, teacher, schedule, duration, progress, and status
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/student/courses', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(courses => console.log(courses));
   */
  app.get(
    "/api/student/courses",
    isAuthenticated,
    isStudent,
    async (req, res) => {
      try {
        // For our mock data, we'll provide sample courses directly for student users
        const courses = [
          {
            id: 1,
            name: "Guitar Lessons",
            category: "music",
            teacherId: 1,
            teacherName: "Sini",
            schedule: "Monday, Wednesday - 4:00 PM to 5:30 PM",
            duration: "12 weeks",
            progress: "Week 3",
            status: "Active",
          },
          {
            id: 2,
            name: "Piano ",
            category: "music",
            teacherId: 2,
            teacherName: "Sarah Wilson",
            schedule: "Tuesday, Friday - 5:00 PM to 6:00 PM",
            duration: "8 weeks",
            progress: "Week 4",
            status: "Active",
          },
          {
            id: 3,
            name: "Gymnastics ",
            category: "dance",
            teacherId: 3,
            teacherName: "Jenet",
            schedule: "Tuesday, Friday - 5:00 PM to 6:00 PM",
            duration: "8 weeks",
            progress: "Week 5",
            status: "Active",
          },
        ];

        res.json(courses);
      } catch (error: any) {
        console.error("Error fetching student courses:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch courses", message: error.message });
      }
    },
  );

  /**
   * GET /api/student/attendance-stats
   * Retrieve attendance statistics for the authenticated student.
   *
   * @purpose Provide overview of the student's attendance (rate, days, present, absent, late, excused)
   *
   * @param req - Express Request object (requires authenticated student)
   * @param res - Express Response object
   * @returns JSON object with attendance statistics
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/student/attendance-stats', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(stats => console.log(stats));
   */
  app.get(
    "/api/student/attendance-stats",
    isAuthenticated,
    isStudent,
    async (req, res) => {
      try {
        // Mock attendance statistics for student view
        const attendanceStats = {
          attendanceRate: "92%",
          attendanceDays: 24,
          present: 22,
          absent: 1,
          late: 1,
          excused: 0,
        };

        res.json(attendanceStats);
      } catch (error: any) {
        console.error("Error fetching attendance stats:", error);
        res.status(500).json({
          error: "Failed to fetch attendance statistics",
          message: error.message,
        });
      }
    },
  );

  /**
   * GET /api/student/upcoming-classes
   * Retrieve upcoming classes for the authenticated student.
   *
   * @purpose Fetch upcoming class schedule for a student, including course, teacher, date, time, and room
   *
   * @param req - Express Request object (requires authenticated student)
   * @param res - Express Response object
   * @returns JSON array of upcoming class objects sorted by date/time
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/student/upcoming-classes', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(classes => console.log(classes));
   */
  app.get(
    "/api/student/upcoming-classes",
    isAuthenticated,
    isStudent,
    async (req, res) => {
      try {
        // Mock upcoming classes data
        const today = new Date();
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const currentDay = today.getDay();

        const upcomingClasses = [
          {
            id: 1,
            courseName: "Guitar Lessons",
            teacherName: "John Smith",
            date: `${dayNames[(currentDay + 1) % 7]}, ${new Date(
              today.getTime() + 86400000,
            ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            time: "4:00 PM - 5:30 PM",
            room: "Studio A",
          },
          {
            id: 1,
            courseName: "Guitar Lessons",
            teacherName: "John Smith",
            date: `${dayNames[(currentDay + 3) % 7]}, ${new Date(
              today.getTime() + 86400000 * 3,
            ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            time: "4:00 PM - 5:30 PM",
            room: "Studio A",
          },
          {
            id: 2,
            courseName: "Music Theory",
            teacherName: "Sarah Wilson",
            date: `${dayNames[(currentDay + 2) % 7]}, ${new Date(
              today.getTime() + 86400000 * 2,
            ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            time: "5:00 PM - 6:00 PM",
            room: "Room 101",
          },
          {
            id: 2,
            courseName: "Music Theory",
            teacherName: "Sarah Wilson",
            date: `${dayNames[(currentDay + 5) % 7]}, ${new Date(
              today.getTime() + 86400000 * 5,
            ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            time: "5:00 PM - 6:00 PM",
            room: "Room 101",
          },
        ];

        // Sort by date/time
        upcomingClasses.sort((a, b) => {
          const dateA = new Date(
            a.date.split(", ")[1] + " " + a.time.split(" - ")[0],
          );
          const dateB = new Date(
            b.date.split(", ")[1] + " " + b.time.split(" - ")[0],
          );
          return dateA.getTime() - dateB.getTime();
        });

        res.json(upcomingClasses);
      } catch (error: any) {
        console.error("Error fetching upcoming classes:", error);
        res.status(500).json({
          error: "Failed to fetch upcoming classes",
          message: error.message,
        });
      }
    },
  );

  /**
   * GET /api/student/payments
   * Retrieve all payments for the authenticated student.
   *
   * @purpose Fetch payment records for a student including invoice ID, course, amount, due date, and status
   *
   * @param req - Express Request object (requires authenticated student)
   * @param res - Express Response object
   * @returns JSON array of payment objects
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/student/payments', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(payments => console.log(payments));
   */
  app.get(
    "/api/student/payments",
    isAuthenticated,
    isStudent,
    async (req, res) => {
      try {
        // Mock payments data for student view
        const today = new Date();
        const nextMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          15,
        );
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          15,
        );

        const payments = [
          {
            id: 101,
            invoiceId: "INV-2023-101",
            courseName: "Guitar Lessons",
            amount: 450.0,
            dueDate: nextMonth.toISOString().split("T")[0],
            status: "Pending",
          },
          {
            id: 100,
            invoiceId: "INV-2023-100",
            courseName: "Guitar Lessons",
            amount: 450.0,
            dueDate: today.toISOString().split("T")[0],
            status: "Paid",
          },
          {
            id: 99,
            invoiceId: "INV-2023-099",
            courseName: "Music Theory",
            amount: 350.0,
            dueDate: lastMonth.toISOString().split("T")[0],
            status: "Paid",
          },
        ];

        res.json(payments);
      } catch (error: any) {
        console.error("Error fetching payments:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch payments", message: error.message });
      }
    },
  );

  /**
   * GET /api/admin/attendance/batch-report
   * Retrieve batch-wise attendance report between specified dates.
   *
   * @purpose Provide attendance statistics for all students in a batch, including counts of present, absent, and leave
   *
   * @param req - Express Request object. Query params: batchId (string), startDate (string), endDate (string)
   * @param res - Express Response object
   * @returns JSON array of objects containing studentId, studentName, present, absent, leave
   * @throws 400 if required query parameters are missing or dates are invalid, 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/admin/attendance/batch-report?batchId=1&startDate=2025-01-01&endDate=2025-01-31', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(report => console.log(report));
   */
  app.get(
    "/api/admin/attendance/batch-report",
    isAuthenticated,
    async (req, res) => {
      try {
        const batchId = req.query.batchId as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        if (!batchId || !startDate || !endDate) {
          return res.status(400).json({ error: "Missing required parameters" });
        }

        // Parse dates
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        // Validate dates
        if (
          isNaN(parsedStartDate.getTime()) ||
          isNaN(parsedEndDate.getTime())
        ) {
          return res.status(400).json({ error: "Invalid date format" });
        }

        const attendanceRecords = await storage.getBatchAttendance(
          parseInt(batchId),
          parsedStartDate,
          parsedEndDate,
        );

        // Get students for this batch
        const enrollments = await storage.getEnrollments();
        const batchEnrollments = enrollments.filter(
          (e) => e.batchId === parseInt(batchId),
        );
        const batchStudents = await storage.getStudents();
        const studentsInBatch = batchStudents.filter((s) =>
          batchEnrollments.some((e) => e.studentId === s.id),
        );

        // Process attendance records by student
        const processedAttendance = studentsInBatch.map((student) => {
          // Convert attendanceRecords to an array if it's not already
          const records = Array.isArray(attendanceRecords)
            ? attendanceRecords
            : [attendanceRecords];

          const studentRecords = records.filter(
            (record) => record.studentId === student.id,
          );
          const present = studentRecords.filter(
            (r) => r.status === "present",
          ).length;
          const absent = studentRecords.filter(
            (r) => r.status === "absent",
          ).length;
          const leave = studentRecords.filter(
            (r) => r.status === "leave",
          ).length;

          return {
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            present,
            absent,
            leave,
          };
        });

        return res.json(processedAttendance);
      } catch (error: any) {
        console.error("Error fetching batch attendance:", error);
        res.status(500).json({
          error: "Failed to fetch batch attendance",
          message: error.message,
        });
      }
    },
  );

  /**
   * GET /api/student/attendance
   * Retrieve mock attendance records for the authenticated student.
   *
   * @purpose Fetch attendance history for a student including course, teacher, date, status, and remarks
   *
   * @param req - Express Request object (requires authenticated student)
   * @param res - Express Response object
   * @returns JSON array of attendance records
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/student/attendance', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(records => console.log(records));
   */
  app.get(
    "/api/student/attendance",
    isAuthenticated,
    isStudent,
    async (req, res) => {
      try {
        // Mock attendance records data
        const today = new Date();
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day

        const attendanceRecords = [
          {
            id: 301,
            date: new Date(today.getTime() - oneDay * 1)
              .toISOString()
              .split("T")[0],
            courseName: "Guitar Lessons",
            teacherName: "Sini",
            status: "present",
            remarks: "",
          },
          {
            id: 300,
            date: new Date(today.getTime() - oneDay * 3)
              .toISOString()
              .split("T")[0],
            courseName: "Gymnastics",
            teacherName: "Jenet",
            status: "present",
            remarks: "",
          },
          {
            id: 299,
            date: new Date(today.getTime() - oneDay * 6)
              .toISOString()
              .split("T")[0],
            courseName: "Zumba",
            teacherName: "Sini",
            status: "Late",
            remarks: "Arrived 10 minutes late",
          },
          {
            id: 298,
            date: new Date(today.getTime() - oneDay * 8)
              .toISOString()
              .split("T")[0],
            courseName: "Gymnastics",
            teacherName: "Jenet",
            status: "present",
            remarks: "",
          },
          {
            id: 297,
            date: new Date(today.getTime() - oneDay * 10)
              .toISOString()
              .split("T")[0],
            courseName: "Guitar Lessons",
            teacherName: "Sini",
            status: "present",
            remarks: "",
          },
          {
            id: 296,
            date: new Date(today.getTime() - oneDay * 12)
              .toISOString()
              .split("T")[0],
            courseName: "Zumba",
            teacherName: "Jenet",
            status: "absent",
            remarks: "Sick",
          },
          {
            id: 295,
            date: new Date(today.getTime() - oneDay * 14)
              .toISOString()
              .split("T")[0],
            courseName: "Gymnastics",
            teacherName: "Jenet",
            status: "present",
            remarks: "",
          },
          {
            id: 294,
            date: new Date(today.getTime() - oneDay * 16)
              .toISOString()
              .split("T")[0],
            courseName: "Guitar Lessons",
            teacherName: "Sini",
            status: "present",
            remarks: "",
          },
        ];

        // Sort attendance records by date (newest first)
        attendanceRecords.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        res.json(attendanceRecords);
      } catch (error: any) {
        console.error("Error fetching attendance records:", error);
        res.status(500).json({
          error: "Failed to fetch attendance records",
          message: error.message,
        });
      }
    },
  );

  /**
   * GET /api/student/attendance (filtered)
   * Retrieve student attendance records filtered by course and month.
   *
   * @purpose Provide detailed attendance records for a student with optional filters by course and month
   *
   * @param req - Express Request object. Query params: course (optional), date (optional in YYYY-MM format)
   * @param res - Express Response object
   * @returns JSON array of enriched attendance records with courseName, teacherName, and batchName
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/student/attendance?course=1&date=2025-10', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(records => console.log(records));
   */
  app.get("/api/student/attendance", isAuthenticated, async (req, res) => {
    try {
      const courseId = req.query.course as string;
      const date = req.query.date as string;

      // Get all enrollments for the student
      const enrollments = await storage.getEnrollments();
      const studentEnrollments = enrollments.filter(
        (e) => e.studentId === req.user!.id,
      );

      // Get all batches
      const batches = await storage.getBatches();

      // Get all attendance records
      let attendance = await storage.getAttendance(req.user!.id);

      // Filter attendance records for the student's enrollments
      attendance = attendance?.filter((a: any) =>
        studentEnrollments.some((e) => e.id === a.enrollmentId),
      );

      // Filter by course if specified
      if (courseId && courseId !== "all") {
        const courseEnrollments = studentEnrollments.filter((e) => {
          const batch = batches.find((b) => b.id === e.batchId);
          return batch?.courseId.toString() === courseId;
        });
        attendance = attendance?.filter((a: any) =>
          courseEnrollments.some((e) => e.id === a.enrollmentId),
        );
      }

      // Filter by month if specified
      if (date) {
        const [year, month] = date.split("-");
        attendance = attendance?.filter((a: any) => {
          const attendanceDate = new Date(a.date);
          return (
            attendanceDate.getFullYear() === parseInt(year) &&
            attendanceDate.getMonth() === parseInt(month) - 1
          );
        });
      }

      // Enrich attendance data with course and teacher info
      const enrichedAttendance = await Promise.all(
        attendance?.map(async (record: any) => {
          const enrollment = studentEnrollments.find(
            (e) => e.id === record.enrollmentId,
          );
          const batch = enrollment
            ? batches.find((b) => b.id === enrollment.batchId)
            : null;
          const course = batch ? await storage.getCourse(batch.courseId) : null;
          const teacher = batch ? await storage.getUser(batch.teacherId) : null;

          return {
            ...record,
            courseName: course?.name || "Unknown Course",
            teacherName: teacher?.fullName || "Unknown Teacher",
            batchName: batch?.name || "Unknown Batch",
          };
        }),
      );

      res.json(enrichedAttendance);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/teacher/batches
   * Retrieve batches assigned to the authenticated teacher.
   *
   * @purpose Fetch all batches for which the authenticated teacher is responsible
   *
   * @param req - Express Request object (requires authenticated teacher)
   * @param res - Express Response object
   * @returns JSON array of batches with course information
   * @throws 404 if teacher record not found, 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/teacher/batches', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(batches => console.log(batches));
   */
  app.get(
    "/api/teacher/batches",
    isAuthenticated,
    isTeacher,
    async (req, res) => {
      try {
        const teacherId = req.user!.id;
        const teacher = await storage.getEmployeeByEmployeeId(
          "EMP00" + teacherId,
        );

        if (!teacher) {
          return res.status(404).json({ message: "Teacher record not found" });
        }

        // Get batches taught by this teacher
        const batches = await storage.getBatchesByTeacher(teacher.id);

        // Augment batches with course info
        const batchesWithCourseInfo = [];

        for (const batch of batches) {
          const course = await storage.getCourse(batch.courseId);
          batchesWithCourseInfo.push({
            ...batch,
            courseName: course ? course.name : "Unknown Course",
            // time: `${batch.startTime} - ${batch.endTime}`
          });
        }

        res.json(batchesWithCourseInfo);
      } catch (error: any) {
        console.error("Error fetching teacher batches:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch batches", message: error.message });
      }
    },
  );

  /**
   * GET /api/teacher/batch/students/:batchId
   * Retrieve all students in a specific batch for the authenticated teacher.
   *
   * @purpose Fetch students enrolled in a batch, ensuring teacher authorization
   *
   * @param req - Express Request object. Params: batchId (batch identifier)
   * @param res - Express Response object
   * @returns JSON array of students in the batch with id, studentId, name, and enrollmentId
   * @throws 403 if teacher does not have permission, 404 if teacher record or batch not found, 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/teacher/batch/students/1', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(students => console.log(students));
   */
  app.get(
    "/api/teacher/batch/students/:batchId",
    isAuthenticated,
    isTeacher,
    async (req, res) => {
      try {
        const teacherId = req.user!.id;
        const teacher = await storage.getEmployeeByEmployeeId(
          "EMP00" + teacherId,
        );

        if (!teacher) {
          return res.status(404).json({ message: "Teacher record not found" });
        }

        const batchId = parseInt(req.params.batchId);

        // Verify this teacher teaches this batch
        const batch = await storage.getBatch(batchId);
        if (!batch || batch.teacherId !== teacher.id) {
          return res.status(403).json({
            message: "You do not have permission to access this batch",
          });
        }

        // Get students in this batch
        const enrollments = await storage.getEnrollmentsByBatch(batchId);
        const students = [];

        for (const enrollment of enrollments) {
          const student = await storage.getStudent(enrollment.studentId);
          if (student) {
            // Use the student's id if userId doesn't exist
            const user = await storage.getUser(student.id);
            students.push({
              id: student.id,
              studentId: student.studentId,
              name: user ? user.fullName : "Unknown Student",
              enrollmentId: enrollment.id,
            });
          }
        }

        res.json(students);
      } catch (error: any) {
        console.error("Error fetching batch students:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch students", message: error.message });
      }
    },
  );

  /**
   * GET /api/teacher/attendance
   * Retrieve attendance records for a teacher's batch on a specified date.
   *
   * @purpose Allow teachers to view attendance for their assigned batch
   *
   * @param req - Express Request object. Query params: batchId (required), date (optional)
   * @param res - Express Response object
   * @returns JSON array of attendance records with studentId, studentName, date, and status
   * @throws 403 if teacher does not have permission, 404 if teacher record not found, 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/teacher/attendance?batchId=1&date=2025-10-06', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(records => console.log(records));
   */
  app.get(
    "/api/teacher/attendance",
    isAuthenticated,
    isTeacher,
    async (req, res) => {
      try {
        const teacherId = req.user!.id;
        const teacher = await storage.getEmployeeByEmployeeId(
          "EMP00" + teacherId,
        );

        if (!teacher) {
          return res.status(404).json({ message: "Teacher record not found" });
        }

        const { batchId, date } = req.query;

        if (!batchId || batchId === "all") {
          return res.json([]);
        }

        // Verify this teacher teaches this batch
        const batch = await storage.getBatch(parseInt(batchId as string));
        if (!batch || batch.teacherId !== teacher.id) {
          return res.status(403).json({
            message: "You do not have permission to access this batch",
          });
        }

        // Parse date
        const selectedDate = date ? new Date(date as string) : new Date();

        // Get enrollments for this batch
        const enrollments = await storage.getEnrollmentsByBatch(
          parseInt(batchId as string),
        );

        // Get attendance records for the specified date
        const allAttendanceRecords =
          await storage.getAttendanceByDate(selectedDate);

        // Filter attendance records for this batch's enrollments
        const attendanceRecords = [];

        for (const enrollment of enrollments) {
          const records = allAttendanceRecords.filter(
            (a: any) => a.enrollmentId === enrollment.id,
          );

          for (const record of records) {
            const student = await storage.getStudent(enrollment.studentId);
            if (student) {
              // Use the student's id if userId doesn't exist
              const user = await storage.getUser(student.id);
              attendanceRecords.push({
                id: record.id,
                // enrollmentId: record.enrollmentId,
                studentId: student.id,
                studentName: user ? user.fullName : "Unknown Student",
                date: record.date,
                status: record.status,
                // remarks: record.remarks,
              });
            }
          }
        }

        res.json(attendanceRecords);
      } catch (error: any) {
        console.error("Error fetching attendance records:", error);
        res.status(500).json({
          error: "Failed to fetch attendance records",
          message: error.message,
        });
      }
    },
  );

  /**
   * GET /api/payments
   * Retrieve all payments/invoices with student names.
   *
   * @purpose Allow admins to view all payments and associated student information
   *
   * @param req - Express Request object (requires authentication)
   * @param res - Express Response object
   * @returns JSON array of payments including studentName
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/payments', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(payments => console.log(payments));
   */
  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      const formattedPayments = [];

      for (const payment of payments) {
        const student = await storage.getStudent(payment.studentId);
        let studentName = `Student #${payment.studentId}`;

        if (student) {
          // Use the student's id if userId doesn't exist
          const user = await storage.getUser(student.id);
          if (user) {
            studentName = user.fullName;
          }
        }

        formattedPayments.push({
          ...payment,
          studentName,
        });
      }

      res.json(formattedPayments);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch payments", message: error.message });
    }
  });

  /**
   * POST /api/payments
   * Create a new payment record.
   *
   * @purpose Allow admins to create payments/invoices for students
   *
   * @param req - Express Request object. Body: payment details (studentId, amount, invoiceId, status, etc.)
   * @param res - Express Response object
   * @returns JSON of the newly created payment
   * @throws 500 on internal server error
   * @sideEffect Adds a new payment record to the database
   *
   * @example fetch('/api/payments', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ studentId: 1, amount: 500, invoiceId: 'INV-001', status: 'Pending' })
   * })
   *   .then(res => res.json())
   *   .then(payment => console.log(payment));
   */
  app.post("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const payment = await storage.createPayment(req.body);
      res.status(201).json(payment);
    } catch (error: any) {
      console.error("Error creating payment:", error);
      res
        .status(500)
        .json({ error: "Failed to create payment", message: error.message });
    }
  });

  /**
   * PUT /api/payments/:id
   * Update an existing payment record.
   *
   * @purpose Allow admins to modify details of an existing payment
   *
   * @param req - Express Request object. Params: id (payment ID), Body: updated payment data
   * @param res - Express Response object
   * @returns JSON of the updated payment
   * @throws 404 if payment not found, 500 on internal server error
   * @sideEffect Updates an existing payment record in the database
   *
   * @example fetch('/api/payments/101', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ amount: 550, status: 'Paid' })
   * })
   *   .then(res => res.json())
   *   .then(updatedPayment => console.log(updatedPayment));
   */
  app.put("/api/payments/:id", isAuthenticated, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const updatedPayment = await storage.updatePayment(paymentId, req.body);

      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json(updatedPayment);
    } catch (error: any) {
      console.error("Error updating payment:", error);
      res
        .status(500)
        .json({ error: "Failed to update payment", message: error.message });
    }
  });

  /**
   * GET /api/studentPayments
   * Retrieve all student payments.
   *
   * @purpose Allow admin or branch admin to view student payments
   *
   * @param req - Express Request object (requires authentication as admin or branch admin)
   * @param res - Express Response object
   * @returns JSON array of student payments
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/studentPayments', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(payments => console.log(payments));
   */
  app.get("/api/studentPayments", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const payments = await storage.getStudentPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/studentPayments
   * Create a new student payment record.
   *
   * @purpose Allow admin or branch admin to add a new payment for a student
   *
   * @param req - Express Request object. Body: payment details (single invoiceNumber, amount, studentId, etc.)
   * @param res - Express Response object
   * @returns JSON of the newly created student payment
   * @throws 400 if invoiceNumber is an array, 500 on internal server error
   * @sideEffect Adds a new student payment record to the database
   *
   * @example fetch('/api/studentPayments', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ invoiceNumber: 'INV-101', studentId: 1, amount: 450, status: 'Pending' })
   * })
   *   .then(res => res.json())
   *   .then(payment => console.log(payment));
   */
  app.post("/api/studentPayments", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const requestData = req.body;

      if (Array.isArray(requestData.invoiceNumber)) {
        return res.status(400).json({
          message:
            "This endpoint only accepts a single invoiceNumber string, not an array. The client should loop and make multiple requests.",
        });
      }
      const paymentId = await storage.generatePaymentId();
      const paymentData = {
        ...req.body,
        paymentId,
      };
      const payment = await storage.createStudentPayment(paymentData);
      res.status(201).json(payment);
    } catch (error: any) {
      console.error("Error creating student payment:", error);
      res.status(500).json({
        error: "Failed to create student payment",
        message: error.message,
      });
    }
  });

  /**
   * GET /api/generate-payment-id
   * Generate a new unique payment ID.
   *
   * @purpose Provide a new payment ID for creating student payments
   *
   * @param req - Express Request object (requires authentication as admin or branch admin)
   * @param res - Express Response object
   * @returns JSON with a generated paymentId
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/generate-payment-id', {
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' }
   * })
   *   .then(res => res.json())
   *   .then(data => console.log(data.paymentId));
   */
  app.get(
    "/api/generate-payment-id",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const paymentId = await storage.generatePaymentId();
        res.json({ paymentId });
      } catch (error: any) {
        res.status(500).json({
          message: "Failed to generate payment ID",
          error: error.message,
        });
      }
    },
  );

  /**
   * PUT /api/studentPayments/:id
   * Update an existing student payment record.
   *
   * @purpose Allow admin or branch admin to modify an existing student payment
   *
   * @param req - Express Request object. Params: id (student payment ID), Body: updated payment data
   * @param res - Express Response object
   * @returns JSON of the updated student payment
   * @throws 404 if student payment not found, 500 on internal server error
   * @sideEffect Updates an existing student payment record in the database
   *
   * @example fetch('/api/studentPayments/101', {
   *   method: 'PUT',
   *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
   *   body: JSON.stringify({ amount: 500, status: 'Paid' })
   * })
   *   .then(res => res.json())
   *   .then(updatedPayment => console.log(updatedPayment));
   */
  app.put(
    "/api/studentPayments/:id",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const paymentId = parseInt(req.params.id);
        const updatedPayment = await storage.updateStudentPayment(
          paymentId,
          req.body,
        );

        if (!updatedPayment) {
          return res.status(404).json({ message: "Payment not found" });
        }

        res.json(updatedPayment);
      } catch (error: any) {
        console.error("Error updating student payment:", error);
        res.status(500).json({
          error: "Failed to update student payment",
          message: error.message,
        });
      }
    },
  );

  /**
   * DELETE /api/studentPayments/:id
   * Delete a specific student payment record.
   *
   * @purpose Allow admin or branch admin to remove a student payment
   *
   * @param req - Express Request object. Params: id (student payment ID)
   * @param res - Express Response object
   * @returns JSON of deleted payment if successful
   * @throws 404 if payment not found, 500 on internal server error
   * @sideEffect Deletes a student payment record from the database
   *
   * @example fetch('/api/studentPayments/101', {
   *   method: 'DELETE',
   *   headers: { Authorization: 'Bearer ...' }
   * }).then(res => res.json()).then(deletedPayment => console.log(deletedPayment));
   */
  app.delete(
    "/api/studentPayments/:id",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const paymentId = parseInt(req.params.id);
        const deletedPayment = await storage.deleteStudentPayment(paymentId);

        if (!deletedPayment) {
          return res.status(404).json({ message: "Payment not found" });
        }

        res.json(deletedPayment);
      } catch (error: any) {
        console.error("Error deleting student payment:", error);
        res.status(500).json({
          error: "Failed to delete student payment",
          message: error.message,
        });
      }
    },
  );

  /**
   * GET /api/unpaidInvoices
   * Retrieve all unpaid invoices for all students.
   *
   * @purpose Allow admin or branch admin to view unpaid invoices
   *
   * @param req - Express Request object (requires admin/branch admin authentication)
   * @param res - Express Response object
   * @returns JSON array of unpaid invoices
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/unpaidInvoices', {
   *   headers: { Authorization: 'Bearer ...' }
   * }).then(res => res.json()).then(invoices => console.log(invoices));
   */
  app.get("/api/unpaidInvoices", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const unpaidInvoices = await storage.getUnpaidInvoices();
      res.json(unpaidInvoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/unpaidInvoicesByStudent/:studentId
   * Retrieve unpaid invoices for a specific student.
   *
   * @purpose Allow authenticated users to view unpaid invoices for their own or others (depending on role)
   *
   * @param req - Express Request object. Params: studentId
   * @param res - Express Response object
   * @returns JSON array of unpaid invoices for the student
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/unpaidInvoicesByStudent/1', {
   *   headers: { Authorization: 'Bearer ...' }
   * }).then(res => res.json()).then(invoices => console.log(invoices));
   */
  app.get(
    "/api/unpaidInvoicesByStudent/:studentId",
    isAuthenticated,
    async (req, res) => {
      try {
        const studentId = parseInt(req.params.studentId);
        const unpaidInvoices =
          await storage.getUnpaidInvoicesByStudent(studentId);
        res.json(unpaidInvoices);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/outstandingSummary/:studentId
   * Retrieve a summary of outstanding payments for a specific student.
   *
   * @purpose Allow admin or branch admin to see total outstanding amounts, unpaid invoices, etc.
   *
   * @param req - Express Request object. Params: studentId
   * @param res - Express Response object
   * @returns JSON object summarizing the student’s outstanding payments
   * @throws 500 on internal server error
   * @sideEffect None
   *
   * @example fetch('/api/outstandingSummary/1', {
   *   headers: { Authorization: 'Bearer ...' }
   * }).then(res => res.json()).then(summary => console.log(summary));
   */
  app.get(
    "/api/outstandingSummary/:studentId",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const studentId = parseInt(req.params.studentId);
        const outstandingSummary =
          await storage.getOutstandingSummary(studentId);
        res.json(outstandingSummary);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * GET /api/creditNotes
   * Retrieve all credit notes.
   *
   * @purpose Allow admin or branch admin to view all credit notes
   *
   * @param req - Express Request object (requires admin/branch admin authentication)
   * @param res - Express Response object
   * @returns JSON array of credit notes
   * @throws 500 on internal server error
   * @sideEffects None (read-only)
   *
   * @example
   * fetch("/api/creditNotes", { headers: { Authorization: "Bearer <token>" } })
   *   .then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.get("/api/creditNotes", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const creditNotes = await storage.getCreditNotes();
      res.json(creditNotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/creditNotes/:id
   * Retrieve a specific credit note by its credit note number.
   *
   * @purpose Allow authenticated users to fetch details of a specific credit note
   *
   * @param req.params.id - Credit note number
   * @param req.query.status - Optional comma-separated list of statuses (e.g., "approved,pending")
   * @returns JSON of the credit note
   * @throws 404 if credit note not found, 500 on internal server error
   * @sideEffects None (read-only)
   *
   * @example
   * fetch("/api/creditNotes/CN-2023-101", { headers: { Authorization: "Bearer <token>" } })
   *   .then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.get("/api/creditNotes/:id", isAuthenticated, async (req, res) => {
    try {
      const creditNote = await storage.getCreditNoteByCreditNoteNumber(
        req.params.id,
      );
      if (!creditNote) {
        return res.status(404).json({ message: "Credit note not found" });
      }
      res.json(creditNote);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/creditNotes/parent/:parentId
   * Retrieve credit notes for a parent, optionally filtered by status.
   *
   * @purpose Allow authenticated users to fetch credit notes linked to a parent
   *
   * @param req.params.parentId - Parent ID
   * @param req.query.status - Optional comma-separated list of statuses (e.g., "approved,pending")
   * @returns JSON array of credit notes
   * @throws 400 if parentId invalid, 500 on internal server error
   * @sideEffects None (read-only)
   *
   * @example
   * fetch("/api/creditNotes/parent/12?status=approved,pending", { headers: { Authorization: "Bearer <token>" } })
   *   .then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.get(
    "/api/creditNotes/parent/:parentId",
    isAuthenticated,
    async (req, res) => {
      const parentId = parseInt(req.params.parentId, 10);

      if (isNaN(parentId)) {
        return res.status(400).json({ error: "Invalid parent ID" });
      }

      const statusParam = req.query.status;
      let statuses: string[] | undefined;
      if (typeof statusParam === "string") {
        statuses = statusParam.split(",");
      }

      try {
        const creditNotes = await storage.getCreditNotesByParentId(
          parentId,
          statuses,
        );
        res.status(200).json(creditNotes);
      } catch (error) {
        console.error("Error fetching credit notes:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  /**
   * POST /api/creditNotes
   * Create a new credit note.
   *
   * @purpose Allow admin or branch admin to create a credit note
   *
   * @param req.body - Credit note details (e.g., parentId, amount, status)
   * @param req.query.status - Optional comma-separated list of statuses (e.g., "approved,pending")
   * @returns JSON of the newly created credit note
   * @throws 500 on internal server error
   * @sideEffects Creates a record in the creditNotes table
   *
   * @example
   * fetch("/api/creditNotes", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json", Authorization: "Bearer <token>" },
   *   body: JSON.stringify({ parentId: 12, amount: 200, status: "pending" })
   * }).then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.post("/api/creditNotes", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const creditNote = await storage.createCreditNote(req.body);
      res.status(201).json(creditNote);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/paymentItems
   * Create a new payment item.
   *
   * @purpose Allow admin or branch admin to add a payment item
   *
   * @param req.body - Payment item details (e.g., name, amount, description)
   * @param req.query.status - Optional comma-separated list of statuses (e.g., "approved,pending")
   * @returns JSON of the newly created payment item
   * @throws 500 on internal server error
   * @sideEffects Creates a record in the paymentItems table
   *
   * @example
   * fetch("/api/paymentItems", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json", Authorization: "Bearer <token>" },
   *   body: JSON.stringify({ name: "Registration Fee", amount: 100 })
   * }).then(res => res.json())
   *   .then(data => console.log(data));
   */
  app.post("/api/paymentItems", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const paymentItem = await storage.createPaymentItem(req.body);
      res.status(201).json(paymentItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/logout
   * Log the user out of the session.
   *
   * @purpose Allow users to safely log out
   *
   * @param req - Express Request object (requires authentication)
   * @param res - Express Response object
   * @param next - Express NextFunction object
   * @returns 200 OK if logout successful
   * @throws Passes error to next middleware if logout fails
   * @sideEffects Ends the user session
   *
   * @example
   * fetch("/api/logout", { method: "POST", credentials: "include" })
   *   .then(res => console.log(res.status));
   */
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  /**
   * GET /api/users
   * Retrieve all users.
   *
   * @purpose Allow admin/branch admin to view all users
   *
   * @param req - Express Request object (requires authentication)
   * @param res - Express Response object
   * @returns JSON array of users
   * @throws 500 on internal server error
   * @sideEffects None (read-only)
   *
   * @example
   * fetch("/api/users", { headers: { Authorization: "Bearer <token>" } })
   *   .then(res => res.json())
   *   .then(users => console.log(users));
   */
  app.get("/api/users", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/users/:id
   * Retrieve a specific user by ID.
   *
   * @purpose Allow admin/branch admin to view a user
   *
   * @param req.params.id - User ID
   * @param res - Express Response object
   * @returns JSON of user
   * @throws 404 if user not found, 500 on internal server error
   * @sideEffects None (read-only)
   *
   * @example
   * fetch("/api/users/5", { headers: { Authorization: "Bearer <token>" } })
   *   .then(res => res.json())
   *   .then(user => console.log(user));
   */
  app.get("/api/users/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/users
   * Create a new user.
   *
   * @purpose Allow admin/branch admin to create a user
   *
   * @param req.body - User details (username, email, password, fullName, role, etc.)
   * @returns JSON of newly created user
   * @throws 400 if username already exists, 500 on internal server error
   * @sideEffects Creates a record in the users table
   *
   * @example
   * fetch("/api/users", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json", Authorization: "Bearer <token>" },
   *   body: JSON.stringify({ username: "jdoe", email: "jdoe@example.com", password: "123456", fullName: "John Doe", role: "teacher" })
   * }).then(res => res.json())
   *   .then(user => console.log(user));
   */
  app.post("/api/users", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const { username, email, password, fullName, role } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash the password before storing
      const hashedPassword = await hashPassword(password);

      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        fullName,
        role: role || "student",
        address: req.body.address || null,
        phone: req.body.phone || null,
        branch: req.body.branch || null,
        // profilePicture: req.body.profilePicture || null
      });

      res.status(201).json(newUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * PUT /api/users/:id
   * Update an existing user.
   *
   * @purpose Allow admin/branch admin to update user details
   *
   * @param req.params.id - User ID
   * @param req.body - Fields to update (fullName, role, address, etc.)
   * @returns JSON of updated user
   * @throws 404 if user not found, 500 on internal server error
   * @sideEffects Updates user record in the database
   *
   * @example
   * fetch("/api/users/5", {
   *   method: "PUT",
   *   headers: { "Content-Type": "application/json", Authorization: "Bearer <token>" },
   *   body: JSON.stringify({ fullName: "Jane Doe", role: "student" })
   * }).then(res => res.json())
   *   .then(user => console.log(user));
   */
  app.put("/api/users/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(userId, req.body);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * DELETE /api/users/:id
   * Delete a user.
   *
   * @purpose Allow admin/branch admin to delete a user
   *
   * @param req.params.id - User ID
   * @returns JSON message on successful deletion
   * @throws 400 if attempting to delete own account, 404 if user not found, 500 on internal server error
   * @sideEffects Removes user record from the database
   *
   * @example
   * fetch("/api/users/5", { method: "DELETE", headers: { Authorization: "Bearer <token>" } })
   *   .then(res => res.json())
   *   .then(response => console.log(response));
   */
  app.delete("/api/users/:id", isAdminOrBranchAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      // Prevent deleting own account
      if (req.user && req.user.id === userId) {
        return res
          .status(400)
          .json({ message: "Cannot delete your own account" });
      }

      const success = await storage.deleteUser(userId);

      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * POST /api/reset-password/:id
   * Reset a user's password.
   *
   * @purpose Allow admin/branch admin to reset a user's password
   *
   * @param req.params.id - User ID
   * @param req.body.newPassword - New password
   * @returns JSON message on successful password reset
   * @throws 400 if newPassword not provided, 404 if user not found, 500 on internal server error
   * @sideEffects Updates the user's password in the database (hashed)
   *
   * @example
   * fetch("/api/reset-password/5", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json", Authorization: "Bearer <token>" },
   *   body: JSON.stringify({ newPassword: "newSecurePassword123" })
   * }).then(res => res.json())
   *   .then(response => console.log(response));
   */
  app.post(
    "/api/reset-password/:id",
    isAdminOrBranchAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const { newPassword } = req.body;

        if (!newPassword) {
          return res.status(400).json({ message: "New password is required" });
        }

        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = await hashPassword(newPassword);
        const updated = await storage.updateUserPassword(
          user.username,
          hashedPassword,
        );

        if (!updated) {
          return res.status(500).json({ message: "Failed to update password" });
        }

        res.json({ message: "Password reset successfully" });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  /**
   * POST /api/change-password
   * Allows an authenticated user to change their password.
   *
   * @purpose Security: Enable users to update their password
   *
   * @param req.body.currentPassword - User's current password
   * @param req.body.newPassword - New password to set
   * @returns JSON message indicating success
   * @throws 400 if required fields are missing
   * @throws 401 if current password is incorrect
   * @throws 500 on internal server error
   * @sideEffects Updates the user's password in the database (hashed)
   *
   * @example
   * fetch("/api/change-password", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json", Authorization: "Bearer <token>" },
   *   body: JSON.stringify({ currentPassword: "oldPass123", newPassword: "newPass456" })
   * }).then(res => res.json())
   *   .then(response => console.log(response));
   */
  app.post("/api/change-password", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Current password and new password are required" });
      }

      // Verify current password
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      // Update to new password
      const hashedPassword = await hashPassword(newPassword);
      const updated = await storage.updateUserPassword(
        user.username,
        hashedPassword,
      );

      if (!updated) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * GET /api/roles/:roleName
   * Fetch details of a role by its name.
   *
   * @purpose Role management: Retrieve role details including permissions
   *
   * @param req.params.roleName - Role name
   * @returns JSON of role data
   * @throws 404 if role not found
   * @throws 500 on internal server error
   * @sideEffects None (read-only)
   *
   * @example
   * fetch("/api/roles/admin")
   *   .then(res => res.json())
   *   .then(role => console.log(role));
   */
  app.get("/api/roles/:roleName", async (req, res) => {
    try {
      const { roleName } = req.params;
      const roleData = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleName))
        .limit(1);

      if (roleData.length === 0) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(roleData[0]); // Send back the role data
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  /**
   * POST /api/roles
   * Create a new role with optional permissions.
   *
   * @purpose Role management: Allow creation of new roles
   *
   * @param req.body.name - Role name (required)
   * @param req.body.description - Role description (optional)
   * @param req.body.permissions - Object defining role permissions (optional)
   * @returns JSON message indicating success
   * @throws 400 if name is missing or invalid
   * @throws 409 if role with this name already exists
   * @throws 500 on internal server error
   * @sideEffects Inserts a new role record into the database
   *
   * @example
   * fetch("/api/roles", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify({ name: "teacher", description: "Teacher role", permissions: { viewCourses: true, editGrades: true } })
   * }).then(res => res.json())
   *   .then(response => console.log(response));
   */
  app.post("/api/roles", async (req, res) => {
    try {
      const { name, description, permissions } = req.body;

      // Basic validation
      if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
          message: "Role 'name' is required and must be a non-empty string.",
        });
      }

      // Check if role with this name already exists
      const existing = await db
        .select()
        .from(roles)
        .where(eq(roles.name, name));
      if (existing.length > 0) {
        return res
          .status(409)
          .json({ message: "A role with this name already exists." });
      }

      await db.insert(roles).values({
        id: name,
        name: name,
        permissions: permissions || {},
      });

      res.status(201).json({
        success: true,
        message: `Role '${name}' created successfully.`,
      });
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role." });
    }
  });

  /**
   * PUT /api/roles/:roleName/permissions
   * Update permissions for a specific role.
   *
   * @purpose Role management: Modify permissions for an existing role
   *
   * @param req.params.roleName - Role name
   * @param req.body.permissions - Object defining new permissions
   * @returns JSON success message
   * @throws None
   * @sideEffects Updates the permissions field of the role in the database
   *
   * @example
   * fetch("/api/roles/teacher/permissions", {
   *   method: "PUT",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify({ viewCourses: true, editGrades: false })
   * }).then(res => res.json())
   *   .then(response => console.log(response));
   */
  app.put("/api/roles/:roleName/permissions", async (req, res) => {
    const { roleName } = req.params;
    const { permissions } = req.body;

    await db.update(roles).set({ permissions }).where(eq(roles.name, roleName));

    res.json({ success: true });
  });

  /**
   * @purpose Generates a styled table in a PDF document using PDFKit.
   *
   * @param {PDFKit.PDFDocument} doc - The PDF document instance to draw on.
   * @param {Object} table - Table data.
   * @param {string[]} table.headers - Array of column headers.
   * @param {any[][]} table.rows - Array of rows, each row is an array of cell values.
   * @param {Object} config - Optional configuration object (e.g., column widths, colors, styles).
   *
   * @returns {void} This function does not return a value.
   * @throws Will throw an error if PDFKit drawing operations fail.
   * @sideEffects
   * - Modifies the `doc` object by drawing headers, rows, borders, and summary rows.
   * - Adds new pages if table content exceeds current page height.
   * - Updates `doc.y` to leave space after the table for further content.
   * - Colors rows and cell text based on content (e.g., paid/unpaid/partially_paid).
   *
   * @example
   * import PDFDocument from 'pdfkit';
   * import fs from 'fs';
   *
   * const doc = new PDFDocument();
   * doc.pipe(fs.createWriteStream('output.pdf'));
   *
   * const table = {
   *   headers: ['Invoice', 'Student', 'Amount', 'Status'],
   *   rows: [
   *     ['INV-101', 'Alice', 450, 'Paid'],
   *     ['INV-102', 'Bob', 350, 'Unpaid'],
   *     ['INV-103', 'Charlie', 500, 'Partially_Paid'],
   *   ]
   * };
   *
   * generateTable(doc, table, {});
   * doc.end();
   */
  function generateTable(
    doc: PDFKit.PDFDocument,
    table: { headers: string[]; rows: any[][] },
    config: any,
  ) {
    const tableTop = doc.y;
    const { headers, rows } = table;
    const columnCount = headers.length;
    const rowHeight = 25;
    const headerHeight = 35;
    const tableWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const columnWidth = tableWidth / columnCount;

    // Track current position
    let currentY = tableTop;

    // Draw table header
    drawTableHeader(
      doc,
      headers,
      currentY,
      tableWidth,
      headerHeight,
      columnWidth,
    );
    currentY += headerHeight;

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Check if we need a new page (leave space for footer)
      if (currentY + rowHeight > doc.page.height - 150) {
        doc.addPage();
        currentY = doc.page.margins.top; // Reset to top margin of new page

        // Redraw table header on new page
        drawTableHeader(
          doc,
          headers,
          currentY,
          tableWidth,
          headerHeight,
          columnWidth,
        );
        currentY += headerHeight;
      }

      const y = currentY;
      const isEvenRow = i % 2 === 0;

      // Alternating row colors
      if (isEvenRow) {
        doc
          .rect(doc.page.margins.left, y, tableWidth, rowHeight)
          .fill("#FFFFFF");
      } else {
        doc
          .rect(doc.page.margins.left, y, tableWidth, rowHeight)
          .fill("#F5F5F5");
      }

      // Add subtle row borders
      doc
        .strokeColor("#E0E0E0")
        .lineWidth(0.3)
        .moveTo(doc.page.margins.left, y + rowHeight)
        .lineTo(doc.page.margins.left + tableWidth, y + rowHeight)
        .stroke();

      // Draw cell data
      row.forEach((cell, j) => {
        const x = doc.page.margins.left + j * columnWidth;

        // Add subtle vertical separators
        if (j > 0) {
          doc
            .strokeColor("#F0F0F0")
            .lineWidth(0.3)
            .moveTo(x, y)
            .lineTo(x, y + rowHeight)
            .stroke();
        }

        // Format cell content with appropriate colors
        let cellText = String(cell);
        let textColor = "#333333";
        let alignment = "center";

        // Color coding based on content
        if (cellText.toLowerCase().includes("unpaid")) {
          textColor = "#F44336"; // Red for unpaid
        } else if (
          cellText.toLowerCase().includes("paid") &&
          !cellText.toLowerCase().includes("unpaid")
        ) {
          textColor = "#4CAF50"; // Green for paid
        } else if (cellText.toLowerCase().includes("partially_paid")) {
          textColor = "#FF9800"; // Orange for partially paid
        }

        // Align numbers to center, text to center
        if (
          !isNaN(Number(cell)) ||
          cellText.includes("-") ||
          cellText.includes("/")
        ) {
          alignment = "center";
        }

        doc
          .fillColor(textColor)
          .font("Helvetica")
          .text(cellText, x + 5, y + 8, {
            width: columnWidth - 10,
            align: alignment,
            ellipsis: true,
          });
      });

      currentY += rowHeight;
    }

    // Calculate sums for numeric columns
    const { numericColumns, sums } = calculateSums(rows, headers);

    // Add summary row if there are sums
    if (numericColumns.length > 0) {
      // Check if we need a new page for the summary
      if (currentY + rowHeight > doc.page.height - 150) {
        doc.addPage();
        currentY = doc.page.margins.top;

        // Redraw table header on new page for consistency
        drawTableHeader(
          doc,
          headers,
          currentY,
          tableWidth,
          headerHeight,
          columnWidth,
        );
        currentY += headerHeight;
      }

      // Add summary row with different styling
      const summaryY = currentY;
      doc
        .rect(doc.page.margins.left, summaryY, tableWidth, rowHeight)
        .fill([224, 224, 224]); // Light gray background

      doc
        .strokeColor("#BDBDBD")
        .lineWidth(0.5)
        .rect(doc.page.margins.left, summaryY, tableWidth, rowHeight)
        .stroke();

      // Add "TOTAL" label in first column
      doc
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text("TOTAL", doc.page.margins.left + 5, summaryY + 8, {
          width: columnWidth - 10,
          align: "left",
        });

      // Add sums to numeric columns
      headers.forEach((_, i) => {
        const x = doc.page.margins.left + i * columnWidth;

        if (numericColumns.includes(i)) {
          doc
            .fillColor("#000000")
            .font("Helvetica-Bold")
            .text(sums[i].toFixed(2), x + 5, summaryY + 8, {
              width: columnWidth - 10,
              align: "center",
            });
        }
      });

      currentY += rowHeight;
    }

    // Add table border
    doc
      .strokeColor("#3F51B5")
      .lineWidth(1)
      .rect(doc.page.margins.left, tableTop, tableWidth, currentY - tableTop)
      .stroke();

    // Move the doc's y position below the table
    doc.y = currentY + 30;
  }

  /**
   * @purpose Draws the table header row in a PDF document with styling.
   *
   * @param {PDFKit.PDFDocument} doc - The PDF document instance to draw on.
   * @param {string[]} headers - Array of header titles for each column.
   * @param {number} y - The Y-coordinate to start drawing the header.
   * @param {number} tableWidth - Total width of the table.
   * @param {number} headerHeight - Height of the header row.
   * @param {number} columnWidth - Width of each column.
   *
   * @returns {void} This function does not return a value.
   * @throws Will throw an error if PDFKit drawing operations fail.
   * @sideEffects
   * - Modifies the `doc` object by drawing header background, text, and vertical separators.
   * - Updates the visual styling (colors, font, alignment) of the table header.
   *
   * @example
   * drawTableHeader(doc, ['Invoice', 'Student', 'Amount', 'Status'], 50, 500, 35, 125);
   */
  function drawTableHeader(
    doc: PDFKit.PDFDocument,
    headers: string[],
    y: number,
    tableWidth: number,
    headerHeight: number,
    columnWidth: number,
  ) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#FFFFFF");

    // Draw header background
    doc
      .rect(doc.page.margins.left, y, tableWidth, headerHeight)
      .fill([63, 81, 181]);

    // Draw header text
    headers.forEach((header, i) => {
      const x = doc.page.margins.left + i * columnWidth;

      // Add vertical separators in header
      if (i > 0) {
        doc
          .strokeColor("#FFFFFF")
          .lineWidth(0.5)
          .moveTo(x, y + 5)
          .lineTo(x, y + headerHeight - 5)
          .stroke();
      }

      doc.fillColor("#FFFFFF").text(header, x + 8, y + 12, {
        width: columnWidth - 16,
        align: "center",
        ellipsis: true,
      });
    });
  }

  /**
   * @purpose Calculates sums for numeric columns in a table.
   *
   * @param {any[][]} rows - Array of table rows, each row is an array of cell values.
   * @param {string[]} columns - Array of column headers (used to identify columns).
   * @returns {{ numericColumns: number[], sums: { [key: number]: number } }}
   *   - `numericColumns`: Array of column indexes that contain numeric data.
   *   - `sums`: Object mapping numeric column index to its total sum.
   * @throws Will throw an error if input data is not a valid array.
   * @sideEffects
   * - Does not modify the original `rows` array.
   * - Performs numeric detection and summation of the table data.
   *
   * @example
   * const rows = [
   *   ['INV-101', 'Alice', 450, 'Paid'],
   *   ['INV-102', 'Bob', 350, 'Unpaid'],
   *   ['INV-103', 'Charlie', 500, 'Partially_Paid']
   * ];
   * const columns = ['Invoice', 'Student', 'Amount', 'Status'];
   * const { numericColumns, sums } = calculateSums(rows, columns);
   * // numericColumns = [2]
   * // sums = { 2: 1300 }
   */
  function calculateSums(rows: any[][], columns: string[]) {
    const sums: { [key: string]: number } = {};

    // Identify numeric columns (those that contain numbers)
    const numericColumns: number[] = [];

    columns.forEach((col, index) => {
      // Check if this column contains numeric data
      const hasNumbers = rows.some((row) => {
        const value = row[index];
        return !isNaN(parseFloat(String(value))) && isFinite(Number(value));
      });

      if (hasNumbers) {
        numericColumns.push(index);
      }
    });

    // Calculate sums for numeric columns
    numericColumns.forEach((colIndex) => {
      sums[colIndex] = rows.reduce((total, row) => {
        const value = parseFloat(String(row[colIndex])) || 0;
        return total + value;
      }, 0);
    });

    return { numericColumns, sums };
  }

  const HEADER_IMAGE_HEIGHT = 140; // Adjust this based on your header.png actual rendered height
  const FOOTER_IMAGE_HEIGHT = 110; // Adjust this based on your footer.png actual rendered height
  const FOOTER_TEXT_MARGIN_BOTTOM = 30;

  /**
   * @purpose
   * Adds a custom "Institution" header to the top of a PDF page, including a logo image,
   * fallback text logo, and a centered title. Matches the Institution design style.
   *
   * @param {PDFKit.PDFDocument} doc - The PDFKit document instance to draw on.
   * @param {Object} config - Configuration object for the header.
   * @param {string} config.title - The main title to display below the header image/logo.
   * @returns {void} This function does not return a value.
   * @throws Will throw an error if the header image exists but cannot be loaded by PDFKit.
   * @sideEffects
   * - Modifies the `doc` by drawing images, text, and adjusting `doc.y`.
   * - Adds spacing between header, title, and subsequent content.
   * - Logs warnings or errors if the header image file is missing or fails to load.
   *
   * @example
   * const doc = new PDFDocument();
   * addInstitutionHeader(doc, { title: 'Monthly Attendance Report' });
   */
  function addInstitutiontutionManagementHeader(
    doc: PDFKit.PDFDocument,
    config: any,
  ) {
    const pageWidth = doc.page.width;

    // Save current state
    doc.save();

    const logoPath = path.join(process.cwd(), "server", "assets", "header.png");

    // Start header at the very top of the page (or close to it)
    const headerStartY = 0; // Adjust this value - smaller = closer to top

    // Place header image if it exists
    if (fs.existsSync(logoPath)) {
      try {
        // Draw header image at the top of the page
        doc.image(logoPath, 0, headerStartY, {
          width: pageWidth,
          // Let PDFKit maintain aspect ratio
        });

        // Move Y position down by the image height (estimate if needed)
        // You might need to adjust this based on your actual header image dimensions
        const estimatedHeaderHeight = 100; // Adjust this value based on your header.png
        doc.y = headerStartY + estimatedHeaderHeight;
      } catch (error) {
        console.error(
          "Could not load header.png, falling back to text logo.",
          error,
        );
        // Fallback code...
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .fillColor([63, 81, 181])
          .text("Institution", 50, headerStartY);
        doc.y = headerStartY + 30;
        doc
          .fontSize(12)
          .font("Helvetica")
          .fillColor("#666666")
          .text("DANCE | MUSIC | FINEARTS | FITNESS", 50, doc.y);
        doc.y += 20;
      }
    } else {
      console.warn(
        `File not found at the specified path: ${logoPath}. Displaying fallback text logo.`,
      );
      // Fallback code...
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor([63, 81, 181])
        .text("Institution", 50, headerStartY);
      doc.y = headerStartY + 30;
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#666666")
        .text("DANCE | MUSIC | FINEARTS | FITNESS", 50, doc.y);
      doc.y += 20;
    }

    doc.y += 20; // Add more space between header and title

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#333333")
      .text(config.title, 0, doc.y, {
        align: "center",
      });

    // Move Y position down after title
    doc.y += 30;

    doc.restore(); // Restore state
  }

  /**
   * @purpose Adds report details such as the period and generation timestamp to the PDF.
   *
   * @param {PDFKit.PDFDocument} doc - The PDFKit document instance to draw on.
   * @param {Object} config - Configuration object containing report details.
   * @param {string} [config.periodText] - Optional text describing the period of the report (e.g., "Jan 2025").
   * @returns {void} Does not return a value.
   * @throws Will throw an error if the doc parameter is not a valid PDFKit document instance.
   * @sideEffects
   * - Modifies `doc` by adding text at the current position.
   * - Updates `doc.y` to leave space for the table.
   *
   * @example
   * addReportDetails(doc, { periodText: "January 2025" });
   */
  function addReportDetails(doc: PDFKit.PDFDocument, config: any) {
    const startY = doc.y;

    doc.fontSize(11).font("Helvetica").fillColor("#333333");

    // Period information
    if (config.periodText) {
      doc.text(`Period: ${config.periodText}`, 50, startY);
    }

    // Generation timestamp
    const generatedText = `Generated on: ${format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}`;
    doc.text(generatedText, 50, startY + 15);

    // Additional spacing before table
    doc.y = startY + 50;
  }

  /**
   * @purpose Adds a footer to the bottom of the current PDF page, including a page number and an optional footer image matching the Institution design.
   *
   * @param {PDFKit.PDFDocument} doc - The PDFKit document instance to draw on.
   * @returns {void} Does not return a value.
   * @sideEffects
   * - Draws text and optional image on the PDF.
   * - Logs errors if the footer image cannot be loaded.
   * @throws Will throw an error if the footer image exists but cannot be loaded by PDFKit.
   *
   * @example
   * addInstitutionFooter(doc);
   */
  function addInstitutiontutionManagementFooter(doc: PDFKit.PDFDocument) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const footerPath = path.join(
      process.cwd(),
      "server",
      "assets",
      "footer.png",
    );

    // Save current state
    doc.save();

    // Add page number text
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(`Page ${doc.page.index + 1}`, pageWidth - 100, pageHeight - 30, {
        align: "right",
      });

    // Check if the footer image exists
    if (fs.existsSync(footerPath)) {
      try {
        const footerHeight = 80; // Reduced height to avoid overlap
        doc.image(footerPath, 0, pageHeight - footerHeight, {
          width: pageWidth,
          height: footerHeight,
        });
      } catch (error) {
        console.error("Could not load or draw footer.png.", error);
      }
    }

    // Restore state
    doc.restore();
  }

  /**
   * POST /api/export/pdf
   *
   * @purpose Generates a password-protected PDF report with a header, footer, report details, and a styled table.
   *
   * @param {Object} req.body
   * @param {string} req.body.password - Password to protect the PDF
   * @param {any[][]} req.body.reportData - 2D array containing the report rows
   * @param {Object} req.body.config - Configuration for the report
   * @param {string} req.body.config.title - Report title
   * @param {string[]} req.body.config.columns - Table column headers
   * @param {string} req.body.config.fileName - Output file name
   * @param {'p'|'l'} req.body.config.orientation - Page orientation ('p' for portrait, 'l' for landscape)
   *
   * @returns {PDF} Streams the generated PDF as the response
   * @throws Will throw an error if the PDF document cannot be generated.
   * @sideEffects
   * - Generates and streams a PDF to the client
   * - Uses header, footer, and table drawing functions which modify the PDF document state
   *
   * @example
   * fetch("/api/export/pdf", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify({
   *     password: "secret123",
   *     reportData: [[1, "John Doe", "Paid"], [2, "Jane Doe", "Unpaid"]],
   *     config: { title: "Monthly Report", columns: ["ID", "Name", "Status"], fileName: "Report_Jan", orientation: "p" }
   *   })
   * });
   */
  app.post("/api/export/pdf", isAuthenticated, async (req, res) => {
    try {
      const { password, reportData, config } = req.body;

      if (!password || !reportData || !config) {
        return res.status(400).send("Missing required data for export.");
      }

      const doc = new PDFDocument({
        size: "a4",
        layout: config.orientation === "p" ? "portrait" : "landscape",
        userPassword: password,
        margins: { top: 50, bottom: 100, left: 50, right: 50 }, // Increased bottom margin for footer
        info: {
          Title: config.title,
          Author: "Institution",
          Subject: config.title,
          Creator: "Institution Report System",
          CreationDate: new Date(),
        },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${config.fileName}.pdf"`,
      );

      doc.pipe(res);

      // Add header first
      addInstitutiontutionManagementHeader(doc, config);

      // Add report details
      addReportDetails(doc, config);

      // Add the styled table
      generateTable(
        doc,
        {
          headers: config.columns,
          rows: reportData,
        },
        config,
      );

      // Add footer to the first page
      addInstitutiontutionManagementFooter(doc);

      // Handle footer for subsequent pages
      let pageCount = doc.bufferedPageRange().count;
      for (let i = 1; i < pageCount; i++) {
        doc.switchToPage(i);
        addInstitutiontutionManagementFooter(doc);
      }

      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Failed to generate PDF.");
    }
  });

  /**
   * POST /api/export/excel
   *
   * @purpose Generates an Excel (.xlsx) report with the given data and configuration.
   *
   * @param {Object} req.body
   * @param {string} req.body.password - Optional password for the Excel file (can be ignored if not used)
   * @param {any[][]} req.body.reportData - 2D array containing the report rows
   * @param {Object} req.body.config - Configuration for the report
   * @param {string} req.body.config.sheetName - Name of the Excel sheet
   * @param {'p'|'l'} req.body.config.orientation - Page orientation ('p' for portrait, 'l' for landscape)
   *
   * @returns {Excel} Streams the generated Excel workbook as the response
   * @throws Will throw an error if the Excel document cannot be generated.
   * @sideEffects
   * - Generates and streams an Excel workbook to the client
   * - Modifies workbook and worksheet objects
   *
   * @example
   * fetch("/api/export/excel", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify({
   *     reportData: [[1, "John Doe", "Paid"], [2, "Jane Doe", "Unpaid"]],
   *     config: { sheetName: "Monthly Report", orientation: "p" }
   *   })
   * });
   */
  app.post("/api/export/excel", isAuthenticated, async (req, res) => {
    try {
      const { password, reportData, config } = req.body;

      if (!password || !reportData || !config) {
        return res.status(400).send("Missing required data for export.");
      }

      const workbook = new ExcelJS.Workbook();

      // Set workbook properties
      workbook.creator = "Institution";
      workbook.lastModifiedBy = "Institution Report System";
      workbook.created = new Date();
      workbook.modified = new Date();

      const worksheet = workbook.addWorksheet(config.sheetName, {
        pageSetup: {
          paperSize: 9, // A4
          orientation: config.orientation === "p" ? "portrait" : "landscape",
          fitToPage: true,
          margins: {
            left: 0.7,
            right: 0.7,
            top: 0.75,
            bottom: 0.75,
            header: 0.3,
            footer: 0.3,
          },
        },
      });

      // Add title row with Institution styling
      worksheet.mergeCells(
        "A1:" + String.fromCharCode(64 + config.excelColumns.length) + "1",
      );
      const titleCell = worksheet.getCell("A1");
      titleCell.value = config.title;
      titleCell.font = { bold: true, size: 18, color: { argb: "333333" } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF" },
      };

      // Add period info if available
      if (config.periodText) {
        worksheet.mergeCells(
          "A2:" + String.fromCharCode(64 + config.excelColumns.length) + "2",
        );
        const periodCell = worksheet.getCell("A2");
        periodCell.value = `Period: ${config.periodText}`;
        periodCell.font = { size: 11, color: { argb: "333333" } };
        periodCell.alignment = { vertical: "middle", horizontal: "left" };
      }

      // Add generation info
      const genRow = config.periodText ? 3 : 2;
      worksheet.mergeCells(
        `A${genRow}:` +
          String.fromCharCode(64 + config.excelColumns.length) +
          genRow,
      );
      const genCell = worksheet.getCell(`A${genRow}`);
      genCell.value = `Generated on: ${format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}`;
      genCell.font = { size: 11, color: { argb: "333333" } };
      genCell.alignment = { vertical: "middle", horizontal: "left" };

      // Set up columns starting from the appropriate row
      const headerRowNum = config.periodText ? 5 : 4;
      worksheet.columns = config.excelColumns.map((colName: string) => ({
        header: colName,
        key: colName,
        width: Math.max(colName.length + 2, 12),
      }));

      // Style the header row with Institution blue
      const headerRow = worksheet.getRow(headerRowNum);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "3F51B5" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Add data with alternating colors
      reportData.forEach((rowData: any, index: number) => {
        const row = worksheet.addRow(rowData);

        // Alternate row colors
        if (index % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F5F5F5" },
            };
          });
        }

        // Add borders and center alignment
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.border = {
            top: { style: "thin", color: { argb: "E0E0E0" } },
            left: { style: "thin", color: { argb: "E0E0E0" } },
            bottom: { style: "thin", color: { argb: "E0E0E0" } },
            right: { style: "thin", color: { argb: "E0E0E0" } },
          };

          // Color coding for status
          const cellValue = String(cell.value || "").toLowerCase();
          if (cellValue.includes("unpaid")) {
            cell.font = { color: { argb: "F44336" } };
          } else if (
            cellValue.includes("paid") &&
            !cellValue.includes("unpaid")
          ) {
            cell.font = { color: { argb: "4CAF50" } };
          } else if (cellValue.includes("partially_paid")) {
            cell.font = { color: { argb: "FF9800" } };
          }
        });
      });

      // Protect the worksheet
      await worksheet.protect(password, {
        selectLockedCells: true,
        selectUnlockedCells: false,
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${config.fileName}.xlsx"`,
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error generating Excel:", error);
      res.status(500).send("Failed to generate Excel.");
    }
  });

  /**
   * @purpose Creates and returns an HTTP server instance using the provided Express app.
   *
   * @param {Express.Application} app - An initialized Express application
   * @returns {import('http').Server} - The HTTP server instance wrapping the Express app
   * @throws Will throw an error if the server cannot be created.
   * @sideEffects
   * - Wraps the Express app with an HTTP server, enabling it to listen for requests
   *
   * @example
   * const app = express();
   * const server = createHttpServer(app);
   * server.listen(3000, () => {
   *   console.log('Server running on port 3000');
   * });
   */
  const httpServer = createServer(app);

  return httpServer;
}
