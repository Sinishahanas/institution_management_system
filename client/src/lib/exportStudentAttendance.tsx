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
    img.crossOrigin = "anonymous";
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
 * @purpose Parameters for exporting a single student's attendance 
 * 
 * @property {Object} student - Student information
 * @property {string} student.firstName - Student's first name
 * @property {string} student.lastName - Student's last name
 * @property {string} student.studentId - Student's ID
 * @property {Array<{ date: string; status: "present" | "absent" | "leave"; batch: string; }>} attendanceRecords - Attendance records
 * @property {number} selectedYear - Selected year
 * @property {number} selectedMonth - Selected month
 * @property {string} headerImageUrl - URL of the header image
 * @property {string} footerImageUrl - URL of the footer image
*/
export interface ExportStudentAttendanceParams {
  student: {
    firstName: string;
    lastName: string;
    studentId: string;
  };
  attendanceRecords: Array<{
    date: string; // ISO date string
    status: "present" | "absent" | "leave";
    batch: string;
  }>;
  selectedYear: number;
  selectedMonth: number;
  headerImageUrl: string;
  footerImageUrl: string;
}


/**
 * @purpose Exports a single student's attendance to Excel or PDF.
 *
 * @param {"excel" | "pdf"} type - Format to export the attendance report
 * @param {ExportStudentAttendanceParams} params - Parameters including student info, attendance records, images, and month/year
 * @returns {Promise<void>} - Resolves when the file is generated and downloaded
 *
 * @sideEffects Downloads a file to the user's system
 * @throws Will throw an error if image loading fails for PDF export
 *
 * @example
 * await exportStudentAttendance("excel", {
 *   student: { firstName: "John", lastName: "Doe", studentId: "S123" },
 *   attendanceRecords: [
 *     { date: "2025-10-01", status: "present", batch: "Batch A" },
 *     { date: "2025-10-02", status: "absent", batch: "Batch A" }
 *   ],
 *   selectedYear: 2025,
 *   selectedMonth: 9,
 *   headerImageUrl: "/assets/header.png",
 *   footerImageUrl: "/assets/footer.png",
 * });
 */
export const exportStudentAttendance = async (
  type: "excel" | "pdf",
  params: ExportStudentAttendanceParams
) => {
  const {
    student,
    attendanceRecords,
    selectedYear,
    selectedMonth,
    headerImageUrl,
    footerImageUrl,
  } = params;

  // Format month/year and current datetime for display and filename
  const selectedMonthYear = format(new Date(selectedYear, selectedMonth), "MMMM yyyy");
  const currentDateTime = format(new Date(), "yyyy-MM-dd_HH-mm");
  const reportDateTime = format(new Date(), "MMMM d, yyyy 'at' h:mm a");

  // Full name of the student for display
  const fullName = `${student.firstName} ${student.lastName}`;

  // Export data for Excel
  const exportData = attendanceRecords.map((record, index) => ({
    "SL No": index + 1,
    // Batch: record.batchId,
    Date: format(new Date(record.date), "dd MMM yyyy"), // Format date for readability
    Batch: record.batch || "N/A", // Show batch or default
    Status: record.status.charAt(0).toUpperCase() + record.status.slice(1), // Capitalize status
  }));

  // Count attendance status
  const presentCount = attendanceRecords.filter(r => r.status === "present").length;
  const absentCount = attendanceRecords.filter(r => r.status === "absent").length;
  const leaveCount = attendanceRecords.filter(r => r.status === "leave").length;
  const total = attendanceRecords.length;
  const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  // Generate filename and columns
  const filename = `${student.studentId}_attendance_${selectedMonthYear}_${currentDateTime}`;
  const columns = ["SL No", "Date", "Batch", "Status"] as const;

  if (type === "excel") {
    // Excel export

    // Header data for Excel
    const headerData = [
      ["Student Attendance Report"],
      [`Student: ${fullName} (${student.studentId})`],
      [`Month: ${selectedMonthYear}`],
      [`Generated on: ${reportDateTime}`],
      [],
      [...columns],
    ];

    const ws = XLSXUtils.aoa_to_sheet(headerData);

    // Add export data to Excel sheet
    XLSXUtils.sheet_add_json(ws, exportData, { origin: "A7", skipHeader: true });

    // Add summary to Excel sheet
    const summaryStartRow = exportData.length + 8;
    ws[`A${summaryStartRow}`] = { t: "s", v: "Summary" };
    ws[`A${summaryStartRow + 1}`] = { t: "s", v: "Present" };
    ws[`B${summaryStartRow + 1}`] = { t: "n", v: presentCount };
    ws[`A${summaryStartRow + 2}`] = { t: "s", v: "Absent" };
    ws[`B${summaryStartRow + 2}`] = { t: "n", v: absentCount };
    ws[`A${summaryStartRow + 3}`] = { t: "s", v: "Leave" };
    ws[`B${summaryStartRow + 3}`] = { t: "n", v: leaveCount };
    ws[`A${summaryStartRow + 4}`] = { t: "s", v: "Attendance %" };
    ws[`B${summaryStartRow + 4}`] = { t: "s", v: `${percentage}%` };

    // Create Excel workbook and add sheet
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "Student Attendance");
    const excelBuffer = XLSXWrite(wb, { bookType: "xlsx", type: "array" });

    // Trigger download
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

    // Add header image
    doc.addImage(headerBase64, "PNG", 10, 10, 180, 20);

    // Add title
    doc.setFontSize(14);
    const title = `Attendance Report - ${selectedMonthYear}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(title, textX, 40);

    // Add student info
    doc.setFontSize(11);
    doc.text(`Student: ${fullName}`, 14, 50);
    doc.text(`ID: ${student.studentId}`, 14, 57);
    doc.text(`Month: ${selectedMonthYear}`, 14, 64);
    doc.text(`Generated on: ${reportDateTime}`, 14, 71);

    // Add table with autoTable
    autoTable(doc, {
      head: [columns as unknown as string[]],
      body: [...exportData.map(row => columns.map(col => row[col as keyof typeof row]))],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [48, 67, 128], halign: 'center' },
      startY: 80,
      bodyStyles: {
        halign: 'center',
      },

      // Add footer image at bottom of each page
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.addImage(footerBase64, "PNG", 10, pageHeight - 30, 180, 20);
      },
    });

    // Save PDF
    doc.save(`${fullName}_${filename}.pdf`);
  }
};
