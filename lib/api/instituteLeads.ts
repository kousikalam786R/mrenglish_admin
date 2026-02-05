import axiosInstance from "@/lib/axiosInstance";

export interface InstituteLead {
  _id: string;
  instituteName: string;
  email: string;
  phone: string;
  city: string;
  description: string;
  status: string;
  source?: string;
  createdAt: string;
}

export interface InstituteLeadsResponse {
  success: boolean;
  leads: InstituteLead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchInstituteLeads(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<InstituteLeadsResponse> {
  const res = await axiosInstance.get("/institute-leads", { params });
  if (!res.data?.success) throw new Error(res.data?.message || "Failed to fetch leads");
  return res.data;
}

export async function updateLeadStatus(
  id: string,
  status: string
): Promise<{ success: boolean; lead: InstituteLead }> {
  const res = await axiosInstance.patch(`/institute-leads/${id}/status`, { status });
  if (!res.data?.success) throw new Error(res.data?.message || "Failed to update lead");
  return res.data;
}
