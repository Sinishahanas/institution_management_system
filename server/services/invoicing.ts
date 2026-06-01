/**
 * generateCreditNotesForMissedClasses
 *
 * @purpose
 *   Generates credit notes for missed classes for all active enrollments.
 *   This function identifies 'leave' attendance records without compensation dates and creates a credit note
 *
 * @param {number} year - Year for which credit notes are generated (e.g., 2025)
 * @param {number} month - Month for which credit notes are generated (0-indexed, e.g., May = 4)
 * @returns {Promise<void>} - Resolves when processing of all active enrollments is complete.
 * @throws {Error} - Throws or logs errors if database operations fail.
 *
 * @sideEffects
 *   - Reads active enrollments, attendance, transportation, and credit notes from the database.
 *   - Inserts new credit notes into the `creditNotes` table.
 *   - Updates logs in console.
 *
 * @example
 *   await generateCreditNotesForMissedClasses(2025, 5);
 */

import cron from 'node-cron';
import { db } from '../db.js';
import * as schema from '../../shared/schema.js';
import { and, eq, gte, lte, isNull, sql, or, like, lt, desc } from 'drizzle-orm';
import { format } from 'date-fns';
import { sendEmail } from '../email/emailNotification.js';
// import { generateInvoicePDF } from 'server/email/generateInvoicePDF.js';

async function generateCreditNotesForMissedClasses(year: number, month: number) {
    const today = new Date();
    // const monthStr = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    // const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    // const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const monthStr = monthStart.toLocaleString('default', { month: 'long', year: 'numeric' });

    try {
        const activeEnrollments = await db // Query the database for active enrollments.
            .select({
                enrollmentId: schema.enrollments.id,
                studentId: schema.enrollments.studentId,
                enrollmentDate: schema.enrollments.enrollmentDate,
                perDayValue: schema.batches.perDayValue,
                batchId: schema.batches.id,
                batchName: schema.batches.name,
            })
            .from(schema.enrollments) // Start query from the enrollments table
            .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id)) // Join with batches table
            .where(eq(schema.enrollments.status, "active")); // Filter for active enrollments


        // Iterate over each active enrollment
        for (const enr of activeEnrollments) {
            const { studentId, perDayValue, batchId, batchName } = enr;

            // Select attendance records for the month
            const absentResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(schema.attendance) // Query the attendance table
                .where(and(
                    eq(schema.attendance.studentId, studentId),
                    eq(schema.attendance.batchId, batchId),
                    gte(schema.attendance.date, monthStart.toISOString().split('T')[0]),
                    lte(schema.attendance.date, monthEnd.toISOString().split('T')[0]),
                    eq(schema.attendance.status, 'leave'),
                    isNull(schema.attendance.compensationDate)
                ));

            const missedCount = Number(absentResult[0]?.count || 0); // Calculate the number of missed classes

            const transportInfo = await db // Query the transportation table
                .select({
                    modeId: schema.transportation.modeId,
                    mode: schema.transportationMode.mode,
                    perDayValue: schema.transportationMode.perDayValue,
                })
                .from(schema.transportation)
                .innerJoin(
                    schema.transportationMode,
                    eq(schema.transportation.modeId, schema.transportationMode.id)
                )
                .where(and( // Filter conditions
                    eq(schema.transportation.studentId, studentId),
                    eq(schema.transportation.transportationNeeded, true)
                ))
                .limit(1); // Limit to one result

            let transportRefund = 0; // Initialize transportation refund.
            let transportNote = ''; // Initialize transportation note.
            if (transportInfo.length > 0) {
                const transportPerDay = Number(transportInfo[0].perDayValue || 0);
                transportRefund = missedCount * transportPerDay;
                transportNote = ` + Transportation: ${transportRefund.toFixed(2)}`;
            }

            if (missedCount === 0) {
            } else { // Check for existing credit notes for the student for this month and reason.
                const existingCreditNotes = await db // Query the credit notes table
                    .select()
                    .from(schema.creditNotes)
                    .where(and(
                        eq(schema.creditNotes.studentId, studentId),
                        eq(schema.creditNotes.generatedMonth, monthStr),
                        like(schema.creditNotes.reason, `Credit for%in ${monthStr} (Batch ${batchName}%`)
                    ));

                if (existingCreditNotes.length > 0) {
                } else { // If no existing credit notes
                    const perClassFee = Number(perDayValue);
                    const creditAmount = missedCount * perClassFee;

                    try {
                        const lastCreditNote = await db // Query the credit notes table
                            .select()
                            .from(schema.creditNotes)
                            .orderBy(desc(schema.creditNotes.id))
                            .limit(1);

                        let nextNumber = 101;
                        if (lastCreditNote.length && lastCreditNote[0].creditNoteNumber) {
                            const lastNum = parseInt(
                                lastCreditNote[0].creditNoteNumber.replace("CN-", "")
                            );
                            if (!isNaN(lastNum)) {
                                nextNumber = lastNum + 1;
                            }
                        }

                        const totalAmount = creditAmount + transportRefund; // Calculate total credit amount
                        const reason = `Credit for ${missedCount} missed class${missedCount > 1 ? 'es' : ''} in ${monthStr} (Batch ${batchName}) - [Course Fee : ${creditAmount.toFixed(2)}${transportNote}]`;

                        const creditNoteNumber = `CN-${nextNumber}`; // Generate credit note number

                        await db.insert(schema.creditNotes).values({ // Insert credit note into the database
                            creditNoteNumber,
                            studentId: sql`${studentId}`,
                            amount: totalAmount.toFixed(2),
                            generatedMonth: monthStr,
                            reason: reason,
                            status: 'open',
                            appliedInvoiceId: null,
                            appliedToType: null,
                        });

                    } catch (insertError) { // Log error if credit note insertion fails
                        console.error(`Failed to insert credit note for student ${studentId} in batch ${batchId}:`, insertError);
                    }
                }
            }
        }
    } catch (error) {
        console.error('CRITICAL ERROR during credit note generation:', error);
    }
}

