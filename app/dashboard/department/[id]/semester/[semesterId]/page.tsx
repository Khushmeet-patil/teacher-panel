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
      console.log("No token or teacher data found, redirecting to login")
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
        // Fetch departments to get the name
        const deptResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/departments`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!deptResponse.ok) throw new Error("Failed to fetch departments")
        const departments = await deptResponse.json()
        const dept = departments.find((d: any) => d.id === resolvedParams.id)
        if (dept) {
          setDepartmentName(dept.name)
        } else {
          throw new Error("Department not assigned")
        }

        // Fetch semesters to get the number
        const semesterResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/department/${resolvedParams.id}/semesters`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!semesterResponse.ok) throw new Error("Failed to fetch semesters")
        const semesters = await semesterResponse.json()
        const semester = semesters.find((s: any) => s.id === resolvedParams.semesterId)
        if (semester) {
          setSemesterNumber(semester.number.toString())
        } else {
          throw new Error("Semester not assigned")
        }
      } catch (error) {
        console.error("Failed to fetch details:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load page details.",
          variant: "destructive",
        })
        router.push(`/dashboard/department/${resolvedParams.id}`)
      }
    }

    const fetchSubjects = async () => {
      try {
        console.log("Fetching subjects for teacher ID:", teacher.id, "and semester ID:", resolvedParams.semesterId)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/subjects/${resolvedParams.semesterId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (!response.ok) {
          if (response.status === 403 || response.status === 404) {
            throw new Error("You are not assigned to this semester")
          }
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data: Subject[] = await response.json()
        console.log("Assigned subjects received:", data)

        if (data.length === 0) {
          toast({
            title: "No Subjects",
            description: "You are not assigned to any subjects in this semester.",
          })
        }

        setSubjects(data)
      } catch (error) {
        console.error("Failed to fetch subjects:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load subjects. Please try again.",
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
    console.log("Navigating to subject:", subjectId)
    router.push(`/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}/subject/${subjectId}`)
  }

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
    )
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
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Semester {semesterNumber}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Semester {semesterNumber} Subjects</h1>
        <p className="text-muted-foreground">Select a subject to view classes</p>
      </div>
      {subjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSubjectClick(subject.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{subject.name}</CardTitle>
                <CardDescription>Select to view classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-16 bg-blue-50 rounded-md">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No subjects assigned to you in this semester yet.
        </div>
      )}
    </DashboardLayout>
  )
}