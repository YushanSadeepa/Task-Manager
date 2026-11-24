import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const day = 86_400_000;

async function main() {
  await prisma.task.deleteMany();
  await prisma.task.createMany({
    data: [
      { title: "Design database schema", status: "COMPLETED", priority: "HIGH", dueDate: new Date(Date.now() - 3 * day) },
      { title: "Build REST API", description: "Routes, controllers, services", status: "IN_PROGRESS", priority: "HIGH", dueDate: new Date(Date.now() + 2 * day) },
      { title: "Write README", status: "TODO", priority: "MEDIUM", dueDate: new Date(Date.now() + 3 * day) },
      { title: "Fix overdue bug", status: "TODO", priority: "LOW", dueDate: new Date(Date.now() - 1 * day) },
    ],
  });
}

main().finally(() => prisma.$disconnect());
