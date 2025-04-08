"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { toast } from "@/components/ui/use-toast"
import React from "react"

interface Class {
  id: string
  name: string
  semester_id: string
}

export default function SubjectPage({ params }: { params: Promise<{ id: string; semesterId: string; subjectId: string }> }) {
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [departmentName, setDepartmentName] = useState<string>("")
  const [semesterNumber, setSemesterNumber] = useState<string>("")
  const [subjectName, setSubjectName] = useState<string>("")
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

    const fetchDetails = async () => {
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

        const subjectResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/subjects/${resolvedParams.semesterId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!subjectResponse.ok) throw new Error("Failed to fetch subjects")
        const subjects = await subjectResponse.json()
        const subject = subjects.find((s: any) => s.id === resolvedParams.subjectId)
        if (subject) setSubjectName(subject.name)
        else throw new Error("Subject not assigned")
      } catch (error) {
        console.error("Failed to fetch details:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load page details.",
          variant: "destructive",
        })
      }
    }

    const fetchClasses = async () => {
      try {
        console.log("Fetching classes for subject ID:", resolvedParams.subjectId, "semester ID:", resolvedParams.semesterId)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/classes/${resolvedParams.subjectId}/${resolvedParams.semesterId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!response.ok) {
          const text = await response.text() // Get raw response for debugging
          console.error("Fetch classes failed with status:", response.status, "Response:", text)
          throw new Error(`Failed to fetch classes: ${response.status} - ${text}`)
        }
        const data: Class[] = await response.json()
        console.log("Classes received:", data)
        setClasses(data)
      } catch (error) {
        console.error("Failed to fetch classes:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Unable to load classes.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
    fetchClasses()
  }, [resolvedParams.id, resolvedParams.semesterId, resolvedParams.subjectId, router])

  const handleClassClick = (classId: string) => {
    console.log("Navigating to class:", classId)
    router.push(
      `/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}/subject/${resolvedParams.subjectId}/class/${classId}?t=${Date.now()}`
    )
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
        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/department/${resolvedParams.id}/semester/${resolvedParams.semesterId}`}>
            Semester {semesterNumber}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{subjectName}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{subjectName} Classes</h1>
        <p className="text-muted-foreground">Select a class to view students</p>
      </div>
      {classes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card
              key={cls.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleClassClick(cls.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{cls.name}</CardTitle>
                <CardDescription>Select to view students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-16 bg-blue-50 rounded-md">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No classes assigned to you for this subject yet.
        </div>
      )}
    </DashboardLayout>
  )
}