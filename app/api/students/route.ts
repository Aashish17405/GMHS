import prisma from "@/utils/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return new Response(JSON.stringify({ error: "Teacher ID is required" }), {
        status: 400,
      });
    }

    const students = await prisma.student.findMany({
      where: {
        teacherId: teacherId,
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
        actions: {
          select: {
            id: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Latest 5 actions
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify({ students }), { status: 200 });
  } catch (error) {
    console.error("Get students error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch students" }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const { name, className, parentId, teacherId } = await request.json();

    if (!name || !className || !parentId || !teacherId) {
      return new Response(
        JSON.stringify({
          error: "Name, className, parentId, and teacherId are required",
        }),
        {
          status: 400,
        }
      );
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

    // Verify that the teacher exists and has the TEACHER role
    const teacher = await prisma.user.findUnique({
      where: {
        id: teacherId,
        role: "TEACHER",
      },
    });

    if (!teacher) {
      return new Response(JSON.stringify({ error: "Invalid teacher ID" }), {
        status: 400,
      });
    }

    const student = await prisma.student.create({
      data: {
        name,
        className,
        parentId,
        teacherId,
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
        message: "Student created successfully",
        student,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Create student error:", error);
    return new Response(JSON.stringify({ error: "Failed to create student" }), {
      status: 500,
    });
  }
}
