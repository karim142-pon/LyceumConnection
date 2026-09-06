import express from "express";
import { z } from "zod";

import pool from "../models/db.js";
import authMiddleware from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();
/* =========================================
   Multer
========================================= */

const storage = multer.diskStorage({

    destination(req, file, cb){

        cb(null, "uploads/avatars");

    },

    filename(req, file, cb){

        const extension = path.extname(file.originalname);

        cb(
            null,
            `${req.user.id}-${Date.now()}${extension}`
        );

    }

});

const upload = multer({

    storage,

    limits:{

        fileSize:5*1024*1024

    },

    fileFilter(req,file,cb){

        const allowed=[
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        cb(
            null,
            allowed.includes(file.mimetype)
        );

    }

});

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

/* =========================================
   Загрузка аватара
========================================= */

router.post(
    "/avatar",
    authMiddleware,
    upload.single("avatar"),

    async(req,res)=>{

        try{

            if(!req.file){

                return res.status(400).json({
                    message:"Файл не выбран."
                });

            }

            const avatarUrl=`/uploads/avatars/${req.file.filename}`;

            await pool.query(

                `UPDATE users

                 SET avatar_url=$1

                 WHERE id=$2`,

                [
                    avatarUrl,
                    req.user.id
                ]

            );

            res.json({

                avatar_url:avatarUrl

            });

        }catch(error){

            console.error(error);

            res.status(500).json({

                message:"Ошибка загрузки."

            });

        }

    }

);

export default router;