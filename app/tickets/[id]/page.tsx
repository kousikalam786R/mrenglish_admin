"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Clock, MessageSquare } from "lucide-react";
import { TicketComposer } from "@/components/TicketComposer";
import { AssignAgentDialog } from "@/components/AssignAgentDialog";
import { StatusChangeMenu } from "@/components/StatusChangeMenu";
import {
  fetchTicketById,
  updateTicket,
  assignTicket,
  addTicketMessage,
  addTicketNote,
} from "@/lib/api/tickets";
import {
  setSelectedTicket,
  updateTicketInList,
  setLoading,
} from "@/redux/slices/ticketSlice";
import { Ticket, TicketStatus } from "@/lib/types/ticket";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fetchSupportAgents } from "@/lib/api/tickets";
import { SupportAgent } from "@/lib/types/ticket";

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const ticket = useAppSelector((state) => state.ticket);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [agents, setAgents] = useState<SupportAgent[]>([]);

  const ticketId = params.id as string;

  // Permission enforcement
  useEffect(() => {
    if (!checkAccess(user.role, "tickets")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  // Load ticket
  useEffect(() => {
    if (checkAccess(user.role, "tickets") && ticketId) {
      loadTicket();
      loadAgents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      dispatch(setLoading(true));
      const ticketData = await fetchTicketById(ticketId);
      dispatch(setSelectedTicket(ticketData));
    } catch (error) {
      console.error("Error loading ticket:", error);
      router.push("/tickets");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loadAgents = async () => {
    try {
      const data = await fetchSupportAgents();
      setAgents(data);
    } catch (error) {
      console.error("Error loading agents:", error);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket.selectedTicket) return;

    try {
      const updated = await updateTicket(ticket.selectedTicket._id, {
        status,
        resolvedAt: status === "Resolved" || status === "Closed" 
          ? new Date().toISOString() 
          : undefined,
      });
      dispatch(updateTicketInList(updated));
      dispatch(setSelectedTicket(updated));
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  const handleAssign = async (agentId: string) => {
    if (!ticket.selectedTicket) return;

    try {
      const updated = await assignTicket(ticket.selectedTicket._id, agentId);
      dispatch(updateTicketInList(updated));
      dispatch(setSelectedTicket(updated));
    } catch (error) {
      console.error("Error assigning ticket:", error);
      throw error;
    }
  };

  const handleSendMessage = async (content: string, isInternal?: boolean) => {
    if (!ticket.selectedTicket) return;

    try {
      if (isInternal) {
        await addTicketNote(ticket.selectedTicket._id, {
          agentId: user.email, // Using email as ID
          agentName: user.name,
          content,
        });
      } else {
        await addTicketMessage(ticket.selectedTicket._id, {
          senderId: user.email,
          senderName: user.name,
          senderType: "agent",
          content,
        });
      }
      await loadTicket();
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const canManage = user.role === "super_admin" || user.role === "support_manager" || user.role === "admin";
  const isAssigned = ticket.selectedTicket?.assignedTo === user.email || canManage;

  if (!checkAccess(user.role, "tickets")) {
    return null;
  }

  if (ticket.loading || !ticket.selectedTicket) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedTicket = ticket.selectedTicket;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/tickets")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{selectedTicket.ticketId}</h1>
            <p className="text-muted-foreground">{selectedTicket.subject}</p>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(true)}
            >
              Assign
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(true)}
            >
              Change Status
            </Button>
          </div>
        )}
      </div>

      {/* Ticket Metadata */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                selectedTicket.priority === "High"
                  ? "destructive"
                  : selectedTicket.priority === "Medium"
                  ? "default"
                  : "secondary"
              }
            >
              {selectedTicket.priority}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default">{selectedTicket.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{selectedTicket.type}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assigned To</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTicket.assignedToName || (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
            </CardContent>
          </Card>

          {/* Conversation Thread */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message._id}
                  className={`p-4 rounded-lg ${
                    message.senderType === "user"
                      ? "bg-muted"
                      : "bg-primary/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{message.senderName}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.senderType}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}

              {/* Reply Composer */}
              {isAssigned && (
                <div className="pt-4 border-t">
                  <TicketComposer
                    onSend={handleSendMessage}
                    placeholder="Type your reply..."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.userName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.userEmail}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedTicket.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedTicket.updatedAt)}
                </p>
              </div>
              {selectedTicket.lastResponseAt && (
                <div>
                  <p className="text-sm font-medium">Last Response</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedTicket.lastResponseAt)}
                  </p>
                </div>
              )}
              {selectedTicket.resolvedAt && (
                <div>
                  <p className="text-sm font-medium">Resolved</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedTicket.resolvedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Internal Notes */}
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTicket.notes.map((note) => (
                  <div key={note._id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {note.agentName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))}
                <TicketComposer
                  onSend={(content) => handleSendMessage(content, true)}
                  placeholder="Add internal note..."
                  showInternalToggle={false}
                />
              </CardContent>
            </Card>
          )}

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedTicket.activityLog.map((activity) => (
                <div key={activity._id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{activity.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    by {activity.performedByName}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.details}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Dialog */}
      <AssignAgentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssign={handleAssign}
        currentAgentId={selectedTicket.assignedTo}
      />

      {/* Status Change Dialog */}
      <StatusChangeMenu
        currentStatus={selectedTicket.status}
        onStatusChange={handleStatusChange}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />
    </div>
  );
}

