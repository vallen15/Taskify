import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Taskify database...");

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users
  const adminPassword = await Bun.password.hash("admin123");
  const userPassword = await Bun.password.hash("user123");

  const admin = await prisma.user.create({
    data: {
      name: "Administrator Taskify",
      email: "admin@taskify.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Budi Pratama",
      email: "budi@taskify.com",
      password: userPassword,
      role: "USER",
    },
  });

  // 2. Categories
  const catPekerjaan = await prisma.category.create({
    data: { name: "Pekerjaan & Proyek", color: "#3b82f6", icon: "briefcase" },
  });
  const catBelajar = await prisma.category.create({
    data: { name: "Belajar & Kuliah", color: "#8b5cf6", icon: "book" },
  });
  const catPribadi = await prisma.category.create({
    data: { name: "Pribadi & Hobi", color: "#10b981", icon: "user" },
  });
  const catKesehatan = await prisma.category.create({
    data: { name: "Kesehatan & Olahraga", color: "#ef4444", icon: "activity" },
  });

  // 3. Tasks
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 2);

  await prisma.task.create({
    data: {
      title: "Menyelesaikan Laporan Projek Magang",
      description: "Menyusun dokumentasi sistem dan slide presentasi demo",
      priority: "URGENT",
      status: "IN_PROGRESS",
      dueDate: tomorrow,
      isCompleted: false,
      categoryId: catPekerjaan.id,
      userId: user.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Review Pull Request Backend Elysia.js",
      description: "Memeriksa integrasi Prisma ORM dan rute API baru",
      priority: "HIGH",
      status: "COMPLETED",
      dueDate: yesterday,
      isCompleted: true,
      completedAt: today,
      categoryId: catPekerjaan.id,
      userId: user.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Mempelajari Bun Test & Vitest Suite",
      description: "Membaca dokumentasi testing framework dan mencoba unit test",
      priority: "MEDIUM",
      status: "PENDING",
      dueDate: tomorrow,
      isCompleted: false,
      categoryId: catBelajar.id,
      userId: user.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Latihan Jogging 5 KM",
      description: "Olahraga sore di Stadion Utama",
      priority: "LOW",
      status: "PENDING",
      dueDate: today,
      isCompleted: false,
      categoryId: catKesehatan.id,
      userId: user.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Bayar Tagihan Internet & Listrik",
      description: "Tenggat pembayaran bulanan terlewati",
      priority: "HIGH",
      status: "PENDING",
      dueDate: yesterday, // Overdue task for testing warning!
      isCompleted: false,
      categoryId: catPribadi.id,
      userId: user.id,
    },
  });

  console.log("✅ Taskify Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
