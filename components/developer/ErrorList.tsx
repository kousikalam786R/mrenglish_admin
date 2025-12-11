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
import { Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ErrorAggregate } from "@/lib/types/developer";
import { format } from "date-fns";

interface ErrorListProps {
  errors: ErrorAggregate[];
  onView: (error: ErrorAggregate) => void;
  onMarkResolved: (error: ErrorAggregate) => void;
  onIgnore: (error: ErrorAggregate) => void;
  onCreateTicket: (error: ErrorAggregate) => void;
}

export function ErrorList({
  errors,
  onView,
  onMarkResolved,
  onIgnore,
  onCreateTicket,
}: ErrorListProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = (status: ErrorAggregate["status"]) => {
    const variants = {
      Open: "destructive",
      Ignored: "secondary",
      Resolved: "outline",
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Error Signature</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Occurrences</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead>Affected Users</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {errors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No errors found
              </TableCell>
            </TableRow>
          ) : (
            errors.map((error) => (
              <TableRow key={error._id}>
                <TableCell className="font-mono text-xs">
                  {error.signature}
                </TableCell>
                <TableCell className="font-medium">{error.title}</TableCell>
                <TableCell>{error.occurrenceCount.toLocaleString()}</TableCell>
                <TableCell className="text-sm">
                  {formatDate(error.lastSeen)}
                </TableCell>
                <TableCell>{error.affectedUsers}</TableCell>
                <TableCell>{getStatusBadge(error.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(error)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {error.status !== "Resolved" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMarkResolved(error)}
                        title="Mark Resolved"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {error.status !== "Ignored" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onIgnore(error)}
                        title="Ignore"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCreateTicket(error)}
                      title="Create Ticket"
                    >
                      <AlertCircle className="h-4 w-4" />
                    </Button>
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

