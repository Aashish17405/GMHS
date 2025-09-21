import prisma from "@/utils/prisma";
import { Prisma, ComplaintStatus } from "@prisma/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parentId = url.searchParams.get("parentId");
  const teacherId = url.searchParams.get("teacherId");
  const studentId = url.searchParams.get("studentId");
  const status = url.searchParams.get("status");

  try {
    const where: Prisma.ComplaintWhereInput = {};

    if (parentId) where.parentId = parentId;
    if (teacherId) where.teacherId = teacherId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status as ComplaintStatus;

    const complaints = await prisma.complaint.findMany({
      where,
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

    return new Response(JSON.stringify({ complaints }), { status: 200 });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching complaints", error }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { title, description, type, studentId, parentId } =
    await request.json();

  // Validation
  if (!title || !title.trim()) {
    return new Response(JSON.stringify({ error: "Title is required" }), {
      status: 400,
    });
  }

  if (!description || !description.trim()) {
    return new Response(JSON.stringify({ error: "Description is required" }), {
      status: 400,
    });
  }

  if (!type) {
    return new Response(
      JSON.stringify({ error: "Complaint type is required" }),
      {
        status: 400,
      }
    );
  }

  if (!parentId) {
    return new Response(JSON.stringify({ error: "Parent ID is required" }), {
      status: 400,
    });
  }

  if (!studentId) {
    return new Response(JSON.stringify({ error: "Student ID is required" }), {
      status: 400,
    });
  }

  try {
    // Verify that the parent and student exist and are related
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { parent: true },
    });

    if (!student) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
      });
    }

    if (student.parentId !== parentId) {
      return new Response(
        JSON.stringify({
          error: "You can only submit complaints for your own child",
        }),
        {
          status: 403,
        }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        type,
        parentId,
        studentId,
        teacherId: student.teacherId, // Assign to student's teacher if available
      },
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
    });

    return new Response(
      JSON.stringify({
        complaint,
        message: "Complaint submitted successfully",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating complaint:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong", error }),
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { complaintId, status, resolution, teacherId } = await request.json();

  // Validation
  if (!complaintId) {
    return new Response(JSON.stringify({ error: "Complaint ID is required" }), {
      status: 400,
    });
  }

  if (!status) {
    return new Response(JSON.stringify({ error: "Status is required" }), {
      status: 400,
    });
  }

  if (status === "RESOLVED" && (!resolution || !resolution.trim())) {
    return new Response(
      JSON.stringify({
        error: "Resolution is required when marking complaint as resolved",
      }),
      {
        status: 400,
      }
    );
  }

  try {
    // Verify complaint exists
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!existingComplaint) {
      return new Response(JSON.stringify({ error: "Complaint not found" }), {
        status: 404,
      });
    }

    const updateData: Prisma.ComplaintUpdateInput = {
      status,
      updatedAt: new Date(),
    };

    if (teacherId) {
      updateData.teacher = {
        connect: { id: teacherId },
      };
    }

    if (resolution) {
      updateData.resolution = resolution.trim();
    }

    if (status === "RESOLVED") {
      updateData.resolvedAt = new Date();
    }

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
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
    });

    return new Response(
      JSON.stringify({ complaint, message: "Complaint updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating complaint:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong", error }),
      { status: 500 }
    );
  }
}
