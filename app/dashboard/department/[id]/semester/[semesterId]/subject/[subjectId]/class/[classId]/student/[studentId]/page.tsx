"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Practical {
  id: string;
  name: string;
  github_link: string;
  submitted_at: string;
  status: "submitted" | "completed" | "rejected";
  marks?: number | null;
  remarks?: string | null;
  student_id?: string;
}

interface Subject {
  id: string;
  name: string;
  num_practicals: number;
  num_group_projects: number;
}

export default function StudentPracticalDetailsPage() {
  const { studentId, classId, subjectId } = useParams() as {
    studentId: string;
    classId: string;
    subjectId: string;
  };
  const router = useRouter();
  
  // State management
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // Selected practical for grading
  const [selectedPractical, setSelectedPractical] = useState<Practical | null>(null);
  const [status, setStatus] = useState<"submitted" | "completed" | "rejected">("submitted");
  const [marks, setMarks] = useState<number | undefined>(undefined);
  const [remarks, setRemarks] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);

  // Load token from localStorage only on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
      if (!storedToken) {
        router.push("/login");
      }
    }
  }, [router]);

  // Fetch data once token is available
  useEffect(() => {
    if (!token || !studentId || !classId || !subjectId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch student info
        const studentRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/teacher/students/${classId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (!studentRes.ok) {
          throw new Error("Failed to fetch student information");
        }
        
        const studentsData = await studentRes.json();
        const student = studentsData.find((s: any) => s.id === studentId);
        
        if (!student) {
          throw new Error("Student not found");
        }
        
        setStudentName(student.name);
        
        // Fetch subject info
        const subjectRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/teacher/subjects/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (!subjectRes.ok) {
          throw new Error("Failed to fetch subject information");
        }
        
        const subjectData = await subjectRes.json();
        setSubject(subjectData);
        
        // Fetch practicals
        const practicalsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/teacher/submissions/${studentId}/${classId}/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (!practicalsRes.ok) {
          throw new Error("Failed to fetch practical submissions");
        }
        
        const practicalsData = await practicalsRes.json();
        setPracticals(practicalsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [studentId, classId, subjectId, token, router]);

  const openGradingModal = (practical: Practical) => {
    setSelectedPractical(practical);
    setStatus(practical.status as "submitted" | "completed" | "rejected");
    setMarks(practical.marks || undefined);
    setRemarks(practical.remarks || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPractical(null);
    setStatus("submitted");
    setMarks(undefined);
    setRemarks("");
  };

  const handleSavePractical = async () => {
    if (!selectedPractical) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      
      // Validate the inputs based on status
      if (status === "completed" && (marks === undefined || marks === null || isNaN(Number(marks)))) {
        throw new Error("Please enter valid marks for completed status.");
      }
      
      if (status === "rejected" && (!remarks || remarks.trim() === "")) {
        throw new Error("Please enter remarks explaining the rejection.");
      }
      
      const requestBody: {
        status: string;
        marks?: number;
        remarks?: string;
      } = { status };
      
      // Only include marks and remarks when relevant
      if (status === "completed") {
        requestBody.marks = Number(marks);
      } else if (status === "rejected") {
        requestBody.remarks = remarks;
      }
      
      console.log("Sending update request:", requestBody);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/teacher/submission/${selectedPractical.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
      }

      const updatedPractical = await response.json();
      
      // Update the practicals list with the updated practical
      setPracticals(currentPracticals => 
        currentPracticals.map(p => 
          p.id === selectedPractical.id ? { ...p, ...updatedPractical } : p
        )
      );
      
      // Show success message
      setSuccessMessage("Practical updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Close the modal
      closeModal();
    } catch (err) {
      console.error("Error updating practical:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Early return during SSR or if no token is present
  if (token === null) {
    return null; // Render nothing until token is loaded on client
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>
          Please <Link href="/login" className="text-indigo-600 hover:underline">log in</Link> to view student practicals.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-700 p-4 text-white sticky top-0 z-10 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Portal</h1>
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="hover:text-indigo-100">Dashboard</Link>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="bg-white text-indigo-700 px-5 py-2.5 rounded-lg hover:bg-indigo-50"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()} 
            className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-3xl font-bold text-gray-800">
            {studentName}'s {subject?.name || "Subject"} Practicals
          </h2>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Practical Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GitHub Link
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {practicals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No practical submissions found.
                    </td>
                  </tr>
                ) : (
                  practicals.map((practical) => (
                    <tr key={practical.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{practical.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(practical.submitted_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={practical.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          View Code
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            practical.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : practical.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {practical.status === "completed"
                            ? "Completed"
                            : practical.status === "rejected"
                            ? "Rejected"
                            : "Submitted"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {practical.status === "completed" ? `${practical.marks}/100` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openGradingModal(practical)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Grade
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {modalOpen && selectedPractical && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-4">Grade Practical: {selectedPractical.name}</h3>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "submitted" | "completed" | "rejected")}
                className="w-full p-3 border rounded-lg bg-white"
              >
                <option value="submitted">Submitted</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {status === "completed" && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Marks (out of 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks || ""}
                  onChange={(e) => setMarks(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
            )}
            
            {status === "rejected" && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-3 border rounded-lg h-32"
                  placeholder="Explain why this practical is being rejected..."
                  required
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePractical}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}