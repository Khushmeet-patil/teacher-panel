"use client"

import { useEffect, useState } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(savedTheme === "dark" || (!savedTheme && prefersDark))
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDarkMode])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} relative`}>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        {children}
      </body>
    </html>
  )
}