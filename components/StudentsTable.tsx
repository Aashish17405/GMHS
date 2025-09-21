"use client";

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
import { Card } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  MoreVertical,
  User,
  Calendar,
  Activity,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewActionsModal } from "@/components/ViewActionsModal";

interface Student {
  id: string;
  name: string;
  className: string;
  createdAt: string;
  parent: {
    id: string;
    name: string;
    email: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  actions: Array<{
    id: string;
    description: string;
    createdAt: string;
  }>;
}

interface StudentsTableProps {
  students: Student[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddAction?: (studentId: string) => void;
  loading?: boolean;
}

export function StudentsTable({
  students,
  onEditStudent,
  onDeleteStudent,
  onAddAction,
  loading = false,
}: StudentsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRecentActions = (actions: Student["actions"]) => {
    if (!actions || actions.length === 0) {
      return "No recent actions";
    }
    return `${actions.length} action${actions.length > 1 ? "s" : ""} recorded`;
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#1e3a8a]"></div>
              <span>Loading students...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="w-full">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-gray-500 mb-4">
              You haven&apos;t added any students yet. Click the &quot;Add New
              Student&quot; button to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="font-semibold text-[#1e3a8a] py-4">
                  Student
                </TableHead>
                <TableHead className="font-semibold text-[#1e3a8a]">
                  Class
                </TableHead>
                <TableHead className="font-semibold text-[#1e3a8a]">
                  Parent
                </TableHead>
                <TableHead className="font-semibold text-[#1e3a8a]">
                  Recent Activity
                </TableHead>
                <TableHead className="font-semibold text-[#1e3a8a]">
                  Joined
                </TableHead>
                <TableHead className="font-semibold text-[#1e3a8a] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow
                  key={student.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-[#1e3a8a] flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {student.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {student.className}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {student.parent.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.parent.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        {getRecentActions(student.actions)}
                      </div>
                      {student.actions && student.actions.length > 0 && (
                        <ViewActionsModal
                          studentId={student.id}
                          studentName={student.name}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(student.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {onAddAction && (
                          <DropdownMenuItem
                            onClick={() => onAddAction(student.id)}
                            className="cursor-pointer"
                          >
                            <Activity className="mr-2 h-4 w-4" />
                            Add Action
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => onEditStudent(student)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Student
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteStudent(student.id)}
                          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {students.map((student) => (
          <Card key={student.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {student.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      ID: {student.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {student.className}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {onAddAction && (
                        <DropdownMenuItem
                          onClick={() => onAddAction(student.id)}
                          className="cursor-pointer"
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          Add Action
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onEditStudent(student)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Student
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteStudent(student.id)}
                        className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Parent Information
                  </p>
                  <p className="text-sm font-medium">{student.parent.name}</p>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-gray-500" />
                    <p className="text-xs text-gray-500">
                      {student.parent.email}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Recent Activity
                  </p>
                  <p className="text-sm text-gray-600">
                    {getRecentActions(student.actions)}
                  </p>
                  {student.actions && student.actions.length > 0 && (
                    <ViewActionsModal
                      studentId={student.id}
                      studentName={student.name}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">
                  Joined {formatDate(student.createdAt)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
