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
import { Ticket } from "@/lib/types/ticket";
import { format } from "date-fns";

interface TicketTableProps {
  tickets: Ticket[];
  onViewTicket: (ticket: Ticket) => void;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  showCheckboxes?: boolean;
}

export function TicketTable({
  tickets,
  onViewTicket,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  showCheckboxes = false,
}: TicketTableProps) {
  const allSelected =
    tickets.length > 0 && selectedIds.length === tickets.length;

  const getPriorityBadge = (priority: Ticket["priority"]) => {
    const variants = {
      High: "destructive",
      Medium: "default",
      Low: "secondary",
    };
    return (
      <Badge variant={variants[priority] as any}>{priority}</Badge>
    );
  };

  const getStatusBadge = (status: Ticket["status"]) => {
    const variants = {
      Open: "default",
      "In-Progress": "default",
      Pending: "secondary",
      Resolved: "outline",
      Closed: "secondary",
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="rounded-md border min-w-[1000px]">
        <Table className="w-full">
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded"
                />
              </TableHead>
            )}
            <TableHead>Ticket ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showCheckboxes ? 11 : 10}
                className="text-center py-8"
              >
                No tickets found
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow key={ticket._id}>
                {showCheckboxes && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(ticket._id)}
                      onChange={() => onToggleSelection(ticket._id)}
                      className="rounded"
                    />
                  </TableCell>
                )}
                <TableCell className="font-mono text-sm">
                  {ticket.ticketId}
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {ticket.subject}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {ticket.userEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.type}</Badge>
                </TableCell>
                <TableCell>
                  {ticket.assignedToName || (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell className="text-sm">
                  {formatDate(ticket.createdAt)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(ticket.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewTicket(ticket)}
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
    </div>
  );
}

