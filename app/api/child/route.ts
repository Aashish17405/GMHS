import prisma from "@/utils/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get parentId from URL search params instead of request body
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    console.log("Parent ID:", parentId);
    if (!parentId) {
      return new NextResponse(
        JSON.stringify({ error: "Parent ID is required" }),
        { status: 400 }
      );
    }
    const students = await prisma.student.findMany({
      where: {
        parent: {
          id: parentId,
        },
      },
      include: {
        teacher: {
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
          take: 10, // Latest 10 actions
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return new NextResponse(JSON.stringify({ students }), { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
