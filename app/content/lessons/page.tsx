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
import { Plus, Search, Eye, Edit, Download, X } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchLessons,
  updateLesson,
} from "@/lib/api/content";
import {
  setLessons,
  setFilters,
  setLoading,
  resetFilters,
  updateLesson as updateLessonAction,
} from "@/redux/slices/contentSlice";
import { Lesson, ContentLevel, LessonCategory, ContentStatus } from "@/lib/types/content";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { exportToCSV } from "@/lib/utils/export";

export default function LessonsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const content = useAppSelector((state) => state.content);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Permission enforcement
  useEffect(() => {
    if (!checkAccess(user.role, "content")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "content")) {
      loadLessons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.filters, user.role]);

  const loadLessons = async () => {
    try {
      dispatch(setLoading(true));
      const lessons = await fetchLessons(content.filters);
      dispatch(setLessons(lessons));
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return;

    try {
      dispatch(setLoading(true));
      for (const id of selectedIds) {
        await updateLesson(id, { status: "Published" });
      }
      await loadLessons();
      setSelectedIds([]);
    } catch (error) {
      console.error("Error publishing lessons:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;

    try {
      dispatch(setLoading(true));
      for (const id of selectedIds) {
        await updateLesson(id, { status: "Archived" });
      }
      await loadLessons();
      setSelectedIds([]);
    } catch (error) {
      console.error("Error archiving lessons:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExport = () => {
    const headers = [
      { key: "title" as keyof Lesson, label: "Title" },
      { key: "level" as keyof Lesson, label: "Level" },
      { key: "category" as keyof Lesson, label: "Category" },
      { key: "status" as keyof Lesson, label: "Status" },
      { key: "updatedAt" as keyof Lesson, label: "Updated At" },
    ];

    exportToCSV(
      content.lessons,
      `lessons-${new Date().toISOString().split("T")[0]}`,
      headers
    );
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
          <h1 className="text-3xl font-bold">Lessons</h1>
          <p className="text-muted-foreground">Manage all lessons</p>
        </div>
        <Link href="/content/lessons/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Lesson
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lessons..."
                  value={content.filters.search || ""}
                  onChange={(e) =>
                    dispatch(setFilters({ search: e.target.value }))
                  }
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Select
                value={content.filters.level || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ level: e.target.value as any }))
                }
              >
                <option value="all">All Levels</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </Select>
            </div>
            <div>
              <Select
                value={content.filters.category || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ category: e.target.value as any }))
                }
              >
                <option value="all">All Categories</option>
                <option value="Grammar">Grammar</option>
                <option value="Speaking">Speaking</option>
                <option value="Conversation">Conversation</option>
                <option value="Reading">Reading</option>
                <option value="Writing">Writing</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedIds.length} lesson(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkPublish}>
                  Publish
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                  Archive
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lessons List</CardTitle>
          <CardDescription>
            {content.lessons.length} lesson(s) found
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
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          content.lessons.length > 0 &&
                          selectedIds.length === content.lessons.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(content.lessons.map((l) => l._id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {content.lessons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No lessons found
                      </TableCell>
                    </TableRow>
                  ) : (
                    content.lessons.map((lesson) => (
                      <TableRow key={lesson._id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(lesson._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, lesson._id]);
                              } else {
                                setSelectedIds(
                                  selectedIds.filter((id) => id !== lesson._id)
                                );
                              }
                            }}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{lesson.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lesson.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{lesson.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              lesson.status === "Published"
                                ? "default"
                                : lesson.status === "Draft"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {lesson.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(lesson.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/content/lessons/${lesson._id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/content/lessons/${lesson._id}`}>
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

