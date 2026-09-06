import {
    getProfile,
    updateProfile
} from "./api.js";

const backButton = document.getElementById("backButton");
const editButton = document.getElementById("editProfileButton");

const editModal = document.getElementById("editModal");

const closeEditModal = document.getElementById("closeEditModal");

const editForm = document.getElementById("editProfileForm");

const editFirstName = document.getElementById("editFirstName");

const editLastName = document.getElementById("editLastName");

const editBio = document.getElementById("editBio");

const bioCounter = document.getElementById("bioCounter");

let currentProfile = null;

backButton?.addEventListener("click", () => {

window.location.href = "feed.html";

});

async function loadProfile(){

try{

const profile = await getProfile();
currentProfile = profile;

editFirstName.value = profile.first_name;
editLastName.value = profile.last_name;
editBio.value = profile.bio || "";

bioCounter.textContent =
`${editBio.value.length} / 300`;

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


function openEditModal(){

    editModal.classList.remove("hidden");

}

function closeModal(){

    editModal.classList.add("hidden");

}

editButton?.addEventListener("click", openEditModal);

closeEditModal?.addEventListener("click", closeModal);

editModal?.addEventListener("click", event=>{

    if(event.target===editModal){

        closeModal();

    }

});

document.addEventListener("keydown", event=>{

    if(event.key==="Escape"){

        closeModal();

    }

});

editBio?.addEventListener("input", ()=>{

    bioCounter.textContent =
    `${editBio.value.length} / 300`;

});


editForm?.addEventListener("submit", async event=>{

    event.preventDefault();

    try{

        await updateProfile({

            firstName: editFirstName.value.trim(),

            lastName: editLastName.value.trim(),

            bio: editBio.value.trim()

        });

        closeModal();

        await loadProfile();

    }catch(error){

        alert(error.message);

    }

});

loadProfile();