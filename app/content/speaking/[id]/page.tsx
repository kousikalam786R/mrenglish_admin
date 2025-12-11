"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { fetchSpeakingModules, updateSpeakingModule } from "@/lib/api/content";
import {
  setSelectedItem,
  updateSpeaking as updateSpeakingAction,
  setLoading,
} from "@/redux/slices/contentSlice";
import { SpeakingModule, Difficulty, SpeakingType, ContentStatus } from "@/lib/types/content";

export default function EditSpeakingPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const content = useAppSelector((state) => state.content);
  const moduleId = params.id as string;
  const module = content.selectedItem as SpeakingModule | null;
  const isModule = content.selectedItemType === "speaking";

  const [moduleName, setModuleName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [type, setType] = useState<SpeakingType>("Interview");
  const [script, setScript] = useState("");
  const [expectedAnswers, setExpectedAnswers] = useState<string[]>([""]);
  const [status, setStatus] = useState<ContentStatus>("Draft");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "content")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "content") && moduleId) {
      loadModule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  useEffect(() => {
    if (module && isModule) {
      setModuleName(module.moduleName);
      setDifficulty(module.difficulty);
      setType(module.type);
      setScript(module.script);
      setExpectedAnswers(module.expectedAnswers.length > 0 ? module.expectedAnswers : [""]);
      setStatus(module.status);
    }
  }, [module, isModule]);

  const loadModule = async () => {
    try {
      dispatch(setLoading(true));
      const modules = await fetchSpeakingModules();
      const found = modules.find((m) => m._id === moduleId);
      if (found) {
        dispatch(setSelectedItem({ item: found, type: "speaking" }));
      } else {
        router.push("/content/speaking");
      }
    } catch (error) {
      console.error("Error loading speaking module:", error);
      router.push("/content/speaking");
    } finally {
      dispatch(setLoading(false));
    }
  };

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

  const handleSave = async () => {
    if (!module) return;

    try {
      setSaving(true);
      const validAnswers = expectedAnswers.filter((a) => a.trim().length > 0);
      const updated = await updateSpeakingModule(moduleId, {
        moduleName: moduleName.trim(),
        difficulty,
        type,
        script: script.trim(),
        expectedAnswers: validAnswers,
        status,
      });
      dispatch(updateSpeakingAction(updated));
    } catch (error) {
      console.error("Error updating speaking module:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!checkAccess(user.role, "content")) {
    return null;
  }

  if (content.loading || !module) {
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
          <Link href="/content/speaking">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{module.moduleName}</h1>
            <p className="text-muted-foreground">Edit speaking module</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Speaking Module Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moduleName">Module Name</Label>
              <Input
                id="moduleName"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="script">Script</Label>
            <textarea
              id="script"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              disabled={saving}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
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
                    disabled={saving}
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
        </CardContent>
      </Card>
    </div>
  );
}

