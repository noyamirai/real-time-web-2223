import statesHandler from "./statesHandler.js";
import { setMessageInChat } from "./messageHandler.js";

const optionButtons = document.querySelectorAll('[data-character-select-btn]');
const StatesHandler = new statesHandler();

import JSConfetti from '/node_modules/js-confetti/dist/es/index.js'
const jsConfetti = new JSConfetti();

class GameController {

    constructor(socket, currentUserObject = {}, allUsersInRoom = []) {
        this.socket = socket,
        this.currentUserObject == currentUserObject;
        this.roomUsers = allUsersInRoom;
        this.roundCount = 1;
        this.leaderboardObj = {};
    }

    getAdminUser(allUsers) {
        const adminKey = Object.keys(allUsers).filter(key => allUsers[key].is_admin);
        return allUsers[adminKey];
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

    startFightScene = (player1SearchKey, player2SearchKey, resultData, nextRound, messageData, adminMessage, isDraw) => {
        const fightScene = document.querySelector('[data-fight-scene]');    

        const player1ChoiceFigure = document.querySelector('[data-player1-choice]');
        const player1ChoiceImg = document.querySelector('[data-player1-choice-img]');
        const player1UsernameTag = document.querySelector('[data-player1-name]');

        const player2ChoiceFigure = document.querySelector('[data-player2-choice]');
        const player2ChoiceImg = document.querySelector('[data-player2-choice-img]');
        const player2UsernameTag = document.querySelector('[data-player2-name]');

        const versusText = document.querySelector('[data-fight-versus]');

        versusText.querySelector('h3').textContent = 'VS';

        player1ChoiceFigure.id = resultData[player1SearchKey].username;
        player2ChoiceFigure.id = resultData[player2SearchKey].username;

        player1UsernameTag.textContent = `${resultData[player1SearchKey].username}'s pick`;
        player2UsernameTag.textContent = `${resultData[player2SearchKey].username}'s pick`;

        player1ChoiceImg.src = `/public/images/${resultData[player1SearchKey].selection}-horizontal.svg`;
        player2ChoiceImg.src = `/public/images/${resultData[player2SearchKey].selection}-horizontal.svg`;

        fightScene.classList.remove('hide');

        setTimeout(() => {
            player1ChoiceFigure.classList.add('active');
            player1ChoiceFigure.classList.add('active--text');

            setTimeout(() => {
                versusText.classList.add('active');

                setTimeout(() => {
                    player2ChoiceFigure.classList.add('active');
                    player2ChoiceFigure.classList.add('active--text');

                    setTimeout(() => {

                        if (isDraw) {
                            versusText.querySelector('h3').textContent = 'DRAW';

                        } else {
                            const loserFigure = document.querySelector(`[data-player-choices]#${resultData.loser.username}`);
                            loserFigure.classList.add('hide');

                            versusText.querySelector('h3').textContent = `${resultData.winner.username} wins!`;
                            fightScene.classList.add('win');

                            if (resultData.winner.username == this.currentUserObject.username) {
                                jsConfetti.addConfetti();
                            }
                        }

                        setMessageInChat(messageData, this.currentUserObject.username);

                        if (adminMessage && adminMessage.newAdmin) {
                            setMessageInChat(adminMessage, this.currentUserObject.username);
                        }

                        const adminUser = this.getAdminUser(this.roomUsers);

                        if (messageData.message.includes('Game finished')) {


                            setTimeout(() => {

                                if (adminUser.username == this.currentUserObject.username) {
                                    fightScene.classList.add('hide');
                                    StatesHandler.showGameOverBtns();
                                }
                               
                            }, 1800);


                        } else {

                            console.log('going to next round : ' + nextRound );
                            this.setGameRound(nextRound); 
                            
                            setTimeout(() => {
                                if (adminUser.username == this.currentUserObject.username) {
                                    fightScene.classList.add('hide');
                                }

                                if (resultData.tie) {
                                    console.log('GAME TIED');
                                    this.startGame();
                                } else {

                                    console.log('admin user is: ' + adminUser.username);

                                    if (adminUser.username == this.currentUserObject.username) {
                                        StatesHandler.setUserSelectForm(this.roomUsers, this.currentUserObject.username);
                                    }

                                }
                            
                            }, 1800);

                        }


                    }, 1400);
                }, 800);
            }, 500);
        }, 300);
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