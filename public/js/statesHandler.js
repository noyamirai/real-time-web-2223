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
                    <input type="radio" name="user-${userObject.username}">
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
        console.log(selectOpponentUI);
        selectOpponentUI.classList.remove('hide');
        console.log(selectOpponentUI);
    }

    hideAdminUIs = () => {
        console.log('hide admin ui');
        const allAdminUis = document.querySelectorAll('[data-admin_user-ui]');

        allAdminUis.forEach(element => {
            if (!element.className.includes('hide'))
                element.classList.add('hide');
        });
    }

    hideAndClearSystemMessage = () => {
        const systemMessage = document.querySelector('#system_message');
        systemMessage.innerHTML = '';

        if (!systemMessage.className.includes('hide')) {
            systemMessage.classList.add('hide');
        }

    }

}

export default statesHandler;