import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const parents = await prisma.user.findMany({
      where: {
        role: "PARENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return new Response(JSON.stringify({ parents }), { status: 200 });
  } catch (error) {
    console.error("Get parents error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch parents" }), {
      status: 500,
    });
  }
}
