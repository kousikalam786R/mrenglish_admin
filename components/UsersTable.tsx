"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { User } from "@/lib/types/user";
import { format } from "date-fns";

interface UsersTableProps {
  users: User[];
  onViewUser: (user: User) => void;
}

export function UsersTable({ users, onViewUser }: UsersTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const getAccountTypeBadge = (user: User) => {
    const accountType = user.accountType || (user.subscriptionStatus === "paid" ? "Paid" : "Free");
    if (accountType === "Paid") {
      return <Badge variant="default">Paid</Badge>;
    }
    return <Badge variant="outline">Free</Badge>;
  };

  const getSubscriptionTypeBadge = (user: User) => {
    const subType = user.subscriptionType || "NA";
    if (subType === "NA") {
      return <Badge variant="secondary">NA</Badge>;
    }
    return <Badge variant="outline">{subType}</Badge>;
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
            <TableHead>Account Type</TableHead>
            <TableHead>Subscription Type</TableHead>
            <TableHead>Subscription End Date</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
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
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.gender || "N/A"}</TableCell>
                <TableCell>{user.country || "N/A"}</TableCell>
                <TableCell>{getAccountTypeBadge(user)}</TableCell>
                <TableCell>{getSubscriptionTypeBadge(user)}</TableCell>
                <TableCell>
                  {user.subscriptionEnd ? formatDate(user.subscriptionEnd) : "N/A"}
                </TableCell>
                <TableCell>
                  {formatDate(user.registeredOn || user.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewUser(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
