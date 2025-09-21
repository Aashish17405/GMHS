"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import axios from "axios";

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

interface RespondToComplaintModalProps {
  complaint: Complaint | null;
  teacherId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplaintUpdated: () => void;
}

export function RespondToComplaintModal({
  complaint,
  teacherId,
  open,
  onOpenChange,
  onComplaintUpdated,
}: RespondToComplaintModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    status: "",
    resolution: "",
  });

  useEffect(() => {
    if (complaint && open) {
      setFormData({
        status: complaint.status,
        resolution: complaint.resolution || "",
      });
      setError("");
    }
  }, [complaint, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setError("");

    if (!formData.status) {
      setError("Please select a status");
      return;
    }

    if (formData.status === "RESOLVED" && !formData.resolution.trim()) {
      setError(
        "Please provide a resolution when marking complaint as resolved"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put("/api/complaints", {
        complaintId: complaint.id,
        status: formData.status,
        resolution: formData.resolution.trim() || undefined,
        teacherId,
      });

      if (response.status === 200) {
        onOpenChange(false);
        onComplaintUpdated();
      }
    } catch (error: unknown) {
      console.error("Error updating complaint:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update complaint. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      status: complaint?.status || "",
      resolution: complaint?.resolution || "",
    });
    setError("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "IN_PROGRESS":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Respond to Complaint
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Review the complaint details and provide your response or mark it as
            resolved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Complaint Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {complaint.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getTypeBadge(complaint.type)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(complaint.status)}
                    <span className="text-sm text-gray-600 capitalize">
                      {complaint.status.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Student:</span>{" "}
                {complaint.student.name} ({complaint.student.className})
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Parent:</span>{" "}
                {complaint.parent.name} ({complaint.parent.email})
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Submitted:</span>{" "}
                {formatDate(complaint.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Description:
              </p>
              <p className="text-sm text-gray-900 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {complaint.resolution && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Current Resolution:
                </p>
                <p className="text-sm text-gray-900 leading-relaxed bg-green-50 p-3 rounded border border-green-200">
                  {complaint.resolution}
                </p>
              </div>
            )}
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-gray-700"
              >
                Update Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="IN_PROGRESS">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="RESOLVED">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Resolved
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <Label
                htmlFor="resolution"
                className="text-sm font-medium text-gray-700"
              >
                Resolution / Actions Taken{" "}
                {formData.status === "RESOLVED" ? "*" : "(Optional)"}
              </Label>
              <textarea
                id="resolution"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] resize-none"
                placeholder="Describe the actions you have taken or plan to take to address this complaint. Be specific about steps taken for the student's improvement."
                value={formData.resolution}
                onChange={(e) =>
                  setFormData({ ...formData, resolution: e.target.value })
                }
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                {formData.status === "RESOLVED"
                  ? "Please provide details about how you resolved this complaint."
                  : "Optional: Describe any actions taken or planned."}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.status}
                className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Update Complaint
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
