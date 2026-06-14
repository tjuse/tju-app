/**
 * 数据库种子：灌入内置常用链接。
 * 运行：pnpm db:seed
 */
import { PrismaClient } from "@prisma/client";
import { builtInLinks } from "../src/features/links/builtin-links";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding built-in links...");

  for (const link of builtInLinks) {
    // userId 为 null 的内置链接：用 title+url 去重
    const existing = await db.link.findFirst({
      where: { url: link.url, userId: null, isBuiltIn: true },
    });
    if (existing) continue;

    await db.link.create({
      data: {
        title: link.title,
        url: link.url,
        icon: link.icon,
        category: link.category,
        order: link.order,
        isBuiltIn: true,
      },
    });
  }

  const count = await db.link.count({ where: { isBuiltIn: true } });
  console.log(`✅ Done. ${count} built-in links in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
