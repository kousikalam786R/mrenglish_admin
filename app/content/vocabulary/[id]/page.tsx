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
import { fetchVocabularyPacks, updateVocabularyPack } from "@/lib/api/content";
import {
  setSelectedItem,
  updateVocabulary as updateVocabularyAction,
  setLoading,
} from "@/redux/slices/contentSlice";
import { VocabularyPack, ContentLevel, ContentStatus, VocabularyWord } from "@/lib/types/content";

export default function EditVocabularyPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const content = useAppSelector((state) => state.content);
  const packId = params.id as string;
  const pack = content.selectedItem as VocabularyPack | null;
  const isPack = content.selectedItemType === "vocabulary";

  const [packName, setPackName] = useState("");
  const [level, setLevel] = useState<ContentLevel>("A1");
  const [status, setStatus] = useState<ContentStatus>("Draft");
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "content")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "content") && packId) {
      loadPack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packId]);

  useEffect(() => {
    if (pack && isPack) {
      setPackName(pack.packName);
      setLevel(pack.level);
      setStatus(pack.status);
      setWords(pack.words.length > 0 ? pack.words : [{ word: "", definition: "", example: "", pronunciation: "" }]);
    }
  }, [pack, isPack]);

  const loadPack = async () => {
    try {
      dispatch(setLoading(true));
      const packs = await fetchVocabularyPacks();
      const found = packs.find((p) => p._id === packId);
      if (found) {
        dispatch(setSelectedItem({ item: found, type: "vocabulary" }));
      } else {
        router.push("/content/vocabulary");
      }
    } catch (error) {
      console.error("Error loading vocabulary pack:", error);
      router.push("/content/vocabulary");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const addWord = () => {
    setWords([...words, { word: "", definition: "", example: "", pronunciation: "" }]);
  };

  const removeWord = (index: number) => {
    if (words.length > 1) {
      setWords(words.filter((_, i) => i !== index));
    }
  };

  const updateWord = (index: number, field: keyof VocabularyWord, value: string) => {
    const updated = [...words];
    updated[index] = { ...updated[index], [field]: value };
    setWords(updated);
  };

  const handleSave = async () => {
    if (!pack) return;

    try {
      setSaving(true);
      const validWords = words.filter((w) => w.word.trim() && w.definition.trim());
      const updated = await updateVocabularyPack(packId, {
        packName: packName.trim(),
        level,
        words: validWords,
        status,
      });
      dispatch(updateVocabularyAction(updated));
    } catch (error) {
      console.error("Error updating vocabulary pack:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!checkAccess(user.role, "content")) {
    return null;
  }

  if (content.loading || !pack) {
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
          <Link href="/content/vocabulary">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{pack.packName}</h1>
            <p className="text-muted-foreground">Edit vocabulary pack</p>
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
          <CardTitle>Vocabulary Pack Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="packName">Pack Name</Label>
              <Input
                id="packName"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                disabled={saving}
              />
            </div>
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Words</Label>
              <Button type="button" variant="outline" size="sm" onClick={addWord}>
                <Plus className="h-4 w-4 mr-2" />
                Add Word
              </Button>
            </div>

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
                        <Label>Word</Label>
                        <Input
                          value={word.word}
                          onChange={(e) => updateWord(index, "word", e.target.value)}
                          disabled={saving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pronunciation</Label>
                        <Input
                          value={word.pronunciation || ""}
                          onChange={(e) => updateWord(index, "pronunciation", e.target.value)}
                          disabled={saving}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Definition</Label>
                        <Input
                          value={word.definition}
                          onChange={(e) => updateWord(index, "definition", e.target.value)}
                          disabled={saving}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Example</Label>
                        <Input
                          value={word.example || ""}
                          onChange={(e) => updateWord(index, "example", e.target.value)}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

