import { PrismaClient } from "../../generated/prisma/index.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";

dotenv.config();

const prismaClientSingleton = () => {
  const host = process.env.DATABASE_HOST || process.env.DB_HOST || "178.18.241.5";
  const user = process.env.DATABASE_USER || process.env.DB_USER || "daryeel";
  const password = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || "Daryeel20@%";
  const database = process.env.DATABASE_NAME || process.env.DB_NAME || "bea";
  const port = parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || "3306");

  const adapter = new PrismaMariaDb({
    host,
    user,
    password,
    database,
    port,
    connectionLimit: 20,      // increased pool size
    connectTimeout: 30000,    // 30s connection timeout
    acquireTimeout: 30000,    // 30s acquire timeout
    idleTimeoutMillis: 60000, // release idle connections after 60s
  });

  return new PrismaClient({ adapter });
};

// ✅ Fix: Always save back to globalThis so the singleton is truly shared
if (!globalThis.prisma) {
  globalThis.prisma = prismaClientSingleton();
}

const prisma = globalThis.prisma;

export default prisma;
