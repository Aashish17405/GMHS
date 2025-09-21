"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Calendar,
  User,
  CheckCircle,
  Clock,
} from "lucide-react";

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

interface ViewComplaintModalProps {
  complaint: Complaint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewComplaintModal({
  complaint,
  open,
  onOpenChange,
}: ViewComplaintModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      ACADEMIC_PERFORMANCE: "Academic Performance",
      BEHAVIORAL_ISSUES: "Behavioral Issues",
      ATTENDANCE: "Attendance Issues",
      HOMEWORK_ISSUES: "Homework Issues",
      COMMUNICATION: "Communication Issues",
      OTHER: "Other",
    };

    return typeLabels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <MessageSquare className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Complaint Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Full details of the complaint submitted by the parent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Header Info */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {complaint.title}
              </h2>
              {getStatusBadge(complaint.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Complaint Type</p>
                <Badge variant="outline" className="text-xs">
                  {getTypeBadge(complaint.type)}
                </Badge>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Complaint ID</p>
                <p className="font-mono text-xs text-gray-800">
                  {complaint.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>

          {/* Student and Parent Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Student Information
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {complaint.student.name}
                </p>
                <p>
                  <span className="font-medium">Class:</span>{" "}
                  {complaint.student.className}
                </p>
                <p>
                  <span className="font-medium">ID:</span>{" "}
                  <span className="font-mono">
                    {complaint.student.id.slice(0, 8)}...
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Parent Information
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {complaint.parent.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {complaint.parent.email}
                </p>
                <p>
                  <span className="font-medium">ID:</span>{" "}
                  <span className="font-mono">
                    {complaint.parent.id.slice(0, 8)}...
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Complaint Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Complaint Description
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>
          </div>

          {/* Resolution (if available) */}
          {complaint.resolution && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Teacher&apos;s Resolution
              </h3>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {complaint.resolution}
                </p>
                {complaint.teacher && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Resolved by:</span>{" "}
                      {complaint.teacher.name}
                    </p>
                    {complaint.resolvedAt && (
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Resolved on:</span>{" "}
                        {formatDate(complaint.resolvedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Complaint Submitted
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(complaint.createdAt)}
                  </p>
                </div>
              </div>

              {complaint.updatedAt !== complaint.createdAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Last Updated
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(complaint.updatedAt)}
                    </p>
                  </div>
                </div>
              )}

              {complaint.resolvedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Complaint Resolved
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(complaint.resolvedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
