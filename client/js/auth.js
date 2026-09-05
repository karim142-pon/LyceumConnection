/*
==========================================================
 LyceumConnection
 Authentication
==========================================================
*/

import {
    loginUser,
    registerUser,
    getCurrentUser
} from "./api.js";

/* ==========================================================
   Поиск элементов
========================================================== */

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

/* ==========================================================
   Общие функции
========================================================== */

function showStatus(element, message, type = "default") {

    if (!element) return;

    element.textContent = message;

    switch (type) {

        case "success":
            element.style.color = "#16a34a";
            break;

        case "error":
            element.style.color = "#dc2626";
            break;

        default:
            element.style.color = "#6b7280";

    }

}

function setButtonLoading(button, loading, text) {

    if (!button) return;

    if (loading) {

        button.dataset.original = button.textContent;
        button.textContent = text;
        button.disabled = true;

    } else {

        button.textContent = button.dataset.original || button.textContent;
        button.disabled = false;

    }

}

/* ==========================================================
   Валидация
========================================================== */

function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

function validateUsername(username) {

    return /^[A-Za-z0-9_]{3,30}$/.test(username);

}

function validatePassword(password) {

    return password.length >= 8;

}

/* ==========================================================
   Автоматическая проверка авторизации
========================================================== */

async function checkAuth() {

    const path = window.location.pathname;

    if (!path.includes("login") && !path.includes("register")) return;

    try {

        await getCurrentUser();

        window.location.href = "feed.html";

    } catch {

        /* Пользователь не авторизован */

    }

}

checkAuth();

/* ==========================================================
   ВХОД
========================================================== */

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const status =
            document.getElementById("statusMessage");

        const button =
            document.getElementById("loginButton");

        showStatus(status, "");

        if (!validateEmail(email)) {

            showStatus(
                status,
                "Введите корректный email.",
                "error"
            );

            return;

        }

        if (!validatePassword(password)) {

            showStatus(
                status,
                "Пароль должен содержать минимум 8 символов.",
                "error"
            );

            return;

        }

        try {

            setButtonLoading(button, true, "Входим...");

            await loginUser({
                email,
                password
            });

            showStatus(
                status,
                "Успешный вход.",
                "success"
            );

            setTimeout(() => {

                window.location.href = "feed.html";

            }, 700);

        } catch (error) {

            showStatus(
                status,
                error.message,
                "error"
            );

        } finally {

            setButtonLoading(button, false);

        }

    });

}

/* ==========================================================
   РЕГИСТРАЦИЯ
========================================================== */

if (registerForm) {

    const passwordInput =
        document.getElementById("password");

    const confirmInput =
        document.getElementById("confirmPassword");

    const status =
        document.getElementById("statusMessage");

    const button =
        document.getElementById("registerButton");

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const firstName =
            document.getElementById("firstName").value.trim();

        const lastName =
            document.getElementById("lastName").value.trim();

        const username =
            document.getElementById("username").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmInput.value;

        showStatus(status, "");

        if (firstName.length < 2 || firstName.length > 50) {

            showStatus(
                status,
                "Имя должно содержать от 2 до 50 символов.",
                "error"
            );

            return;

        }

        if (lastName.length < 2 || lastName.length > 50) {

            showStatus(
                status,
                "Фамилия должна содержать от 2 до 50 символов.",
                "error"
            );

            return;

        }

        if (!validateUsername(username)) {

            showStatus(
                status,
                "Имя пользователя должно содержать 3–30 символов и состоять только из латинских букв, цифр и знака «_».",
                "error"
            );

            return;

        }

        if (!validateEmail(email)) {

            showStatus(
                status,
                "Введите корректный email.",
                "error"
            );

            return;

        }

        if (!validatePassword(password)) {

            showStatus(
                status,
                "Пароль должен содержать минимум 8 символов.",
                "error"
            );

            return;

        }

        if (password !== confirmPassword) {

            showStatus(
                status,
                "Пароли не совпадают.",
                "error"
            );

            return;

        }

        try {

            setButtonLoading(button, true, "Создаем...");

            await registerUser({
                firstName,
                lastName,
                username,
                email,
                password
            });

            showStatus(
                status,
                "Аккаунт успешно создан.",
                "success"
            );

            setTimeout(() => {

                window.location.href = "feed.html";

            }, 800);

        } catch (error) {

            showStatus(
                status,
                error.message,
                "error"
            );

        } finally {

            setButtonLoading(button, false);

        }

    });

}