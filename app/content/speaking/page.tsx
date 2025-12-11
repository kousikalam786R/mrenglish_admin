"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, X } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchSpeakingModules } from "@/lib/api/content";
import {
  setSpeaking,
  setFilters,
  setLoading,
  resetFilters,
} from "@/redux/slices/contentSlice";
import { SpeakingModule, Difficulty, SpeakingType, ContentStatus } from "@/lib/types/content";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function SpeakingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const content = useAppSelector((state) => state.content);

  useEffect(() => {
    if (!checkAccess(user.role, "content")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "content")) {
      loadSpeaking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.filters, user.role]);

  const loadSpeaking = async () => {
    try {
      dispatch(setLoading(true));
      const modules = await fetchSpeakingModules(content.filters);
      dispatch(setSpeaking(modules));
    } catch (error) {
      console.error("Error loading speaking modules:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  if (!checkAccess(user.role, "content")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Speaking Modules</h1>
          <p className="text-muted-foreground">Manage speaking modules</p>
        </div>
        <Link href="/content/speaking/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Speaking Module
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select
                value={content.filters.difficulty || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ difficulty: e.target.value as any }))
                }
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
            </div>
            <div>
              <Select
                value={content.filters.type || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ type: e.target.value as any }))
                }
              >
                <option value="all">All Types</option>
                <option value="Interview">Interview</option>
                <option value="Conversation">Conversation</option>
                <option value="Roleplay">Roleplay</option>
              </Select>
            </div>
            <div>
              <Select
                value={content.filters.status || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ status: e.target.value as any }))
                }
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
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

      {/* Speaking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Speaking Modules List</CardTitle>
          <CardDescription>
            {content.speaking.length} module(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module Name</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {content.speaking.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No speaking modules found
                      </TableCell>
                    </TableRow>
                  ) : (
                    content.speaking.map((module) => (
                      <TableRow key={module._id}>
                        <TableCell className="font-medium">{module.moduleName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{module.difficulty}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{module.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              module.status === "Published"
                                ? "default"
                                : module.status === "Draft"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {module.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(module.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/content/speaking/${module._id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/content/speaking/${module._id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
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
  );
}

