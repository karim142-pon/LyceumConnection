import express from "express";
import pool from "../models/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* =========================================
   Поставить лайк
========================================= */

router.post("/:postId", authMiddleware, async (req, res) => {

    try {

        const postId = Number(req.params.postId);

        await pool.query(

            `INSERT INTO likes (post_id, user_id)
             VALUES ($1, $2)
             ON CONFLICT (post_id, user_id)
             DO NOTHING`,

            [postId, req.user.id]

        );

        const result = await pool.query(

            `SELECT COUNT(*)::int AS likes
             FROM likes
             WHERE post_id = $1`,

            [postId]

        );

        res.json({
            liked: true,
            likes: result.rows[0].likes
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Ошибка постановки лайка."
        });

    }

});

/* =========================================
   Убрать лайк
========================================= */

router.delete("/:postId", authMiddleware, async (req, res) => {

    try {

        const postId = Number(req.params.postId);

        await pool.query(

            `DELETE FROM likes
             WHERE post_id = $1
             AND user_id = $2`,

            [postId, req.user.id]

        );

        const result = await pool.query(

            `SELECT COUNT(*)::int AS likes
             FROM likes
             WHERE post_id = $1`,

            [postId]

        );

        res.json({
            liked: false,
            likes: result.rows[0].likes
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Ошибка удаления лайка."
        });

    }

});

/* =========================================
   Получить количество лайков
========================================= */

router.get("/:postId", authMiddleware, async (req, res) => {

    try {

        const postId = Number(req.params.postId);

        const result = await pool.query(

            `SELECT
                COUNT(*)::int AS likes,
                EXISTS(
                    SELECT 1
                    FROM likes
                    WHERE post_id = $1
                    AND user_id = $2
                ) AS liked
             FROM likes
             WHERE post_id = $1`,

            [postId, req.user.id]

        );

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Ошибка получения лайков."
        });

    }

});

export default router;