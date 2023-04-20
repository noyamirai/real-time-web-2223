# BR: Rock-Paper-Scissors

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Node.JS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

Welcome to "Battle Royale: Rock-Paper-Scissors", a real-time web application built with Node.js and Socket.IO! This application is a school assignment project that aims to provide a unique gaming experience that combines the classic game of Rock Paper Scissors with the thrilling concept of The Hunger Games.

Players can create or join rooms where they can chat with each other in real-time. The Game Master, the initial user who created the room, has the power to start a game session by selecting up to 5 players from the chat room. During some rounds, players will receive mystery power-ups such as a gun, shield, reverse card, revival card, and more to keep things interesting.

The winner of the first game becomes the next Game Master, and the first player to reach 3 wins becomes the ultimate winner, or Apex Predator. With an intuitive user interface and seamless real-time communication, this game provides a fun and exciting experience for players of all ages.

So, gather your friends, join a room, and get ready to compete in a game of strategy, luck, and survival. May the odds be ever in your favor!

<!-- ![WFUT - App preview](./docs/assets/WFUT-app_preview.png) -->

## :computer: Features

This game offers the following features (for now): 

| Features :nail_care:          | Status :rocket:    |
|-------------------------------|--------------------|
| Chat with others              | :white_check_mark: |
| Enter chat with username      | :white_check_mark: |
| Create game room        | :white_check_mark: |
| Share game room key                | :white_check_mark:        |
| Enter game room via key      | :white_check_mark: |
| Game master selects 1v1 victim                 | :hourglass:        |
| Play rock paper scissors                 | :hourglass:        |
| Use power-ups                 | :hourglass:        |
| Restart game session                | :hourglass:        |
| End game session                | :hourglass:        |


## :zap: Quickstart
If you want to start working with us on this project, or if you just want to take a look at the code, and you have cloned this repo to your desktop, go to its root directory and run `npm install` to install its dependencies.

Now that we are all on the same page, you can run the application with or without [nodemon](https://www.google.com/settings/security/lesssecureapps). 

Running the application 'normally'
~~~
npm start
~~~

Running the application with nodemon
~~~
npm run start:dev
~~~

Both these prompts will give you access to the game site via `localhost:9000/`. And That's it! Having trouble? Feel free to let us know by submitting an issue.

## :memo: Documentation

Learn more about and dive deeper into this project by reading the [process documentation](./docs/productdoc.md).

## :warning: License

This project is licensed under the terms of the MIT license.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/noyamirai/real-time-web-2223/blob/main/LICENSE)

