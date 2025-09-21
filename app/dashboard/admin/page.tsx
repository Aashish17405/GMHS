"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  GraduationCap,
  Activity,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Settings,
  BarChart3,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Shield,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import { AdminComplaintsTable } from "@/components/AdminComplaintsTable";
import InstallPrompt from "@/components/InstallPrompt";

interface DashboardStats {
  userStats: {
    total: number;
    byRole: {
      ADMIN: number;
      TEACHER: number;
      PARENT: number;
    };
    recentRegistrations: number;
  };
  studentStats: {
    total: number;
    recentEnrollments: number;
    classDistribution: Array<{
      className: string;
      count: number;
    }>;
  };
  activityStats: {
    total: number;
    recentActions: number;
    dailyActivity: Array<{
      date: string;
      count: number;
    }>;
    avgDailyActivity: string;
  };
  complaintStats: {
    total: number;
    pending: number;
    resolved: number;
    recent: number;
    resolutionRate: string;
  };
  teacherStats: {
    topPerformers: Array<{
      id: string;
      name: string;
      studentCount: number;
      recentActionCount: number;
    }>;
  };
  systemHealth: {
    activeTeachers: number;
    studentsPerTeacher: string;
    actionsPerStudent: string;
  };
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  statistics: {
    studentCount: number;
    totalActions: number;
    recentActivityCount: number;
    classCount: number;
    avgActionsPerStudent: string;
    totalComplaints: number;
    pendingComplaints: number;
    resolvedComplaints: number;
    inProgressComplaints: number;
    complaintResolutionRate: number;
    avgResolutionDays: number;
    recentComplaints: number;
  };
}

