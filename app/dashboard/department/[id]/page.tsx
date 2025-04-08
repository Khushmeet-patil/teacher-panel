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
import { motion } from "framer-motion"

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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/user/teacher/department/${resolvedParams.id}/semesters`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!response.ok) throw new Error(`Failed to fetch semesters: ${response.status}`)
        const semestersData: Semester[] = await response.json()
        setSemesters(semestersData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load semesters.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSemesters()
  }, [resolvedParams.id, router])

  const handleSemesterClick = (semesterId: string) => {
    router.push(`/dashboard/department/${resolvedParams.id}/semester/${semesterId}?t=${Date.now()}`)
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
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink className="text-foreground">{departmentName}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-3xl font-bold text-foreground">{departmentName} Semesters</h1>
          <p className="text-muted-foreground">Select a semester to view subjects</p>
        </div>
        {semesters.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {semesters.map((semester) => (
              <motion.div
                key={semester.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="cursor-pointer border-none shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => handleSemesterClick(semester.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">Semester {semester.number}</CardTitle>
                    <CardDescription className="text-muted-foreground">View subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-20 bg-primary/5 rounded-lg">
                      <Calendar className="h-10 w-10 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No semesters assigned yet.</p>
        )}
      </motion.div>
    </DashboardLayout>
  )
}