// import { loggedIn } from "./onboarding.js";
import socket from "./socket.js";

const messages = document.querySelector('[data-message-list]');
const form = document.querySelector('[data-chat-form]');
const input = document.querySelector('[data-message-input]');

console.log('ENTERED LOBBY');

let loggedUser; 

fetch('/username')
.then(res => res.json())
.then((result) => {

    console.log(result);

    // if (!result.connected) {
        const username = result.username;
    
        socket.auth = {username};
        socket.connect();

        console.log('joined: ', result.username);

        socket.emit("user joined", { username: result.username });
    // }
})

socket.on('user joined', (message) => {
    console.log(message);

    const messageElement = document.createElement("li");
    messageElement.textContent = message;
    messages.appendChild(messageElement);
});

form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }

});

socket.on('chat message', (message) => {
    console.log(message);

    const item = document.createElement('li');
    item.textContent = message;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);

})