import { PrismaClient } from "@prisma/client";
import { getStreamConfig } from "@zephyr/config/src/env";
import { StreamChat } from "stream-chat";

const { apiKey, secret } = getStreamConfig();
const streamClient = StreamChat.getInstance(apiKey, secret);

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      user: {
        async delete({ args, query }) {
          const deletedUser = await query(args);

          if (deletedUser?.id && apiKey && secret) {
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
