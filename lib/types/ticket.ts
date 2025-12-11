export type TicketPriority = "Low" | "Medium" | "High";
export type TicketType = "Bug" | "Payment" | "Content" | "General";
export type TicketStatus = "Open" | "In-Progress" | "Pending" | "Resolved" | "Closed";

export interface Ticket {
  _id: string;
  ticketId: string; // Display ID like TKT-2024-001
  subject: string;
  userId: string;
  userName: string;
  userEmail: string;
  priority: TicketPriority;
  type: TicketType;
  status: TicketStatus;
  assignedTo?: string;
  assignedToName?: string;
  description: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  lastResponseAt?: string;
  slaDueAt?: string;
  messages: TicketMessage[];
  notes: TicketNote[];
  activityLog: TicketActivity[];
}

export interface TicketMessage {
  _id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent" | "system";
  content: string;
  attachments?: string[];
  createdAt: string;
  isInternal?: boolean;
}

export interface TicketNote {
  _id: string;
  ticketId: string;
  agentId: string;
  agentName: string;
  content: string;
  createdAt: string;
}

export interface TicketActivity {
  _id: string;
  ticketId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details?: string;
}

export interface TicketFilters {
  search?: string;
  priority?: TicketPriority | "all";
  status?: TicketStatus | "all";
  type?: TicketType | "all";
  assignedTo?: string | "all";
  dateFrom?: string;
  dateTo?: string;
}

export interface TicketStats {
  unassigned: number;
  open: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResponseTime: number; // in hours
  slaBreaches: number;
}

export interface SupportAgent {
  _id: string;
  name: string;
  email: string;
  role: "support_agent" | "support_manager";
  activeTickets: number;
}

