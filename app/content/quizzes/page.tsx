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
import { fetchQuizzes } from "@/lib/api/content";
import {
  setQuizzes,
  setFilters,
  setLoading,
  resetFilters,
} from "@/redux/slices/contentSlice";
import { Quiz, ContentLevel, ContentStatus } from "@/lib/types/content";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function QuizzesPage() {
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
      loadQuizzes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.filters, user.role]);

  const loadQuizzes = async () => {
    try {
      dispatch(setLoading(true));
      const quizzes = await fetchQuizzes(content.filters);
      dispatch(setQuizzes(quizzes));
    } catch (error) {
      console.error("Error loading quizzes:", error);
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
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">Manage quizzes</p>
        </div>
        <Link href="/content/quizzes/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
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
                  placeholder="Search quizzes..."
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

      {/* Quizzes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quizzes List</CardTitle>
          <CardDescription>
            {content.quizzes.length} quiz(zes) found
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
                    <TableHead>Quiz Name</TableHead>
                    <TableHead>Question Count</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {content.quizzes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No quizzes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    content.quizzes.map((quiz) => (
                      <TableRow key={quiz._id}>
                        <TableCell className="font-medium">{quiz.quizName}</TableCell>
                        <TableCell>{quiz.questions.length}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{quiz.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              quiz.status === "Published"
                                ? "default"
                                : quiz.status === "Draft"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {quiz.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(quiz.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/content/quizzes/${quiz._id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/content/quizzes/${quiz._id}`}>
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

