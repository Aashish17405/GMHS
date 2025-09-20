"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Calendar,
  User,
  Eye,
  Clock,
  CheckCircle,
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

interface ComplaintsTableProps {
  complaints: Complaint[];
  onRespondToComplaint: (complaint: Complaint) => void;
  onViewComplaint: (complaint: Complaint) => void;
  loading?: boolean;
}

export function ComplaintsTable({
  complaints,
  onRespondToComplaint,
  onViewComplaint,
  loading = false,
}: ComplaintsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const complaintDate = new Date(dateString);
    const diffMs = now.getTime() - complaintDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
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

  const getTypeBadge = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      ACADEMIC_PERFORMANCE: "Academic",
      BEHAVIORAL_ISSUES: "Behavior",
      ATTENDANCE: "Attendance",
      HOMEWORK_ISSUES: "Homework",
      COMMUNICATION: "Communication",
      OTHER: "Other",
    };

    return (
      <Badge variant="outline" className="text-xs">
        {typeLabels[type] || type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#1e3a8a]"></div>
              <span>Loading complaints...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="w-full">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No complaints found
            </h3>
            <p className="text-gray-500 mb-4">
              There are no complaints submitted for your students at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="font-semibold text-[#1e3a8a] py-4">
                Complaint
              </TableHead>
              <TableHead className="font-semibold text-[#1e3a8a]">
                Student
              </TableHead>
              <TableHead className="font-semibold text-[#1e3a8a]">
                Parent
              </TableHead>
              <TableHead className="font-semibold text-[#1e3a8a]">
                Type
              </TableHead>
              <TableHead className="font-semibold text-[#1e3a8a]">
                Status
              </TableHead>
              <TableHead className="font-semibold text-[#1e3a8a]">
                Submitted
              </TableHead>
              <TableHead className="font-semibold text-[#1e3a8a] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow
                key={complaint.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <TableCell className="py-4">
                  <div>
                    <div className="font-medium text-gray-900 mb-1">
                      {complaint.title}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {complaint.description.length > 80
                        ? `${complaint.description.substring(0, 80)}...`
                        : complaint.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {complaint.student.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {complaint.student.className}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {complaint.parent.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {complaint.parent.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(complaint.type)}</TableCell>
                <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {formatTimeAgo(complaint.createdAt)}
                    </div>
                    <div className="text-gray-500 flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(complaint.createdAt)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewComplaint(complaint)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    {complaint.status !== "RESOLVED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRespondToComplaint(complaint)}
                        className="text-orange-600 hover:text-orange-700 border-orange-200 hover:bg-orange-50"
                      >
                        <MessageSquare className="mr-1 h-4 w-4" />
                        Respond
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
