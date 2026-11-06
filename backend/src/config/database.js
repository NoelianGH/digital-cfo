// src/config/database.js
const { PrismaClient } = require('@prisma/client');

// Mencegah kebocoran koneksi pool (connection leak) akibat hot-reload nodemon
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;