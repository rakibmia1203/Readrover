import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name: "Admin", email, passwordHash, role: "ADMIN" },
  });
  console.log("Created admin:", email);
}

async function seedCoupons() {
  const coupons = [
    { code: "WELCOME50", type: "FIXED", value: 50, minSubtotal: 500, active: true },
    { code: "SAVE10", type: "PERCENT", value: 10, minSubtotal: 1000, maxDiscount: 300, active: true },
    { code: "FESTIVE100", type: "FIXED", value: 100, minSubtotal: 2000, active: true },
  ];
  for (const c of coupons) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: c, create: c as any });
  }
}

async function seedBooks() {
  const books = [
    {
      slug: "atomic-habits-bn",
      title: "Atomic Habits (Bangla Translation)",
      author: "James Clear",
      publisher: "Sample Publisher",
      language: "Bangla",
      category: "Self-Help",
      tags: "habits,productivity,psychology",
      description: "Build good habits, break bad ones—practical ideas with clear steps.",
      price: 550, salePrice: 499, stock: 25,
      coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=60",
      ratingAvg: 4.7, ratingCount: 123,
    active: true,
    },
    {
      slug: "clean-code",
      title: "Clean Code",
      author: "Robert C. Martin",
      publisher: "Prentice Hall",
      language: "English",
      category: "Programming",
      tags: "software engineering,best practices,clean code",
      description: "A handbook of agile software craftsmanship—principles, patterns, and practices.",
      price: 850, salePrice: 799, stock: 15,
      coverUrl: "https://images.unsplash.com/photo-1455885666463-009c34b2ef86?auto=format&fit=crop&w=900&q=60",
      ratingAvg: 4.6, ratingCount: 98,
    active: true,
    },
    {
      slug: "shesher-kobita",
      title: "শেষের কবিতা",
      author: "Rabindranath Tagore",
      publisher: "Classic House",
      language: "Bangla",
      category: "Novel",
      tags: "classic,bangla literature,romance",
      description: "A timeless Bengali classic.",
      price: 320, salePrice: null, stock: 40,
      coverUrl: "https://images.unsplash.com/photo-1473755504818-b72b6dfdc226?auto=format&fit=crop&w=900&q=60",
      ratingAvg: 4.8, ratingCount: 205,
    active: true,
    },
    {
      slug: "ai-for-beginners",
      title: "AI for Beginners",
      author: "Tech Author",
      publisher: "Tech Press",
      language: "English",
      category: "AI/ML",
      tags: "ai,ml,beginner,career",
      description: "A practical introduction to AI concepts and projects.",
      price: 600, salePrice: 540, stock: 30,
      coverUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=60",
      ratingAvg: 4.3, ratingCount: 57,
    active: true,
    },
  ];

  for (const b of books) {
    await prisma.book.upsert({ where: { slug: b.slug }, update: b as any, create: b as any });
  }
}

async function main() {
  console.log("Seeding database...");
  await ensureAdmin();
  await seedCoupons();
  await seedBooks();
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());
