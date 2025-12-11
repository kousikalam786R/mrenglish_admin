import { Payment, Plan, Refund } from "@/lib/types/subscription";

// Export to CSV
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers: { key: keyof T; label: string }[]
) {
  // Create CSV header
  const csvHeaders = headers.map((h) => h.label).join(",");
  
  // Create CSV rows
  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header.key];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",")
  );

  // Combine header and rows
  const csvContent = [csvHeaders, ...csvRows].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export payments to CSV
export function exportPaymentsToCSV(payments: Payment[]) {
  const headers = [
    { key: "transactionId" as keyof Payment, label: "Transaction ID" },
    { key: "userName" as keyof Payment, label: "User Name" },
    { key: "userEmail" as keyof Payment, label: "User Email" },
    { key: "planName" as keyof Payment, label: "Plan Name" },
    { key: "amount" as keyof Payment, label: "Amount" },
    { key: "currency" as keyof Payment, label: "Currency" },
    { key: "paymentMethod" as keyof Payment, label: "Payment Method" },
    { key: "status" as keyof Payment, label: "Status" },
    { key: "date" as keyof Payment, label: "Date" },
  ];

  exportToCSV(payments, `payments-${new Date().toISOString().split("T")[0]}`, headers);
}

// Export plans to CSV
export function exportPlansToCSV(plans: Plan[]) {
  const headers = [
    { key: "name" as keyof Plan, label: "Plan Name" },
    { key: "price" as keyof Plan, label: "Price" },
    { key: "billingCycle" as keyof Plan, label: "Billing Cycle" },
    { key: "activeSubscribers" as keyof Plan, label: "Active Subscribers" },
    { key: "status" as keyof Plan, label: "Status" },
  ];

  exportToCSV(plans, `plans-${new Date().toISOString().split("T")[0]}`, headers);
}

// Export to Excel (simplified - creates CSV with .xlsx extension)
// For full Excel support, you'd need a library like xlsx
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers: { key: keyof T; label: string }[]
) {
  // For now, we'll export as CSV but with .xlsx extension
  // In production, use a library like 'xlsx' for proper Excel format
  exportToCSV(data, filename, headers);
  
  // Note: This creates a CSV file. For true Excel format, install:
  // npm install xlsx
  // Then use: XLSX.writeFile(workbook, filename)
}

// Export to JSON
export function exportToJSON<T>(data: T[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  downloadBlob(filename, blob, "json");
}

// Download blob utility
export function downloadBlob(filename: string, blob: Blob, extension: string = "") {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}${extension ? `.${extension}` : ""}`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

