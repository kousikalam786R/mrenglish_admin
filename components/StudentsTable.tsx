"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { User } from "@/lib/types/user";
import { format } from "date-fns";

interface StudentsTableProps {
  students: User[];
  onView: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  showEdit?: boolean;
  showDelete?: boolean;
}

export function StudentsTable({
  students,
  onView,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
}: StudentsTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            students.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {user.profilePicThumbnail ? (
                      <img
                        src={user.profilePicThumbnail}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {user.name?.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      </div>
                    )}
                    <span>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.gender || "N/A"}</TableCell>
                <TableCell>{user.country || "N/A"}</TableCell>
                <TableCell>{user.phone || "N/A"}</TableCell>
                <TableCell>
                  {formatDate(user.registeredOn || user.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(user)}
                      title="View profile"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {showEdit && onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {showDelete && onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(user)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
