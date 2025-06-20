import { PrismaClient } from '@prisma/client';

if (typeof window !== 'undefined' || typeof EdgeRuntime !== 'undefined') {
  throw new Error("Prisma only works in Node.js environments");
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ log: ['warn', 'error'] });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({ log: [ 'info', 'warn', 'error'] });
  }
  prisma = global.prisma;
}

export default prisma;

