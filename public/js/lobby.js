import socket from "./socket.js";
import { setMessageInChat } from "./messageHandler.js";

import statesHandler from "./statesHandler.js";
const StatesHandler = new statesHandler();

import { addChatListeners } from "./chatHandler.js";
import GameController from "./gameScript.js";
const gameController = new GameController(socket);

let currentUser;
let isAdmin;
let currentRoom;
let avatarUrl;
let allUsersInRoom;
let gameStarted = false;

const urlParams = new URLSearchParams(window.location.search);
const ESI = urlParams.get('esi');

const userSelectForm = document.querySelector('[data-user-select]');
const optionButtons = document.querySelectorAll('[data-character-select-btn]');

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

    addChatListeners(socket, currentUser, avatarUrl);
    gameController.updateUserObject({username: currentUser, avatarUrl: avatarUrl});
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
            console.log('ADMIN SET: ' + username);

            if (username == currentUser) {
                isAdmin = true;
            }

            StatesHandler.setGameMasterLabel(username);
            StatesHandler.hideAndClearSystemMessage();

            // Show empty message if game hasnt started and theres only 1 player
            if (!gameStarted && Object.keys(allUsersInRoom).length == 1) {
                StatesHandler.setGameMessage('Invite friends');
            }
 
            StatesHandler.removeSetupLoader(1000);
        }
    });

});

socket.on('ROOM_USERS', (users) => {
    allUsersInRoom = users;
    gameController.updateRoomUsers(allUsersInRoom);
})

socket.on('SET_DEFAULT_USER', (username) => {
    const adminUser = getAdminUser(allUsersInRoom);
    console.log(adminUser);

    StatesHandler.setGameMasterLabel(adminUser.username);

    if (!gameStarted) {
        StatesHandler.setGameMessage('Waiting for game master to start');
    }

    StatesHandler.removeSetupLoader(1000);
});

socket.on('MESSAGE_IN_CHAT', (messageData) => {
   setMessageInChat(messageData, currentUser);
})

socket.on('START_GAME_UI', () => {
    console.log('START GAME UI FOR ADMIN!!');

    StatesHandler.hideAdminUIs();
    StatesHandler.hideAndClearSystemMessage();
    StatesHandler.setUserSelectForm(allUsersInRoom, currentUser);
});

socket.on('ERROR', (errorData) => {
    if (errorData.type == 'username_taken') {
        socket.disconnect(errorData.type);
        window.location.href = `/?m=${errorData.type}`;
    }
});

socket.on('START_GAME', () => {
    console.log('START GAME!!!');
    gameStarted = true;
    gameController.startGame();
});

socket.on('GAME_RESULT', (resultData, nextRound) => {
    console.log(resultData);

    console.log('going to next round : ' + nextRound );
    gameController.updateRoundCount(nextRound);

    if (resultData == 'tie') {
        console.log('GAME TIED');
        gameController.startGame();
    } else {

        const adminUser = getAdminUser(allUsersInRoom);
        console.log('admin user is: ' + adminUser.username);

        if (adminUser.username == currentUser) {
            StatesHandler.setUserSelectForm(allUsersInRoom, currentUser);
        }

    }

});

socket.on('ROUND_UPDATE', (count) => {
    gameController.updateRoundCount(count);
});

socket.on('GAME_FINISHED', (leaderboard) => {
    console.log(leaderboard);
    const adminUser = getAdminUser(allUsersInRoom);

    if (adminUser.username == currentUser) {
        StatesHandler.showGameOverBtns();
    }

});

socket.on('LEADERBOARD', (leaderboardObj) => {
    gameController.updateLeaderboard(leaderboardObj);
});

socket.on('EXIT_ROOM', () => {
    setTimeout(() => {
        window.location.href = `/`;
    }, 1500);
});

const gameOverBtns = document.querySelectorAll('[data-game-over-btns]');
gameOverBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {

        console.log(e.target.value);

        if (e.target.value == 'end_session') {
            socket.emit('CLEAR_ROOM');

        } else if (e.target.value == 'restart') {
            socket.emit('RESTART_LOBBY');
        }

    });
});

userSelectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    gameController.handleUserSelectForm(e);
});

optionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        gameController.handleUserPick(e.target);
    });
})

function getAdminUser(allUsers) {
    const adminKey = Object.keys(allUsers).filter(key => allUsers[key].is_admin);
    return allUsers[adminKey];
}