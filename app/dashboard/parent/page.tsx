"use client";

import { apiClient } from "@/lib/api";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitComplaintModal } from "@/components/SubmitComplaintModal";
import { ViewComplaintModal } from "@/components/ViewComplaintModal";
import InstallPrompt from "@/components/InstallPrompt";
import {
  Users,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  UserCheck,
  Activity,
  AlertCircle,
  Loader2,
  MessageSquare,
  AlertTriangle,
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

export default function ParentDashboard() {
  const [loading, setLoading] = useState<boolean>(false);
  const [complaintsLoading, setComplaintsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ParentData | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [viewComplaint, setViewComplaint] = useState<Complaint | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [formData, setFormData] = useState([
    {
      id: 1,
      question: "Child often needs assistance in completing home work.",
      answer: null as boolean | null,
      isComplaint: true,
      requiresText: false,
      additionalText: "",
    },
    {
      id: 2,
      question: "The hand writing is clear, neat and age-appropriate.",
      answer: null as boolean | null,
      isComplaint: false, // No complaint when handwriting is good
      requiresText: false,
      additionalText: "",
    },
    {
      id: 3,
      question: "Child is gradually gaining confidence in speaking English.",
      answer: null as boolean | null,
      isComplaint: false, // No complaint when confidence is growing
      requiresText: false,
      additionalText: "",
    },
    {
      id: 4,
      question: "Spelling mistakes in Languages are a recurring concern.",
      answer: null as boolean | null,
      isComplaint: true,
      requiresText: true,
      textLabel: "Mention language:",
      additionalText: "",
    },
    {
      id: 5,
      question: "Subject understanding requires personal support at school.",
      answer: null as boolean | null,
      isComplaint: true,
      requiresText: true,
      textLabel: "Mention subject:",
      additionalText: "",
    },
    {
      id: 6,
      question:
        "There have been concerns regarding interaction with any teacher.",
      answer: null as boolean | null,
      isComplaint: true,
      requiresText: true,
      textLabel: "Mention teacher name:",
      additionalText: "",
    },
    {
      id: 7,
      question:
        "Notebooks are being corrected regularly and are up to the mark.",
      answer: null as boolean | null,
      isComplaint: false, // No complaint when notebooks are being corrected
      requiresText: false,
      additionalText: "",
    },
    {
      id: 8,
      question:
        "The child experienced discomfort or issues with peers/classmates.",
      answer: null as boolean | null,
      isComplaint: true,
      requiresText: true,
      textLabel: "Describe the issue:",
      additionalText: "",
    },
    {
      id: 9,
      question:
        "The School provides sufficient opportunities for participation in extra/co-curricular activities.",
      answer: null as boolean | null,
      isComplaint: false, // No complaint when opportunities are sufficient
      requiresText: false,
      additionalText: "",
    },
    {
      id: 10,
      question: "Daily study hours at school are consistent and focused.",
      answer: null as boolean | null,
      isComplaint: false, // No complaint when study hours are consistent
      requiresText: false,
      additionalText: "",
    },
  ]);
  const [compiledComplaints, setCompiledComplaints] = useState<string>("");

  useEffect(() => {
    const storedParentId = localStorage.getItem("id");
    console.log("Stored Parent ID:", storedParentId);
    setParentId(storedParentId);
  }, []);

  const fetchData = async () => {
    if (!parentId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/child?parentId=${parentId}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      setData(response.data);
      console.log(response.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    if (!parentId) return;

    try {
      setComplaintsLoading(true);
      const response = await apiClient.get(
        `/api/complaints?parentId=${parentId}`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      setComplaints(response.data.complaints || []);
    } catch (err: unknown) {
      console.error("Error fetching complaints:", err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Function to trigger refresh from modals
  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle answer change
  const handleAnswerChange = (questionId: number, answer: boolean) => {
    setFormData((prev) =>
      prev.map((item) => (item.id === questionId ? { ...item, answer } : item))
    );
  };

  // Handle additional text change
  const handleTextChange = (questionId: number, text: string) => {
    setFormData((prev) =>
      prev.map((item) =>
        item.id === questionId ? { ...item, additionalText: text } : item
      )
    );
  };

  // Compile complaints from form data
  const compileComplaints = () => {
    const complaints: string[] = [];

    formData.forEach((item) => {
      // For complaint items, add to complaints if:
      // - isComplaint is true and answer is true (YES to a problem)
      // - isComplaint is false and answer is false (NO to a good thing)
      const shouldComplain =
        (item.isComplaint && item.answer === true) ||
        (!item.isComplaint && item.answer === false);

      if (shouldComplain) {
        let complaintText = item.question;
        if (item.requiresText && item.additionalText.trim()) {
          complaintText += ` Details: ${item.additionalText.trim()}`;
        }
        complaints.push(complaintText);
      }
    });

    return complaints.join(" | ");
  };

  // Submit complaint form
  const handleSubmitComplaintForm = async () => {
    if (!selectedChild) {
      toast.error("Please select a child");
      return;
    }

    const compiledText = compileComplaints();
    if (!compiledText.trim()) {
      toast.error("No complaints to submit based on your answers");
      return;
    }

    try {
      const selectedStudent = data?.students.find(
        (s) => s.id === selectedChild
      );
      if (!selectedStudent) {
        toast.error("Selected child not found");
        return;
      }

      const complaintData = {
        title: `Concerns for ${selectedStudent.name}`,
        description: compiledText,
        type: "OTHER",
        studentId: selectedChild,
        parentId: parentId,
      };

      console.log("Submitting complaint:", complaintData);

      const response = await apiClient.post("/api/complaints", complaintData, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (response.status === 201) {
        toast.success("Complaint submitted successfully!");
        setShowComplaintForm(false);
        setSelectedChild("");
        setFormData((prev) =>
          prev.map((item) => ({
            ...item,
            answer: null,
            additionalText: "",
          }))
        );
        triggerRefresh();
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint. Please try again.");
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedChild("");
    setFormData((prev) =>
      prev.map((item) => ({
        ...item,
        answer: null,
        additionalText: "",
      }))
    );
    setShowComplaintForm(false);
  };

  // Initial data load when parentId changes
  useEffect(() => {
    if (parentId) {
      fetchData();
      fetchComplaints();
    }
  }, [parentId]); // Remove fetchData and fetchComplaints from dependencies

  // Handle refresh trigger
  useEffect(() => {
    if (refreshTrigger > 0 && parentId) {
      fetchData();
      fetchComplaints();
    }
  }, [refreshTrigger]); // Remove parentId and fetch functions from dependencies

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
    return data.students.reduce(
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

  const getRecentActions = () => {
    if (!data?.students) return [];
    const allActions = data.students.flatMap((student) =>
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
              <h1 className="text-3xl font-bold text-[#1e3a8a]">
                Loading Parent Dashboard...
              </h1>
            </div>
          </div>
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
                Parent Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Monitor your children&apos;s progress and activities
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <InstallPrompt manualTrigger={true} />
              <Button
                onClick={() => setShowComplaintForm(true)}
                className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
                disabled={!data?.students || data.students.length === 0}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Complaint
              </Button>
              <div className="flex items-center space-x-2 text-[#1e3a8a]">
                <Users className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-medium">
                  {data?.students?.length || 0} Child
                  {data?.students?.length !== 1 ? "ren" : ""}
                </span>
              </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Children
                </CardTitle>
                <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-1">
                  {data.students.length}
                </div>
                <p className="text-xs text-gray-500">Enrolled in school</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Activities
                </CardTitle>
                <div className="p-2 rounded-full bg-green-100 flex-shrink-0">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-1">
                  {getTotalActions()}
                </div>
                <p className="text-xs text-gray-500">Recorded actions</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  My Complaints
                </CardTitle>
                <div className="p-2 rounded-full bg-orange-100 flex-shrink-0">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-1">
                  {complaints.length}
                </div>
                <p className="text-xs text-gray-500">Total submitted</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  Pending Issues
                </CardTitle>
                <div className="p-2 rounded-full bg-red-100 flex-shrink-0">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-1">
                  {getPendingComplaints()}
                </div>
                <p className="text-xs text-gray-500">Awaiting response</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Children Cards */}
        {data?.students && data.students.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {data.students.map((student) => (
              <Card
                key={student.id}
                className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm sm:text-lg">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl text-[#1e3a8a]">
                          {student.name}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-sm">{student.className}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 self-start"
                    >
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {/* Teacher Information */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-[#1e3a8a]" />
                      <span className="font-medium text-[#1e3a8a] text-sm sm:text-base">
                        Teacher
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {student.teacher.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {student.teacher.email}
                      </p>
                    </div>
                  </div>

                  {/* Enrollment Date */}
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Enrolled: {formatDate(student.createdAt)}</span>
                  </div>

                  {/* Recent Actions */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-[#1e3a8a]" />
                        <span className="font-medium text-[#1e3a8a] text-sm sm:text-base">
                          Recent Activities
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs self-start">
                        {student.actions.length} total
                      </Badge>
                    </div>
                    {student.actions.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {student.actions.slice(0, 3).map((action) => (
                          <div
                            key={action.id}
                            className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                          >
                            <p className="text-xs sm:text-sm text-gray-900 mb-1">
                              {action.description}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDateTime(action.createdAt)}</span>
                            </p>
                          </div>
                        ))}
                        {student.actions.length > 3 && (
                          <p className="text-xs sm:text-sm text-gray-500 text-center py-2">
                            +{student.actions.length - 3} more activities
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500 italic bg-gray-50 rounded-lg p-3">
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
            <CardContent className="text-center py-8 sm:py-12 p-4 sm:p-6">
              <Users className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No Children Found
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                You don&apos;t have any children enrolled in the system yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent Activities Summary */}
        {data?.students && getRecentActions().length > 0 && (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Activities Across All Children
              </CardTitle>
              <CardDescription className="text-sm">
                Latest activities from all your children
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {getRecentActions().map((action) => (
                  <div
                    key={`${action.id}-${action.studentName}`}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-xs sm:text-sm">
                        {action.studentName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {action.studentName}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs self-start"
                        >
                          {action.studentClass}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-1">
                        {action.description}
                      </p>
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

        {/* My Complaints Section */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              My Complaints
            </CardTitle>
            <CardDescription className="text-sm">
              View and track your submitted complaints and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {complaintsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin text-[#1e3a8a] mr-2" />
                <span className="text-sm sm:text-base text-gray-600">
                  Loading complaints...
                </span>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No Complaints Yet
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4">
                  You haven&apos;t submitted any complaints yet. Use the
                  &quot;Submit Complaint&quot; button above to raise any
                  concerns.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                          {complaint.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                          {complaint.description}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500">
                          <span>Student: {complaint.student.name}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            Submitted: {formatDate(complaint.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2">
                        {complaint.status === "PENDING" && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                        {complaint.status === "IN_PROGRESS" && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            <MessageSquare className="mr-1 h-3 w-3" />
                            In Progress
                          </Badge>
                        )}
                        {complaint.status === "RESOLVED" && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            <Activity className="mr-1 h-3 w-3" />
                            Resolved
                          </Badge>
                        )}
                        <button
                          onClick={() => setViewComplaint(complaint)}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                    {complaint.resolution && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs sm:text-sm font-medium text-green-800 mb-1">
                          Teacher&apos;s Response:
                        </p>
                        <p className="text-xs sm:text-sm text-green-700">
                          {complaint.resolution}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Complaint Modal */}
        <ViewComplaintModal
          complaint={viewComplaint}
          open={viewComplaint !== null}
          onOpenChange={(open) => {
            if (!open) {
              setViewComplaint(null);
            }
          }}
        />

        {/* Complaint Form Dialog */}
        <Dialog open={showComplaintForm} onOpenChange={setShowComplaintForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#1e3a8a]">
                Submit Complaint - Parent Feedback Form
              </DialogTitle>
              <DialogDescription>
                Please select a child and answer the following questions. Your
                responses will help us address any concerns.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Child Selection */}
              <div className="space-y-2">
                <Label htmlFor="child-select" className="text-sm font-medium">
                  Select Child *
                </Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {data?.students?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Please answer the following questions:
                </h3>
                {formData.map((item, index) => (
                  <Card key={item.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <p className="font-medium text-gray-900">
                          {index + 1}. {item.question}
                        </p>

                        {/* Yes/No Buttons */}
                        <div className="flex space-x-4">
                          <Button
                            type="button"
                            variant={
                              item.answer === true ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleAnswerChange(item.id, true)}
                            className={
                              item.answer === true
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            variant={
                              item.answer === false ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleAnswerChange(item.id, false)}
                            className={
                              item.answer === false
                                ? "bg-red-600 hover:bg-red-700"
                                : ""
                            }
                          >
                            No
                          </Button>
                        </div>

                        {/* Additional Text Input */}
                        {item.requiresText &&
                          ((item.isComplaint && item.answer === true) ||
                            (!item.isComplaint && item.answer === false)) && (
                            <div className="mt-3">
                              <Label className="text-sm text-gray-600">
                                {item.textLabel || "Please provide details:"}
                              </Label>
                              <Input
                                type="text"
                                value={item.additionalText}
                                onChange={(e) =>
                                  handleTextChange(item.id, e.target.value)
                                }
                                placeholder="Enter details..."
                                className="mt-1"
                              />
                            </div>
                          )}

                        {/* Show if this will create a complaint */}
                        {((item.isComplaint && item.answer === true) ||
                          (!item.isComplaint && item.answer === false)) && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                            <p className="text-sm text-orange-800">
                              ⚠️ This response will be included in your
                              complaint
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Preview Compiled Complaints */}
              {compileComplaints() && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900">
                    Complaint Preview:
                  </Label>
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap">
                    {compileComplaints()}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitComplaintForm}
                  disabled={!selectedChild || !compileComplaints()}
                  className="bg-[#1e3a8a] hover:bg-[#1e40af]"
                >
                  Submit Complaint
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
