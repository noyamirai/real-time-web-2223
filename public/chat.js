// import { loggedIn } from "./onboarding.js";
import socket from "./socket.js";

const messages = document.querySelector('[data-message-list]');
const form = document.querySelector('[data-chat-form]');
const input = document.querySelector('[data-message-input]');
const submitMessageBtn = document.querySelector('.btn--send');

let currentUser;

fetch('/username')
.then(res => res.json())
.then((result) => {

    console.log(result);
    const username = result.username;
    currentUser = username;

    socket.auth = {username};
    socket.connect();

    socket.emit('NEW_USER', username);
})

socket.on('NEW_USER', (message) => {
    const htmlString = `
        <p>${message}</p>
    `;

    const messageElement = document.createElement("li");
    messageElement.classList.add('system-notice');
    messageElement.innerHTML = htmlString;

    messages.appendChild(messageElement);
});

form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (input.value) {
        socket.emit('CHAT_MESSAGE', {
            message: input.value,
            sender: currentUser
        });

        input.value = '';
    }

});

socket.on('CHAT_MESSAGE', (result) => {
    console.log(result);

    const item = document.createElement('li');
    console.log(result.sender);
    console.log(currentUser);

    const htmlString = `
        <div class="message__sender">
            <picture>
                <img src="" alt="">
            </picture>

            <span>${result.sender}</span>
        </div>

        <div class="message__content">
            <p>${result.message}</p>
        </div>
    `;

    item.classList.add('message');

    if (result.sender == currentUser) {
        item.classList.add('message--sent');
    }

    console.log(htmlString);

    item.innerHTML = htmlString;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
})

socket.on('USER_LEFT', (message) => {
   const htmlString = `
        <p>${message}</p>
    `;

    const messageElement = document.createElement("li");
    messageElement.classList.add('system-notice');
    messageElement.innerHTML = htmlString;

    messages.appendChild(messageElement);
})

input.addEventListener('input', (e) => {

    if (input.value == '') {
        submitMessageBtn.disabled = true;
    } else if (input.value != '' && submitMessageBtn.disabled) {
        submitMessageBtn.disabled = false;
    }

});