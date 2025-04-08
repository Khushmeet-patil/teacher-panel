"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md">
        <h2 className="text-xl font-semibold">Teacher Dashboard</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            localStorage.clear()
            router.push("/")
          }}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}