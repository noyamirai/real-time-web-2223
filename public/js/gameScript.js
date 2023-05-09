import statesHandler from "./statesHandler.js";

const userSelectForm = document.querySelector('[data-user-select]');
const optionButtons = document.querySelectorAll('[data-character-select-btn]');

const StatesHandler = new statesHandler();

class GameController {

    constructor(socket, currentUserObject = {}, allUsersInRoom = []) {
        this.socket = socket,
        this.currentUserObject == currentUserObject,
        this.roomUsers = allUsersInRoom,
        this.roundCount = 1;
        this.leaderboardObj = {};
    }

    updateUserObject = (obj) => {
        this.currentUserObject = obj;
    }

    updateRoomUsers = (users) => {
        this.roomUsers = users;
    }

    updateRoundCount = (count) => {
        this.roundCount = count;
    }

    updateLeaderboard = (obj) => {
        this.leaderboardObj = obj;
    }

    setStartGameCountdown = () => {
        const gameBoard = document.querySelector('[data-game-board]');
        gameBoard.classList.add('game--message');

        const gameMessageEl = document.querySelector('#system_message');
        const headingEl = document.createElement('h3');
        const headingText = 'Get ready to fight!';

        headingEl.innerHTML = headingText;
        gameMessageEl.appendChild(headingEl);

        const countText = document.createElement('p');
        countText.id = 'countText';
        let count = 3;
        countText.innerHTML = count;
        gameMessageEl.appendChild(countText);

        gameMessageEl.classList.remove('hide');

        const countdown = setInterval(() => {
            count--;

            if (count > 0) {
                countText.innerHTML = count;
            } else {
                countText.innerHTML = 'Start!';

                setTimeout(() => {
                    clearInterval(countdown);

                    StatesHandler.hideAndClearSystemMessage();

                    gameBoard.classList.remove('game--message');
                    gameBoard.classList.add('game--select');

                    this.showHands();

                }, 500);
            }

        }, 1000);
    }

    setSelectCountdown = () => {

        const gameBoard = document.querySelector('[data-game-board]');
        gameBoard.classList.add('game--message');

        const gameMessageEl = document.querySelector('#system_message');
        const headingEl = document.createElement('h3');
        const headingText = 'Make a choice';

        headingEl.innerHTML = headingText;
        gameMessageEl.appendChild(headingEl);

        const countText = document.createElement('p');
        countText.id = 'countText';
        let count = 5;
        countText.innerHTML = count;
        gameMessageEl.appendChild(countText);

        gameMessageEl.classList.remove('hide');

        const countdown = setInterval(() => {
            count--;

            if (count > 0) {
                countText.innerHTML = count;
            } else {
                countText.innerHTML = 'Time is up!';

                setTimeout(() => {
                    console.log('SEND RPS_SELECTION EMIT');
                    clearInterval(countdown);

                    StatesHandler.hideAndClearSystemMessage();
                    this.hideHands();

                    gameBoard.classList.remove('game--select');
                    gameBoard.classList.add('game--message');

                    let selectedButton = document.querySelector('[data-character-select-container].selected button');

                    if (!selectedButton) {
                        const randomNum = Math.floor(Math.random() * 3);
                        selectedButton = optionButtons[randomNum];
                    }

                    this.socket.emit('RPS_SELECTION', 
                        {   
                            username: this.currentUserObject.username, 
                            selection: selectedButton.value 
                        }, 
                        this.roundCount,
                        this.leaderboardObj
                    );
                }, 500);
            }

        }, 1000);

    }

    hideHands = () => {
        const handSelectForm = document.querySelector('[data-character-select]');
        handSelectForm.classList.add('hide'); 
    }

    showHands = () => {
        const handSelectForm = document.querySelector('[data-character-select]');
        handSelectForm.classList.remove('hide');

        this.resetHandPicks();

        this.setSelectCountdown();
    }

    resetHandPicks = () => {
        const handPick = document.querySelector('[data-character-select-container].selected');

        if (handPick) {
            handPick.classList.remove('selected');
        }
   
    }

    startGame = () => {
        StatesHandler.hideAdminUIs();
        StatesHandler.hideAndClearSystemMessage();
        this.setStartGameCountdown();
    }

    handleUserSelectForm = () => {
        const selectedUsername = document.querySelector('input[name="username"]:checked');

        this.socket.emit('START_GAME', {
            targetedBy: this.currentUserObject,
            targetUser: selectedUsername.value,
        });
    }

    handleUserPick = (targetButton) => {
        optionButtons.forEach(btn => {
            const parentElement = btn.parentNode;
            btn.textContent = 'select';
            parentElement.classList.remove('selected');
        });

        targetButton.textContent = "selected";
        const parentElement = targetButton.parentNode;
        parentElement.classList.add('selected');
    }
};

export default GameController;