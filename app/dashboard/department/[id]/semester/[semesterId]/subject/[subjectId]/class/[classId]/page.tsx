"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { User } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { toast } from "@/components/ui/use-toast"
import React from "react"

interface Student {
  id: string
  name: string
  batch: string
}

export default function ClassPage({
  params,
}: {
  params: Promise<{ id: string; semesterId: string; subjectId: string; classId: string }>
}) {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [departmentName, setDepartmentName] = useState<string>("")
  const [semesterNumber, setSemesterNumber] = useState<string>("")
  const [subjectName, setSubjectName] = useState<string>("")
  const [className, setClassName] = useState<string>("")
  const [teacherBatch, setTeacherBatch] = useState<string | null>(null)
  const resolvedParams = React.use(params)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      const teacherData = localStorage.getItem("teacher")

      if (!token || !teacherData) {
        toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" })
        router.push("/")
        return
      }

      const teacher = JSON.parse(teacherData)
      setDepartmentName(teacher.department_id === resolvedParams.id ? teacher.department_name || "Department" : "Department")

      try {
        const assignmentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/teacher/assignments/${teacher.id}/${resolvedParams.classId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!assignmentResponse.ok) throw new Error("Failed to fetch teacher assignment")
        const assignment = await assignmentResponse.json()
        const batch = assignment.batch || null
        setTeacherBatch(batch)

        const [semesterResponse, subjectResponse, classResponse, studentsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/teacher/department/${resolvedParams.id}/semesters`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/teacher/subjects/${resolvedParams.semesterId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/teacher/classes/${resolvedParams.subjectId}/${resolvedParams.semesterId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/teacher/students/${resolvedParams.classId}?batch=${batch}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!semesterResponse.ok) throw new Error("Failed to fetch semesters")
        if (!subjectResponse.ok) throw new Error("Failed to fetch subjects")
        if (!classResponse.ok) throw new Error("Failed to fetch classes")
        if (!studentsResponse.ok) throw new Error("Failed to fetch students")

        const [semesters, subjects, classes, studentsData] = await Promise.all([
          semesterResponse.json(),
          subjectResponse.json(),
          classResponse.json(),
          studentsResponse.json(),
        ]);

        setSemesterNumber(semesters.find((s: any) => s.id === resolvedParams.semesterId)?.number.toString() || "")
        setSubjectName(subjects.find((s: any) => s.id === resolvedParams.subjectId)?.name || "")
        setClassName(classes.find((c: any) => c.id === resolvedParams.classId)?.name || "")
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching data:", (error as Error).message);
        toast({ title: "Error", description: (error as Error).message || "Could not load class data.", variant: "destructive" });
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, resolvedParams.semesterId, resolvedParams.subjectId, resolvedParams.classId, router]);

  const handleStudentClick = (studentId: string) => {
    router.push(
      `/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}/subject/${resolvedParams.subjectId}/class/${resolvedParams.classId}/student/${studentId}`
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/department/${resolvedParams.id}`}>{departmentName}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}`}>
            Semester {semesterNumber}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}/subject/${resolvedParams.subjectId}`}>
            {subjectName}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{className} (Batch {teacherBatch || "N/A"})</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{className} Students (Batch {teacherBatch || "N/A"})</h1>
        <p className="text-muted-foreground">Select a student to view their practicals</p>
      </div>
      {students.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card
              key={student.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleStudentClick(student.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{student.name}</CardTitle>
                <CardDescription>Batch: {student.batch}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-16 bg-blue-50 rounded-md">
                  <User className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No students found in this class for your assigned batch ({teacherBatch || "N/A"}).
        </div>
      )}
    </DashboardLayout>
  );
}