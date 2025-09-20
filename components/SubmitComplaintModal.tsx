"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2, AlertCircle, FileText } from "lucide-react";
import axios from "axios";

interface Student {
  id: string;
  name: string;
  className: string;
}

interface SubmitComplaintModalProps {
  parentId: string;
  onComplaintSubmitted: () => void;
  selectedStudentId?: string;
  triggerButton?: React.ReactNode;
}

const complaintTypes = [
  { value: "ACADEMIC_PERFORMANCE", label: "Academic Performance" },
  { value: "BEHAVIORAL_ISSUES", label: "Behavioral Issues" },
  { value: "ATTENDANCE", label: "Attendance Issues" },
  { value: "HOMEWORK_ISSUES", label: "Homework Issues" },
  { value: "COMMUNICATION", label: "Communication Issues" },
  { value: "OTHER", label: "Other" },
];

export function SubmitComplaintModal({
  parentId,
  onComplaintSubmitted,
  selectedStudentId,
  triggerButton,
}: SubmitComplaintModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    studentId: selectedStudentId || "",
  });

  useEffect(() => {
    if (open) {
      fetchStudents();
      if (selectedStudentId) {
        setFormData((prev) => ({ ...prev, studentId: selectedStudentId }));
      }
    }
  }, [open, selectedStudentId]);

  const fetchStudents = async () => {
    setStudentsLoading(true);
    setError("");
    try {
      // Fetch students for this parent
      const response = await axios.get(`/api/child?parentId=${parentId}`);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load your children. Please try again.");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a complaint title");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a complaint description");
      return;
    }

    if (!formData.type) {
      setError("Please select a complaint type");
      return;
    }

    if (!formData.studentId) {
      setError("Please select a child");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/complaints", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        studentId: formData.studentId,
        parentId,
      });

      if (response.status === 201) {
        setFormData({
          title: "",
          description: "",
          type: "",
          studentId: selectedStudentId || "",
        });
        setOpen(false);
        onComplaintSubmitted();
      }
    } catch (error: any) {
      console.error("Error submitting complaint:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to submit complaint. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "",
      studentId: selectedStudentId || "",
    });
    setError("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Submit Complaint
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-orange-600 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Complaint
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Submit a complaint about your child's performance or any concerns
            you have. This will be sent to your child's teacher for review and
            action.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="studentId"
              className="text-sm font-medium text-gray-700"
            >
              Select Child *
            </Label>
            {studentsLoading ? (
              <div className="flex items-center justify-center py-3 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading your children...
              </div>
            ) : (
              <Select
                value={formData.studentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, studentId: value })
                }
                disabled={!!selectedStudentId}
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-orange-600 focus:ring-orange-600">
                  <SelectValue placeholder="Choose your child" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{student.name}</span>
                        <span className="text-sm text-gray-500">
                          Class: {student.className}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Complaint Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Complaint Type *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="w-full border-gray-300 focus:border-orange-600 focus:ring-orange-600">
                <SelectValue placeholder="Select complaint type" />
              </SelectTrigger>
              <SelectContent>
                {complaintTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Complaint Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Complaint Title *
            </Label>
            <Input
              id="title"
              type="text"
              className="w-full border-gray-300 focus:border-orange-600 focus:ring-orange-600"
              placeholder="Brief title describing the issue"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Complaint Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Detailed Description *
            </Label>
            <textarea
              id="description"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 resize-none"
              placeholder="Please provide detailed information about your concern. Include specific incidents, dates, and any other relevant information that would help the teacher understand and address the issue."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Be as specific as possible to help the teacher understand your
              concerns.
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
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.title.trim() ||
                !formData.description.trim() ||
                !formData.type ||
                !formData.studentId
              }
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Submit Complaint
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
