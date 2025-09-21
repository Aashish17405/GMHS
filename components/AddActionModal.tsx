"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Student {
  id: string;
  name: string;
  className: string;
}

interface AddActionModalProps {
  teacherId: string;
  onActionAdded: () => void;
  selectedStudentId?: string;
  triggerButton?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddActionModal({
  teacherId,
  onActionAdded,
  selectedStudentId,
  triggerButton,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: AddActionModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled
    ? externalOnOpenChange || (() => {})
    : setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    studentId: selectedStudentId || "",
  });

  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    setError("");
    try {
      const response = await axios.get(`/api/students?teacherId=${teacherId}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students. Please try again.");
    } finally {
      setStudentsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (open) {
      fetchStudents();
      if (selectedStudentId) {
        setFormData((prev) => ({ ...prev, studentId: selectedStudentId }));
      }
    }
  }, [open, selectedStudentId, fetchStudents]); // Include fetchStudents in dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.description.trim()) {
      setError("Please enter an action description");
      return;
    }

    if (!formData.studentId) {
      setError("Please select a student");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/actions", {
        description: formData.description.trim(),
        teacherId,
        studentId: formData.studentId,
      });

      if (response.status === 201) {
        toast.success("Action added successfully!");
        setFormData({
          description: "",
          studentId: selectedStudentId || "",
        });
        setOpen(false);
        onActionAdded();
      }
    } catch (error: unknown) {
      console.error("Error adding action:", error);
      toast.error("Failed to add action. Please try again.");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add action. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: "",
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

  // Don't render trigger button if it's controlled externally
  if (isControlled && !triggerButton) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Add Student Action
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Record an action taken with or for a student. This helps track
              student progress and interactions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="studentId"
                className="text-sm font-medium text-gray-700"
              >
                Select Student *
              </Label>
              {studentsLoading ? (
                <div className="flex items-center justify-center py-3 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading students...
                </div>
              ) : (
                <Select
                  value={formData.studentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, studentId: value })
                  }
                  disabled={!!selectedStudentId}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]">
                    <SelectValue placeholder="Choose a student" />
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

            {/* Action Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Action Description *
              </Label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] resize-none"
                placeholder="Describe the action taken (e.g., 'Helped student with math homework', 'Discussed behavior improvement', 'Provided extra reading support')"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Be specific about what action was taken and its purpose.
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
                  loading || !formData.description.trim() || !formData.studentId
                }
                className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Add Action
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white">
            <Activity className="mr-2 h-4 w-4" />
            Add Action
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Add Student Action
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Record an action taken with or for a student. This helps track
            student progress and interactions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="studentId"
              className="text-sm font-medium text-gray-700"
            >
              Select Student *
            </Label>
            {studentsLoading ? (
              <div className="flex items-center justify-center py-3 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading students...
              </div>
            ) : (
              <Select
                value={formData.studentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, studentId: value })
                }
                disabled={!!selectedStudentId}
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]">
                  <SelectValue placeholder="Choose a student" />
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

          {/* Action Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Action Description *
            </Label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] resize-none"
              placeholder="Describe the action taken (e.g., 'Helped student with math homework', 'Discussed behavior improvement', 'Provided extra reading support')"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Be specific about what action was taken and its purpose.
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
                loading || !formData.description.trim() || !formData.studentId
              }
              className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Add Action
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
