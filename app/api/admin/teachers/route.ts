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

      // Get recent activity (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentActions = teacher.studentsAsTeacher.flatMap((student) =>
        student.actions.filter((action) => new Date(action.createdAt) > weekAgo)
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
        },
        students: teacher.studentsAsTeacher,
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
