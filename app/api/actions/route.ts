import prisma from "@/utils/prisma";
export async function POST(request: Request) {
    const { description, teacherId, studentId } = await request.json();
    if (!description) {
        return new Response(JSON.stringify({ error: "Description is required" }), {
            status: 400,
        });
    }
    try {
        const action = await prisma.action.create({
            data: {
                description,
                createdAt: new Date(),
                teacherId: teacherId,
                studentId: studentId,
            },
        });
        return new Response(JSON.stringify(action), { status: 201 });
    } catch (error) {
        console.log(error);
        return new Response(
            JSON.stringify({ message: "Something went wrong", error }),
            { status: 500 }
        );
    }
}