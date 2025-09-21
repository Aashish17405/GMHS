"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { ViewComplaintModal } from "./ViewComplaintModal";

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

interface TeacherMetrics {
  id: string;
  name: string;
  email: string;
  totalComplaints: number;
  resolved: number;
  pending: number;
  inProgress: number;
  resolutionRate: number;
  avgResolutionTimeDays: number;
  recentComplaints: Complaint[];
}

interface ComplaintStatistics {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  resolutionRate: number;
  avgResponseTimeHours: number;
  typeDistribution: Record<string, number>;
  dailyTrends: Array<{
    date: string;
    count: number;
    resolved: number;
  }>;
}

interface AdminComplaintsData {
  complaints: Complaint[];
  statistics: ComplaintStatistics;
  teacherPerformance: TeacherMetrics[];
}

export function AdminComplaintsTable() {
  const [data, setData] = useState<AdminComplaintsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [viewComplaintModal, setViewComplaintModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [teacherFilter, setTeacherFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchComplaintsData();
  }, []);

  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/complaints");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching complaints data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-600"
          >
            <CheckCircle className="h-3 w-3" />
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      ACADEMIC_PERFORMANCE: "Academic",
      BEHAVIORAL_ISSUES: "Behavioral",
      ATTENDANCE: "Attendance",
      HOMEWORK_ISSUES: "Homework",
      COMMUNICATION: "Communication",
      OTHER: "Other",
    };
    return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
  };

  const getPerformanceIndicator = (rate: number) => {
    if (rate >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate >= 60) return <Target className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const filteredComplaints =
    data?.complaints.filter((complaint) => {
      if (statusFilter !== "ALL" && complaint.status !== statusFilter)
        return false;
      if (typeFilter !== "ALL" && complaint.type !== typeFilter) return false;
      if (teacherFilter !== "ALL" && complaint.teacher?.id !== teacherFilter)
        return false;
      return true;
    }) || [];

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setViewComplaintModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            Failed to load complaints data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Complaints
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {data.statistics.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.statistics.dailyTrends.slice(-1)[0]?.count || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Resolution Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {data.statistics.resolutionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.statistics.resolved} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {data.statistics.avgResponseTimeHours}h
            </div>
            <p className="text-xs text-muted-foreground">
              {data.statistics.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Active Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {
                data.teacherPerformance.filter((t) => t.totalComplaints > 0)
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">handling complaints</p>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {data.teacherPerformance
              .filter((teacher) => teacher.totalComplaints > 0)
              .sort((a, b) => b.resolutionRate - a.resolutionRate)
              .slice(0, 5)
              .map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {getPerformanceIndicator(teacher.resolutionRate)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{teacher.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {teacher.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                      <span className="text-sm text-gray-500">
                        {teacher.totalComplaints} complaints
                      </span>
                      <Badge
                        variant={
                          teacher.resolutionRate >= 80
                            ? "default"
                            : teacher.resolutionRate >= 60
                            ? "secondary"
                            : "destructive"
                        }
                        className="w-fit"
                      >
                        {teacher.resolutionRate}% resolved
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Avg: {teacher.avgResolutionTimeDays} days
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Complaints</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="ACADEMIC_PERFORMANCE">Academic</SelectItem>
                <SelectItem value="BEHAVIORAL_ISSUES">Behavioral</SelectItem>
                <SelectItem value="ATTENDANCE">Attendance</SelectItem>
                <SelectItem value="HOMEWORK_ISSUES">Homework</SelectItem>
                <SelectItem value="COMMUNICATION">Communication</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Teachers</SelectItem>
                {data.teacherPerformance.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {complaint.student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {complaint.student.className}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{complaint.parent.name}</p>
                          <p className="text-sm text-gray-500">
                            {complaint.parent.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {complaint.teacher ? (
                          <div>
                            <p className="font-medium">
                              {complaint.teacher.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {complaint.teacher.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>{getTypeBadge(complaint.type)}</TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewComplaint(complaint)}
                          className="h-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No complaints found with the selected filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <Card key={complaint.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">
                          {complaint.student.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {complaint.student.className}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(complaint.status)}
                        {getTypeBadge(complaint.type)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Parent
                        </p>
                        <p className="text-sm">{complaint.parent.name}</p>
                        <p className="text-xs text-gray-500">
                          {complaint.parent.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Teacher
                        </p>
                        {complaint.teacher ? (
                          <div>
                            <p className="text-sm">{complaint.teacher.name}</p>
                            <p className="text-xs text-gray-500">
                              {complaint.teacher.email}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Unassigned</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewComplaint(complaint)}
                        className="h-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No complaints found with the selected filters</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ViewComplaintModal
        complaint={selectedComplaint}
        open={viewComplaintModal}
        onOpenChange={setViewComplaintModal}
      />
    </div>
  );
}
