"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TicketStatus } from "@/lib/types/ticket";
import { Loader2 } from "lucide-react";

interface StatusChangeMenuProps {
  currentStatus: TicketStatus;
  onStatusChange: (status: TicketStatus) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatusChangeMenu({
  currentStatus,
  onStatusChange,
  open,
  onOpenChange,
}: StatusChangeMenuProps) {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(currentStatus);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus, open]);

  const handleChange = async () => {
    if (selectedStatus === currentStatus) {
      onOpenChange(false);
      return;
    }

    try {
      setChanging(true);
      await onStatusChange(selectedStatus);
      onOpenChange(false);
    } catch (error) {
      console.error("Error changing status:", error);
    } finally {
      setChanging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
          <DialogDescription>
            Update the ticket status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
              disabled={changing}
            >
              <option value="Open">Open</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={changing}
            >
              Cancel
            </Button>
            <Button onClick={handleChange} disabled={changing}>
              {changing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

