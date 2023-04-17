// import socket from "./socket.js";

// const usernameForm = document.querySelector('[data-nickname-form]');
// const usernameInput = document.querySelector('[data-nickname-input]');

// if (usernameForm) {
//     usernameForm.addEventListener('submit', function(e) {
//         e.preventDefault();
    
//         if (usernameInput.value) {
//             socket.emit('new user', username);
// //             usernameCreated(usernameInput.value);
//         }
    
//     });
// }

// function usernameCreated(username) {

//     // Call socket.connect() with the username as the auth data
//     socket.auth = { username };
//     socket.connect();

//     // Redirect the user to the lobby after the connection is established
//     socket.on("connect", () => {
//         window.location.href = "/lobby";
//     });
// }

// socket.on("connect_error", (err) => {
//   console.log(err);
// });

// export { loggedIn };
