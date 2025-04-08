"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import LoginModal from "@/components/login-modal"
import { motion } from "framer-motion"

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/placeholder.svg?height=40&width=40" alt="Logo" width={40} height={40} className="rounded-full" />
            <h1 className="text-2xl font-bold text-primary">EduTrack</h1>
          </div>
          <Button onClick={() => setShowLoginModal(true)} className="bg-primary hover:bg-primary/90">
            Teacher Login
          </Button>
        </div>
      </header>

      <section className="container mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Elevate Your <span className="text-primary">Teaching</span> Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            Seamlessly manage classes, track student progress, and grade practicals with ease.
          </p>
          <Button onClick={() => setShowLoginModal(true)} size="lg" className="bg-primary hover:bg-primary/90">
            Start Now
          </Button>
        </motion.div>
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Image
            src="/placeholder.svg?height=400&width=500"
            alt="Teacher Dashboard"
            width={500}
            height={400}
            className="rounded-xl shadow-2xl"
          />
        </motion.div>
      </section>

      <section className="bg-muted py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why EduTrack?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Organized Management", description: "Effortlessly handle departments and classes.", icon: "📚" },
              { title: "Student Insights", description: "Real-time tracking of student submissions.", icon: "👩‍🎓" },
              { title: "Efficient Grading", description: "Streamlined practical evaluation process.", icon: "✅" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-6 text-center">
          <p>© 2025 EduTrack. All rights reserved.</p>
        </div>
      </footer>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  )
}