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
import { fetchQuizzes, updateQuiz } from "@/lib/api/content";
import {
  setSelectedItem,
  updateQuiz as updateQuizAction,
  setLoading,
} from "@/redux/slices/contentSlice";
import { Quiz, ContentLevel, ContentStatus, QuizQuestion } from "@/lib/types/content";

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const content = useAppSelector((state) => state.content);
  const quizId = params.id as string;
  const quiz = content.selectedItem as Quiz | null;
  const isQuiz = content.selectedItemType === "quiz";

  const [quizName, setQuizName] = useState("");
  const [level, setLevel] = useState<ContentLevel>("A1");
  const [status, setStatus] = useState<ContentStatus>("Draft");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "content")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "content") && quizId) {
      loadQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  useEffect(() => {
    if (quiz && isQuiz) {
      setQuizName(quiz.quizName);
      setLevel(quiz.level);
      setStatus(quiz.status);
      setQuestions(quiz.questions.length > 0 ? quiz.questions : [
        {
          _id: `q-${Date.now()}`,
          questionText: "",
          options: { A: "", B: "", C: "", D: "" },
          correctAnswer: "A",
          explanation: "",
        },
      ]);
    }
  }, [quiz, isQuiz]);

  const loadQuiz = async () => {
    try {
      dispatch(setLoading(true));
      const quizzes = await fetchQuizzes();
      const found = quizzes.find((q) => q._id === quizId);
      if (found) {
        dispatch(setSelectedItem({ item: found, type: "quiz" }));
      } else {
        router.push("/content/quizzes");
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
      router.push("/content/quizzes");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        _id: `q-${Date.now()}-${questions.length}`,
        questionText: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "A",
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: string | "A" | "B" | "C" | "D") => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionKey: "A" | "B" | "C" | "D", value: string) => {
    const updated = [...questions];
    updated[questionIndex] = {
      ...updated[questionIndex],
      options: {
        ...updated[questionIndex].options,
        [optionKey]: value,
      },
    };
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!quiz) return;

    try {
      setSaving(true);
      const validQuestions = questions.filter(
        (q) => q.questionText.trim() && q.options.A && q.options.B && q.options.C && q.options.D
      );
      const updated = await updateQuiz(quizId, {
        quizName: quizName.trim(),
        level,
        questions: validQuestions,
        status,
      });
      dispatch(updateQuizAction(updated));
    } catch (error) {
      console.error("Error updating quiz:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!checkAccess(user.role, "content")) {
    return null;
  }

  if (content.loading || !quiz) {
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
          <Link href="/content/quizzes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{quiz.quizName}</h1>
            <p className="text-muted-foreground">Edit quiz</p>
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
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quizName">Quiz Name</Label>
              <Input
                id="quizName"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
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
              <Label>Questions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Input
                          value={question.questionText}
                          onChange={(e) =>
                            updateQuestion(index, "questionText", e.target.value)
                          }
                          disabled={saving}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Option A</Label>
                          <Input
                            value={question.options.A}
                            onChange={(e) => updateOption(index, "A", e.target.value)}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Option B</Label>
                          <Input
                            value={question.options.B}
                            onChange={(e) => updateOption(index, "B", e.target.value)}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Option C</Label>
                          <Input
                            value={question.options.C}
                            onChange={(e) => updateOption(index, "C", e.target.value)}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Option D</Label>
                          <Input
                            value={question.options.D}
                            onChange={(e) => updateOption(index, "D", e.target.value)}
                            disabled={saving}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <Select
                            value={question.correctAnswer}
                            onChange={(e) =>
                              updateQuestion(index, "correctAnswer", e.target.value as "A" | "B" | "C" | "D")
                            }
                            disabled={saving}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Explanation (Optional)</Label>
                          <Input
                            value={question.explanation || ""}
                            onChange={(e) =>
                              updateQuestion(index, "explanation", e.target.value)
                            }
                            disabled={saving}
                          />
                        </div>
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

