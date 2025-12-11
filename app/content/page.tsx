"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, BookOpen, Mic, HelpCircle } from "lucide-react";
import Link from "next/link";
import { fetchContentStats } from "@/lib/api/content";
import { useState } from "react";
import { ContentStats } from "@/lib/types/content";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function ContentPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Permission enforcement
  useEffect(() => {
    if (!checkAccess(user.role, "content")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "content")) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchContentStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading content stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!checkAccess(user.role, "content")) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "N/A";
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      lesson: "Lesson",
      vocabulary: "Vocabulary Pack",
      speaking: "Speaking Module",
      quiz: "Quiz",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Manager</h1>
          <p className="text-muted-foreground">
            Manage all educational content for the app
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalLessons || 0}</div>
                <p className="text-xs text-muted-foreground">Active lessons</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vocabulary Packs</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalVocabularyPacks || 0}</div>
                <p className="text-xs text-muted-foreground">Word packs</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
                <p className="text-xs text-muted-foreground">Assessment quizzes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Speaking Modules</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSpeakingModules || 0}</div>
                <p className="text-xs text-muted-foreground">Speaking exercises</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/content/lessons/create">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Lesson
              </Button>
            </Link>
            <Link href="/content/vocabulary/create">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Vocabulary Pack
              </Button>
            </Link>
            <Link href="/content/quizzes/create">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </Link>
            <Link href="/content/speaking/create">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Speaking Module
              </Button>
            </Link>
          </div>

          {/* Recent Edits */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Edits</CardTitle>
              <CardDescription>Last 5 content items that were updated</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentEdits && stats.recentEdits.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentEdits.map((edit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                          {edit.type === "lesson" && <FileText className="h-5 w-5" />}
                          {edit.type === "vocabulary" && <BookOpen className="h-5 w-5" />}
                          {edit.type === "speaking" && <Mic className="h-5 w-5" />}
                          {edit.type === "quiz" && <HelpCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{edit.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {getTypeLabel(edit.type)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatDate(edit.updatedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent edits
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
