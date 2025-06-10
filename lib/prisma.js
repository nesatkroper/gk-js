const { PrismaClient } = require("@prisma/client");

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["warn", "error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }
  prisma = global.prisma;
}

prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    console.error("Prisma Error:", error);
    throw error;
  }
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
