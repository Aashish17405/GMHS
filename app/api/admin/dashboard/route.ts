import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get user counts by role
    const userCounts = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        id: true,
      },
    });

    // Get total students
    const totalStudents = await prisma.student.count();

    // Get total actions
    const totalActions = await prisma.action.count();

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const recentStudents = await prisma.student.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get activity trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get complaint statistics
    const totalComplaints = await prisma.complaint.count();
    const pendingComplaints = await prisma.complaint.count({
      where: { status: "PENDING" },
    });
    const resolvedComplaints = await prisma.complaint.count({
      where: { status: "RESOLVED" },
    });
    const recentComplaints = await prisma.complaint.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const recentActions = await prisma.action.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get daily activity for the last 7 days
    const dailyActivity = await prisma.action.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Process daily activity into a more usable format
    const activityByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayActions = dailyActivity.filter((activity) => {
        const actionDate = new Date(activity.createdAt);
        return actionDate >= dayStart && actionDate < dayEnd;
      });

      return {
        date: dayStart.toISOString().split("T")[0],
        count: dayActions.reduce(
          (sum, activity) => sum + activity._count.id,
          0
        ),
      };
    }).reverse();

    // Get class distribution
    const classDistribution = await prisma.student.groupBy({
      by: ["className"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Get top performing teachers (by student count and activity)
    const teacherPerformance = await prisma.user.findMany({
      where: {
        role: "TEACHER",
      },
      include: {
        studentsAsTeacher: {
          include: {
            actions: {
              where: {
                createdAt: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
        },
      },
    });

    const teacherStats = teacherPerformance
      .map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        studentCount: teacher.studentsAsTeacher.length,
        recentActionCount: teacher.studentsAsTeacher.reduce(
          (sum, student) => sum + student.actions.length,
          0
        ),
      }))
      .sort((a, b) => b.recentActionCount - a.recentActionCount)
      .slice(0, 5);

    // Format user counts for easier consumption
    const roleStats = {
      ADMIN: userCounts.find((u) => u.role === "ADMIN")?._count.id || 0,
      TEACHER: userCounts.find((u) => u.role === "TEACHER")?._count.id || 0,
      PARENT: userCounts.find((u) => u.role === "PARENT")?._count.id || 0,
    };

    return NextResponse.json({
      userStats: {
        total: roleStats.ADMIN + roleStats.TEACHER + roleStats.PARENT,
        byRole: roleStats,
        recentRegistrations: recentUsers,
      },
      studentStats: {
        total: totalStudents,
        recentEnrollments: recentStudents,
        classDistribution: classDistribution.map((cls) => ({
          className: cls.className,
          count: cls._count.id,
        })),
      },
      activityStats: {
        total: totalActions,
        recentActions,
        dailyActivity: activityByDay,
        avgDailyActivity: (recentActions / 7).toFixed(1),
      },
      complaintStats: {
        total: totalComplaints,
        pending: pendingComplaints,
        resolved: resolvedComplaints,
        recent: recentComplaints,
        resolutionRate:
          totalComplaints > 0
            ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1)
            : "0",
      },
      teacherStats: {
        topPerformers: teacherStats,
      },
      systemHealth: {
        activeTeachers: roleStats.TEACHER,
        studentsPerTeacher:
          roleStats.TEACHER > 0
            ? (totalStudents / roleStats.TEACHER).toFixed(1)
            : "0",
        actionsPerStudent:
          totalStudents > 0 ? (totalActions / totalStudents).toFixed(1) : "0",
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
