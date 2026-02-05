import { Institute, InstituteFormData } from "@/lib/types/institute";
import { User, PaginationMeta } from "@/lib/types/user";
import axiosInstance from "@/lib/axiosInstance";

// In-memory mock data for development (replace with real API calls when backend is ready)
let mockInstitutes: Institute[] = [
  {
    _id: "inst1",
    name: "ABC English Academy",
    email: "admin@abcenglish.com",
    address: "123 Main St, City",
    phone: "+91 9876543210",
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    _id: "inst2",
    name: "Global Language Institute",
    email: "contact@globallang.com",
    address: "456 Park Ave",
    phone: "+91 9123456789",
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
];

let mockInstituteStudents: Record<string, User[]> = {
  inst1: [
    {
      _id: "s1",
      name: "Rahul Kumar",
      email: "rahul@example.com",
      gender: "Male",
      country: "India",
      instituteId: "inst1",
      registeredOn: "2024-10-12",
      createdAt: "2024-10-12T00:00:00.000Z",
    },
    {
      _id: "s2",
      name: "Priya Sharma",
      email: "priya@example.com",
      gender: "Female",
      country: "India",
      instituteId: "inst1",
      registeredOn: "2024-11-01",
      createdAt: "2024-11-01T00:00:00.000Z",
    },
  ],
  inst2: [
    {
      _id: "s3",
      name: "Amit Patel",
      email: "amit@example.com",
      gender: "Male",
      country: "India",
      instituteId: "inst2",
      registeredOn: "2024-09-15",
      createdAt: "2024-09-15T00:00:00.000Z",
    },
  ],
};

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function fetchInstitutes(): Promise<Institute[]> {
  try {
    const res = await axiosInstance.get("/institutes");
    if (res.data?.institutes) return res.data.institutes;
  } catch {
    // Fallback to mock
  }
  await new Promise((r) => setTimeout(r, 300));
  return [...mockInstitutes];
}

export async function fetchInstituteById(id: string): Promise<Institute | null> {
  try {
    const res = await axiosInstance.get(`/institutes/${id}`);
    if (res.data?.institute) return res.data.institute;
  } catch {
    // Fallback to mock
  }
  await new Promise((r) => setTimeout(r, 200));
  return mockInstitutes.find((i) => i._id === id) || null;
}

export async function createInstitute(data: InstituteFormData): Promise<Institute> {
  try {
    const res = await axiosInstance.post("/institutes", data);
    if (res.data?.institute) return res.data.institute;
  } catch {
    // Fallback to mock
  }
  await new Promise((r) => setTimeout(r, 300));
  const newInst: Institute = {
    _id: generateId(),
    name: data.name,
    email: data.email,
    address: data.address,
    phone: data.phone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockInstitutes.push(newInst);
  mockInstituteStudents[newInst._id] = [];
  return newInst;
}

export async function updateInstitute(id: string, data: InstituteFormData): Promise<Institute> {
  try {
    const res = await axiosInstance.put(`/institutes/${id}`, data);
    if (res.data?.institute) return res.data.institute;
  } catch {
    // Fallback to mock
  }
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockInstitutes.findIndex((i) => i._id === id);
  if (idx === -1) throw new Error("Institute not found");
  mockInstitutes[idx] = {
    ...mockInstitutes[idx],
    ...data,
    _id: id,
    updatedAt: new Date().toISOString(),
  };
  return mockInstitutes[idx];
}

export async function deleteInstitute(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/institutes/${id}`);
    return;
  } catch {
    // Fallback to mock
  }
  await new Promise((r) => setTimeout(r, 200));
  mockInstitutes = mockInstitutes.filter((i) => i._id !== id);
  delete mockInstituteStudents[id];
}

// Students under an institute (for admin viewing institute's students)
export async function fetchStudentsByInstitute(
  instituteId: string,
  pagination?: PaginationMeta
): Promise<{ students: User[]; pagination: PaginationMeta }> {
  try {
    const res = await axiosInstance.get(`/institutes/${instituteId}/students`, {
      params: pagination,
    });
    if (res.data?.students !== undefined) {
      const pag = res.data.pagination || {
        page: 1,
        limit: 10,
        total: res.data.students.length,
        totalPages: 1,
      };
      return { students: res.data.students, pagination: pag };
    }
  } catch {
    // Fallback to mock
  }
  await new Promise((r) => setTimeout(r, 300));
  const list = mockInstituteStudents[instituteId] || [];
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const start = (page - 1) * limit;
  const students = list.slice(start, start + limit);
  return {
    students,
    pagination: {
      page,
      limit,
      total: list.length,
      totalPages: Math.ceil(list.length / limit) || 1,
    },
  };
}

// Institute role: CRUD their own students
export async function fetchMyStudents(
  instituteId: string,
  filters: { search?: string },
  pagination: PaginationMeta
): Promise<{ students: User[]; pagination: PaginationMeta }> {
  try {
    const res = await axiosInstance.get(`/institutes/${instituteId}/students`, {
      params: { ...pagination, search: filters.search },
    });
    if (res.data?.students !== undefined) {
      const pag = res.data.pagination || {
        page: 1,
        limit: 10,
        total: res.data.students.length,
        totalPages: 1,
      };
      return { students: res.data.students, pagination: pag };
    }
  } catch {
    // use mock below
  }
  const list = mockInstituteStudents[instituteId] || [];
  let filtered = list;
  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    filtered = list.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
    );
  }
  const start = (pagination.page - 1) * pagination.limit;
  const students = filtered.slice(start, start + pagination.limit);
  return {
    students,
    pagination: {
      ...pagination,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pagination.limit) || 1,
    },
  };
}

export async function createStudent(
  instituteId: string,
  data: Partial<User> & { name: string; email: string }
): Promise<User> {
  try {
    const res = await axiosInstance.post(`/institutes/${instituteId}/students`, data);
    if (res.data?.student) return res.data.student;
  } catch {
    // Fallback to mock
  }
  await new Promise((r) => setTimeout(r, 300));
  const newStudent: User = {
    _id: generateId(),
    name: data.name,
    email: data.email,
    instituteId,
    gender: data.gender,
    country: data.country,
    phone: data.phone,
    createdAt: new Date().toISOString(),
    registeredOn: new Date().toISOString().slice(0, 10),
  };
  if (!mockInstituteStudents[instituteId]) mockInstituteStudents[instituteId] = [];
  mockInstituteStudents[instituteId].push(newStudent);
  return newStudent;
}

export async function updateStudent(
  instituteId: string,
  studentId: string,
  data: Partial<User>
): Promise<User> {
  try {
    const res = await axiosInstance.put(
      `/institutes/${instituteId}/students/${studentId}`,
      data
    );
    if (res.data?.student) return res.data.student;
  } catch {
    // Fallback to mock
  }
  await new Promise((r) => setTimeout(r, 300));
  const list = mockInstituteStudents[instituteId] || [];
  const idx = list.findIndex((s) => s._id === studentId);
  if (idx === -1) throw new Error("Student not found");
  list[idx] = { ...list[idx], ...data, _id: studentId };
  return list[idx];
}

export async function deleteStudent(
  instituteId: string,
  studentId: string
): Promise<void> {
  try {
    await axiosInstance.delete(`/institutes/${instituteId}/students/${studentId}`);
    return;
  } catch {
    // Fallback to mock
  }
  await new Promise((r) => setTimeout(r, 200));
  const list = mockInstituteStudents[instituteId] || [];
  mockInstituteStudents[instituteId] = list.filter((s) => s._id !== studentId);
}
