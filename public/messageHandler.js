const messages = document.querySelector('[data-message-list]');

export function setMessageInChat (data, currentUser) {

    const htmlString = getMessageHtml(data);

    const messageElement = document.createElement("li");

    if (data.type == 'system_message') {
        messageElement.classList.add('system-notice');   
    } else if (data.type == 'chat_message') {
        messageElement.classList.add('message');

        if (data.sender == currentUser) {
            messageElement.classList.add('message--sent');
        }
    }

    messageElement.innerHTML = htmlString;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
}

function getMessageHtml(data) {

    let htmlString = ``;

    if (data.type == 'chat_message') {
        htmlString = `
            <div class="message__sender">
                <picture>
                    <img src="" alt="">
                </picture>

                <span>${data.sender}</span>
            </div>

            <div class="message__content">
                <p>${data.message}</p>
            </div>
        `;
    } else {
        htmlString = `
            <p>${data.message}</p>
        `;
    }

    return htmlString;
}