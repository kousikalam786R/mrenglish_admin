"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { createSpeakingModule } from "@/lib/api/content";
import { Difficulty, SpeakingType, ContentStatus } from "@/lib/types/content";
import { addSpeaking } from "@/redux/slices/contentSlice";

export default function CreateSpeakingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [moduleName, setModuleName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [type, setType] = useState<SpeakingType>("Interview");
  const [script, setScript] = useState("");
  const [expectedAnswers, setExpectedAnswers] = useState<string[]>([""]);
  const [status, setStatus] = useState<ContentStatus>("Draft");
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!checkAccess(user.role, "content")) {
    router.push("/dashboard");
    return null;
  }

  const addAnswer = () => {
    setExpectedAnswers([...expectedAnswers, ""]);
  };

  const removeAnswer = (index: number) => {
    if (expectedAnswers.length > 1) {
      setExpectedAnswers(expectedAnswers.filter((_, i) => i !== index));
    }
  };

  const updateAnswer = (index: number, value: string) => {
    const updated = [...expectedAnswers];
    updated[index] = value;
    setExpectedAnswers(updated);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!moduleName.trim()) {
      newErrors.moduleName = "Module name is required";
    }
    if (!script.trim()) {
      newErrors.script = "Script is required";
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
      const validAnswers = expectedAnswers.filter((a) => a.trim().length > 0);
      const newModule = await createSpeakingModule({
        moduleName: moduleName.trim(),
        difficulty,
        type,
        script: script.trim(),
        expectedAnswers: validAnswers,
        status,
        createdBy: user.email,
      });
      dispatch(addSpeaking(newModule));
      router.push(`/content/speaking/${newModule._id}`);
    } catch (error) {
      console.error("Error creating speaking module:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/content/speaking">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Speaking Module</h1>
          <p className="text-muted-foreground">Create a new speaking module</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Speaking Module Details</CardTitle>
            <CardDescription>Fill in the information to create a new speaking module</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moduleName">Module Name *</Label>
                <Input
                  id="moduleName"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="Module name"
                  disabled={creating}
                />
                {errors.moduleName && (
                  <p className="text-sm text-destructive">{errors.moduleName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  disabled={creating}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as SpeakingType)}
                  disabled={creating}
                >
                  <option value="Interview">Interview</option>
                  <option value="Conversation">Conversation</option>
                  <option value="Roleplay">Roleplay</option>
                </Select>
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

            <div className="space-y-2">
              <Label htmlFor="script">Script *</Label>
              <textarea
                id="script"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Script content"
                disabled={creating}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              {errors.script && (
                <p className="text-sm text-destructive">{errors.script}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Expected Answers</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAnswer}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Answer
                </Button>
              </div>

              <div className="space-y-2">
                {expectedAnswers.map((answer, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={answer}
                      onChange={(e) => updateAnswer(index, e.target.value)}
                      placeholder={`Expected answer ${index + 1}`}
                      disabled={creating}
                    />
                    {expectedAnswers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAnswer(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Audio Upload (Optional)</Label>
              <div className="border-2 border-dashed rounded-md p-4 text-center text-muted-foreground">
                <p className="text-sm">Audio Upload</p>
                <p className="text-xs mt-1">Placeholder for audio upload</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/content/speaking">
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
                  "Create Speaking Module"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

