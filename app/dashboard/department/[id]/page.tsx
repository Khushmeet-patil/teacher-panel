"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { toast } from "@/components/ui/use-toast"
import React from "react"

interface Semester {
  id: string
  number: number
}

export default function DepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [departmentName, setDepartmentName] = useState<string>("")
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
    if (teacher.department_id === resolvedParams.id) {
      setDepartmentName(teacher.department_name || "Department")
    }

    const fetchSemesters = async () => {
      try {
        console.log("Fetching semesters for department ID:", resolvedParams.id)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/department/${resolvedParams.id}/semesters`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        if (!response.ok) throw new Error(`Failed to fetch semesters: ${response.status}`)
        const semestersData: Semester[] = await response.json()
        console.log("Semesters received:", semestersData)
        setSemesters(semestersData)
      } catch (error) {
        console.error("Error fetching semesters:", error)
        toast({
          title: "Error",
          description: "Failed to load semesters. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSemesters()
  }, [resolvedParams.id, router]) // Ensure effect runs when id changes

  const handleSemesterClick = (semesterId: string) => {
    console.log("Navigating to semester:", semesterId)
    router.push(
      `/dashboard/department/${resolvedParams.id}/semester/${semesterId}?t=${Date.now()}`
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
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{departmentName}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{departmentName} Semesters</h1>
        <p className="text-muted-foreground">Select a semester to view subjects</p>
      </div>
      {semesters.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {semesters.map((semester) => (
            <Card
              key={semester.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSemesterClick(semester.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle>Semester {semester.number}</CardTitle>
                <CardDescription>Select to view subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-16 bg-blue-50 rounded-md">
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No semesters assigned to this department yet.
        </div>
      )}
    </DashboardLayout>
  )
}