import prisma from "@/utils/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { email, password, role, name } = await request.json();

    if (!email || !password || !name || !role) {
      return new Response(
        JSON.stringify({
          error: "Email, Password, Name, and Role are required",
        }),
        {
          status: 400,
        }
      );
    }

    // Validate role against enum values
    const validRoles = ["ADMIN", "TEACHER", "PARENT"];
    const upperRole = role.toUpperCase();
    if (!validRoles.includes(upperRole)) {
      return new Response(
        JSON.stringify({
          error: "Invalid role. Must be ADMIN, TEACHER, or PARENT",
        }),
        {
          status: 400,
        }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        {
          status: 409,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS || "10")
    );

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: upperRole as "ADMIN" | "TEACHER" | "PARENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return new Response(
      JSON.stringify({ message: "User created successfully", user }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
