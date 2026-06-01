import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { utils as XLSXUtils, write as XLSXWrite } from "xlsx";
import { format } from "date-fns";


/**
 * @purpose Loads an image from a URL and converts it to a Base64-encoded PNG string.
 *
 * @param {string} url - The URL of the image to load.
 * @returns {Promise<string>} A promise that resolves with the Base64 string of the image.
 * @throws {string} Rejects with an error message if the image fails to load or canvas context is unavailable.
 * @sideEffects None
 *
 * @example
 * const base64Image = await loadImageAsBase64("https://example.com/logo.png");
 */
export const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";/** Represents a batch in the system */
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context not available");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject("Failed to load image: " + url);
    img.src = url;
  });
};

/**
 * @purpose Represents a batch in the system
 * 
 * @property {number} id - The unique identifier of the batch.
 * @property {string} name - The name of the batch.
 * @property {string} branch - The branch associated with the batch.
 * @property {number} courseId - The ID of the course associated with the batch.
 */
export interface Batch {
  id: number;
  name: string;
  branch: string;
  courseId: number;
}

/**
 * @purpose Parameters for exporting attendance reports.
 *
 * @property {string|null} selectedBatch - The currently selected batch ID.
 * @property {Array<Batch>} batches - List of all batches.
 * @property {(courseId: number) => string} getCourseName - Function to get course name from courseId.
 * @property {Array<any>} enrolledStudents - List of students enrolled in the batch.
 * @property {Array<any>} filteredSavedAttendance - Attendance records filtered for the selected batch.
 * @property {number} selectedYear - Selected year for the report.
 * @property {number} selectedMonth - Selected month for the report.
 * @property {(records: any[]) => any[]} getMonthlyAttendanceRecords - Function to process attendance records for the month.
 * @property {string} headerImageUrl - URL of the header image to include in the report.
 * @property {string} footerImageUrl - URL of the footer image to include in the report.
 */
export interface ExportAttendanceParams {
  selectedBatch: string | null;
  batches: Array<Batch>;
  getCourseName: (courseId: number) => string;
  enrolledStudents: Array<any>;
  filteredSavedAttendance: Array<any>;
  selectedYear: number;
  selectedMonth: number;
  getMonthlyAttendanceRecords: (records: any[]) => any[];
  headerImageUrl: string;
  footerImageUrl: string;
}

/**
 * @purpose
 * - Exports attendance data as an Excel or PDF report.
 * - Generates a formatted report with header/footer images, total counts, and student attendance percentages. Supports both Excel (`xlsx`) and PDF (`jsPDF`) formats.
 *
 * @param {"excel"|"pdf"} type - The export format.
 * @param {ExportAttendanceParams} params - Parameters for generating the report.
 * @returns {Promise<void>} Resolves once the file is generated and download is triggered.
 * @throws Will throw an error if images fail to load for the PDF export.
 * @sideEffects
 * - Initiates a file download for the generated Excel or PDF report.
 * - Loads header and footer images via network requests.
 *
 * @example
 * await exportAttendance("excel", {
 *   selectedBatch: "1",
 *   batches: allBatches,
 *   getCourseName: (id) => "Mathematics",
 *   enrolledStudents: students,
 *   filteredSavedAttendance: attendanceRecords,
 *   selectedYear: 2025,
 *   selectedMonth: 9,
 *   getMonthlyAttendanceRecords: (records) => records,
 *   headerImageUrl: "/assets/header.png",
 *   footerImageUrl: "/assets/footer.png",
 * });
 *
 * @example
 * await exportAttendance("pdf", { ...sameParams });
 */
