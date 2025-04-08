"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"

interface Department {
  id: string
  name: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherName, setTeacherName] = useState<string>("Teacher")

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

    const parsedTeacher = JSON.parse(teacherData)
    setTeacherName(parsedTeacher.name || "Teacher")

    const fetchDepartments = async () => {
      try {
        console.log("Fetching departments for teacher ID:", parsedTeacher.id)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/departments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
        const departmentsData: Department[] = await response.json()
        console.log("Departments received:", departmentsData)

        if (departmentsData.length === 0) {
          toast({
            title: "No Assignments",
            description: "You are not assigned to any departments yet.",
          })
        }

        setDepartments(departmentsData)
      } catch (error) {
        console.error("Error fetching departments:", error)
        toast({
          title: "Error",
          description: "Failed to load departments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [router])

  const handleDepartmentClick = (departmentId: string, departmentName: string) => {
    console.log("Clicked department ID:", departmentId, "Name:", departmentName)
    // Force navigation with a timestamp and ensure no caching interference
    const url = `/dashboard/department/${departmentId}?name=${encodeURIComponent(departmentName)}&t=${Date.now()}`
    console.log("Navigating to:", url)
    router.push(url)
    // Optionally refresh the page to ensure no stale data
    router.refresh()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {teacherName}</h1>
        <p className="text-muted-foreground">Here are the departments you are assigned to.</p>
      </div>
      {departments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <Card
              key={department.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleDepartmentClick(department.id, department.name)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{department.name}</CardTitle>
                <CardDescription>Department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-24 bg-blue-50 rounded-md">
                  <BookOpen className="h-12 w-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No departments assigned to you yet.
        </div>
      )}
    </DashboardLayout>
  )
}