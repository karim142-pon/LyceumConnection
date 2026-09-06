import { getProfile } from "./api.js";

const backButton = document.getElementById("backButton");

backButton?.addEventListener("click", () => {

window.location.href = "feed.html";

});

async function loadProfile(){

try{

const profile = await getProfile();

document.getElementById("profileName").textContent =
`${profile.first_name} ${profile.last_name}`;

document.getElementById("profileUsername").textContent =
`@${profile.username}`;

document.getElementById("profileBio").textContent =
profile.bio || "Биография пока не заполнена.";

const date = new Date(profile.created_at);

document.getElementById("profileJoined").textContent =
`На платформе с ${date.toLocaleDateString("ru-RU")}`;

document.getElementById("profileAvatar").textContent =
profile.first_name.charAt(0);

}catch(error){

console.error(error);

}

}

loadProfile();