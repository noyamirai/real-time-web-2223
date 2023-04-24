import socket from "./socket.js";
import { setMessageInChat } from "./messageHandler.js";

const form = document.querySelector('[data-chat-form]');
const input = document.querySelector('[data-message-input]');
const submitMessageBtn = document.querySelector('.btn--send');

let currentUser;
let currentRoom;
let allUsersInRoom;
let gameStarted = false;

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
            console.log('set admin ui');
            const adminUserSpan = document.querySelector('[data-admin-username]');
            adminUserSpan.innerHTML = `<span data-admin-username>${username}</span> is the game master this round`;

            // TODO: make dynamic (ability to trigger this ui on other situations)
            console.log(Object.keys(allUsersInRoom));
            // Show empty message if game hasnt started and theres only 1 player
            if (!gameStarted && Object.keys(allUsersInRoom).length == 1) {
                console.log('empty message?');
                const gameBoard = document.querySelector('[data-game-board]');
                gameBoard.classList.add('game--message');

                const gameMessageEl = document.querySelector('#game_message');
                const textEl = document.createElement('p');
                const text = 'Invite friends';

                textEl.innerHTML = text;
                gameMessageEl.appendChild(textEl);
                gameMessageEl.classList.remove('hide');
            }

            // TODO: show admin controls
        }
    });

});

socket.on('ROOM_USERS', (users) => {
    allUsersInRoom = users;
})

socket.on('SET_DEFAULT_USER', (username) => {

    if (!gameStarted) {
        const gameBoard = document.querySelector('[data-game-board]');
        gameBoard.classList.add('game--message');

        const gameMessageEl = document.querySelector('#game_message');
        const textEl = document.createElement('p');
        const text = 'Waiting for game master to start';

        textEl.innerHTML = text;
        gameMessageEl.appendChild(textEl);
        gameMessageEl.classList.remove('hide');
    }

});

socket.on('MESSAGE_IN_CHAT', (messageData) => {
   setMessageInChat(messageData, currentUser);
})

socket.on('ERROR', (errorData) => {

    if (errorData.type == 'username_taken') {
        socket.disconnect(errorData.type);
        window.location.href = `/?m=${errorData.type}`;
    }

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

input.addEventListener('input', (e) => {

    if (input.value == '') {
        submitMessageBtn.disabled = true;
    } else if (input.value != '' && submitMessageBtn.disabled) {
        submitMessageBtn.disabled = false;
    }

});