"use client"

import { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b">
        <h2 className="text-xl font-semibold">Teacher Dashboard</h2>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}