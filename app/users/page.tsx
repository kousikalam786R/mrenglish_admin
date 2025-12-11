"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/UsersTable";
import { UserFiltersComponent } from "@/components/UserFilters";
import { Pagination } from "@/components/Pagination";
import { ViewUserModal } from "@/components/ViewUserModal";
import { PaginationMeta } from "@/lib/types/user";
import { fetchUsers } from "@/lib/api/users";
import {
  setUsers,
  setFilters,
  setSelectedUser,
  setLoading,
  resetFilters,
} from "@/redux/slices/userListSlice";
import { Loader2 } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const userList = useAppSelector((state) => state.userList);

  // Permission enforcement
  useEffect(() => {
    if (!checkAccess(user.role, "users")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch users from API
  const loadUsers = async () => {
    try {
      dispatch(setLoading(true));
      const result = await fetchUsers(userList.filters, pagination);
      dispatch(setUsers(result.users));
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (checkAccess(user.role, "users")) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  useEffect(() => {
    if (checkAccess(user.role, "users")) {
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userList.filters]);

  const handleViewUser = (user: any) => {
    dispatch(setSelectedUser(user));
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const handleFiltersChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setPagination({ ...pagination, page: 1 });
  };

  // Don't render if user doesn't have access
  if (!checkAccess(user.role, "users")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage all users in the system
        </p>
      </div>

      {/* Filters */}
      <UserFiltersComponent
        filters={userList.filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            {pagination.total} total users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userList.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <UsersTable
                users={userList.users}
                onViewUser={handleViewUser}
              />
              {pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View User Modal */}
      <ViewUserModal
        user={userList.selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
