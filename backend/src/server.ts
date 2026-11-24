import { createApp } from "./app";
import { env } from "./config/env";
import { taskController } from "./container";
import { prisma } from "./lib/prisma";

const server = createApp(taskController).listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}/api (${env.NODE_ENV})`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
