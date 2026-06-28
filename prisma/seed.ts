import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { categories, tools } from "./seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categoryIdBySlug = new Map<string, string>();

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
      },
    });
    categoryIdBySlug.set(category.slug, created.id);
  }

  for (const tool of tools) {
    const categoryId = categoryIdBySlug.get(tool.categorySlug);
    if (!categoryId) continue;

    const createdTool = await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {
        name: tool.name,
        tagline: tool.tagline,
        description: tool.description,
        websiteUrl: tool.websiteUrl,
        pricingModel: tool.pricingModel,
        categoryId,
      },
      create: {
        slug: tool.slug,
        name: tool.name,
        tagline: tool.tagline,
        description: tool.description,
        websiteUrl: tool.websiteUrl,
        pricingModel: tool.pricingModel,
        categoryId,
      },
    });

    for (const tagName of tool.tags) {
      const slug = tagName.toLowerCase().replace(/\s+/g, "-");
      const tag = await prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { name: tagName, slug },
      });
      await prisma.toolTag.upsert({
        where: { toolId_tagId: { toolId: createdTool.id, tagId: tag.id } },
        update: {},
        create: { toolId: createdTool.id, tagId: tag.id },
      });
    }

    for (const plan of tool.pricingPlans) {
      await prisma.pricingPlan.create({
        data: {
          toolId: createdTool.id,
          name: plan.name,
          priceUsdCents: plan.priceUsdCents,
          billingCycle: plan.billingCycle,
          featuresJson: plan.features,
        },
      });
    }
  }

  console.log(`Seed concluído: ${categories.length} categorias, ${tools.length} ferramentas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
