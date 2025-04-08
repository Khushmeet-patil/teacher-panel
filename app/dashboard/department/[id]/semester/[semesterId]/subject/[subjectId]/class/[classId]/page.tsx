"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import React from "react";

interface Student {
  id: string;
  name: string;
  batch: string;
}

export default function ClassPage({
  params,
}: {
  params: Promise<{ id: string; semesterId: string; subjectId: string; classId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [semesterNumber, setSemesterNumber] = useState<string>("");
  const [subjectName, setSubjectName] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [teacherBatch, setTeacherBatch] = useState<string | null>(null);
  const resolvedParams = React.use(params);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const teacherData = localStorage.getItem("teacher");

      if (!token || !teacherData) {
        toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
        router.push("/");
        return;
      }

      const teacher = JSON.parse(teacherData);
      setDepartmentName(teacher.department_id === resolvedParams.id ? teacher.department_name || "Department" : "Department");

      try {
        const batch = searchParams.get("batch") || null;
        setTeacherBatch(batch);

        const [semesterResponse, subjectResponse, classResponse, studentsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/department/${resolvedParams.id}/semesters`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/subjects/${resolvedParams.semesterId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/classes/${resolvedParams.subjectId}/${resolvedParams.semesterId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/students/${resolvedParams.classId}${batch ? `?batch=${batch}` : ""}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!semesterResponse.ok) throw new Error("Failed to fetch semesters");
        if (!subjectResponse.ok) throw new Error("Failed to fetch subjects");
        if (!classResponse.ok) throw new Error("Failed to fetch classes");
        if (!studentsResponse.ok) throw new Error("Failed to fetch students");

        const [semesters, subjects, classes, studentsData] = await Promise.all([
          semesterResponse.json(),
          subjectResponse.json(),
          classResponse.json(),
          studentsResponse.json(),
        ]);

        setSemesterNumber(semesters.find((s: any) => s.id === resolvedParams.semesterId)?.number.toString() || "");
        setSubjectName(subjects.find((s: any) => s.id === resolvedParams.subjectId)?.name || "");
        setClassName(classes.find((c: any) => c.id === resolvedParams.classId)?.name || "");
        setStudents(studentsData);
      } catch (error) {
        toast({ title: "Error", description: (error as Error).message || "Could not load class data.", variant: "destructive" });
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, resolvedParams.semesterId, resolvedParams.subjectId, resolvedParams.classId, router, searchParams]);

  const handleStudentClick = (studentId: string) => {
    router.push(
      `/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}/subject/${resolvedParams.subjectId}/class/${resolvedParams.classId}/student/${studentId}`
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
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}/subject/${resolvedParams.subjectId}`}
                className="text-muted-foreground hover:text-primary"
              >
                {subjectName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink className="text-foreground">
                {className} (Batch {teacherBatch || "N/A"})
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-3xl font-bold text-foreground">
            {className} Students (Batch {teacherBatch || "N/A"})
          </h1>
          <p className="text-muted-foreground">Select a student to view their practicals</p>
        </div>
        {students.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <motion.div key={student.id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card
                  className="cursor-pointer border-none shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => handleStudentClick(student.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">{student.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">Batch: {student.batch}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-20 bg-primary/5 rounded-lg">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No students found in this class for batch {teacherBatch || "N/A"}.
          </p>
        )}
      </motion.div>
    </DashboardLayout>
  );
}