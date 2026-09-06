import {
    getProfile,
    updateProfile,
    uploadAvatar,
    getMyPosts,
    getProfileStats
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
const avatarInput=document.getElementById("avatarInput");

const avatarImage=document.getElementById("profileAvatarImage");

const avatarLetter=document.getElementById("profileAvatarLetter");
const userPostsContainer = document.getElementById("userPostsContainer");
const postsCount=document.getElementById("postsCount");
const friendsCount=document.getElementById("friendsCount");
const likesCount=document.getElementById("likesCount");

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

if(profile.avatar_url){

    avatarImage.src=profile.avatar_url;

    avatarImage.classList.remove("hidden");

    avatarLetter.classList.add("hidden");

}else{

    avatarLetter.textContent=
    profile.first_name.charAt(0);

}

}catch(error){

console.error(error);

}

}

async function loadMyPosts() {

    try {

        const posts = await getMyPosts();

        userPostsContainer.innerHTML = "";

        if (!posts.length) {

            userPostsContainer.innerHTML =
                '<p class="loading-text">У вас пока нет публикаций.</p>';

            return;

        }

        posts.forEach(post => {

            const card = document.createElement("article");

            card.className = "profile-post-card";

            card.innerHTML = `
                <div class="profile-post-header">

                    <strong>${post.first_name} ${post.last_name}</strong>

                    <span>${new Date(post.created_at).toLocaleString("ru-RU")}</span>

                </div>

                <p>${post.content}</p>
            `;

            userPostsContainer.appendChild(card);

        });

    } catch (error) {

        console.error(error);

    }

}

async function loadStats(){

    try{

        const stats=await getProfileStats();

        animateCounter(postsCount,stats.posts);
        animateCounter(friendsCount,stats.friends);
        animateCounter(likesCount,stats.likes);

    }catch(error){

        console.error(error);

    }

}

function animateCounter(element,target){

    let current=0;

    const step=Math.max(1,Math.ceil(target/25));

    const timer=setInterval(()=>{

        current+=step;

        if(current>=target){

            current=target;

            clearInterval(timer);

        }

        element.textContent=current;

    },18);

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

document
.getElementById("profileAvatar")
?.addEventListener("click",()=>{

    avatarInput.click();

});

avatarInput?.addEventListener("change",async()=>{

    const file=avatarInput.files[0];

    if(!file)return;

    avatarImage.src=URL.createObjectURL(file);

    avatarImage.classList.remove("hidden");

    avatarLetter.classList.add("hidden");

    try{

        await uploadAvatar(file);

        await loadProfile();

    }catch(error){

        alert(error.message);

    }

});

await Promise.all([
    loadProfile(),
    loadMyPosts(), 
    loadStats()
]);