"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Clock, 
  BookOpen, 
  UserCheck,
  Activity,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  className: string;
  createdAt: string;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  actions: Array<{
    id: string;
    description: string;
    createdAt: string;
  }>;
}

interface ParentData {
  students: Student[];
}

export default function ParentDashboard() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ParentData | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    const storedParentId = localStorage.getItem("id");
    console.log("Stored Parent ID:", storedParentId);
    setParentId(storedParentId);
  }, []);

  useEffect(() => {
    if (parentId) {
      fetchData();
    }
  }, [parentId]);

  const fetchData = async () => {
    if (!parentId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/child?parentId=${parentId}`);
      setData(response.data);
      console.log(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalActions = () => {
    if (!data?.students) return 0;
    return data.students.reduce((total, student) => total + student.actions.length, 0);
  };

  const getRecentActions = () => {
    if (!data?.students) return [];
    const allActions = data.students.flatMap(student => 
      student.actions.map(action => ({
        ...action,
        studentName: student.name,
        studentClass: student.className
      }))
    );
    return allActions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  };

  // Show loading while parentId is being fetched
  if (!parentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#1e3a8a] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#1e3a8a]" />
              <h1 className="text-3xl font-bold text-[#1e3a8a]">Loading Parent Dashboard...</h1>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2">Parent Dashboard</h1>
              <p className="text-gray-600">Monitor your children's progress and activities</p>
            </div>
            <div className="flex items-center space-x-2 text-[#1e3a8a]">
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">
                {data?.students?.length || 0} Child{data?.students?.length !== 1 ? 'ren' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {data?.students && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Children</CardTitle>
                <div className="p-2 rounded-full bg-blue-100">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1e3a8a] mb-1">{data.students.length}</div>
                <p className="text-xs text-gray-500">Enrolled in school</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Activities</CardTitle>
                <div className="p-2 rounded-full bg-green-100">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1e3a8a] mb-1">{getTotalActions()}</div>
                <p className="text-xs text-gray-500">Recorded actions</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Recent Activity</CardTitle>
                <div className="p-2 rounded-full bg-orange-100">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1e3a8a] mb-1">{getRecentActions().length}</div>
                <p className="text-xs text-gray-500">Actions this week</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Children Cards */}
        {data?.students && data.students.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.students.map((student) => (
              <Card key={student.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-[#1e3a8a] flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-xl text-[#1e3a8a]">{student.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>{student.className}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Teacher Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserCheck className="h-4 w-4 text-[#1e3a8a]" />
                      <span className="font-medium text-[#1e3a8a]">Teacher</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.teacher.name}</p>
                      <p className="text-sm text-gray-600">{student.teacher.email}</p>
                    </div>
                  </div>

                  {/* Enrollment Date */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Enrolled: {formatDate(student.createdAt)}</span>
                  </div>

                  {/* Recent Actions */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <BookOpen className="h-4 w-4 text-[#1e3a8a]" />
                      <span className="font-medium text-[#1e3a8a]">Recent Activities</span>
                      <Badge variant="outline" className="text-xs">
                        {student.actions.length} total
                      </Badge>
                    </div>
                    {student.actions.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {student.actions.slice(0, 3).map((action) => (
                          <div key={action.id} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-sm text-gray-900 mb-1">{action.description}</p>
                            <p className="text-xs text-gray-600 flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDateTime(action.createdAt)}</span>
                            </p>
                          </div>
                        ))}
                        {student.actions.length > 3 && (
                          <p className="text-sm text-gray-500 text-center py-2">
                            +{student.actions.length - 3} more activities
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic bg-gray-50 rounded-lg p-3">
                        No activities recorded yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Children Found</h3>
              <p className="text-gray-500">
                You don't have any children enrolled in the system yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent Activities Summary */}
        {data?.students && getRecentActions().length > 0 && (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities Across All Children
              </CardTitle>
              <CardDescription>
                Latest activities from all your children
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRecentActions().map((action) => (
                  <div key={`${action.id}-${action.studentName}`} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {action.studentName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{action.studentName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {action.studentClass}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{action.description}</p>
                      <p className="text-xs text-gray-500 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDateTime(action.createdAt)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
