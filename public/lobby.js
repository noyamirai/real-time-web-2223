// import { loggedIn } from "./onboarding.js";
import socket from "./socket.js";

const messages = document.querySelector('[data-message-list]');
const form = document.querySelector('[data-chat-form]');
const input = document.querySelector('[data-message-input]');
const submitMessageBtn = document.querySelector('.btn--send');

let currentUser;
let currentRoom;

fetch('/user')
.then(res => res.json())
.then((result) => {

    console.log(result);
    const username = result.username;
    const roomCode = result.room_code;

    currentUser = username;
    currentRoom = roomCode;

    socket.auth = { username: username, roomCode: roomCode };
    socket.connect();

    socket.emit('JOIN_ROOM');
})

socket.on('NEW_USER', (message) => {
    console.log(message);

    const htmlString = `
        <p>${message}</p>
    `;

    const messageElement = document.createElement("li");
    messageElement.classList.add('system-notice');
    messageElement.innerHTML = htmlString;

    messages.appendChild(messageElement);
});

socket.on('SET_ADMIN', (username) => {

    fetch(`/set/admin`, {
        method: 'POST',
        body: {
            'username': username
        }
    })
    .then( res => res.json())
    .then((adminSet) => {
        if (adminSet) {
            const adminUserSpan = document.querySelector('[data-admin-username]');
            adminUserSpan.innerHTML = `<span data-admin-username>${username}</span> is the game master this round`;

            console.log('user became admin');
        }
    });

});

form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (input.value) {
        socket.emit('CHAT_MESSAGE', {
            message: input.value,
            sender: currentUser
        });

        input.value = '';
    }

});

socket.on('CHAT_MESSAGE', (result) => {
    console.log(result);

    const item = document.createElement('li');
    console.log(result.sender);
    console.log(currentUser);

    const htmlString = `
        <div class="message__sender">
            <picture>
                <img src="" alt="">
            </picture>

            <span>${result.sender}</span>
        </div>

        <div class="message__content">
            <p>${result.message}</p>
        </div>
    `;

    item.classList.add('message');

    if (result.sender == currentUser) {
        item.classList.add('message--sent');
    }

    console.log(htmlString);

    item.innerHTML = htmlString;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
})

socket.on('USER_LEFT', (message) => {
   const htmlString = `
        <p>${message}</p>
    `;

    const messageElement = document.createElement("li");
    messageElement.classList.add('system-notice');
    messageElement.innerHTML = htmlString;

    messages.appendChild(messageElement);
})

input.addEventListener('input', (e) => {

    if (input.value == '') {
        submitMessageBtn.disabled = true;
    } else if (input.value != '' && submitMessageBtn.disabled) {
        submitMessageBtn.disabled = false;
    }

});