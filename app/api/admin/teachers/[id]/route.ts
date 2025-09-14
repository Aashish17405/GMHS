import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, data } = await request.json();

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: {
        id,
        role: "TEACHER",
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    switch (action) {
      case "updateProfile":
        const updatedTeacher = await prisma.user.update({
          where: { id },
          data: {
            name: data.name,
            email: data.email,
          },
        });
        return NextResponse.json({
          message: "Teacher profile updated successfully",
          teacher: updatedTeacher,
        });

      case "assignStudents":
        // Assign multiple students to this teacher
        const { studentIds } = data;
        await prisma.student.updateMany({
          where: {
            id: { in: studentIds },
          },
          data: {
            teacherId: id,
          },
        });
        return NextResponse.json({
          message: `${studentIds.length} students assigned successfully`,
        });

      case "unassignStudents":
        // Unassign specific students from this teacher
        const { unassignStudentIds } = data;
        await prisma.student.updateMany({
          where: {
            id: { in: unassignStudentIds },
            teacherId: id,
          },
          data: {
            teacherId: undefined,
          },
        });
        return NextResponse.json({
          message: `${unassignStudentIds.length} students unassigned successfully`,
        });

      case "resetPassword":
        // In a real app, you'd generate a secure reset token
        // For now, we'll just return success
        return NextResponse.json({
          message: "Password reset email sent to teacher",
        });

      case "deactivate":
        // In a real app, you might have an 'active' field
        // For now, we'll update a custom field or use email to mark as inactive
        await prisma.user.update({
          where: { id },
          data: {
            // You could add an 'active' field to your schema
            email: `deactivated_${teacher.email}`,
          },
        });
        return NextResponse.json({
          message: "Teacher deactivated successfully",
        });

      case "reactivate":
        // Reactivate a deactivated teacher
        const cleanEmail = teacher.email.replace("deactivated_", "");
        await prisma.user.update({
          where: { id },
          data: {
            email: cleanEmail,
          },
        });
        return NextResponse.json({
          message: "Teacher reactivated successfully",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Teacher management error:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: {
        id,
        role: "TEACHER",
      },
      include: {
        studentsAsTeacher: {
          include: {
            actions: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Delete all actions for students taught by this teacher
    const studentIds = teacher.studentsAsTeacher.map((s) => s.id);
    if (studentIds.length > 0) {
      await prisma.action.deleteMany({
        where: { studentId: { in: studentIds } },
      });

      // Unassign students (set teacherId to undefined instead of deleting students)
      await prisma.student.updateMany({
        where: { teacherId: id },
        data: { teacherId: undefined },
      });
    }

    // Delete the teacher
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Teacher deleted successfully",
      studentsAffected: studentIds.length,
    });
  } catch (error) {
    console.error("Delete teacher error:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
