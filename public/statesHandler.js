class statesHandler {
    

    setGameMasterLabel = (username) => {
        const adminUserSpan = document.querySelector('[data-admin-username]');
        adminUserSpan.innerHTML = `<span data-admin-username>${username}</span> is the game master this round`;
    }

}

export default statesHandler;