/**
 * generateMonthlyInvoices
 *
 * @purpose
 *   Generates monthly invoices for all active students.
 *   Applies course fees, registration fees (first invoice), inventory fees, transportation fees,
 *   credit notes, and available advance payments.
 *   It creates a new invoice record and associated invoice items in the database and sends an email notification.
 *
 * @returns {Promise<void>} - A promise that resolves when the invoice generation is complete.
 *
 * @throws {Error} - Throws or logs errors if database transactions fail.
 *
 * @sideEffects
 *   - Reads student, attendance, enrollment, course, studentCourseFee, studentInventory, inventory,
 *     transportation, transportationMode, creditNotes, and studentPayments data from the database.
 *   - Inserts records in `invoices` and `invoiceItems`.
 *   - Updates `creditNotes`  and `studentPayments` in database.
 *   - Sends emails to students.
 *   - Logs process information and errors to the console.
 *
 * @example
 *   await generateMonthlyInvoices();
 */
async function generateMonthlyInvoices() {
    const today = new Date(); // Get current date
    const invoiceMonthStr = today.toLocaleString('default', { month: 'long', year: 'numeric' }); // Format month and year

    const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Start of previous month
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // End of previous month

    try {
        // Select all active students
        const activeStudents = await db.select().from(schema.students).where(eq(schema.students.status, 'active'));

        // Iterate through each active student
        for (const student of activeStudents) {
            const attendanceRecord = await db.select({ id: schema.attendance.id })
                .from(schema.attendance)
                .where(and(
                    eq(schema.attendance.studentId, student.id),
                    gte(schema.attendance.date, prevMonthStart.toISOString().split('T')[0]),
                    lte(schema.attendance.date, prevMonthEnd.toISOString().split('T')[0])
                )).limit(1);

            // Skip if no attendance record found
            if (attendanceRecord.length === 0) {
                continue;
            }

            // Select existing invoices for the student
            const existingInvoices = await db
                .select()
                .from(schema.invoices)
                .where(eq(schema.invoices.studentId, student.id));

            const isFirstInvoice = existingInvoices.length === 0;

            try {
                await db.transaction(async (tx) => { // Start database transaction
                    const invoiceNumber = `INV-${format(new Date(), 'yyyyMMdd')}-${student.id}`; // Generate invoice number
                   
                    // Check if invoice already exists
                    const existingInvoice = await tx
                        .select()
                        .from(schema.invoices)
                        .where(and(
                            eq(schema.invoices.studentId, student.id),
                            eq(schema.invoices.invoiceNumber, invoiceNumber)
                        ))
                        .limit(1);

                    // Skip if invoice already exists
                    if (existingInvoice.length > 0) {
                        return;
                    }

                    // Initialize invoice items array and totals
                    const invoiceItemsData = [];
                    let subTotal = 0;
                    let totalDiscounts = 0;

                    // Registration Fee
                    const registrationFee = Number(student.registrationFee);
                    if (isFirstInvoice && registrationFee > 0) {
                        subTotal += registrationFee;
                        invoiceItemsData.push({
                            description: 'Registration Fee',
                            itemType: 'registration_fee',
                            unitPrice: registrationFee.toFixed(2),
                            total: registrationFee.toFixed(2),
                        });
                    }

                    // Course Fee
                    const enrollments = await tx.select({
                        courseName: schema.courses.name,
                        originalFee: schema.courses.fee,
                        totalFee: schema.studentCourseFee.totalFee,
                        discountType: schema.studentCourseFee.discountType,
                        discountValue: schema.studentCourseFee.discountValue,
                        durationMonths: schema.studentCourseFee.durationMonths,
                        monthsOfYear: schema.studentCourseFee.monthsOfYear,
                    })
                        .from(schema.enrollments)
                        .innerJoin(schema.studentCourseFee, eq(schema.enrollments.id, schema.studentCourseFee.enrollmentId))
                        .innerJoin(schema.courses, eq(schema.enrollments.courseId, schema.courses.id))
                        .where(and(eq(schema.enrollments.studentId, student.id), eq(schema.enrollments.status, 'active')));

                    const existingInvoiceCounts: Record<string, number> = {};

                    const previousInvoices = await tx.select({
                        description: schema.invoiceItems.description,
                        itemType: schema.invoiceItems.itemType,
                    })
                        .from(schema.invoices)
                        .innerJoin(schema.invoiceItems, eq(schema.invoices.id, schema.invoiceItems.invoiceId))
                        .where(and(
                            eq(schema.invoices.studentId, student.id),
                            or(eq(schema.invoiceItems.itemType, 'course_fee'), eq(schema.invoiceItems.itemType, 'transport_fee'))
                        ));

                    for (const item of previousInvoices) { // Populate existingInvoiceCounts
                        let key = item.description;

                        if (item.itemType === 'transport_fee') {
                            // Normalize key for transport fee
                            key = `transport_${item.description.replace('Transportation - ', '')}`;
                        }

                        existingInvoiceCounts[key] = (existingInvoiceCounts[key] || 0) + 1;
                    }

                    for (const enr of enrollments) { // Process each enrollment
                        let monthlyFee = Number(enr.originalFee); // Original course fee
                        let discountAmount = 0; // Discount amount
                        let shownDiscountValue = 0; // Discount value to show
                        const duration = Number(enr.durationMonths); // Duration in months

                        const existingInvoiceCount = existingInvoiceCounts[enr.courseName] || 0;
                        const shouldApplyDiscount = (isFirstInvoice || duration > 1) && existingInvoiceCount < duration;

                        if (monthlyFee > 0) {
                            if (shouldApplyDiscount) {
                                // Apply discount
                                if (enr.discountType === 'percentage') {
                                    const splitPercentage = duration > 1
                                        ? Number(enr.discountValue) / duration
                                        : Number(enr.discountValue);
                                    // Calculate discount amount
                                    discountAmount = (monthlyFee * splitPercentage) / 100;
                                    shownDiscountValue = splitPercentage;
                                } 
                                // discountType === 'amount'
                                else if (enr.discountType === 'amount') {
                                    discountAmount = duration > 1
                                        ? Number(enr.discountValue) / duration
                                        : Number(enr.discountValue);
                                    shownDiscountValue = discountAmount;
                                }

                                // Add discount to totalDiscounts
                                totalDiscounts += discountAmount;
                            }

                            // Calculate line total
                            const lineTotal = monthlyFee - discountAmount;

                            // Add invoice item
                            invoiceItemsData.push({
                                description: `${enr.courseName}`,
                                itemType: 'course_fee',
                                discountType: `${enr.discountType}`,
                                discountValue: `${shownDiscountValue}`,
                                unitPrice: monthlyFee.toFixed(2),
                                total: lineTotal.toFixed(2),
                            });

                            // Add to subTotal
                            subTotal += monthlyFee;
                        }
                    }

                    // Inventory Fee
                    if (isFirstInvoice) {
                        const inventoryItems = await tx.select({ // Select inventory items
                            name: schema.inventory.items,
                            quantity: schema.studentInventory.quantity,
                            amount: schema.inventory.amount,
                            totalAmount: schema.studentInventory.totalAmount,
                            discountType: schema.studentInventory.discountType,
                            discountValue: schema.studentInventory.discountValue,
                        })
                            .from(schema.studentInventory)
                            .innerJoin(schema.inventory, eq(schema.studentInventory.inventoryId, schema.inventory.id))
                            .where(eq(schema.studentInventory.studentId, student.id));

                        // Process each inventory item
                        for (const item of inventoryItems) {
                            const total = Number(item.amount) * item.quantity;
                            if (total > 0) {
                                subTotal += total;
                                totalDiscounts += Number(item.discountValue);
                                const lineTotal = total - Number(item.discountValue);
                                invoiceItemsData.push({
                                    description: `${item.name}`,
                                    itemType: 'inventory_fee',
                                    quantity: `${item.quantity}`,
                                    discountType: `${item.discountType}`,
                                    discountValue: `${item.discountValue}`,
                                    unitPrice: total.toFixed(2),
                                    total: lineTotal.toFixed(2),
                                });
                            }
                        }
                    }

                    // Transportation Fee
                    const transport = await tx.select({ // Select transportation fee
                        mode: schema.transportationMode.mode,
                        rate: schema.transportationMode.rate,
                        totalAmount: schema.transportation.totalAmount,
                        discountType: schema.transportation.discountType,
                        discountValue: schema.transportation.discountValue,
                        durationMonths: schema.transportation.durationMonths
                    })
                        .from(schema.transportation)
                        .innerJoin(schema.transportationMode, eq(schema.transportation.modeId, schema.transportationMode.id))
                        .where(and(eq(schema.transportation.studentId, student.id), eq(schema.transportation.status, 'active')));

                    // Process transportation fee
                    if (transport.length > 0) { // If transportation details exist
                        const t = transport[0];
                        const monthlyTransportFee = Number(t.rate);
                        const duration = Number(t.durationMonths);
                        let discountAmount = 0;
                        let shownDiscountValue = 0;

                        // Check existing invoice count
                        const existingTransportInvoiceCount = existingInvoiceCounts[`transport_${t.mode}`] || 0;
                        const shouldApplyDiscount = (isFirstInvoice || duration > 1) && existingTransportInvoiceCount < duration;

                        if (monthlyTransportFee > 0) { // If monthly transport fee is greater than 0
                            if (shouldApplyDiscount) {
                                if (t.discountType === 'percentage') {
                                    const splitPercentage = duration > 1
                                        ? Number(t.discountValue) / duration
                                        : Number(t.discountValue);
                                    discountAmount = (monthlyTransportFee * splitPercentage) / 100;
                                    shownDiscountValue = splitPercentage;
                                } else if (t.discountType === 'amount') {
                                    discountAmount = duration > 1
                                        ? Number(t.discountValue) / duration
                                        : Number(t.discountValue);
                                    shownDiscountValue = discountAmount;
                                }

                                totalDiscounts += discountAmount;
                            }

                            // Calculate line total
                            const lineTotal = monthlyTransportFee - discountAmount;

                            // Add invoice item
                            invoiceItemsData.push({
                                description: `Transportation - ${t.mode}`,
                                itemType: 'transport_fee',
                                discountType: `${t.discountType}`,
                                discountValue: `${shownDiscountValue}`,
                                unitPrice: monthlyTransportFee.toFixed(2),
                                total: lineTotal.toFixed(2),
                            });

                            // Add to subTotal
                            subTotal += monthlyTransportFee;
                        }
                    }

                    // Apply Credit Notes
                    const openCreditNotes = await tx.select().from(schema.creditNotes) // Select open credit notes
                        .where(and(eq(schema.creditNotes.studentId, student.id),
                            eq(schema.creditNotes.status, 'open')));

                    // Process credit notes
                    for (const cn of openCreditNotes) {
                        const creditAmount = parseFloat(cn.amount);
                        subTotal -= creditAmount;
                        invoiceItemsData.push({
                            description: `${cn.reason}`,
                            itemType: 'credit_note_adj',
                            unitPrice: (-creditAmount).toFixed(2),
                            total: (-creditAmount).toFixed(2)
                        });
                    }

                    // Calculate total amount
                    let totalAmount = subTotal - totalDiscounts;
                    const vatAmount = totalAmount * 0.05;

                    // If total amount is less than or equal to 0, return
                    if (totalAmount <= 0) {
                        return;
                    }

                    // Select advance payments
                    const advancePayments = await tx.select({
                        id: schema.studentPayments.id,
                        advanceAmount: schema.studentPayments.advanceAmount
                    }).from(schema.studentPayments)
                        .where(and(
                            eq(schema.studentPayments.studentId, student.id),
                            eq(schema.studentPayments.status, "paid"),
                            eq(schema.studentPayments.state, "active"),
                        ));

                    // Calculate total advance available
                    let totalAdvanceAvailable = 0;
                    for (const adv of advancePayments) {
                        totalAdvanceAvailable += Number(adv.advanceAmount || 0);
                    }

                    // Calculate applied advance and remaining amount
                    let appliedAdvance = 0;
                    let remainingAmount = totalAmount;

                    if (totalAdvanceAvailable > 0) {
                        appliedAdvance = Math.min(totalAdvanceAvailable, totalAmount);
                        remainingAmount -= appliedAdvance;
                    }

                    // Calculate remaining amount to apply
                    let remainingToApply = appliedAdvance;

                    for (const adv of advancePayments) {
                        if (remainingToApply <= 0) break;

                        const available = Number(adv.advanceAmount || 0);
                        const applyNow = Math.min(available, remainingToApply);
                        const newRemaining = available - applyNow;

                        // Update advance payment
                        await tx.update(schema.studentPayments)
                            .set({
                                advanceAmount: newRemaining.toFixed(2),
                                state: newRemaining === 0 ? "inactive" : "active"
                            })
                            .where(eq(schema.studentPayments.id, adv.id));

                        remainingToApply -= applyNow;
                    }

                    // Calculate invoice status
                    const invoiceStatus =
                        appliedAdvance >= totalAmount ? "paid" :
                            appliedAdvance > 0 ? "partially_paid" :
                                "unpaid";

                    const amountPaidValue = appliedAdvance > 0 ? appliedAdvance.toFixed(2) : "0";

                    // Insert new invoice
                    const [newInvoice] = await tx.insert(schema.invoices).values({
                        invoiceNumber,
                        studentId: student.id,
                        issueDate: today.toISOString().split('T')[0],
                        dueDate: new Date(today.getFullYear(), today.getMonth(), 30).toISOString().split('T')[0],
                        amountPaid: amountPaidValue,
                        subTotal: subTotal.toFixed(2),
                        vatAmount: vatAmount.toFixed(2),
                        discountAmount: totalDiscounts.toFixed(2),
                        totalAmount: totalAmount.toFixed(2),
                        status: invoiceStatus,
                    }).returning();

                    // Insert invoice items
                    await tx.insert(schema.invoiceItems).values(
                        invoiceItemsData.map(item => ({
                            ...item, invoiceId: newInvoice.id,
                            quantity: item.quantity && !isNaN(Number(item.quantity)) ? Number(item.quantity) : 1,
                        }))
                    );

                    // Update credit notes
                    for (const cn of openCreditNotes) {
                        await tx.update(schema.creditNotes)
                            .set({ status: 'approved', appliedInvoiceId: newInvoice.id, appliedToType: 'Against invoice ' + newInvoice.invoiceNumber })
                            .where(eq(schema.creditNotes.id, cn.id));
                    }

                    // Send invoice email
                    await sendEmail(
                        'invoice',
                        student.email!,
                        "Invoice for the month of " + invoiceMonthStr,
                        {
                            invoiceNumber: newInvoice.invoiceNumber,
                            invoiceMonth: invoiceMonthStr,
                            totalAmount: totalAmount.toFixed(2),
                            dueDate: newInvoice.dueDate,
                        },
                    );

                });
            } catch (err) { // Catch errors during transaction or for a specific student
                console.error(`Error generating invoice for student ${student.id}:`, err);
            }
        }

    } catch (error) { // Catch errors during monthly invoice generation
        console.error('CRITICAL ERROR during monthly invoice generation:', error);
    }
}

// cron.schedule('0 23 * * *', () => {
//     const today = new Date();
//     const tomorrow = new Date();
//     tomorrow.setDate(today.getDate() + 1);

//     if (today.getMonth() !== tomorrow.getMonth()) {
//         generateCreditNotesForMissedClasses(2025,5);
//         // generateCreditNotesForMissedClasses(today.getFullYear(), today.getMonth());
//     }
// }, {
//     timezone: "Asia/Dubai"
// });

// cron.schedule('0 2 1 * *', () => {
//     generateMonthlyInvoices();
// }, {
//     timezone: "Asia/Dubai"
// });

// generateCreditNotesForMissedClasses(2025,5);
// generateMonthlyInvoices();