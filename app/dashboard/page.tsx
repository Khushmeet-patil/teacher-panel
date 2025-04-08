"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { motion } from "framer-motion"

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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/departments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
        const departmentsData: Department[] = await response.json()
        setDepartments(departmentsData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load departments.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [router])

  const handleDepartmentClick = (departmentId: string, departmentName: string) => {
    router.push(`/dashboard/department/${departmentId}?name=${encodeURIComponent(departmentName)}&t=${Date.now()}`)
  }

  if (loading) {
    return (
      <DashboardLayout>
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
          <h1 className="text-3xl font-bold text-foreground">Welcome, {teacherName}</h1>
          <p className="text-muted-foreground">Explore your assigned departments below.</p>
        </div>
        {departments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <motion.div
                key={department.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="cursor-pointer border-none shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => handleDepartmentClick(department.id, department.name)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">{department.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">Department</CardDescription>
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
          <p className="text-center text-muted-foreground">No departments assigned yet.</p>
        )}
      </motion.div>
    </DashboardLayout>
  )
}