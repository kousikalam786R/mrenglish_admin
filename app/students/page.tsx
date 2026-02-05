"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentsTable } from "@/components/StudentsTable";
import { ViewUserModal } from "@/components/ViewUserModal";
import { StudentFormModal } from "@/components/StudentFormModal";
import { Pagination } from "@/components/Pagination";
import { PaginationMeta } from "@/lib/types/user";
import { User } from "@/lib/types/user";
import {
  fetchMyStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/lib/api/institutes";
import { setSelectedUser } from "@/redux/slices/userListSlice";
import { Loader2, Plus, Search } from "lucide-react";
import { confirmAction } from "@/lib/utils/confirm";

export default function StudentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const userList = useAppSelector((state) => state.userList);

  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  const instituteId = user.instituteId;

  useEffect(() => {
    if (!checkAccess(user.role, "students")) {
      router.push("/dashboard");
      return;
    }
    if (user.role !== "institute" || !instituteId) {
      router.push("/dashboard");
      return;
    }
  }, [user.role, user.instituteId, instituteId, router]);

  const loadStudents = async () => {
    if (!instituteId) return;
    setLoading(true);
    try {
      const result = await fetchMyStudents(
        instituteId,
        { search: search || undefined },
        { ...pagination, page: pagination.page }
      );
      setStudents(result.students);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checkAccess(user.role, "students") && instituteId) {
      loadStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instituteId, pagination.page]);

  useEffect(() => {
    if (!instituteId) return;
    const t = setTimeout(() => {
      setPagination((p) => ({ ...p, page: 1 }));
      loadStudents();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleView = (u: User) => {
    dispatch(setSelectedUser(u));
    setViewModalOpen(true);
  };

  const handleEdit = (u: User) => {
    setEditingStudent(u);
    setFormModalOpen(true);
  };

  const handleDelete = async (u: User) => {
    const ok = await confirmAction(
      `Are you sure you want to delete student "${u.name}"? This cannot be undone.`
    );
    if (!ok || !instituteId) return;
    try {
      await deleteStudent(instituteId, u._id);
      loadStudents();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    email: string;
    gender?: string;
    country?: string;
    phone?: string;
  }) => {
    if (!instituteId) return;
    if (editingStudent) {
      await updateStudent(instituteId, editingStudent._id, data);
    } else {
      await createStudent(instituteId, data);
    }
    loadStudents();
  };

  if (!checkAccess(user.role, "students") || user.role !== "institute" || !instituteId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">
          Manage your institute students — view profiles, add, edit, and remove students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Student List</CardTitle>
              <CardDescription>{pagination.total} total students</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <StudentsTable
                students={students}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              {pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    pagination={pagination}
                    onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ViewUserModal
        user={userList.selectedUser}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      <StudentFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        initialData={editingStudent}
        onSubmit={handleFormSubmit}
        title={editingStudent ? "Edit Student" : "Add Student"}
        description={editingStudent ? "Update student details." : "Add a new student to your institute."}
      />
    </div>
  );
}
