const chatForm = document.querySelector('[data-chat-form]');
const chatInput = document.querySelector('[data-message-input]');
const submitMessageBtn = document.querySelector('.btn--send');

let isAdmin = false;

export function addChatListeners (socket, currentUser, avatarUrl) {
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (chatInput.value) {
            socket.emit('CHAT_MESSAGE', {
                message: chatInput.value,
                sender: currentUser,
                avatar: avatarUrl,
                is_admin: isAdmin
            });

            chatInput.value = '';
        }

    });

    chatInput.addEventListener('input', (e) => {

        if (chatInput.value == '') {
            submitMessageBtn.disabled = true;
        } else if (chatInput.value != '' && submitMessageBtn.disabled) {
            submitMessageBtn.disabled = false;
        }

    });
}

export function setAdminUserForChat(bool) {
    console.log('is admin for chat: ' + bool);
    isAdmin = bool;
}