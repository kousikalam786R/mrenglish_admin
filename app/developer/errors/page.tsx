"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, X, Loader2, Ticket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorList } from "@/components/developer/ErrorList";
import {
  fetchErrorAggregates,
  fetchErrorById,
  markErrorResolved,
} from "@/lib/api/developer";
import {
  setErrors,
  setErrorDetail,
  setFilters,
  setLoading,
  resetFilters,
} from "@/redux/slices/developerSlice";
import { ErrorAggregate, ErrorStatus } from "@/lib/types/developer";
import { useRouter as useNextRouter } from "next/navigation";

export default function ErrorsPage() {
  const router = useRouter();
  const nextRouter = useNextRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const developer = useAppSelector((state) => state.developer);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "developer")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "developer")) {
      loadErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [developer.filters, user.role]);

  const loadErrors = async () => {
    try {
      dispatch(setLoading(true));
      const errors = await fetchErrorAggregates(developer.filters);
      dispatch(setErrors(errors));
    } catch (error) {
      console.error("Error loading errors:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleView = async (error: ErrorAggregate) => {
    try {
      const detail = await fetchErrorById(error._id);
      dispatch(setErrorDetail(detail));
      setDetailDialogOpen(true);
    } catch (error) {
      console.error("Error loading error detail:", error);
    }
  };

  const handleMarkResolved = async (error: ErrorAggregate) => {
    if (!confirm("Mark this error as resolved?")) return;

    try {
      await markErrorResolved(error._id, "Resolved");
      await loadErrors();
    } catch (error) {
      console.error("Error marking resolved:", error);
    }
  };

  const handleIgnore = async (error: ErrorAggregate) => {
    if (!confirm("Ignore this error?")) return;

    try {
      await markErrorResolved(error._id, "Ignored");
      await loadErrors();
    } catch (error) {
      console.error("Error ignoring:", error);
    }
  };

  const handleCreateTicket = (error: ErrorAggregate) => {
    // Navigate to tickets page with prepopulated data
    const params = new URLSearchParams({
      subject: `Error: ${error.title}`,
      description: `Error signature: ${error.signature}\nOccurrences: ${error.occurrenceCount}\nAffected users: ${error.affectedUsers}`,
      type: "Bug",
      priority: "High",
    });
    nextRouter.push(`/tickets/create?${params.toString()}`);
  };

  if (!checkAccess(user.role, "developer")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Errors</h1>
        <p className="text-muted-foreground">Error aggregation and management</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search errors..."
                  value={developer.filters.search || ""}
                  onChange={(e) =>
                    dispatch(setFilters({ search: e.target.value }))
                  }
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Select
                value={developer.filters.status || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ status: e.target.value as any }))
                }
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="Ignored">Ignored</option>
                <option value="Resolved">Resolved</option>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(resetFilters())}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Errors List</CardTitle>
          <CardDescription>
            {developer.errors.list.length} error(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {developer.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ErrorList
              errors={developer.errors.list}
              onView={handleView}
              onMarkResolved={handleMarkResolved}
              onIgnore={handleIgnore}
              onCreateTicket={handleCreateTicket}
            />
          )}
        </CardContent>
      </Card>

      {/* Error Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
            <DialogDescription>
              {developer.errors.selected?.title}
            </DialogDescription>
          </DialogHeader>
          {developer.errors.selected && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stack">Stack Trace</TabsTrigger>
                <TabsTrigger value="events">Sample Events</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Signature</p>
                    <p className="text-sm font-mono">{developer.errors.selected.signature}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm">{developer.errors.selected.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Occurrences</p>
                    <p className="text-sm">{developer.errors.selected.occurrenceCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Affected Users</p>
                    <p className="text-sm">{developer.errors.selected.affectedUsers}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Affected Endpoints</p>
                  <div className="flex gap-2 flex-wrap">
                    {developer.errors.selected.affectedEndpoints.map((endpoint) => (
                      <span key={endpoint} className="text-xs bg-muted px-2 py-1 rounded">
                        {endpoint}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {developer.errors.selected.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => handleCreateTicket(developer.errors.selected!)}
                  className="w-full"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Create Support Ticket
                </Button>
              </TabsContent>

              <TabsContent value="stack" className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Full Stack Trace</p>
                  <pre className="text-xs font-mono bg-muted p-4 rounded overflow-x-auto">
                    {developer.errors.selected.fullStack}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Sample Events</p>
                  <div className="space-y-2">
                    {developer.errors.selected.sampleEvents.map((event) => (
                      <div key={event._id} className="border rounded p-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium">Timestamp</p>
                            <p className="text-xs font-mono">{event.timestamp}</p>
                          </div>
                          <div>
                            <p className="font-medium">Request ID</p>
                            <p className="text-xs font-mono">{event.requestId || "N/A"}</p>
                          </div>
                          <div>
                            <p className="font-medium">Endpoint</p>
                            <p className="text-xs">{event.endpoint || "N/A"}</p>
                          </div>
                          <div>
                            <p className="font-medium">User ID</p>
                            <p className="text-xs">{event.userId || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

