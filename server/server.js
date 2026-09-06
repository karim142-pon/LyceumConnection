import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import likesRoutes from "./routes/likes.js";
import profileRoutes from "./routes/profile.js";
import postsRoutes from "./routes/posts.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3000;



// Безопасность HTTP-заголовков
app.use(helmet());

// Разрешаем запросы только с фронтенда
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../client")));
app.use(cookieParser());

// Ограничение запросов (защита от перебора)
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// Маршруты
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/likes", likesRoutes);

// Проверка работы сервера
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "LyceumConnection API работает."
    });
});

// Обработка неизвестных маршрутов
app.use((req, res) => {
    res.status(404).json({
        message: "Маршрут не найден."
    });
});

// Централизованная обработка ошибок
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: "Внутренняя ошибка сервера."
    });
});

app.listen(PORT, () => {
    console.log(`LyceumConnection API запущен на http://localhost:${PORT}`);
});