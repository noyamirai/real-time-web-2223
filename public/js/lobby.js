import socket from "./socket.js";
import { setMessageInChat } from "./messageHandler.js";

import statesHandler from "./statesHandler.js";
const StatesHandler = new statesHandler();

import { addChatListeners, setAdminUserForChat } from "./chatHandler.js";
import GameController from "./gameScript.js";
const gameController = new GameController(socket);

const urlParams = new URLSearchParams(window.location.search);
const ESI = urlParams.get('esi');

const userSelectForm = document.querySelector('[data-user-select]');
const copyTexts = document.querySelectorAll('[data-copy-text]');
const tooltip = document.querySelector('[data-tooltip]');
const gameOverBtns = document.querySelectorAll('[data-game-over-btns]');
const pickContainers = document.querySelectorAll('[data-character-select-container]');

let currentUser;
let isAdmin;
let currentRoom;
let avatarUrl;
let allUsersInRoom;
let gameStarted = false;
let prevAdmin;

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
    gameController.setUserObject({username: currentUser, avatarUrl: avatarUrl});
})

socket.on('SET_ADMIN', (username) => {

    const currentAdminUser = getAdminUser(allUsersInRoom);
    // user changed! set server session isAdmin = false;
    if (currentAdminUser.username != username && isAdmin) {

        fetch(`/set/default-user`, {
        method: 'POST',
        body: {
            'username': currentAdminUser.username
            }
        })
        .then( res => res.json())
        .then((adminSet) => {
            if (adminSet) {
                console.log('USER REVOKED FROM ADMIN: ' + currentAdminUser.username);
                isAdmin = false;

                setAdminUserForChat(isAdmin);
            }
        });
        
    }

    // Set new admin
    fetch(`/set/admin`, {
        method: 'POST',
        body: {
            'username': username
        }
    })
    .then( res => res.json())
    .then((adminSet) => {
        if (adminSet) {
            console.log('NEW ADMIN SET: ' + username);

            if (username == currentUser) {
                isAdmin = true;
            }

            setAdminUserForChat(isAdmin);

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
    gameController.setRoomUsers(allUsersInRoom);
})

socket.on('SET_DEFAULT_USER', (username) => {
    const adminUser = getAdminUser(allUsersInRoom);

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
    gameController.setGameRound(nextRound);

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
    gameController.setGameRound(count);
});

socket.on('GAME_FINISHED', (leaderboard) => {
    console.log(leaderboard);
    const adminUser = getAdminUser(allUsersInRoom);

    if (adminUser.username == currentUser) {
        StatesHandler.showGameOverBtns();
    }

});

socket.on('LEADERBOARD', (leaderboardObj) => {
    gameController.setLeaderboard(leaderboardObj);
});

socket.on('EXIT_ROOM', () => {
    setTimeout(() => {
        window.location.href = `/exit`;
    }, 1500);
});

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
    gameController.handleGameTargetSelection(e);
});

pickContainers.forEach(container => {
    container.addEventListener('click', (e) => {
        const btn = container.querySelector('button');
        gameController.handleUserHandPick(btn);
    });
});

if (copyTexts.length > 0) {
    copyTexts.forEach((copyText) => {

        copyText.addEventListener('click', () => {
            const textToCopy = copyText.querySelector('[data-text-to-copy]').textContent;
            navigator.clipboard.writeText(textToCopy)
            
            .then(() => {
                tooltip.textContent = "Code copied!";
                tooltip.classList.add('tooltip--success');
                tooltip.classList.remove('tooltip--fail');

                setTimeout(() => {
                    tooltip.textContent = "Click to copy code";
                    tooltip.classList.remove('tooltip--success');
                }, 2000);
            })
            .catch((err) => {
                tooltip.textContent = "Something went wrong";
                console.error('Error copying text:', err);
                tooltip.classList.add('tooltip--fail');
                tooltip.classList.remove('tooltip--success');

                setTimeout(() => {
                    tooltip.textContent = "Click to copy code";
                    tooltip.classList.remove('tooltip--fail');
                }, 2000);
            });
        });

    })
}

function getAdminUser(allUsers) {
    const adminKey = Object.keys(allUsers).filter(key => allUsers[key].is_admin);
    return allUsers[adminKey];
}