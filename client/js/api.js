/*
==========================================================
 LyceumConnection
 API Client
==========================================================
*/

const API_BASE = "/api";
const REQUEST_TIMEOUT = 10000;

/* ==========================================================
   Вспомогательная функция запроса
========================================================== */

async function request(endpoint, options = {}) {

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, REQUEST_TIMEOUT);

    try {

        const response = await fetch(`${API_BASE}${endpoint}`, {

            credentials: "include",

            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },

            signal: controller.signal,

            ...options

        });

        clearTimeout(timeout);

        let data = null;

        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {

            throw new Error(
                data?.message || "Ошибка сервера."
            );

        }

        return data;

    } catch (error) {

        if (error.name === "AbortError") {

            throw new Error("Превышено время ожидания сервера.");

        }

        throw error;

    }

}

/* ==========================================================
   AUTH
========================================================== */

export async function registerUser(userData) {

    return request("/auth/register", {

        method: "POST",

        body: JSON.stringify(userData)

    });

}

export async function loginUser(credentials) {

    return request("/auth/login", {

        method: "POST",

        body: JSON.stringify(credentials)

    });

}

export async function logoutUser() {

    return request("/auth/logout", {

        method: "POST"

    });

}

export async function getCurrentUser() {

    return request("/auth/me");

}

/* ==========================================================
   POSTS
========================================================== */

export async function getPosts() {

    const response = await fetch("/api/posts", {
        credentials: "include"
    });

    if (!response.ok)
        throw new Error("Не удалось загрузить ленту.");

    return response.json();

}

export async function createPost(data) {

    const response = await fetch("/api/posts", {

        method: "POST",

        credentials: "include",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    });

    if (!response.ok) {

        const error = await response.json();

        throw new Error(error.message);

    }

    return response.json();

}

export async function likePost(postId) {

    return request(`/posts/${postId}/like`, {

        method: "POST"

    });

}

/* ==========================================================
   COMMENTS
========================================================== */

export async function getComments(postId) {

    return request(`/posts/${postId}/comments`);

}

export async function createComment(postId, content) {

    return request(`/posts/${postId}/comments`, {

        method: "POST",

        body: JSON.stringify({
            content
        })

    });

}

/* ==========================================================
   USERS
========================================================== */

export async function searchUsers(query) {

    return request(`/users/search?q=${encodeURIComponent(query)}`);

}

export async function getUserProfile(userId) {

    return request(`/users/${userId}`);

}

/* ==========================================================
   FRIEND REQUESTS
========================================================== */

export async function sendFriendRequest(userId) {

    return request("/friends/request", {

        method: "POST",

        body: JSON.stringify({
            userId
        })

    });

}

export async function acceptFriendRequest(requestId) {

    return request(`/friends/request/${requestId}`, {

        method: "PATCH",

        body: JSON.stringify({
            status: "accepted"
        })

    });

}

/* ==========================================================
   NOTIFICATIONS
========================================================== */

export async function getNotifications() {

    return request("/notifications");

}

export async function markNotificationRead(id) {

    return request(`/notifications/${id}/read`, {

        method: "PATCH"

    });

}