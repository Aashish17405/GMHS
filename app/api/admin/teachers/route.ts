import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER",
      },
      include: {
        studentsAsTeacher: {
          include: {
            parent: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            actions: {
              select: {
                id: true,
                description: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 5, // Latest 5 actions per student
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        complaintsAsTeacher: {
          include: {
            student: {
              select: {
                name: true,
                className: true,
              },
            },
            parent: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate statistics for each teacher
    const teachersWithStats = teachers.map((teacher) => {
      const studentCount = teacher.studentsAsTeacher.length;
      const totalActions = teacher.studentsAsTeacher.reduce(
        (sum, student) => sum + student.actions.length,
        0
      );

      // Complaint statistics
      const complaints = teacher.complaintsAsTeacher;
      const totalComplaints = complaints.length;
      const pendingComplaints = complaints.filter(
        (c) => c.status === "PENDING"
      ).length;
      const resolvedComplaints = complaints.filter(
        (c) => c.status === "RESOLVED"
      ).length;
      const inProgressComplaints = complaints.filter(
        (c) => c.status === "IN_PROGRESS"
      ).length;

      // Calculate average resolution time for resolved complaints
      const resolvedComplaintsWithTime = complaints.filter(
        (c) => c.status === "RESOLVED" && c.resolvedAt
      );
      const avgResolutionDays =
        resolvedComplaintsWithTime.length > 0
          ? resolvedComplaintsWithTime.reduce((acc, complaint) => {
              if (complaint.resolvedAt) {
                const resolutionTime =
                  new Date(complaint.resolvedAt).getTime() -
                  new Date(complaint.createdAt).getTime();
                return acc + resolutionTime / (1000 * 60 * 60 * 24); // Convert to days
              }
              return acc;
            }, 0) / resolvedComplaintsWithTime.length
          : 0;

      const complaintResolutionRate =
        totalComplaints > 0
          ? (resolvedComplaints / totalComplaints) * 100
          : 100;

      // Get recent activity (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentActions = teacher.studentsAsTeacher.flatMap((student) =>
        student.actions.filter((action) => new Date(action.createdAt) > weekAgo)
      );

      const recentComplaints = complaints.filter(
        (complaint) => new Date(complaint.createdAt) > weekAgo
      );

      // Get unique classes
      const uniqueClasses = new Set(
        teacher.studentsAsTeacher.map((student) => student.className)
      );

      return {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        createdAt: teacher.createdAt,
        statistics: {
          studentCount,
          totalActions,
          recentActivityCount: recentActions.length,
          classCount: uniqueClasses.size,
          avgActionsPerStudent:
            studentCount > 0 ? (totalActions / studentCount).toFixed(1) : "0",
          // Complaint metrics
          totalComplaints,
          pendingComplaints,
          resolvedComplaints,
          inProgressComplaints,
          complaintResolutionRate:
            Math.round(complaintResolutionRate * 100) / 100,
          avgResolutionDays: Math.round(avgResolutionDays * 100) / 100,
          recentComplaints: recentComplaints.length,
        },
        students: teacher.studentsAsTeacher,
        complaints: complaints.slice(0, 5), // Latest 5 complaints
        recentActivity: recentActions.slice(0, 5).map((action) => ({
          ...action,
          studentName:
            teacher.studentsAsTeacher.find((s) =>
              s.actions.some((a) => a.id === action.id)
            )?.name || "Unknown",
        })),
      };
    });

    return NextResponse.json({
      teachers: teachersWithStats,
      summary: {
        totalTeachers: teachers.length,
        totalStudents: teachers.reduce(
          (sum, t) => sum + t.studentsAsTeacher.length,
          0
        ),
        totalActions: teachers.reduce(
          (sum, t) =>
            sum +
            t.studentsAsTeacher.reduce(
              (s, student) => s + student.actions.length,
              0
            ),
          0
        ),
        totalComplaints: teachers.reduce(
          (sum, t) => sum + t.complaintsAsTeacher.length,
          0
        ),
        avgResolutionRate:
          teachersWithStats.length > 0
            ? (
                teachersWithStats.reduce(
                  (sum, t) => sum + t.statistics.complaintResolutionRate,
                  0
                ) / teachersWithStats.length
              ).toFixed(1)
            : "0",
      },
    });
  } catch (error) {
    console.error("Get teachers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
