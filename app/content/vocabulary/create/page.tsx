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
import { createVocabularyPack } from "@/lib/api/content";
import { ContentLevel, ContentStatus, VocabularyWord } from "@/lib/types/content";
import { addVocabulary } from "@/redux/slices/contentSlice";

export default function CreateVocabularyPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [packName, setPackName] = useState("");
  const [level, setLevel] = useState<ContentLevel>("A1");
  const [status, setStatus] = useState<ContentStatus>("Draft");
  const [words, setWords] = useState<VocabularyWord[]>([
    { word: "", definition: "", example: "", pronunciation: "" },
  ]);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!checkAccess(user.role, "content")) {
    router.push("/dashboard");
    return null;
  }

  const addWord = () => {
    setWords([...words, { word: "", definition: "", example: "", pronunciation: "" }]);
  };

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const updateWord = (index: number, field: keyof VocabularyWord, value: string) => {
    const updated = [...words];
    updated[index] = { ...updated[index], [field]: value };
    setWords(updated);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!packName.trim()) {
      newErrors.packName = "Pack name is required";
    }
    if (words.length === 0 || words.some((w) => !w.word.trim() || !w.definition.trim())) {
      newErrors.words = "At least one word with definition is required";
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
      const validWords = words.filter((w) => w.word.trim() && w.definition.trim());
      const newPack = await createVocabularyPack({
        packName: packName.trim(),
        level,
        words: validWords,
        status,
        createdBy: user.email,
      });
      dispatch(addVocabulary(newPack));
      router.push(`/content/vocabulary/${newPack._id}`);
    } catch (error) {
      console.error("Error creating vocabulary pack:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/content/vocabulary">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Vocabulary Pack</h1>
          <p className="text-muted-foreground">Create a new vocabulary pack</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary Pack Details</CardTitle>
            <CardDescription>Fill in the information to create a new vocabulary pack</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packName">Pack Name *</Label>
                <Input
                  id="packName"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="Vocabulary pack name"
                  disabled={creating}
                />
                {errors.packName && (
                  <p className="text-sm text-destructive">{errors.packName}</p>
                )}
              </div>

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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Words *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addWord}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Word
                </Button>
              </div>
              {errors.words && (
                <p className="text-sm text-destructive">{errors.words}</p>
              )}

              <div className="space-y-4">
                {words.map((word, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Word {index + 1}</h4>
                        {words.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWord(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Word *</Label>
                          <Input
                            value={word.word}
                            onChange={(e) => updateWord(index, "word", e.target.value)}
                            placeholder="Word"
                            disabled={creating}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pronunciation</Label>
                          <Input
                            value={word.pronunciation || ""}
                            onChange={(e) => updateWord(index, "pronunciation", e.target.value)}
                            placeholder="/pronunciation/"
                            disabled={creating}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Definition *</Label>
                          <Input
                            value={word.definition}
                            onChange={(e) => updateWord(index, "definition", e.target.value)}
                            placeholder="Definition"
                            disabled={creating}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Example</Label>
                          <Input
                            value={word.example || ""}
                            onChange={(e) => updateWord(index, "example", e.target.value)}
                            placeholder="Example sentence"
                            disabled={creating}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
              <Link href="/content/vocabulary">
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
                  "Create Vocabulary Pack"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

