const messages = document.querySelector('[data-message-list]');

export function setMessageInChat (data, currentUser) {

    if (data.recon && data.recon_by == currentUser)
        return;

    let htmlString = getMessageHtml(data);

    const messageElement = document.createElement("li");

    if (data.type == 'system_message') {
        messageElement.classList.add('system-notice');   
        
        if (data.gameResult) {
            messageElement.classList.add('system-notice--game');
            
            if (data.gameResult != 'tie' && (data.gameResult.winner.username == currentUser || data.gameResult.loser.username == currentUser)) {

                if (data.gameResult.winner.username == currentUser) {
                    messageElement.classList.add('won');
                    htmlString = htmlString.replace(`<strong>${currentUser}</strong> wins`, '<strong>you</strong> won!');
                } else {
                    messageElement.classList.add('fail')
                }

            } else if (data.gameResult != 'tie') {
                messageElement.classList.add('won')
            }
        }

    } else if (data.type == 'chat_message') {
        messageElement.classList.add('message');
        messageElement.id = data.sender.username;

        const allInsertedListItems = messages.querySelectorAll('li');
        const lastItem = allInsertedListItems[allInsertedListItems.length-1];

        if (allInsertedListItems.length > 0 && lastItem.id == data.sender.username) {
            messageElement.classList.add('message--double');
        }

        if (data.sender.username == currentUser) {
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

        const messageContent = document.createElement('div');
        const allInsertedListItems = messages.querySelectorAll('li');
        const lastItem = allInsertedListItems[allInsertedListItems.length-1];

        if (allInsertedListItems.length == 0 || lastItem.id != data.sender.username ) {
            htmlString += `
                <div class="message__sender">
                    <picture class="avatar">
                        <img src="${data.sender.avatar}" alt="">
                    </picture>

                    <span>${data.sender.username}</span>
                </div>
            `;
        }

        messageContent.classList.add('message__content');
        messageContent.textContent = data.message;

        htmlString += messageContent.outerHTML;

    } else {
        htmlString = `
            <p>${data.message}</p>
        `;
    }

    return htmlString;
}