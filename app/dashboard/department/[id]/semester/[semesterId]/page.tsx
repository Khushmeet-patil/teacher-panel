"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { toast } from "@/components/ui/use-toast"
import React from "react"
import { motion } from "framer-motion"

interface Subject {
  id: string
  name: string
  semester_id: string
}

export default function SemesterPage({ params }: { params: Promise<{ id: string; semesterId: string }> }) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [departmentName, setDepartmentName] = useState<string>("")
  const [semesterNumber, setSemesterNumber] = useState<string>("")
  const resolvedParams = React.use(params)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const teacherData = localStorage.getItem("teacher")

    if (!token || !teacherData) {
      toast({
        title: "Session Expired",
        description: "Please log in again.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    const teacher = JSON.parse(teacherData)

    const fetchDepartmentAndSemesterDetails = async () => {
      try {
        const deptResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/departments`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!deptResponse.ok) throw new Error("Failed to fetch departments")
        const departments = await deptResponse.json()
        const dept = departments.find((d: any) => d.id === resolvedParams.id)
        if (dept) setDepartmentName(dept.name)
        else throw new Error("Department not assigned")

        const semesterResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/department/${resolvedParams.id}/semesters`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!semesterResponse.ok) throw new Error("Failed to fetch semesters")
        const semesters = await semesterResponse.json()
        const semester = semesters.find((s: any) => s.id === resolvedParams.semesterId)
        if (semester) setSemesterNumber(semester.number.toString())
        else throw new Error("Semester not assigned")
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load details.",
          variant: "destructive",
        })
        router.push(`/dashboard/department/${resolvedParams.id}`)
      }
    }

    const fetchSubjects = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/subjects/${resolvedParams.semesterId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!response.ok) throw new Error(`Failed to fetch subjects: ${response.status}`)
        const data: Subject[] = await response.json()
        setSubjects(data)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load subjects.",
          variant: "destructive",
        })
        router.push(`/dashboard/department/${resolvedParams.id}`)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartmentAndSemesterDetails()
    fetchSubjects()
  }, [resolvedParams.id, resolvedParams.semesterId, router])

  const handleSubjectClick = (subjectId: string) => {
    router.push(`/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}/subject/${subjectId}`)
  }

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
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <Breadcrumb className="mb-4">
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/department/${resolvedParams.id}`} className="text-muted-foreground hover:text-primary">{departmentName}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink className="text-foreground">Semester {semesterNumber}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-3xl font-bold text-foreground">Semester {semesterNumber} Subjects</h1>
          <p className="text-muted-foreground">Select a subject to view classes</p>
        </div>
        {subjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <motion.div
                key={subject.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="cursor-pointer border-none shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => handleSubjectClick(subject.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">{subject.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">View classes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-20 bg-primary/5 rounded-lg">
                      <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No subjects assigned yet.</p>
        )}
      </motion.div>
    </DashboardLayout>
  )
}