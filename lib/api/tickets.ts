import {
  Ticket,
  TicketFilters,
  TicketStats,
  TicketMessage,
  TicketNote,
  SupportAgent,
} from "@/lib/types/ticket";

export type { SupportAgent };

// Mock support agents
const mockAgents: SupportAgent[] = [
  {
    _id: "agent-1",
    name: "Sarah Johnson",
    email: "sarah@mre.com",
    role: "support_manager",
    activeTickets: 15,
  },
  {
    _id: "agent-2",
    name: "Mike Chen",
    email: "mike@mre.com",
    role: "support_agent",
    activeTickets: 8,
  },
  {
    _id: "agent-3",
    name: "Emily Davis",
    email: "emily@mre.com",
    role: "support_agent",
    activeTickets: 12,
  },
];

// Mock tickets
const generateMockTickets = (): Ticket[] => {
  const statuses: Ticket["status"][] = [
    "Open",
    "In-Progress",
    "Pending",
    "Resolved",
    "Closed",
  ];
  const priorities: Ticket["priority"][] = ["Low", "Medium", "High"];
  const types: Ticket["type"][] = ["Bug", "Payment", "Content", "General"];

  return Array.from({ length: 25 }, (_, i) => {
    const ticketId = `TKT-2024-${String(i + 1).padStart(3, "0")}`;
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const type = types[i % types.length];
    const assigned = i % 3 !== 0 ? mockAgents[i % mockAgents.length] : null;

    return {
      _id: `ticket-${i + 1}`,
      ticketId,
      subject: `Ticket ${i + 1}: ${type} issue`,
      userId: `user-${i + 1}`,
      userName: `User ${i + 1}`,
      userEmail: `user${i + 1}@example.com`,
      priority,
      type,
      status,
      assignedTo: assigned?._id,
      assignedToName: assigned?.name,
      description: `Description for ticket ${i + 1}. This is a ${type.toLowerCase()} related issue with ${priority.toLowerCase()} priority.`,
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      lastResponseAt:
        i % 2 === 0
          ? new Date(
              Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000
            ).toISOString()
          : undefined,
      resolvedAt:
        status === "Resolved" || status === "Closed"
          ? new Date(
              Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000
            ).toISOString()
          : undefined,
      messages: [],
      notes: [],
      activityLog: [],
    };
  });
};

let mockTickets = generateMockTickets();

