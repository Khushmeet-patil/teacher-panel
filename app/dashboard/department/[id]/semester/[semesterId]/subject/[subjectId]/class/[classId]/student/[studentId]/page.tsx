"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Practical {
  id: string;
  name: string;
  github_link: string;
  submitted_at: string;
  status: "submitted" | "completed" | "rejected";
  marks?: number | null;
  remarks?: string | null;
}

interface Subject {
  id: string;
  name: string;
}

interface Student {
  name: string;
  gender?: string;
}

export default function StudentPracticalDetailsPage() {
  const { studentId, classId, subjectId } = useParams() as {
    studentId: string;
    classId: string;
    subjectId: string;
  };
  const router = useRouter();
  const { toast } = useToast();

  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [selectedPractical, setSelectedPractical] = useState<Practical | null>(null);
  const [status, setStatus] = useState<"submitted" | "completed" | "rejected">("submitted");
  const [marks, setMarks] = useState<number | undefined>(undefined);
  const [remarks, setRemarks] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{ marks?: string; remarks?: string }>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
      if (!storedToken) {
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    if (!token || !studentId || !classId || !subjectId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const studentRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/teacher/students/${classId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!studentRes.ok) throw new Error("Failed to fetch student information");
        const studentsData = await studentRes.json();
        const studentData = studentsData.find((s: any) => s.id === studentId);
        if (!studentData) throw new Error("Student not found in this class");
        setStudent({ name: studentData.name, gender: studentData.gender });

        const subjectRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/teacher/subjects/${subjectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!subjectRes.ok) {
          const errorData = await subjectRes.json();
          throw new Error(errorData.error || "Failed to fetch subject information");
        }
        const subjectsData = await subjectRes.json();
        const subjectData = Array.isArray(subjectsData) ? subjectsData[0] : subjectsData;
        setSubject(subjectData);

        const practicalsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/teacher/submissions/${studentId}/${classId}/${subjectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!practicalsRes.ok) {
          const errorData = await practicalsRes.json();
          if (practicalsRes.status === 403) {
            throw new Error("You are not authorized to view this student’s practicals.");
          }
          throw new Error(errorData.error || "Failed to fetch practical submissions");
        }
        const practicalsData = await practicalsRes.json();
        setPracticals(practicalsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [studentId, classId, subjectId, token, router, toast]);

  const openGradingModal = (practical: Practical) => {
    setSelectedPractical(practical);
    setStatus(practical.status);
    setMarks(practical.marks || undefined);
    setRemarks(practical.remarks || "");
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPractical(null);
    setStatus("submitted");
    setMarks(undefined);
    setRemarks("");
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: { marks?: string; remarks?: string } = {};
    if (status === "completed" && (marks === undefined || marks === null || isNaN(Number(marks)) || marks < 0 || marks > 100)) {
      errors.marks = "Please enter valid marks (0-100) for completed status.";
    }
    if (status === "rejected" && (!remarks || remarks.trim() === "")) {
      errors.remarks = "Please enter remarks for rejected status.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePractical = async () => {
    if (!selectedPractical || !validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (!token) throw new Error("No authentication token found. Please log in again.");

      const requestBody: { status: string; marks?: number; remarks?: string } = { status };
      if (status === "completed") requestBody.marks = Number(marks);
      if (status === "rejected") requestBody.remarks = remarks;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/teacher/submission/${selectedPractical.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
      }

      const updatedPractical = await response.json();
      setPracticals((currentPracticals) =>
        currentPracticals.map((p) => (p.id === selectedPractical.id ? { ...p, ...updatedPractical } : p))
      );
      setSuccessMessage("Practical updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      closeModal();
      toast({
        title: "Success",
        description: "Practical updated successfully",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update practical",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (token === null) return null;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">
          Please <Link href="/login" className="text-primary hover:underline">log in</Link> to view student practicals.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {student?.name || "Student"}'s <span className="text-primary">{subject?.name || "Subject"}</span> Practicals
              </h2>
              <p className="text-muted-foreground">Review and grade student submissions</p>
            </div>
          </div>

          {successMessage && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Practical</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">GitHub</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Marks</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted">
                      {practicals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                            No practical submissions found.
                          </td>
                        </tr>
                      ) : (
                        practicals.map((practical) => (
                          <motion.tr
                            key={practical.id}
                            whileHover={{ backgroundColor: "hsl(var(--muted) / 0.3)" }}
                            transition={{ duration: 0.2 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{practical.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {new Date(practical.submitted_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <a
                                href={practical.github_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                View Code
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  practical.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : practical.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {practical.status.charAt(0).toUpperCase() + practical.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {practical.status === "completed" && practical.marks !== null ? `${practical.marks}/100` : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openGradingModal(practical)}
                                className="text-primary hover:text-primary/80"
                              >
                                Grade
                              </Button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {modalOpen && selectedPractical && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background p-6 rounded-xl shadow-2xl max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">Grade: {selectedPractical.name}</h3>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as "submitted" | "completed" | "rejected")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === "completed" && (
                <div>
                  <Label className="text-foreground">Marks (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={marks ?? ""}
                    onChange={(e) => setMarks(e.target.value ? Number(e.target.value) : undefined)}
                    className={`mt-1 ${formErrors.marks ? "border-destructive" : ""}`}
                  />
                  {formErrors.marks && <p className="text-destructive text-sm mt-1">{formErrors.marks}</p>}
                </div>
              )}

              {status === "rejected" && (
                <div>
                  <Label className="text-foreground">Remarks</Label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className={`mt-1 w-full p-2 border rounded-lg focus:ring-primary focus:border-primary h-24 ${formErrors.remarks ? "border-destructive" : ""}`}
                    placeholder="Explain why this practical is rejected..."
                  />
                  {formErrors.remarks && <p className="text-destructive text-sm mt-1">{formErrors.remarks}</p>}
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSavePractical} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}