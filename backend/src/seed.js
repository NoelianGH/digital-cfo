// src/seed.js
const prisma = require('./config/database');

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@digitalcfo.id' },
    update: {},
    create: {
      name: 'Budi Santoso (Kopi Kenangan UMKM)',
      email: 'demo@digitalcfo.id',
      password: 'password123', // Nanti kita amankan dengan bcrypt saat modul auth
      businessName: 'Kopi Kenangan UMKM',
    },
  });

  console.log('✅ User demo siap! ID:', user.id);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());