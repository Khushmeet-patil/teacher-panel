"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import React from "react";

interface ClassBatch {
  id: string;
  name: string;
  batch: string;
}

export default function SubjectPage({ params }: { params: Promise<{ id: string; semesterId: string; subjectId: string }> }) {
  const router = useRouter();
  const [classBatches, setClassBatches] = useState<ClassBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [semesterNumber, setSemesterNumber] = useState<string>("");
  const [subjectName, setSubjectName] = useState<string>("");
  const resolvedParams = React.use(params);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const teacherData = localStorage.getItem("teacher");

    if (!token || !teacherData) {
      toast({
        title: "Session Expired",
        description: "Please log in again.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    const teacher = JSON.parse(teacherData);

    const fetchDetails = async () => {
      try {
        const deptResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/departments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!deptResponse.ok) throw new Error("Failed to fetch departments");
        const departments = await deptResponse.json();
        const dept = departments.find((d: any) => d.id === resolvedParams.id);
        setDepartmentName(dept?.name || "Department");

        const semesterResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/department/${resolvedParams.id}/semesters`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!semesterResponse.ok) throw new Error("Failed to fetch semesters");
        const semesters = await semesterResponse.json();
        const semester = semesters.find((s: any) => s.id === resolvedParams.semesterId);
        setSemesterNumber(semester?.number.toString() || "");

        const subjectResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/subjects/${resolvedParams.semesterId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!subjectResponse.ok) throw new Error("Failed to fetch subjects");
        const subjects = await subjectResponse.json();
        const subject = subjects.find((s: any) => s.id === resolvedParams.subjectId);
        setSubjectName(subject?.name || "");
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load details.",
          variant: "destructive",
        });
      }
    };

    const fetchClassBatches = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/classes/${resolvedParams.subjectId}/${resolvedParams.semesterId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error(`Failed to fetch class-batch assignments: ${response.status}`);
        const data: ClassBatch[] = await response.json();
        setClassBatches(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Unable to load classes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    fetchClassBatches();
  }, [resolvedParams.id, resolvedParams.semesterId, resolvedParams.subjectId, router]);

  const handleClassBatchClick = (classId: string, batch: string) => {
    router.push(
      `/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}/subject/${resolvedParams.subjectId}/class/${classId}?batch=${encodeURIComponent(batch)}`
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
        <div>
          <Breadcrumb className="mb-4">
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-primary">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/department/${resolvedParams.id}`} className="text-muted-foreground hover:text-primary">
                {departmentName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}`}
                className="text-muted-foreground hover:text-primary"
              >
                Semester {semesterNumber}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink className="text-foreground">{subjectName}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-3xl font-bold text-foreground">{subjectName} Classes</h1>
          <p className="text-muted-foreground">Select a class and batch to view students</p>
        </div>
        {classBatches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classBatches.map((cb) => (
              <motion.div key={`${cb.id}-${cb.batch}`} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card onClick={() => handleClassBatchClick(cb.id, cb.batch)}>
                  <CardHeader>
                    <CardTitle>{cb.name} - Batch {cb.batch}</CardTitle>
                    <CardDescription>View students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-20 bg-primary/5 rounded-lg">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No classes or batches assigned yet.</p>
        )}
      </motion.div>
    </DashboardLayout>
  );
}