import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const mediaCount = await prisma.media.count();

    console.log("\n=== Database Status ===");
    console.log(`Users: ${userCount}`);
    console.log(`Posts: ${postCount}`);
    console.log(`Media: ${mediaCount}`);
    console.log("\nWARNING: You are about to run a migration.");
    console.log("Make sure you have backed up your database.");
    console.log("\nRecommended steps:");
    console.log("1. Run: pnpm run backup");
    console.log(
      "2. Use --create-only flag first: pnpm prisma migrate dev --create-only"
    );
    console.log("3. Review migration file");
    console.log("4. Then apply: pnpm prisma migrate deploy\n");

    if (userCount > 0 || postCount > 0 || mediaCount > 0) {
      console.log("\x1b[31m%s\x1b[0m", "⚠️  LIVE DATA DETECTED - BE CAREFUL!");
    }
  } catch (error) {
    console.error("Failed to check database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkDatabase();
}