export async function fetchTickets(
  filters: TicketFilters,
  userRole?: string,
  userId?: string
): Promise<Ticket[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockTickets];

  // Filter by role
  if (userRole === "support_agent" && userId) {
    filtered = filtered.filter((t) => t.assignedTo === userId);
  }

  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.ticketId.toLowerCase().includes(searchLower) ||
        t.subject.toLowerCase().includes(searchLower) ||
        t.userEmail.toLowerCase().includes(searchLower)
    );
  }

  if (filters.priority && filters.priority !== "all") {
    filtered = filtered.filter((t) => t.priority === filters.priority);
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  if (filters.type && filters.type !== "all") {
    filtered = filtered.filter((t) => t.type === filters.type);
  }

  if (filters.assignedTo && filters.assignedTo !== "all") {
    filtered = filtered.filter((t) => t.assignedTo === filters.assignedTo);
  }

  if (filters.dateFrom) {
    filtered = filtered.filter(
      (t) => new Date(t.createdAt) >= new Date(filters.dateFrom!)
    );
  }

  if (filters.dateTo) {
    filtered = filtered.filter(
      (t) => new Date(t.createdAt) <= new Date(filters.dateTo!)
    );
  }

  return filtered;
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const ticket = mockTickets.find((t) => t._id === id);
  if (!ticket) throw new Error("Ticket not found");

  // Add mock messages and notes
  ticket.messages = [
    {
      _id: "msg-1",
      ticketId: id,
      senderId: ticket.userId,
      senderName: ticket.userName,
      senderType: "user",
      content: ticket.description,
      createdAt: ticket.createdAt,
    },
    {
      _id: "msg-2",
      ticketId: id,
      senderId: "agent-1",
      senderName: "Sarah Johnson",
      senderType: "agent",
      content: "Thank you for reporting this issue. We're looking into it.",
      createdAt: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  ];

  ticket.notes = [
    {
      _id: "note-1",
      ticketId: id,
      agentId: "agent-1",
      agentName: "Sarah Johnson",
      content: "Initial review completed",
      createdAt: new Date(
        Date.now() - 1 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  ];

  ticket.activityLog = [
    {
      _id: "act-1",
      ticketId: id,
      action: "Ticket Created",
      performedBy: ticket.userId,
      performedByName: ticket.userName,
      timestamp: ticket.createdAt,
    },
    {
      _id: "act-2",
      ticketId: id,
      action: "Assigned",
      performedBy: "agent-1",
      performedByName: "Sarah Johnson",
      timestamp: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
      details: "Assigned to Sarah Johnson",
    },
  ];

  return ticket;
}

export async function createTicket(
  payload: Omit<Ticket, "_id" | "ticketId" | "createdAt" | "updatedAt" | "messages" | "notes" | "activityLog">
): Promise<Ticket> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newTicket: Ticket = {
    ...payload,
    _id: `ticket-${Date.now()}`,
    ticketId: `TKT-2024-${String(mockTickets.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    notes: [],
    activityLog: [
      {
        _id: `act-${Date.now()}`,
        ticketId: `TKT-2024-${String(mockTickets.length + 1).padStart(3, "0")}`,
        action: "Ticket Created",
        performedBy: payload.userId,
        performedByName: payload.userName,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  mockTickets.unshift(newTicket);
  return newTicket;
}

export async function updateTicket(
  id: string,
  data: Partial<Ticket>
): Promise<Ticket> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockTickets.findIndex((t) => t._id === id);
  if (index === -1) throw new Error("Ticket not found");

  const updated = {
    ...mockTickets[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  mockTickets[index] = updated;
  return updated;
}

export async function assignTicket(
  ticketId: string,
  agentId: string
): Promise<Ticket> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const agent = mockAgents.find((a) => a._id === agentId);
  if (!agent) throw new Error("Agent not found");

  const ticket = await updateTicket(ticketId, {
    assignedTo: agentId,
    assignedToName: agent.name,
    status: ticket.status === "Open" ? "In-Progress" : ticket.status,
  });

  // Add activity log
  ticket.activityLog.push({
    _id: `act-${Date.now()}`,
    ticketId: ticket.ticketId,
    action: "Assigned",
    performedBy: agentId,
    performedByName: agent.name,
    timestamp: new Date().toISOString(),
    details: `Assigned to ${agent.name}`,
  });

  return ticket;
}

export async function addTicketMessage(
  ticketId: string,
  message: Omit<TicketMessage, "_id" | "ticketId" | "createdAt">
): Promise<TicketMessage> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const ticket = mockTickets.find((t) => t._id === ticketId);
  if (!ticket) throw new Error("Ticket not found");

  const newMessage: TicketMessage = {
    ...message,
    _id: `msg-${Date.now()}`,
    ticketId: ticket.ticketId,
    createdAt: new Date().toISOString(),
  };

  ticket.messages.push(newMessage);
  ticket.updatedAt = new Date().toISOString();
  ticket.lastResponseAt = new Date().toISOString();

  return newMessage;
}

export async function addTicketNote(
  ticketId: string,
  note: Omit<TicketNote, "_id" | "ticketId" | "createdAt">
): Promise<TicketNote> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const ticket = mockTickets.find((t) => t._id === ticketId);
  if (!ticket) throw new Error("Ticket not found");

  const newNote: TicketNote = {
    ...note,
    _id: `note-${Date.now()}`,
    ticketId: ticket.ticketId,
    createdAt: new Date().toISOString(),
  };

  ticket.notes.push(newNote);

  return newNote;
}

export async function bulkUpdateTickets(
  ids: string[],
  data: Partial<Ticket>
): Promise<Ticket[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const updated: Ticket[] = [];
  for (const id of ids) {
    try {
      const ticket = await updateTicket(id, data);
      updated.push(ticket);
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
    }
  }

  return updated;
}

export async function fetchTicketStats(
  userRole?: string,
  userId?: string
): Promise<TicketStats> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let tickets = mockTickets;

  if (userRole === "support_agent" && userId) {
    tickets = tickets.filter((t) => t.assignedTo === userId);
  }

  return {
    unassigned: tickets.filter((t) => !t.assignedTo).length,
    open: tickets.filter((t) => t.status === "Open").length,
    pending: tickets.filter((t) => t.status === "Pending").length,
    inProgress: tickets.filter((t) => t.status === "In-Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
    closed: tickets.filter((t) => t.status === "Closed").length,
    avgResponseTime: 4.5, // hours
    slaBreaches: 2,
  };
}

export async function fetchSupportAgents(): Promise<SupportAgent[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockAgents;
}

