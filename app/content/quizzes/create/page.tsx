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
import { createQuiz } from "@/lib/api/content";
import { ContentLevel, ContentStatus, QuizQuestion } from "@/lib/types/content";
import { addQuiz } from "@/redux/slices/contentSlice";

export default function CreateQuizPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [quizName, setQuizName] = useState("");
  const [level, setLevel] = useState<ContentLevel>("A1");
  const [status, setStatus] = useState<ContentStatus>("Draft");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      _id: `q-${Date.now()}`,
      questionText: "",
      options: { A: "", B: "", C: "", D: "" },
      correctAnswer: "A",
      explanation: "",
    },
  ]);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!checkAccess(user.role, "content")) {
    router.push("/dashboard");
    return null;
  }

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

  const updateQuestion = (
    index: number,
    field: keyof QuizQuestion | "option",
    value: string | { A: string; B: string; C: string; D: string }
  ) => {
    const updated = [...questions];
    if (field === "option") {
      // This won't work as expected, need to handle option updates differently
      return;
    }
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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!quizName.trim()) {
      newErrors.quizName = "Quiz name is required";
    }
    if (questions.length === 0 || questions.some((q) => !q.questionText.trim() || !q.options.A || !q.options.B || !q.options.C || !q.options.D)) {
      newErrors.questions = "At least one complete question is required";
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
      const validQuestions = questions.filter(
        (q) => q.questionText.trim() && q.options.A && q.options.B && q.options.C && q.options.D
      );
      const newQuiz = await createQuiz({
        quizName: quizName.trim(),
        level,
        questions: validQuestions,
        status,
        createdBy: user.email,
      });
      dispatch(addQuiz(newQuiz));
      router.push(`/content/quizzes/${newQuiz._id}`);
    } catch (error) {
      console.error("Error creating quiz:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/content/quizzes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Quiz</h1>
          <p className="text-muted-foreground">Create a new quiz</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>Fill in the information to create a new quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quizName">Quiz Name *</Label>
                <Input
                  id="quizName"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  placeholder="Quiz name"
                  disabled={creating}
                />
                {errors.quizName && (
                  <p className="text-sm text-destructive">{errors.quizName}</p>
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
                <Label>Questions *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
              {errors.questions && (
                <p className="text-sm text-destructive">{errors.questions}</p>
              )}

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
                          <Label>Question Text *</Label>
                          <Input
                            value={question.questionText}
                            onChange={(e) =>
                              updateQuestion(index, "questionText", e.target.value)
                            }
                            placeholder="Enter question text"
                            disabled={creating}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Option A *</Label>
                            <Input
                              value={question.options.A}
                              onChange={(e) => updateOption(index, "A", e.target.value)}
                              disabled={creating}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Option B *</Label>
                            <Input
                              value={question.options.B}
                              onChange={(e) => updateOption(index, "B", e.target.value)}
                              disabled={creating}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Option C *</Label>
                            <Input
                              value={question.options.C}
                              onChange={(e) => updateOption(index, "C", e.target.value)}
                              disabled={creating}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Option D *</Label>
                            <Input
                              value={question.options.D}
                              onChange={(e) => updateOption(index, "D", e.target.value)}
                              disabled={creating}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Correct Answer *</Label>
                            <Select
                              value={question.correctAnswer}
                              onChange={(e) =>
                                updateQuestion(index, "correctAnswer", e.target.value as "A" | "B" | "C" | "D")
                              }
                              disabled={creating}
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
                              placeholder="Explanation for the answer"
                              disabled={creating}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/content/quizzes">
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
                  "Create Quiz"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

