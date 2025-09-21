import prisma from "@/utils/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const teacherId = url.searchParams.get("teacherId");
  const studentId = url.searchParams.get("studentId");

  try {
    const where: { teacherId?: string; studentId?: string } = {};
    if (teacherId) where.teacherId = teacherId;
    if (studentId) where.studentId = studentId;

    const actions = await prisma.action.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            className: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify({ actions }), { status: 200 });
  } catch (error) {
    console.error("Error fetching actions:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching actions", error }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { description, teacherId, studentId } = await request.json();

  // Validation
  if (!description || !description.trim()) {
    return new Response(JSON.stringify({ error: "Description is required" }), {
      status: 400,
    });
  }

  if (!teacherId) {
    return new Response(JSON.stringify({ error: "Teacher ID is required" }), {
      status: 400,
    });
  }

  if (!studentId) {
    return new Response(JSON.stringify({ error: "Student ID is required" }), {
      status: 400,
    });
  }

  try {
    // Verify that the teacher and student exist
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId, role: "TEACHER" },
    });

    if (!teacher) {
      return new Response(JSON.stringify({ error: "Teacher not found" }), {
        status: 404,
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
      });
    }

    const action = await prisma.action.create({
      data: {
        description: description.trim(),
        teacherId,
        studentId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            className: true,
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
      JSON.stringify({ action, message: "Action added successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating action:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong", error }),
      { status: 500 }
    );
  }
}
