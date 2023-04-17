// import socket from "./socket.js";

// let loggedIn = false;

// const nicknameForm = document.querySelector('[data-nickname-form]');
// const nicknameInput = document.querySelector('[data-nickname-input]');

// if (nicknameForm) {
//     nicknameForm.addEventListener('submit', function(e) {
//         e.preventDefault();
    
//         if (nicknameInput.value) {
//             usernameCreated(nicknameInput.value);
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
