class statesHandler {
    
    setGameMasterLabel = (username) => {
        const adminUserSpan = document.querySelector('[data-admin-username]');
        adminUserSpan.innerHTML = `<span data-admin-username>${username}</span> is the game master this round`;
    }

    setGameMessage = (message) => {
        const gameBoard = document.querySelector('[data-game-board]');
        gameBoard.classList.add('game--message');

        const gameMessageEl = document.querySelector('#system_message');
        const textEl = document.createElement('p');
        const text = message;

        textEl.innerHTML = text;
        gameMessageEl.appendChild(textEl);
        gameMessageEl.classList.remove('hide');
    }

    setTimerUI = (heading, startCount) => {
        const gameBoard = document.querySelector('[data-game-board]');
        gameBoard.classList.add('game--message');

        const gameMessageEl = document.querySelector('#system_message');
        const headingEl = document.createElement('h3');
        const headingText = heading;

        headingEl.innerHTML = headingText;
        gameMessageEl.appendChild(headingEl);

        const countText = document.createElement('p');
        countText.id = 'countText';
        let count = startCount;
        countText.innerHTML = count;
        gameMessageEl.appendChild(countText);

        gameMessageEl.classList.remove('hide');

        return { text: countText, count: count};
    }

    removeSetupLoader = (time) => {
        setTimeout(() => {

            const loaderEl = document.querySelector('[data-loader]');
            const mainEl = document.querySelector('[data-game-lobby]');
            const bodyEl = document.querySelector('body');

            mainEl.classList.remove('hide');
            loaderEl.classList.add('hide');

            bodyEl.classList.add('lobby--active');

        },time)
        
    }

    setUserSelectForm = (allUsersInRoom, currentUser) => {
        console.log('set user select form');
        
        const userSelectForm = document.querySelector('[data-user-select]');        
        userSelectForm.innerHTML = '';

        const gameBoard = document.querySelector('[data-game-board]');
        gameBoard.classList.add('game--message');

        for (const index in allUsersInRoom) {
            const userObject = allUsersInRoom[index];

            if (currentUser != userObject.username) {
                const labelElement = document.createElement('label');

                labelElement.innerHTML = `
                    <input type="radio" name="username" id="user-${userObject.username}" value="${userObject.username}">
                    ${userObject.username}
                `;

                userSelectForm.appendChild(labelElement);
            }
        }

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.classList.add('btn');
        submitBtn.textContent = 'Start game';

        userSelectForm.appendChild(submitBtn);

        const selectOpponentUI = document.querySelector('[data-select_opponent-ui]');
        selectOpponentUI.classList.remove('hide');
    }

    hideAdminUIs = () => {
        console.log('hide admin ui');
        const allAdminUis = document.querySelectorAll('[data-admin_user-ui]');

        allAdminUis.forEach(element => {
            if (!element.className.includes('hide'))
                element.classList.add('hide');
        });
    }

    hideAndClearSystemMessage = (hideMessage = true) => {
        const systemMessage = document.querySelector('#system_message');
        systemMessage.innerHTML = '';

        if (hideMessage && !systemMessage.className.includes('hide')) {
            systemMessage.classList.add('hide');
        }
    }

    showGameOverBtns = () => {
        const btnContainer = document.querySelector('[data-restart-game]');
        btnContainer.classList.remove('hide');
    }

}

export default statesHandler;