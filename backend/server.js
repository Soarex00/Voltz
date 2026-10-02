import "dotenv/config";
import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { prisma } from "./lib/prisma.js";
import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { adminRouter } from "./routes/admin.js";
import { recommendationsRouter } from "./routes/recommendations.js";
import { tratarErros } from "./middleware/errors.js";

const app = express();
app.disable("x-powered-by");
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN?.split(",").map((item) => item.trim()) || true,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/health/database", async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok", database: "connected" });
});
app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/admin", adminRouter);
app.use("/recommendations", recommendationsRouter);
app.use((req, res, next) => {
  if (
    req.path.startsWith("/api/") ||
    [
      "/auth",
      "/products",
      "/orders",
      "/admin",
      "/recommendations",
      "/health",
    ].some((base) => req.path === base || req.path.startsWith(`${base}/`))
  ) {
    return res.status(404).json({ mensagem: "Rota não encontrada." });
  }
  next();
});
const webDir = resolve("dist");
if (existsSync(webDir)) {
  app.use(express.static(webDir));
  app.get(/.*/, (req, res, next) =>
    req.accepts("html") ? res.sendFile(resolve(webDir, "index.html")) : next(),
  );
}
app.use(tratarErros);
const port = Number(process.env.PORT || 3333);
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`Voltz API disponível na porta ${port}.`),
);
async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
