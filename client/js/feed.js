import { logoutUser } from "./api.js";

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        await logoutUser();
        window.location.href = "login.html";
    });
}