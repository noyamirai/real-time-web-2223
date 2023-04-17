// import { loggedIn } from "./onboarding.js";
import socket from "./socket.js";

const messages = document.querySelector('[data-message-list]');
const form = document.querySelector('[data-chat-form]');
const input = document.querySelector('[data-message-input]');

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
    console.log(message);

    const messageElement = document.createElement("li");
    messageElement.textContent = message;
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
    item.textContent = `${result.sender}: ${result.message}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
})

socket.on('USER_LEFT', (message) => {
   
    console.log(message);

    const messageElement = document.createElement("li");
    messageElement.textContent = message;
    messages.appendChild(messageElement);
})