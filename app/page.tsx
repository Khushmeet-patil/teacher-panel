"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoginModal from "@/components/login-modal";
import { motion } from "framer-motion";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-blue-600">EduTrack</h1>
          </div>
          <Button
            onClick={() => setShowLoginModal(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Teacher Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 flex flex-col items-center text-center">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
            Empower Your <span className="text-blue-600">Teaching Workflow</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Efficiently review student practicals, assign marks, and explore GitHub-hosted code submissions—all in one intuitive platform.
          </p>
          <Button
            onClick={() => setShowLoginModal(true)}
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Practical Review",
                description: "View and assess student-submitted practicals with ease.",
                icon: "📝",
              },
              {
                title: "GitHub Integration",
                description: "Access and evaluate code directly from student GitHub repos.",
                icon: "💻",
              },
              {
                title: "Marking Made Simple",
                description: "Assign marks quickly with a streamlined grading system.",
                icon: "⭐",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gray-50">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Ready to Streamline Your Teaching?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Join EduTrack today and take control of your classroom management with a professional, teacher-focused dashboard.
            </p>
            <Button
              onClick={() => setShowLoginModal(true)}
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Start Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>© 2025 EduTrack. All rights reserved.</p>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}