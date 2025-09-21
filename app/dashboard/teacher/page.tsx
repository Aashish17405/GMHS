"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateStudentModal } from "@/components/CreateStudentModal";
import { StudentsTable } from "@/components/StudentsTable";
import { EditStudentModal } from "@/components/EditStudentModal";
import { DeleteStudentModal } from "@/components/DeleteStudentModal";
import { AddActionModal } from "@/components/AddActionModal";
import { ComplaintsTable } from "@/components/ComplaintsTable";
import { RespondToComplaintModal } from "@/components/RespondToComplaintModal";
import { ViewComplaintModal } from "@/components/ViewComplaintModal";
import { Users, GraduationCap, Activity, MessageSquare } from "lucide-react";
import axios from "axios";

interface Student {
  id: string;
  name: string;
  className: string;
  createdAt: string;
  parent: {
    id: string;
    name: string;
    email: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  actions: Array<{
    id: string;
    description: string;
    createdAt: string;
  }>;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  student: {
    id: string;
    name: string;
    className: string;
  };
  parent: {
    id: string;
    name: string;
    email: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function TeacherDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [addActionStudentId, setAddActionStudentId] = useState<string | null>(
    null
  );
  const [respondToComplaint, setRespondToComplaint] =
    useState<Complaint | null>(null);
  const [viewComplaint, setViewComplaint] = useState<Complaint | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Safely access localStorage on client side only
    const storedTeacherId = localStorage.getItem("id");
    setTeacherId(storedTeacherId || "teacher-id-placeholder");
  }, []);

  // ✅ Fix 1: Use useCallback to memoize functions
  const fetchStudents = useCallback(async () => {
    if (!teacherId) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/students?teacherId=${teacherId}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      setStudents(response.data.students);
      console.log("Fetched students:", response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }, [teacherId]); // Only depend on teacherId

  const fetchComplaints = useCallback(async () => {
    if (!teacherId) return;

    setComplaintsLoading(true);
    try {
      const response = await axios.get(
        `/api/complaints?teacherId=${teacherId}`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      setComplaints(response.data.complaints);
      console.log("Fetched complaints:", response.data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setComplaintsLoading(false);
    }
  }, [teacherId]); // Only depend on teacherId

  // Trigger refresh function
  const refreshData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // ✅ Fix 2: Remove function references from dependencies
  useEffect(() => {
    if (teacherId) {
      fetchStudents();
      fetchComplaints();
    }
  }, [teacherId, refreshTrigger, fetchStudents, fetchComplaints]); // Now these are stable references

  const handleEditStudent = (student: Student) => {
    setEditStudent(student);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setDeleteStudent({ id: studentId, name: student.name });
    }
  };

  const handleAddAction = (studentId: string) => {
    setAddActionStudentId(studentId);
  };

  const handleRespondToComplaint = (complaint: Complaint) => {
    setRespondToComplaint(complaint);
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setViewComplaint(complaint);
  };

  const getTotalActions = () => {
    return students.reduce(
      (total, student) => total + student.actions.length,
      0
    );
  };

  const getPendingComplaints = () => {
    return complaints.filter(
      (complaint) =>
        complaint.status === "PENDING" || complaint.status === "IN_PROGRESS"
    ).length;
  };

  const getUniqueClasses = () => {
    const classes = new Set(students.map((student) => student.className));
    return classes.size;
  };

  const getRecentActions = () => {
    const allActions = students.flatMap((student) =>
      student.actions.map((action) => ({
        ...action,
        studentName: student.name,
        studentClass: student.className,
      }))
    );
    return allActions
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  };

  const stats = [
    {
      title: "Total Students",
      value: students.length.toString(),
      description: "Students under your supervision",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Classes",
      value: getUniqueClasses().toString(),
      description: "Different classes you manage",
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Actions",
      value: getTotalActions().toString(),
      description: "Total actions recorded",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Pending Complaints",
      value: getPendingComplaints().toString(),
      description: "Complaints needing attention",
      icon: MessageSquare,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  // Show loading while teacherId is being fetched
  if (!teacherId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#1e3a8a] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mb-2">
                Teacher Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your students and track their progress
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <AddActionModal
                teacherId={teacherId || ""}
                onActionAdded={refreshData}
              />
              <CreateStudentModal
                teacherId={teacherId || ""}
                onStudentCreated={refreshData}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-full ${stat.bgColor} flex-shrink-0`}
                >
                  <stat.icon
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Students Table */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Students
            </CardTitle>
            <CardDescription className="text-sm">
              Manage your students, view their information, and track their
              progress
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <StudentsTable
              students={students}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddAction={handleAddAction}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Recent Actions */}
        {!loading && students.length > 0 && (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Actions
              </CardTitle>
              <CardDescription className="text-sm">
                Latest actions recorded across all your students
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {getRecentActions().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="mx-auto h-8 w-8 mb-3 text-gray-400" />
                  <p className="text-sm sm:text-base">
                    No recent actions recorded yet.
                  </p>
                  <p className="text-xs sm:text-sm">
                    Use the &quot;Add Action&quot; button to start tracking
                    student interactions.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getRecentActions().map((action) => (
                    <div
                      key={action.id}
                      className="flex flex-col sm:flex-row sm:items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 gap-2 sm:gap-0"
                    >
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm sm:text-base">
                            {action.studentName}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded self-start">
                            {action.studentClass}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          {action.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(action.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Complaints Section */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              Parent Complaints
            </CardTitle>
            <CardDescription className="text-sm">
              Complaints submitted by parents that require your attention and
              response
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ComplaintsTable
              complaints={complaints}
              onRespondToComplaint={handleRespondToComplaint}
              onViewComplaint={handleViewComplaint}
              loading={complaintsLoading}
            />
          </CardContent>
        </Card>

        {/* Edit Student Modal */}
        <EditStudentModal
          student={editStudent}
          open={editStudent !== null}
          onOpenChange={(open) => !open && setEditStudent(null)}
          onStudentUpdated={refreshData}
        />

        {/* Delete Student Modal */}
        <DeleteStudentModal
          studentId={deleteStudent?.id || null}
          studentName={deleteStudent?.name || ""}
          open={deleteStudent !== null}
          onOpenChange={(open) => !open && setDeleteStudent(null)}
          onStudentDeleted={refreshData}
        />

        {/* Add Action Modal for specific student */}
        <AddActionModal
          teacherId={teacherId || ""}
          selectedStudentId={addActionStudentId || undefined}
          open={addActionStudentId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setAddActionStudentId(null);
            }
          }}
          onActionAdded={() => {
            setAddActionStudentId(null);
            refreshData();
          }}
        />

        {/* Complaint Modals */}
        <RespondToComplaintModal
          complaint={respondToComplaint}
          teacherId={teacherId || ""}
          open={respondToComplaint !== null}
          onOpenChange={(open) => {
            if (!open) {
              setRespondToComplaint(null);
            }
          }}
          onComplaintUpdated={() => {
            setRespondToComplaint(null);
            refreshData();
          }}
        />

        <ViewComplaintModal
          complaint={viewComplaint}
          open={viewComplaint !== null}
          onOpenChange={(open) => {
            if (!open) {
              setViewComplaint(null);
            }
          }}
        />
      </div>
    </div>
  );
}