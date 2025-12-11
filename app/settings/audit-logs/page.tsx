"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Download, X, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchAuditLogs,
} from "@/lib/api/settings";
import {
  setAuditLogs,
  setFilters,
  setLoading,
  resetFilters,
} from "@/redux/slices/settingsSlice";
import { exportToCSV } from "@/lib/utils/export";
import { format } from "date-fns";

export default function AuditLogsSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const settings = useAppSelector((state) => state.settings);

  useEffect(() => {
    if (!checkAccess(user.role, "settings") && user.role !== "developer") {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "settings") || user.role === "developer") {
      loadLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.filters, user.role]);

  const loadLogs = async () => {
    try {
      dispatch(setLoading(true));
      const logs = await fetchAuditLogs(settings.filters);
      dispatch(setAuditLogs(logs));
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExport = () => {
    exportToCSV(
      settings.auditLogs,
      `audit-logs-${new Date().toISOString().split("T")[0]}`,
      [
        { key: "timestamp", label: "Timestamp" },
        { key: "actor.name", label: "Actor" },
        { key: "action", label: "Action" },
        { key: "target.name", label: "Target" },
        { key: "details", label: "Details" },
      ]
    );
  };

  if (!checkAccess(user.role, "settings") && user.role !== "developer") {
    return null;
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">System activity and changes</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Actor</label>
                <Input
                  value={settings.filters.actor || ""}
                  onChange={(e) =>
                    dispatch(setFilters({ actor: e.target.value }))
                  }
                  placeholder="Search actor..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Action</label>
                <Select
                  value={settings.filters.action || "all"}
                  onChange={(e) =>
                    dispatch(setFilters({ action: e.target.value === "all" ? undefined : e.target.value }))
                  }
                >
                  <option value="all">All Actions</option>
                  <option value="role.updated">Role Updated</option>
                  <option value="plan.created">Plan Created</option>
                  <option value="integration.tested">Integration Tested</option>
                  <option value="user.deleted">User Deleted</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date From</label>
                <Input
                  type="date"
                  value={settings.filters.dateFrom || ""}
                  onChange={(e) =>
                    dispatch(setFilters({ dateFrom: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date To</label>
                <Input
                  type="date"
                  value={settings.filters.dateTo || ""}
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

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              {settings.auditLogs.length} log(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settings.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      settings.auditLogs.map((log) => (
                        <TableRow key={log._id}>
                          <TableCell className="font-mono text-xs">
                            {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{log.actor.name}</p>
                              <p className="text-xs text-muted-foreground">{log.actor.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{log.action}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{log.target.type}</p>
                              <p className="text-xs text-muted-foreground">{log.target.name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md truncate">{log.details}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}

