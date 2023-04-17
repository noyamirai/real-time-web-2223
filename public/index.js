console.log('SCRIPT INITIALIZED');

const socket = io();

const messages = document.querySelector('[data-message-list]');
const form = document.querySelector('[data-chat-form]');
const input = document.querySelector('[data-message-input]');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (input.value) {
        socket.emit('message', input.value);
        input.value = '';
    }

});


socket.on('message', (message) => {
    console.log(message);

    const item = document.createElement('li');
    item.textContent = message;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);

})