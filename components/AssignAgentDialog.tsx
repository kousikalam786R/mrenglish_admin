"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SupportAgent } from "@/lib/types/ticket";
import { fetchSupportAgents } from "@/lib/api/tickets";
import { Loader2 } from "lucide-react";

interface AssignAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (agentId: string) => Promise<void>;
  currentAgentId?: string;
}

export function AssignAgentDialog({
  open,
  onOpenChange,
  onAssign,
  currentAgentId,
}: AssignAgentDialogProps) {
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open) {
      loadAgents();
      setSelectedAgentId(currentAgentId || "");
    }
  }, [open, currentAgentId]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await fetchSupportAgents();
      setAgents(data);
    } catch (error) {
      console.error("Error loading agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAgentId) return;

    try {
      setAssigning(true);
      await onAssign(selectedAgentId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning ticket:", error);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
          <DialogDescription>
            Select a support agent to assign this ticket to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="agent">Support Agent</Label>
                <Select
                  id="agent"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  disabled={assigning}
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.activeTickets} active tickets)
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={assigning}
                >
                  Cancel
                </Button>
                <Button onClick={handleAssign} disabled={assigning || !selectedAgentId}>
                  {assigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

