// src/seed.js
const prisma = require('./config/database');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Menyiapkan akun Admin & User Uji Coba...');

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('user123', 10);

  // 1. Akun Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@digitalcfo.id' },
    update: {
      password: hashedAdminPassword,
      role: 'ADMIN',
      name: 'Administrator CFO',
      businessName: 'Digital CFO Headquarter',
    },
    create: {
      name: 'Administrator CFO',
      email: 'admin@digitalcfo.id',
      password: hashedAdminPassword,
      businessName: 'Digital CFO Headquarter',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Akun Admin siap: ${admin.email} (Password: admin123) [Role: ${admin.role}]`);

  // 2. Akun User (Uji coba, data-datanya dikosongkan terlebih dahulu)
  const user = await prisma.user.upsert({
    where: { email: 'user@digitalcfo.id' },
    update: {
      password: hashedUserPassword,
      role: 'USER',
      name: 'User Uji Coba',
      businessName: 'Toko Uji Coba UMKM',
    },
    create: {
      name: 'User Uji Coba',
      email: 'user@digitalcfo.id',
      password: hashedUserPassword,
      businessName: 'Toko Uji Coba UMKM',
      role: 'USER',
    },
  });

  // Kosongkan transaksi, produk, dan promo milik user@digitalcfo.id agar bersih untuk uji coba
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.saleItem.deleteMany({
    where: {
      product: { userId: user.id },
    },
  });
  await prisma.product.deleteMany({ where: { userId: user.id } });
  await prisma.promo.deleteMany({ where: { userId: user.id } });

  console.log(`✅ Akun User siap & data dikosongkan: ${user.email} (Password: user123) [Role: ${user.role}]`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });