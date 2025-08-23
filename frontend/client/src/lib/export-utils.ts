import { apiRequest } from "./queryClient";

export const exportToCSV = async () => {
  try {
    const response = await apiRequest("POST", "/api/export/csv");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin_leads.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error('Failed to export CSV');
  }
};

export const exportToExcel = async () => {
  try {
    const response = await apiRequest("POST", "/api/export/excel");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin_leads.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Excel export failed:', error);
    throw new Error('Failed to export Excel');
  }
};
