import express from "express";
import { z } from "zod";

import pool from "../models/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* =========================================
   Схема валидации
========================================= */

const profileSchema = z.object({

    firstName: z.string().trim().min(2).max(50),

    lastName: z.string().trim().min(2).max(50),

    bio: z.string().trim().max(300).optional().default("")

});

/* =========================================
   Получить свой профиль
========================================= */

router.get("/me", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT
                id,
                username,
                first_name,
                last_name,
                bio,
                avatar_url,
                created_at

             FROM users

             WHERE id = $1`,

            [req.user.id]

        );

        if (!result.rows.length) {

            return res.status(404).json({
                message: "Пользователь не найден."
            });

        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Ошибка получения профиля."
        });

    }

});

/* =========================================
   Обновить профиль
========================================= */

router.put("/me", authMiddleware, async (req, res) => {

    try {

        const data = profileSchema.parse(req.body);

        const result = await pool.query(

            `UPDATE users

             SET
                first_name = $1,
                last_name = $2,
                bio = $3

             WHERE id = $4

             RETURNING
                id,
                username,
                first_name,
                last_name,
                bio,
                avatar_url`,

            [
                data.firstName,
                data.lastName,
                data.bio,
                req.user.id
            ]

        );

        res.json(result.rows[0]);

    } catch (error) {

        if (error instanceof z.ZodError) {

            return res.status(400).json({
                message: "Некорректные данные профиля."
            });

        }

        console.error(error);

        res.status(500).json({
            message: "Ошибка обновления профиля."
        });

    }

});

export default router;