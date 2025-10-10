import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./env";
import { errorHandler } from "./middlewares/error";
import { authRoutes } from "./routes/auth";

const app = express();

const origins = (env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(
  cors({ origin: origins.length ? origins : ["http://localhost:3000", "http://127.0.0.1:3000"], credentials: true })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);

app.use(errorHandler);

const port = env.PORT ?? 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server ready on http://0.0.0.0:${port}`);
});
