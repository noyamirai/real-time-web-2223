import statesHandler from "./statesHandler.js";

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

    setUserObject = (obj) => {
        this.currentUserObject = obj;
    }

    setRoomUsers = (users) => {
        this.roomUsers = users;
    }

    setGameRound = (count) => {
        this.roundCount = count;
    }

    setLeaderboard = (obj) => {
        this.leaderboardObj = obj;
    }

    startGameCountdown = () => {
        const gameBoard = document.querySelector('[data-game-board]');
        const timerData = StatesHandler.setTimerUI('Get ready to fight', 3);

        const countText = timerData.text;
        let count = timerData.count;

        const countdown = setInterval(() => {
            count--;

            if (count > 0) {
                countText.innerHTML = count;
            } else {
                countText.innerHTML = 'Start!';

                setTimeout(() => {
                    clearInterval(countdown);

                    StatesHandler.hideAndClearSystemMessage();

                    // gameBoard.classList.remove('game--message');
                    // gameBoard.classList.add('game--select');

                    this.toggleHands();

                }, 500);
            }

        }, 1000);
    }

    startSelectChoiceCountdown = () => {
        const timerData = StatesHandler.setTimerUI('Make a choice', 5);
        const countText = timerData.text;
        let count = timerData.count;

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
                    this.toggleHands(false);


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

    toggleHands = (show = true) => {
        const handSelectForm = document.querySelector('[data-character-select]');
        const gameBoard = document.querySelector('[data-game-board]');

        if (show) {
            handSelectForm.classList.remove('hide');

            gameBoard.classList.add('game--select');
            gameBoard.classList.remove('game--message');

            this.resetHandSelection();
            this.startSelectChoiceCountdown();

        } else {
            gameBoard.classList.remove('game--select');
            gameBoard.classList.add('game--message');
            handSelectForm.classList.add('hide'); 
        }
    }

    resetHandSelection = () => {
        const handPick = document.querySelector('[data-character-select-container].selected');

        if (handPick) {
            handPick.classList.remove('selected');
        }
    }

    startGame = () => {
        StatesHandler.hideAdminUIs();
        StatesHandler.hideAndClearSystemMessage();
        StatesHandler.resetFightScenes();
        this.startGameCountdown();
    }

    handleGameTargetSelection = () => {
        const selectedUsername = document.querySelector('input[name="username"]:checked');

        this.socket.emit('START_GAME', {
            targetedBy: this.currentUserObject,
            targetUser: selectedUsername.value,
        });
    }

    handleUserHandPick = (targetButton) => {
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