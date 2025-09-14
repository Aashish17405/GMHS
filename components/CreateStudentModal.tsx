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
import { Plus, Loader2 } from "lucide-react";
import axios from "axios";

interface Parent {
  id: string;
  name: string;
  email: string;
}

interface CreateStudentModalProps {
  teacherId: string;
  onStudentCreated: () => void;
}

export function CreateStudentModal({
  teacherId,
  onStudentCreated,
}: CreateStudentModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [parentLoading, setParentLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    className: "",
    parentId: "",
  });

  useEffect(() => {
    if (open) {
      fetchParents();
    }
  }, [open]);

  const fetchParents = async () => {
    setParentLoading(true);
    try {
      const response = await axios.get("/api/parents");
      setParents(response.data.parents);
    } catch (error) {
      console.error("Error fetching parents:", error);
    } finally {
      setParentLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/students", {
        ...formData,
        teacherId,
      });

      setFormData({ name: "", className: "", parentId: "" });
      setOpen(false);
      onStudentCreated();
    } catch (error: any) {
      console.error("Error creating student:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create student";
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.className && formData.parentId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add New Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-[#1e3a8a] text-xl font-semibold">
            Add New Student
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a new student record. Fill in all the required information
            below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-[#1e3a8a] font-medium">
              Student Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter student's full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="className" className="text-[#1e3a8a] font-medium">
              Class *
            </Label>
            <Input
              id="className"
              placeholder="e.g., Grade 5A, Class 10B"
              value={formData.className}
              onChange={(e) =>
                setFormData({ ...formData, className: e.target.value })
              }
              required
              className="border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="parent" className="text-[#1e3a8a] font-medium">
              Parent *
            </Label>
            <Select
              value={formData.parentId}
              onValueChange={(value) =>
                setFormData({ ...formData, parentId: value })
              }
              required
            >
              <SelectTrigger className="border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]">
                <SelectValue
                  placeholder={
                    parentLoading ? "Loading parents..." : "Select a parent"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {parentLoading ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading parents...
                  </SelectItem>
                ) : parents.length > 0 ? (
                  parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{parent.name}</span>
                        <span className="text-sm text-gray-500">
                          {parent.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-parents" disabled>
                    No parents available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Student"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
