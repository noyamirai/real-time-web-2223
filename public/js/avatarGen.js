const refreshBtn = document.querySelector('[data-refresh-icons]');

refreshBtn.classList.remove('hide');

refreshBtn.addEventListener('click', (e) => {

    const endpoint = "https://api.dicebear.com/6.x/bottts-neutral/svg?seed=";
    const loader = document.querySelector('[data-loader]');
    loader.classList.remove('hidden');

    for (let i = 0; i < 6; i++) {
        // generate a random name for the icon
        const name = Math.random().toString(36).substring(7);

        const imageElement = document.querySelectorAll('[data-avatar-img]');

        imageElement[i].src = endpoint + name;
    }

    setTimeout(() => {
        loader.classList.add('hidden');
    }, 500);

});