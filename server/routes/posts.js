import express from "express";
import { z } from "zod";

import pool from "../models/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const postSchema = z.object({
    content: z.string().trim().min(1).max(5000),

    imageUrl: z.string().url().optional().or(z.literal(""))
});

/* =========================================
   Создание поста
========================================= */

router.post("/", authMiddleware, async (req, res) => {

    try {

        const data = postSchema.parse(req.body);

        const result = await pool.query(

            `INSERT INTO posts (user_id, content, image_url)
            VALUES ($1, $2, $3)
            RETURNING id, content, image_url, created_at`,

            [
                req.user.id,
                data.content,
                data.imageUrl || null
            ]

        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        if (error instanceof z.ZodError) {

            return res.status(400).json({
                message: "Некорректный текст поста."
            });

        }

        console.error(error);

        res.status(500).json({
            message: "Ошибка создания поста."
        });

    }

});

/* =========================================
   Получение ленты
========================================= */

router.get("/", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT
                posts.id,
                posts.content,
                posts.created_at,
                users.id AS user_id,
                users.first_name,
                users.last_name,
                users.username,
                users.avatar_url
             FROM posts
             JOIN users
                ON users.id = posts.user_id
             ORDER BY posts.created_at DESC`

        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Ошибка загрузки ленты."
        });

    }

});

export default router;