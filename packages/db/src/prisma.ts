import { PrismaClient } from "@prisma/client";
import { StreamChat } from "stream-chat";

if (!process.env.NEXT_PUBLIC_STREAM_KEY || !process.env.STREAM_SECRET) {
  throw new Error("Stream Chat environment variables are not configured");
}

const streamClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY,
  process.env.STREAM_SECRET
);

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      user: {
        async delete({ args, query }) {
          const deletedUser = await query(args);

          if (deletedUser?.id) {
            try {
              await streamClient.deleteUser(deletedUser.id, {
                mark_messages_deleted: true,
                hard_delete: true
              });
            } catch (error) {
              console.error("Failed to delete StreamChat user:", error);
            }
          }

          return deletedUser;
        }
      }
    }
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export default prisma;
