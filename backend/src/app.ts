import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";
import { DEFAULTS } from "./config.js";

const app: Express = express();

app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Mount all routes under the base URL (e.g., /api/v1)
const baseUrl = DEFAULTS.BASE_URL || "";
app.use(baseUrl, routes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

export default app;
