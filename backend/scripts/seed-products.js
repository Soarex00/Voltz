import "dotenv/config";
import { readFile } from "node:fs/promises";
import { prisma } from "../lib/prisma.js";

try {
  const existentes = await prisma.produto.count();
  if (existentes) {
    console.log(
      `Catálogo já contém ${existentes} produtos; seed não executado.`,
    );
  } else {
    const { products } = JSON.parse(
      await readFile(new URL("../../db.json", import.meta.url), "utf8"),
    );
    await prisma.produto.createMany({
      data: products.map((p, index) => ({
        id: String(p.id),
        image: p.image,
        model: p.model,
        name: p.name,
        price: Number(p.price),
        rating: p.rating ?? null,
        reviews: p.reviews ?? null,
        userReviews: p.userReviews ?? [],
        vehicles: p.vehicles ?? [],
        destaque: index < 3,
        ativo: true,
      })),
    });
    console.log(
      `${products.length} baterias do catálogo Voltz foram cadastradas; as três primeiras estão em destaque.`,
    );
  }
} catch {
  console.error("Não foi possível importar as baterias do catálogo Voltz.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
