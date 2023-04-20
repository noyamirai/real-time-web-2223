import socket from "./socket.js";
import { setMessageInChat } from "./messageHandler.js";

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

            // TODO: show admin controls
        }
    });

});

socket.on('MESSAGE_IN_CHAT', (messageData) => {
   setMessageInChat(messageData, currentUser);
})

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

input.addEventListener('input', (e) => {

    if (input.value == '') {
        submitMessageBtn.disabled = true;
    } else if (input.value != '' && submitMessageBtn.disabled) {
        submitMessageBtn.disabled = false;
    }

});