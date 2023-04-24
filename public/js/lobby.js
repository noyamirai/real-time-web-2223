import socket from "./socket.js";
import { setMessageInChat } from "./messageHandler.js";
import statesHandler from "./statesHandler.js";
const StatesHandler = new statesHandler();

const form = document.querySelector('[data-chat-form]');
const input = document.querySelector('[data-message-input]');
const submitMessageBtn = document.querySelector('.btn--send');

let currentUser;
let currentRoom;
let avatarUrl;
let allUsersInRoom;
let gameStarted = false;

const urlParams = new URLSearchParams(window.location.search);
const ESI = urlParams.get('esi');

fetch(`/user/${ESI}`)
.then(res => res.json())
.then((result) => {

    const username = result.username;
    const roomCode = result.room_code;
    const avatar = result.avatar_url;

    currentUser = username;
    currentRoom = roomCode;
    avatarUrl = avatar;

    console.log(result);

    socket.auth = { username: username, roomCode: roomCode, avatarUrl: avatarUrl };
    socket.connect();

    socket.emit('JOIN_ROOM', result.connected);

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
            StatesHandler.setGameMasterLabel(username);
            
            const allDefaultUserElements = document.querySelectorAll('[data-default_user-ui]');
            allDefaultUserElements.forEach(element => {
                element.innerHTML = '';
            });

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

            setTimeout(() => {
                const loaderEl = document.querySelector('[data-loader]');
                const mainEl = document.querySelector('[data-game-lobby]');
                const bodyEl = document.querySelector('body');

                mainEl.classList.remove('hide');
                loaderEl.classList.add('hide');

                bodyEl.classList.add('lobby--active');
            }, 1000);
            // TODO: show admin controls
        }
    });

});

socket.on('ROOM_USERS', (users) => {
    allUsersInRoom = users;
})

socket.on('SET_DEFAULT_USER', (username) => {

    const adminUser = getAdminUser(allUsersInRoom);
    console.log(adminUser);

    StatesHandler.setGameMasterLabel(adminUser.username);

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

    setTimeout(() => {
        const loaderEl = document.querySelector('[data-loader]');
        const mainEl = document.querySelector('[data-game-lobby]');
        const bodyEl = document.querySelector('body');

        mainEl.classList.remove('hide');
        loaderEl.classList.add('hide');

        bodyEl.classList.add('lobby--active');
    }, 1000);

});

socket.on('MESSAGE_IN_CHAT', (messageData) => {
   setMessageInChat(messageData, currentUser);
})

socket.on('START_GAME_UI', () => {
    console.log('START GAME UI FOR ADMIN!!');
});

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
            sender: currentUser,
            avatar: avatarUrl
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

function getAdminUser(allUsers) {
    const adminKey = Object.keys(allUsers).filter(key => allUsers[key].is_admin);
    return allUsers[adminKey];
}