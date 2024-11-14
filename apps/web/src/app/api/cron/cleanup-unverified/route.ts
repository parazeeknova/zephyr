import { prisma } from "@zephyr/db";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const deleteUsers = await prisma.$transaction([
      prisma.emailVerificationToken.deleteMany({
        where: {
          user: {
            emailVerified: false,
            googleId: null,
            createdAt: {
              lt: oneHourAgo
            }
          }
        }
      }),
      prisma.user.deleteMany({
        where: {
          emailVerified: false,
          googleId: null,
          createdAt: {
            lt: oneHourAgo
          }
        }
      })
    ]);

    return Response.json({
      success: true,
      deletedCount: deleteUsers[1].count
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
