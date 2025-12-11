"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Download, CheckSquare, X } from "lucide-react";
import { TicketTable } from "@/components/TicketTable";
import { TicketModal } from "@/components/TicketModal";
import { AssignAgentDialog } from "@/components/AssignAgentDialog";
import { StatusChangeMenu } from "@/components/StatusChangeMenu";
import {
  fetchTickets,
  fetchTicketStats,
  bulkUpdateTickets,
  assignTicket,
  fetchSupportAgents,
} from "@/lib/api/tickets";
import {
  setTickets,
  setStats,
  setFilters,
  setLoading,
  toggleTicketSelection,
  selectAllTickets,
  clearSelection,
  updateTicketInList,
  resetFilters,
} from "@/redux/slices/ticketSlice";
import { Ticket, TicketStatus, SupportAgent } from "@/lib/types/ticket";
import { Loader2 } from "lucide-react";
import { exportToCSV } from "@/lib/utils/export";
import Link from "next/link";

export default function TicketsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const ticket = useAppSelector((state) => state.ticket);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [bulkAssignTarget, setBulkAssignTarget] = useState<string | null>(null);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [quickViewTicket, setQuickViewTicket] = useState<Ticket | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Permission enforcement
  useEffect(() => {
    if (!checkAccess(user.role, "tickets")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  // Load tickets and stats
  useEffect(() => {
    if (checkAccess(user.role, "tickets")) {
      loadTickets();
      loadStats();
      loadAgents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.filters, user.role, user.email]);

  const loadTickets = async () => {
    try {
      dispatch(setLoading(true));
      const tickets = await fetchTickets(
        ticket.filters,
        user.role,
        user.email // Use email as userId for filtering
      );
      dispatch(setTickets(tickets));
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loadStats = async () => {
    try {
      const stats = await fetchTicketStats(user.role, user.email);
      dispatch(setStats(stats));
    } catch (error) {
      console.error("Error loading stats:", error);
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

  const handleViewTicket = (ticket: Ticket) => {
    // For quick view, show modal. For full view, navigate to detail page
    setQuickViewTicket(ticket);
    setIsQuickViewOpen(true);
  };

  const handleBulkAssign = async (agentId: string) => {
    if (ticket.selectedTicketIds.length === 0) return;

    try {
      dispatch(setLoading(true));
      for (const ticketId of ticket.selectedTicketIds) {
        await assignTicket(ticketId, agentId);
      }
      await loadTickets();
      dispatch(clearSelection());
      setBulkAssignTarget(null);
    } catch (error) {
      console.error("Error bulk assigning:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleBulkStatusChange = async (status: TicketStatus) => {
    if (ticket.selectedTicketIds.length === 0) return;

    try {
      dispatch(setLoading(true));
      await bulkUpdateTickets(ticket.selectedTicketIds, { status });
      await loadTickets();
      dispatch(clearSelection());
      setStatusDialogOpen(false);
    } catch (error) {
      console.error("Error bulk updating:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExport = () => {
    const headers = [
      { key: "ticketId" as keyof Ticket, label: "Ticket ID" },
      { key: "subject" as keyof Ticket, label: "Subject" },
      { key: "userName" as keyof Ticket, label: "User" },
      { key: "priority" as keyof Ticket, label: "Priority" },
      { key: "type" as keyof Ticket, label: "Type" },
      { key: "status" as keyof Ticket, label: "Status" },
      { key: "assignedToName" as keyof Ticket, label: "Assigned To" },
      { key: "createdAt" as keyof Ticket, label: "Created At" },
    ];

    exportToCSV(
      ticket.tickets,
      `tickets-${new Date().toISOString().split("T")[0]}`,
      headers
    );
  };

  const canManage = user.role === "super_admin" || user.role === "support_manager" || user.role === "admin";
  const isAgent = user.role === "support_agent";

  if (!checkAccess(user.role, "tickets")) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">
            {isAgent ? "Your assigned tickets" : "Manage support tickets"}
          </p>
        </div>
        {canManage && (
          <Link href="/tickets/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticket.stats.open}</div>
            <p className="text-xs text-muted-foreground">Currently open</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticket.stats.unassigned}</div>
            <p className="text-xs text-muted-foreground">Need assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticket.stats.avgResponseTime}h
            </div>
            <p className="text-xs text-muted-foreground">Average hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticket.stats.slaBreaches}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={ticket.filters.search || ""}
                  onChange={(e) =>
                    dispatch(setFilters({ search: e.target.value }))
                  }
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Select
                value={ticket.filters.priority || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ priority: e.target.value as any }))
                }
              >
                <option value="all">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </div>
            <div>
              <Select
                value={ticket.filters.status || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ status: e.target.value as any }))
                }
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </Select>
            </div>
            <div>
              <Select
                value={ticket.filters.type || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ type: e.target.value as any }))
                }
              >
                <option value="all">All Types</option>
                <option value="Bug">Bug</option>
                <option value="Payment">Payment</option>
                <option value="Content">Content</option>
                <option value="General">General</option>
              </Select>
            </div>
            {canManage && (
              <div>
                <Select
                  value={ticket.filters.assignedTo || "all"}
                  onChange={(e) =>
                    dispatch(setFilters({ assignedTo: e.target.value }))
                  }
                >
                  <option value="all">All Agents</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date From</label>
              <Input
                type="date"
                value={ticket.filters.dateFrom || ""}
                onChange={(e) =>
                  dispatch(setFilters({ dateFrom: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date To</label>
              <Input
                type="date"
                value={ticket.filters.dateTo || ""}
                onChange={(e) =>
                  dispatch(setFilters({ dateTo: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(resetFilters())}
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {canManage && ticket.selectedTicketIds.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {ticket.selectedTicketIds.length} ticket(s) selected
              </span>
              <div className="flex gap-2">
                <Select
                  value={bulkAssignTarget || ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAssign(e.target.value);
                    }
                  }}
                >
                  <option value="">Assign to...</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusDialogOpen(true)}
                >
                  Change Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    dispatch(setFilters({ status: "Resolved" }));
                    handleBulkStatusChange("Resolved");
                  }}
                >
                  Mark Resolved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    dispatch(setFilters({ status: "Closed" }));
                    handleBulkStatusChange("Closed");
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(clearSelection())}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket List</CardTitle>
          <CardDescription>
            {ticket.tickets.length} ticket(s) found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {ticket.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto p-6">
              <TicketTable
                tickets={ticket.tickets}
                onViewTicket={handleViewTicket}
                selectedIds={ticket.selectedTicketIds}
                onToggleSelection={(id) => dispatch(toggleTicketSelection(id))}
                onSelectAll={() => dispatch(selectAllTickets())}
                showCheckboxes={canManage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <StatusChangeMenu
        currentStatus="Open"
        onStatusChange={async (status) => {
          await handleBulkStatusChange(status);
        }}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />

      {/* Quick View Modal */}
      <TicketModal
        ticket={quickViewTicket}
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
      />
    </div>
  );
}
