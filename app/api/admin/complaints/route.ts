import prisma from "@/utils/prisma";

export async function GET() {
  try {
    // Fetch all complaints with comprehensive details
    const complaints = await prisma.complaint.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            className: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate complaint statistics
    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(
      (c) => c.status === "PENDING"
    ).length;
    const inProgressComplaints = complaints.filter(
      (c) => c.status === "IN_PROGRESS"
    ).length;
    const resolvedComplaints = complaints.filter(
      (c) => c.status === "RESOLVED"
    ).length;

    // Calculate average response time (time between created and first response)
    const complaintsWithResponse = complaints.filter(
      (c) => c.status !== "PENDING"
    );
    const avgResponseTimeHours =
      complaintsWithResponse.length > 0
        ? complaintsWithResponse.reduce((acc, complaint) => {
            const responseTime =
              new Date(complaint.updatedAt).getTime() -
              new Date(complaint.createdAt).getTime();
            return acc + responseTime / (1000 * 60 * 60); // Convert to hours
          }, 0) / complaintsWithResponse.length
        : 0;

    // Calculate resolution rate
    const resolutionRate =
      totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;

    // Get teacher performance metrics
    const teacherPerformance = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        complaintsAsTeacher: {
          include: {
            student: { select: { name: true } },
            parent: { select: { name: true } },
          },
        },
      },
    });

    // Calculate performance metrics for each teacher
    const teacherMetrics = teacherPerformance.map((teacher) => {
      const assignedComplaints = teacher.complaintsAsTeacher;
      const totalAssigned = assignedComplaints.length;
      const resolved = assignedComplaints.filter(
        (c) => c.status === "RESOLVED"
      ).length;
      const pending = assignedComplaints.filter(
        (c) => c.status === "PENDING"
      ).length;
      const inProgress = assignedComplaints.filter(
        (c) => c.status === "IN_PROGRESS"
      ).length;

      // Calculate average resolution time for resolved complaints
      const resolvedComplaints = assignedComplaints.filter(
        (c) => c.status === "RESOLVED" && c.resolvedAt
      );
      const avgResolutionTime =
        resolvedComplaints.length > 0
          ? resolvedComplaints.reduce((acc: number, complaint) => {
              if (complaint.resolvedAt) {
                const resolutionTime =
                  new Date(complaint.resolvedAt).getTime() -
                  new Date(complaint.createdAt).getTime();
                return acc + resolutionTime / (1000 * 60 * 60 * 24); // Convert to days
              }
              return acc;
            }, 0) / resolvedComplaints.length
          : 0;

      const resolutionRate =
        totalAssigned > 0 ? (resolved / totalAssigned) * 100 : 0;

      return {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        totalComplaints: totalAssigned,
        resolved,
        pending,
        inProgress,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        avgResolutionTimeDays: Math.round(avgResolutionTime * 100) / 100,
        recentComplaints: assignedComplaints.slice(0, 3), // Last 3 complaints for quick view
      };
    });

    // Get complaint trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentComplaints = complaints.filter(
      (c) => new Date(c.createdAt) >= sevenDaysAgo
    );
    const dailyTrends = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayComplaints = recentComplaints.filter((c) => {
        const complaintDate = new Date(c.createdAt);
        return complaintDate >= dayStart && complaintDate <= dayEnd;
      });

      dailyTrends.push({
        date: dayStart.toISOString().split("T")[0],
        count: dayComplaints.length,
        resolved: dayComplaints.filter((c) => c.status === "RESOLVED").length,
      });
    }

    // Complaint type distribution
    const typeDistribution = complaints.reduce((acc, complaint) => {
      acc[complaint.type] = (acc[complaint.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      complaints,
      statistics: {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        avgResponseTimeHours: Math.round(avgResponseTimeHours * 100) / 100,
        typeDistribution,
        dailyTrends,
      },
      teacherPerformance: teacherMetrics,
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error("Error fetching admin complaints data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch complaints data" }),
      { status: 500 }
    );
  }
}
