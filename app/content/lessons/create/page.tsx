"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createLesson } from "@/lib/api/content";
import { ContentLevel, LessonCategory, ContentStatus } from "@/lib/types/content";
import { useAppDispatch } from "@/redux/hooks";
import { addLesson } from "@/redux/slices/contentSlice";

export default function CreateLessonPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<ContentLevel>("A1");
  const [category, setCategory] = useState<LessonCategory>("Grammar");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<ContentStatus>("Draft");
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!checkAccess(user.role, "content")) {
    router.push("/dashboard");
    return null;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setCreating(true);
      const newLesson = await createLesson({
        title: title.trim(),
        level,
        category,
        content: content.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        status,
        createdBy: user.email,
      });
      dispatch(addLesson(newLesson));
      router.push(`/content/lessons/${newLesson._id}`);
    } catch (error) {
      console.error("Error creating lesson:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/content/lessons">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Lesson</h1>
          <p className="text-muted-foreground">Create a new lesson</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
            <CardDescription>Fill in the information to create a new lesson</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Lesson title"
                  disabled={creating}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  disabled={creating}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as ContentLevel)}
                  disabled={creating}
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
                <Label htmlFor="category">Category *</Label>
                <Select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LessonCategory)}
                  disabled={creating}
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
              <Label htmlFor="content">Content *</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Rich text content (placeholder - will be replaced with rich text editor)"
                disabled={creating}
                className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="beginner, grammar, practice"
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label>Media Uploads (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed rounded-md p-4 text-center text-muted-foreground">
                  <p className="text-sm">Audio Upload</p>
                  <p className="text-xs mt-1">Placeholder for audio upload</p>
                </div>
                <div className="border-2 border-dashed rounded-md p-4 text-center text-muted-foreground">
                  <p className="text-sm">Image Upload</p>
                  <p className="text-xs mt-1">Placeholder for image upload</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/content/lessons">
                <Button type="button" variant="outline" disabled={creating}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Lesson"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

