"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "@/lib/types/ticket";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface TicketModalProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketModal({ ticket, open, onOpenChange }: TicketModalProps) {
  const router = useRouter();

  if (!ticket) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "N/A";
    }
  };

  const handleViewFull = () => {
    onOpenChange(false);
    router.push(`/tickets/${ticket._id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{ticket.ticketId}</DialogTitle>
          <DialogDescription>{ticket.subject}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Priority</p>
              <Badge
                variant={
                  ticket.priority === "High"
                    ? "destructive"
                    : ticket.priority === "Medium"
                    ? "default"
                    : "secondary"
                }
              >
                {ticket.priority}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <Badge variant="default">{ticket.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Type</p>
              <Badge variant="outline">{ticket.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Assigned To</p>
              <p className="text-sm text-muted-foreground">
                {ticket.assignedToName || "Unassigned"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">User</p>
            <p className="text-sm text-muted-foreground">
              {ticket.userName} ({ticket.userEmail})
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Description</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Created</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(ticket.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(ticket.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleViewFull}>View Full Details</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

