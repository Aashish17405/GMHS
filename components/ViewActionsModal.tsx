"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, User, Eye } from "lucide-react";
import axios from "axios";

interface Action {
  id: string;
  description: string;
  createdAt: string;
  teacher: {
    id: string;
    name: string;
  };
}

interface ViewActionsModalProps {
  studentId: string;
  studentName: string;
}

export function ViewActionsModal({
  studentId,
  studentName,
}: ViewActionsModalProps) {
  const [open, setOpen] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchActions();
    }
  }, [open, studentId]);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/actions?studentId=${studentId}`);
      setActions(response.data.actions || []);
    } catch (error) {
      console.error("Error fetching actions:", error);
    } finally {
      setLoading(false);
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const actionDate = new Date(dateString);
    const diffMs = now.getTime() - actionDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-normal"
        >
          <Eye className="mr-1 h-3 w-3" />
          View Actions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1e3a8a] flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actions for {studentName}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            All recorded actions and interactions for this student
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#1e3a8a]"></div>
              <span className="ml-2 text-gray-600">Loading actions...</span>
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No actions recorded
              </h3>
              <p className="text-gray-500">
                No actions have been recorded for this student yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        Action
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(action.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(action.createdAt)}
                    </div>
                  </div>

                  <p className="text-gray-900 mb-3 leading-relaxed">
                    {action.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-600">
                    <User className="mr-1 h-4 w-4" />
                    <span>Recorded by: {action.teacher.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
