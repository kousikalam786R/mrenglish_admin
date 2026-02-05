"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { fetchInstituteLeads, updateLeadStatus, InstituteLead } from "@/lib/api/instituteLeads";
import { Loader2, Mail, Phone, MapPin } from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
];

export default function InstituteLeadsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [leads, setLeads] = useState<InstituteLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAccess(user.role, "institute-leads")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await fetchInstituteLeads({
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setLeads(res.leads);
      setPagination((p) => ({
        ...p,
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
      }));
    } catch (err) {
      console.error("Error fetching institute leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checkAccess(user.role, "institute-leads")) {
      loadLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role, pagination.page, statusFilter]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId);
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.error("Error updating lead status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "MMM d, yyyy HH:mm");
    } catch {
      return "—";
    }
  };

  if (!checkAccess(user.role, "institute-leads")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Institute Leads</h1>
        <p className="text-muted-foreground">
          Inquiries from the website institute form. Update status as you follow up.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Lead list</CardTitle>
              <CardDescription>
                {pagination.total} lead{pagination.total !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter by status:</span>
              <Select
                value={statusFilter || "all"}
                onChange={(e) => {
                  const v = e.target.value;
                  setStatusFilter(v === "all" ? "" : v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <option value="all">All</option>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institute</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No leads yet. Submissions from the website institute form will appear here.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leads.map((lead) => (
                        <TableRow key={lead._id}>
                          <TableCell className="font-medium">{lead.instituteName}</TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="text-primary hover:underline"
                                >
                                  {lead.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="text-primary hover:underline"
                                >
                                  {lead.phone}
                                </a>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {lead.city}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">
                            {lead.description}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                              disabled={updatingId === lead._id}
                            >
                              {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(lead.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