export const exportAttendance = async (
  type: "excel" | "pdf",
  params: ExportAttendanceParams
) => {
  const {
    selectedBatch,
    batches,
    getCourseName,
    enrolledStudents,
    filteredSavedAttendance,
    selectedYear,
    selectedMonth,
    getMonthlyAttendanceRecords,
    headerImageUrl,
    footerImageUrl,
  } = params;

  // Return early if no batch is selected
  if (!selectedBatch) return;

  // Format current date/time for filename and report display
  const currentDateTime = format(new Date(), "yyyy-MM-dd_HH-mm");
  const reportDateTime = format(new Date(), "MMMM d, yyyy 'at' h:mm a");

  // Find batch information based on selected batch ID
  const batchInfo = batches.find((b) => b.id.toString() === selectedBatch);
  const courseName = batchInfo ? getCourseName(batchInfo.courseId) : "Unknown Course";
  
  // Format selected month/year for report title
  const selectedMonthYear = format(new Date(selectedYear, selectedMonth), "MMMM yyyy");

  // Map enrolled students to attendance data
  const exportData = enrolledStudents.map((student, index) => {
    const studentRecords = getMonthlyAttendanceRecords(
      filteredSavedAttendance.filter((r) => r.studentId === student.id.toString())
    );

    // Count attendance status
    const presentCount = studentRecords.filter((r) => r.status === "present").length;
    const absentCount = studentRecords.filter((r) => r.status === "absent").length;
    const leaveCount = studentRecords.filter((r) => r.status === "leave").length;
    const total = studentRecords.length;
    const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

    // Return formatted row
    return {
      "SL No": index + 1,
      "Student Name": `${student.firstName} ${student.lastName}`,
      "Student ID": student.studentId,
      Present: presentCount,
      Absent: absentCount,
      Leave: leaveCount,
      "Attendance %": `${percentage}%`,
    };
  });

  // Generate filename and columns for export
  const filename = `${batchInfo?.name}_attendance_${selectedMonthYear}_${currentDateTime}`;
  const columns = ["SL No", "Student Name", "Student ID", "Present", "Absent", "Leave", "Attendance %"] as const;
//   type Column = typeof columns[number];

  if (type === "excel") {
    // Excel export
    const headerData = [
      ["Attendance Report"],
      [`Batch: ${batchInfo?.name}`],
      [`Course: ${courseName}`],
      [`Branch: ${batchInfo?.branch}`],
      [`Period: ${selectedMonthYear}`],
      [`Generated on: ${reportDateTime}`],
      [],
      [...columns],
    ];

    const ws = XLSXUtils.aoa_to_sheet(headerData);

    // Add data rows
    XLSXUtils.sheet_add_json(ws, exportData, { origin: "A7", skipHeader: true });

    const totalRow = exportData.length + 7;

    ws[`B${totalRow}`] = { t: "s", v: "Total" };

    // Columns C (Present), D (Absent), E (Leave)
    const presentCol = "C";
    const absentCol = "D";
    const leaveCol = "E";

    // Add formulas for Present, Absent, Leave totals
    ws[`${presentCol}${totalRow}`] = { t: "n", f: `SUM(${presentCol}7:${presentCol}${totalRow - 1})` };
    ws[`${absentCol}${totalRow}`] = { t: "n", f: `SUM(${absentCol}7:${absentCol}${totalRow - 1})` };
    ws[`${leaveCol}${totalRow}`] = { t: "n", f: `SUM(${leaveCol}7:${leaveCol}${totalRow - 1})` };

    // Create workbook and add sheet
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "Attendance");
    const excelBuffer = XLSXWrite(wb, { bookType: "xlsx", type: "array" });

    // Write workbook to buffer and trigger download
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    // PDF export
    const doc = new jsPDF();

    // Load header and footer images
    const headerBase64 = await loadImageAsBase64(headerImageUrl);
    const footerBase64 = await loadImageAsBase64(footerImageUrl);

    // Add header image (example coordinates, scale as needed)
    doc.addImage(headerBase64, "PNG", 10, 10, 180, 20);

    // Add report title
    doc.setFontSize(14);
    const title = "Attendance Report for the month of " + selectedMonthYear;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(title, textX, 40);

    // Add batch, course, branch, period, and generated on information
    doc.setFontSize(11);
    doc.text(`Batch: ${batchInfo?.name}`, 14, 50);
    doc.text(`Course: ${courseName}`, 14, 57);
    doc.text(`Branch: ${batchInfo?.branch}`, 14, 64);
    doc.text(`Period: ${selectedMonthYear}`, 14, 71);
    doc.text(`Generated on: ${reportDateTime}`, 14, 78);

    // Calculate totals for footer row
    const totalPresent = exportData.reduce((sum, row) => sum + row.Present, 0);
    const totalAbsent = exportData.reduce((sum, row) => sum + row.Absent, 0);
    const totalLeave = exportData.reduce((sum, row) => sum + row.Leave, 0);

    const totalRow = ["", "Total", "", totalPresent, totalAbsent, totalLeave, ""];

    // Generate table with autoTable
    autoTable(doc, {
    head: [columns as unknown as string[]],
    body: [...exportData.map(row => columns.map(col => row[col as keyof typeof row])), totalRow],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [48, 67, 128], halign: 'center' },
    footStyles: { fillColor: [230, 230, 230], textColor: 20 },
    startY: 85,

    columnStyles: {
        1: { halign: 'left' } // index 1 = "Student Name" column
      },

    bodyStyles: {
        halign: 'center'
      },    
    
    // Add footer image at bottom of each page
    didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.addImage(footerBase64, "PNG", 10, pageHeight - 30, 180, 20);
    },
    
    // Make bold
    didParseCell: function (data) {
        if (data.section === 'body' && data.row.index === data.table.body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }      
    });

    // Save file
    doc.save(`${filename}.pdf`);
  }
};
