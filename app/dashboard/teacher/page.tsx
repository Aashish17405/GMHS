"use client";

import { useState, useEffect } from "react";
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
import { Users, GraduationCap, Activity, TrendingUp } from "lucide-react";
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

export default function TeacherDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    // Safely access localStorage on client side only
    const storedTeacherId = localStorage.getItem("id");
    setTeacherId(storedTeacherId || "teacher-id-placeholder");
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchStudents();
    }
  }, [teacherId]);

  const fetchStudents = async () => {
    if (!teacherId) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/students?teacherId=${teacherId}`);
      setStudents(response.data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditStudent(student);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setDeleteStudent({ id: studentId, name: student.name });
    }
  };

  const getTotalActions = () => {
    return students.reduce(
      (total, student) => total + student.actions.length,
      0
    );
  };

  const getUniqueClasses = () => {
    const classes = new Set(students.map((student) => student.className));
    return classes.size;
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
      description: "Actions recorded this month",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Active Today",
      value: "12", // Mock data
      description: "Students with activity today",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your students and track their progress
              </p>
            </div>
            <CreateStudentModal
              teacherId={teacherId || ""}
              onStudentCreated={fetchStudents}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1e3a8a] mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Students Table */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students
            </CardTitle>
            <CardDescription>
              Manage your students, view their information, and track their
              progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentsTable
              students={students}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Edit Student Modal */}
        <EditStudentModal
          student={editStudent}
          open={editStudent !== null}
          onOpenChange={(open) => !open && setEditStudent(null)}
          onStudentUpdated={fetchStudents}
        />

        {/* Delete Student Modal */}
        <DeleteStudentModal
          studentId={deleteStudent?.id || null}
          studentName={deleteStudent?.name || ""}
          open={deleteStudent !== null}
          onOpenChange={(open) => !open && setDeleteStudent(null)}
          onStudentDeleted={fetchStudents}
        />
      </div>
    </div>
  );
}
