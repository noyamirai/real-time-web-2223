import socket from "./socket.js";
import { setMessageInChat } from "./messageHandler.js";

import statesHandler from "./statesHandler.js";
const StatesHandler = new statesHandler();

import { addChatListeners } from "./chatHandler.js";
import GameController from "./gameScript.js";
const gameController = new GameController(socket);

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
    StatesHandler.hideAndClearSystemMessage();
    StatesHandler.setUserSelectForm(allUsersInRoom, currentUser);

    gameController.setUserSelectListener();
    gameController.setOptionsListener();
});

socket.on('ERROR', (errorData) => {
    if (errorData.type == 'username_taken') {
        socket.disconnect(errorData.type);
        window.location.href = `/?m=${errorData.type}`;
    }
});

socket.on('START_GAME', () => {
    gameController.startGame();
});

socket.on('ROUND_UPDATE', (count) => {
    console.log(count + ' update round count');
    gameController.updateRoundCount(count);
});

socket.on('LEADERBOARD', (leaderboardObj) => {
    gameController.updateLeaderboard(leaderboardObj);
});

function getAdminUser(allUsers) {
    const adminKey = Object.keys(allUsers).filter(key => allUsers[key].is_admin);
    return allUsers[adminKey];
}