import prisma from "@/utils/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, className, parentId } = await request.json();

    if (!name || !className || !parentId) {
      return new Response(
        JSON.stringify({
          error: "Name, className, and parentId are required",
        }),
        {
          status: 400,
        }
      );
    }

    // Verify that the student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
      });
    }

    // Verify that the parent exists and has the PARENT role
    const parent = await prisma.user.findUnique({
      where: {
        id: parentId,
        role: "PARENT",
      },
    });

    if (!parent) {
      return new Response(JSON.stringify({ error: "Invalid parent ID" }), {
        status: 400,
      });
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        name,
        className,
        parentId,
      },
      include: {
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
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        message: "Student updated successfully",
        student,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Update student error:", error);
    return new Response(JSON.stringify({ error: "Failed to update student" }), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify that the student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        actions: true,
      },
    });

    if (!existingStudent) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
      });
    }

    // Delete all related actions first
    await prisma.action.deleteMany({
      where: { studentId: id },
    });

    // Delete the student
    await prisma.student.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({
        message: "Student deleted successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete student error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete student" }), {
      status: 500,
    });
  }
}
