"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentsTable } from "@/components/StudentsTable";
import { ViewUserModal } from "@/components/ViewUserModal";
import { Pagination } from "@/components/Pagination";
import { PaginationMeta } from "@/lib/types/user";
import { User } from "@/lib/types/user";
import { Institute } from "@/lib/types/institute";
import { fetchInstituteById, fetchStudentsByInstitute } from "@/lib/api/institutes";
import { setSelectedUser } from "@/redux/slices/userListSlice";
import { Loader2, ArrowLeft } from "lucide-react";

export default function InstituteStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const userList = useAppSelector((state) => state.userList);

  const instituteId = params?.id as string;
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (!checkAccess(user.role, "institutes")) {
      router.push("/dashboard");
      return;
    }
  }, [user.role, router]);

  useEffect(() => {
    if (!instituteId || !checkAccess(user.role, "institutes")) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [inst, result] = await Promise.all([
          fetchInstituteById(instituteId),
          fetchStudentsByInstitute(instituteId, { page: 1, limit: 10, total: 0, totalPages: 0 }),
        ]);
        if (!cancelled) {
          setInstitute(inst || null);
          setStudents(result.students);
          setPagination(result.pagination);
        }
      } catch (err) {
        if (!cancelled) console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [instituteId, user.role]);

  useEffect(() => {
    if (!instituteId || pagination.page === 1) return;
    let cancelled = false;
    (async () => {
      const result = await fetchStudentsByInstitute(instituteId, pagination);
      if (!cancelled) {
        setStudents(result.students);
        setPagination(result.pagination);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [instituteId, pagination.page]);

  const handleView = (u: User) => {
    dispatch(setSelectedUser(u));
    setViewModalOpen(true);
  };

  if (!checkAccess(user.role, "institutes")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/institutes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {institute ? `${institute.name} — Students` : "Institute Students"}
          </h1>
          <p className="text-muted-foreground">
            View student profiles for this institute.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>{pagination.total} students</CardDescription>
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
                showEdit={false}
                showDelete={false}
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
    </div>
  );
}
