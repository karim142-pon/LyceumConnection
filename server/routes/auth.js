import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

import pool from "../models/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* ==========================================================
   Схемы
========================================================== */

const registerSchema = z.object({

    firstName: z.string().min(2).max(50),

    lastName: z.string().min(2).max(50),

    username: z.string()
        .min(3)
        .max(30)
        .regex(/^[A-Za-z0-9_]+$/),

    email: z.email(),

    password: z.string().min(8)

});

const loginSchema = z.object({

    email: z.email(),

    password: z.string().min(8)

});

/* ==========================================================
   Создание JWT
========================================================== */

function createToken(userId){

    return jwt.sign(

        { id:userId },

        process.env.JWT_SECRET,

        { expiresIn:"7d" }

    );

}

/* ==========================================================
   Регистрация
========================================================== */

router.post("/register", async (req,res)=>{

    try{

        const data = registerSchema.parse(req.body);

        const exists = await pool.query(

            "SELECT id FROM users WHERE email=$1 OR username=$2",

            [data.email,data.username]

        );

        if(exists.rows.length){

            return res.status(409).json({

                message:"Пользователь уже существует."

            });

        }

        const passwordHash = await bcrypt.hash(data.password,12);

        const result = await pool.query(

            `INSERT INTO users
            (first_name,last_name,username,email,password_hash)
            VALUES($1,$2,$3,$4,$5)
            RETURNING id,first_name,last_name,username,email`,

            [

                data.firstName,

                data.lastName,

                data.username,

                data.email,

                passwordHash

            ]

        );

        const user = result.rows[0];

        const token = createToken(user.id);

        res.cookie("token",token,{

            httpOnly:true,

            sameSite:"strict",

            secure: process.env.NODE_ENV === "production",

            maxAge:7*24*60*60*1000

        });

        res.status(201).json({

            success:true,

            user

        });

    }

    catch(error){

        if(error instanceof z.ZodError){

            return res.status(400).json({

                message:"Некорректные данные."

            });

        }

        console.error(error);

        res.status(500).json({

            message:"Ошибка регистрации."

        });

    }

});

/* ==========================================================
   Вход
========================================================== */

router.post("/login", async (req,res)=>{

    try{

        const data = loginSchema.parse(req.body);

        const result = await pool.query(

            `SELECT id,first_name,last_name,
                    username,email,password_hash
             FROM users
             WHERE email=$1`,

            [data.email]

        );

        if(!result.rows.length){

            return res.status(401).json({

                message:"Неверный email или пароль."

            });

        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(

            data.password,

            user.password_hash

        );

        if(!validPassword){

            return res.status(401).json({

                message:"Неверный email или пароль."

            });

        }

        const token = createToken(user.id);

        res.cookie("token",token,{

            httpOnly:true,

            sameSite:"strict",

            secure: process.env.NODE_ENV === "production",

            maxAge:7*24*60*60*1000

        });

        delete user.password_hash;

        res.json({

            success:true,

            user

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            message:"Ошибка входа."

        });

    }

});

/* ==========================================================
   Текущий пользователь
========================================================== */

router.get("/me", authMiddleware, async (req,res)=>{

    const result = await pool.query(

        `SELECT id,first_name,last_name,
                username,email,bio,
                avatar_url,created_at
         FROM users
         WHERE id=$1`,

        [req.user.id]

    );

    if(!result.rows.length){

        return res.status(404).json({

            message:"Пользователь не найден."

        });

    }

    res.json(result.rows[0]);

});

/* ==========================================================
   Выход
========================================================== */

router.post("/logout",(req,res)=>{

    res.clearCookie("token",{

        httpOnly:true,

        sameSite:"strict",

        secure: process.env.NODE_ENV === "production",

    });

    res.json({

        success:true

    });

});

export default router;