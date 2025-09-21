"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface DeleteStudentModalProps {
  studentId: string | null;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentDeleted: () => void;
}

export function DeleteStudentModal({
  studentId,
  studentName,
  open,
  onOpenChange,
  onStudentDeleted,
}: DeleteStudentModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!studentId) return;

    setLoading(true);

    try {
      await axios.delete(`/api/students/${studentId}`);

      toast.success("Student deleted successfully!");
      onOpenChange(false);
      onStudentDeleted();
    } catch (error: unknown) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student. Please try again.");
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete student";
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-red-900 text-xl font-semibold">
                Delete Student
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-gray-800">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-900">{studentName}</span>?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This will permanently delete the student record and all associated
              actions. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Student"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