interface TeachersData {
  teachers: Teacher[];
  summary: {
    totalTeachers: number;
    totalStudents: number;
    totalActions: number;
    totalComplaints: number;
    avgResolutionRate: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [teachersData, setTeachersData] = useState<TeachersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "teachers" | "analytics" | "complaints"
  >("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []); // Run once on component mount

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, teachersResponse] = await Promise.all([
        axios.get(`/api/admin/dashboard`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }),
        axios.get(`/api/admin/teachers`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }),
      ]);

      setDashboardStats(statsResponse.data);
      setTeachersData(teachersResponse.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-[#1e3a8a] rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-[#1e3a8a] truncate">
                  Admin Portal
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  System Administration
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <InstallPrompt manualTrigger={true} />
              <div className="hidden md:flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">
                  Administrator
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3730a3] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  Welcome, Administrator!
                </h2>
                <p className="text-white/90 text-sm sm:text-lg">
                  Monitor system performance and manage institutional operations
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {[
              {
                id: "overview",
                label: "System Overview",
                icon: BarChart3,
                shortLabel: "Overview",
              },
              {
                id: "teachers",
                label: "Teacher Management",
                icon: Users,
                shortLabel: "Teachers",
              },
              {
                id: "complaints",
                label: "Complaints",
                icon: MessageSquare,
                shortLabel: "Complaints",
              },
              {
                id: "analytics",
                label: "Analytics",
                icon: TrendingUp,
                shortLabel: "Analytics",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as
                      | "overview"
                      | "teachers"
                      | "complaints"
                      | "analytics"
                  )
                }
                className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-colors flex-1 ${
                  activeTab === tab.id
                    ? "bg-[#1e3a8a] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="font-medium text-xs sm:text-sm">
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && dashboardStats && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Users
                  </CardTitle>
                  <div className="p-2 rounded-full bg-blue-100">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1e3a8a] mb-1">
                    {dashboardStats.userStats.total}
                  </div>
                  <p className="text-xs text-gray-500">
                    +{dashboardStats.userStats.recentRegistrations} this month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Active Teachers
                  </CardTitle>
                  <div className="p-2 rounded-full bg-green-100">
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1e3a8a] mb-1">
                    {dashboardStats.userStats.byRole.TEACHER}
                  </div>
                  <p className="text-xs text-gray-500">
                    {dashboardStats.systemHealth.studentsPerTeacher} students
                    per teacher
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Students
                  </CardTitle>
                  <div className="p-2 rounded-full bg-orange-100">
                    <GraduationCap className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1e3a8a] mb-1">
                    {dashboardStats.studentStats.total}
                  </div>
                  <p className="text-xs text-gray-500">
                    +{dashboardStats.studentStats.recentEnrollments} new
                    enrollments
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Activities
                  </CardTitle>
                  <div className="p-2 rounded-full bg-purple-100">
                    <Activity className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1e3a8a] mb-1">
                    {dashboardStats.activityStats.total}
                  </div>
                  <p className="text-xs text-gray-500">
                    {dashboardStats.activityStats.avgDailyActivity} daily
                    average
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Complaints
                  </CardTitle>
                  <div className="p-2 rounded-full bg-red-100">
                    <MessageSquare className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1e3a8a] mb-1">
                    {dashboardStats.complaintStats.total}
                  </div>
                  <p className="text-xs text-gray-500">
                    {dashboardStats.complaintStats.resolutionRate}% resolved
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Health & Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* System Health */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    System Health
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-[#1e3a8a]">
                        {dashboardStats.userStats.byRole.ADMIN}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Admins
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-[#1e3a8a]">
                        {dashboardStats.userStats.byRole.PARENT}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Parents
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-[#1e3a8a]">
                        {dashboardStats.systemHealth.actionsPerStudent}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Actions/Student
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Complaint Health */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    Complaint Health
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Complaint management overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-red-600">
                        {dashboardStats.complaintStats.pending}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Pending
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-green-600">
                        {dashboardStats.complaintStats.resolved}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Resolved
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-blue-600">
                        {dashboardStats.complaintStats.recent}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Recent (7d)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Teachers */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Performing Teachers
                  </CardTitle>
                  <CardDescription>Based on recent activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardStats.teacherStats.topPerformers
                      .slice(0, 5)
                      .map((teacher, index) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1e3a8a] text-white text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {teacher.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {teacher.studentCount} students
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {teacher.recentActionCount} activities
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === "teachers" && teachersData && (
          <div className="space-y-4 sm:space-y-6">
            {/* Teachers Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-xl sm:text-2xl font-bold text-[#1e3a8a]">
                        {teachersData.summary.totalTeachers}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total Teachers
                      </div>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-xl sm:text-2xl font-bold text-[#1e3a8a]">
                        {teachersData.summary.totalStudents}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Students Managed
                      </div>
                    </div>
                    <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-xl sm:text-2xl font-bold text-[#1e3a8a]">
                        {teachersData.summary.totalActions}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total Actions
                      </div>
                    </div>
                    <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-xl sm:text-2xl font-bold text-[#1e3a8a]">
                        {teachersData.summary.totalComplaints}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total Complaints
                      </div>
                    </div>
                    <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Teachers List */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    Teacher Management
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Monitor and manage teacher accounts
                  </CardDescription>
                </div>
                <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {teachersData.teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors space-y-4 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm sm:text-lg">
                            {teacher.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {teacher.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {teacher.email}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="text-xs text-gray-500">
                              {teacher.statistics.studentCount} students
                            </span>
                            <span className="text-xs text-gray-500">
                              {teacher.statistics.totalActions} actions
                            </span>
                            <span className="text-xs text-gray-500 hidden sm:inline">
                              {teacher.statistics.classCount} classes
                            </span>
                            <span className="text-xs text-gray-500">
                              {teacher.statistics.totalComplaints} complaints
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                teacher.statistics.complaintResolutionRate >= 80
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : teacher.statistics
                                      .complaintResolutionRate >= 60
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {teacher.statistics.complaintResolutionRate}%
                              resolved
                            </Badge>
                            {teacher.statistics.avgResolutionDays > 0 && (
                              <span className="text-xs text-gray-500 hidden sm:inline">
                                {teacher.statistics.avgResolutionDays}d avg
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:space-x-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            teacher.statistics.recentActivityCount > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {teacher.statistics.recentActivityCount} recent
                        </Badge>
                        {teacher.statistics.pendingComplaints > 0 && (
                          <Badge
                            variant="destructive"
                            className="bg-red-100 text-red-800 text-xs"
                          >
                            {teacher.statistics.pendingComplaints} pending
                          </Badge>
                        )}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 h-8 w-8"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8">
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === "complaints" && (
          <div className="space-y-6">
            <AdminComplaintsTable />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && dashboardStats && (
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Activity Analytics
                </CardTitle>
                <CardDescription>
                  System activity trends and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Daily Activity Chart */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">
                      Daily Activity (Last 7 Days)
                    </h4>
                    <div className="space-y-2">
                      {dashboardStats.activityStats.dailyActivity.map((day) => (
                        <div
                          key={day.date}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#1e3a8a] h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.max(
                                    5,
                                    (day.count /
                                      Math.max(
                                        ...dashboardStats.activityStats.dailyActivity.map(
                                          (d) => d.count
                                        )
                                      )) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">
                              {day.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Class Distribution */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">
                      Class Distribution
                    </h4>
                    <div className="space-y-2">
                      {dashboardStats.studentStats.classDistribution
                        .slice(0, 10)
                        .map((cls) => (
                          <div
                            key={cls.className}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-600">
                              {cls.className}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${Math.max(
                                      5,
                                      (cls.count /
                                        Math.max(
                                          ...dashboardStats.studentStats.classDistribution.map(
                                            (c) => c.count
                                          )
                                        )) *
                                        100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-6 text-right">
                                {cls.count}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fallback for loading or no data */}
        {!dashboardStats && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-xl font-semibold text-[#1e3a8a] mb-2">
                No Data Available
              </div>
              <p className="text-gray-600">
                Unable to load dashboard data. Please refresh the page or check
                your connection.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
