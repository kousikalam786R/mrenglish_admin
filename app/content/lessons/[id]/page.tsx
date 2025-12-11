"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchLessons, updateLesson } from "@/lib/api/content";
import {
  setSelectedItem,
  updateLesson as updateLessonAction,
  setLoading,
} from "@/redux/slices/contentSlice";
import { Lesson, ContentLevel, LessonCategory, ContentStatus } from "@/lib/types/content";

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const content = useAppSelector((state) => state.content);
  const [activeTab, setActiveTab] = useState("overview");

  const lessonId = params.id as string;
  const lesson = content.selectedItem as Lesson | null;
  const isLesson = content.selectedItemType === "lesson";

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<ContentLevel>("A1");
  const [category, setCategory] = useState<LessonCategory>("Grammar");
  const [contentText, setContentText] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<ContentStatus>("Draft");
  const [saving, setSaving] = useState(false);

  // Permission enforcement
  useEffect(() => {
    if (!checkAccess(user.role, "content")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  // Load lesson
  useEffect(() => {
    if (checkAccess(user.role, "content") && lessonId) {
      loadLesson();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Update form when lesson loads
  useEffect(() => {
    if (lesson && isLesson) {
      setTitle(lesson.title);
      setLevel(lesson.level);
      setCategory(lesson.category);
      setContentText(lesson.content);
      setTags(lesson.tags.join(", "));
      setStatus(lesson.status);
    }
  }, [lesson, isLesson]);

  const loadLesson = async () => {
    try {
      dispatch(setLoading(true));
      const lessons = await fetchLessons();
      const found = lessons.find((l) => l._id === lessonId);
      if (found) {
        dispatch(
          setSelectedItem({ item: found, type: "lesson" })
        );
      } else {
        router.push("/content/lessons");
      }
    } catch (error) {
      console.error("Error loading lesson:", error);
      router.push("/content/lessons");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSave = async () => {
    if (!lesson) return;

    try {
      setSaving(true);
      const updated = await updateLesson(lessonId, {
        title: title.trim(),
        level,
        category,
        content: contentText.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        status,
      });
      dispatch(updateLessonAction(updated));
    } catch (error) {
      console.error("Error updating lesson:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!checkAccess(user.role, "content")) {
    return null;
  }

  if (content.loading || !lesson) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/content/lessons">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">Edit lesson</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value as ContentLevel)}
                    disabled={saving}
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LessonCategory)}
                    disabled={saving}
                  >
                    <option value="Grammar">Grammar</option>
                    <option value="Speaking">Speaking</option>
                    <option value="Conversation">Conversation</option>
                    <option value="Reading">Reading</option>
                    <option value="Writing">Writing</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  disabled={saving}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Content</CardTitle>
              <CardDescription>
                Rich text editor placeholder - will be replaced with actual editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                disabled={saving}
                className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Audio File</Label>
                <div className="border-2 border-dashed rounded-md p-4 text-center text-muted-foreground">
                  {lesson.audioUrl ? (
                    <p className="text-sm">{lesson.audioUrl}</p>
                  ) : (
                    <p className="text-sm">No audio file uploaded</p>
                  )}
                  <p className="text-xs mt-1">Placeholder for audio upload</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image File</Label>
                <div className="border-2 border-dashed rounded-md p-4 text-center text-muted-foreground">
                  {lesson.imageUrl ? (
                    <p className="text-sm">{lesson.imageUrl}</p>
                  ) : (
                    <p className="text-sm">No image file uploaded</p>
                  )}
                  <p className="text-xs mt-1">Placeholder for image upload</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

