import {
    logoutUser,
    createPost,
    getPosts
} from "./api.js";

const logoutButton = document.getElementById("logoutButton");

const postModal = document.getElementById("postModal");
const openPostModal = document.getElementById("openPostModal");
const closePostModal = document.getElementById("closePostModal");

const postForm = document.getElementById("postForm");
const postContent = document.getElementById("postContent");
const postsContainer = document.getElementById("postsContainer");
const charCounter = document.getElementById("charCounter");
const postStatus = document.getElementById("postStatus");
const myProfileButton = document.getElementById("myProfileButton");

myProfileButton?.addEventListener("click", () => {

window.location.href = "profile.html";

});

function openModal() {

    postModal.classList.remove("hidden");

    setTimeout(() => postContent.focus(), 50);

}

function closeModal() {

    postModal.classList.add("hidden");

}

openPostModal?.addEventListener("click", openModal);

closePostModal?.addEventListener("click", closeModal);

postModal?.addEventListener("click", (event) => {

    if (event.target === postModal) {

        closeModal();

    }

});

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeModal();

    }

});

postContent?.addEventListener("input", () => {

    charCounter.textContent =
        `${postContent.value.length} / 5000`;

});

async function loadPosts() {

    try {

        const posts = await getPosts();

        postsContainer.innerHTML = "";

        posts.forEach(renderPost);

    } catch (error) {

        console.error(error);

    }

}

function renderPost(post) {

    const template = document.getElementById("postTemplate");

    const node = template.content.cloneNode(true);

    node.querySelector(".post-name").textContent =
        `${post.first_name} ${post.last_name}`;

    node.querySelector(".post-date").textContent =
        new Date(post.created_at).toLocaleString("ru-RU");

    node.querySelector(".post-text").textContent =
        post.content;

    postsContainer.appendChild(node);

}

postForm?.addEventListener("submit", async (event) => {

    event.preventDefault();

    const content = postContent.value.trim();

    if (!content) return;

    try {

        await createPost({

            content,
            imageUrl: ""

        });

        postContent.value = "";

        charCounter.textContent = "0 / 5000";

        postStatus.textContent = "";

        closeModal();

        await loadPosts();

    } catch (error) {

        postStatus.textContent = error.message;

    }

});

logoutButton?.addEventListener("click", async () => {

    await logoutUser();

    location.href = "login.html";

});

loadPosts();