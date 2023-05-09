import RPSController from "./controllers/RPSController.js";
import RoomController from "./controllers/RoomController.js";
const users = {};
const playerChoices = {};
const leaderboard = {};

const roomController = new RoomController();
const rpsController = new RPSController();

export default (io, socket) => {

    roomController.setConnectionState(true);

    const username = socket.username;
    const roomCode = socket.roomCode;
    const avatarUrl = socket.avatarUrl;

    let isAdmin = socket.isAdmin ?? false;
    let broadcastLeftMessage = true;

    if (!users.hasOwnProperty(roomCode))
        users[roomCode] = {};

    if (!playerChoices.hasOwnProperty(roomCode))
        playerChoices[roomCode] = {};

    if (!leaderboard.hasOwnProperty(roomCode))
        leaderboard[roomCode] = {};

    const usernamesInRoom = roomController.listRoomUsers(users[roomCode]);

    socket.on('JOIN_ROOM', (wasConnectedBefore) => {

        // Username taken!
        if (!wasConnectedBefore && usernamesInRoom.length > 0 && usernamesInRoom.includes(username)) {            
            socket.emit('ERROR', { type: 'username_taken' });
            broadcastLeftMessage = false;

            return;
        }

        socket.join(`${roomCode}`);

        const room = io.sockets.adapter.rooms.get(roomCode);
        const numUsers = room ? room.size : 0;

        if (wasConnectedBefore) {
            console.log('user was connected before');
            users[roomCode][username] = roomController.getUserFromBackup(username);
            users[roomCode][username].socketId = socket.id;

            const currentAdmin = roomController.getAdmin(users[roomCode]);

            console.log('current admin is: ' + currentAdmin.username);
            console.log('was admin before: ' + roomController.wasAdminBefore(username));

            if (roomController.wasAdminBefore(username) && !currentAdmin) {
                isAdmin = true;
            }
            
        } else {
            // create new user
            users[roomCode][username] = {
                username: username,
                socketId: socket.id,
                is_admin: isAdmin ? isAdmin : (numUsers == 1 ? true : false),
                avatarUrl: avatarUrl
            }
        }

        leaderboard[roomCode][username] = 0;

        io.to(`${roomCode}`).emit('ROOM_USERS', users[roomCode]);
        const currentUser = users[roomCode][username];

        // If admin or first user in room
        if (currentUser.is_admin) {
            io.to(`${users[roomCode][username].socketId}`).emit('SET_ADMIN', username);
        } else {
            io.to(`${users[roomCode][username].socketId}`).emit('SET_DEFAULT_USER', username);
        }

        // create/update backup of all users in room
        roomController.roomUsersBackup(users[roomCode]);

        console.log(`${username} has joined the ${roomCode} chat! ✋`);

        // if there are now more than 1 users in room, trigger start game UI
        if (Object.keys(users[roomCode]).length > 1) {
            const adminUser = roomController.getAdmin(users[roomCode]);
            io.to(`${adminUser.socketId}`).emit('START_GAME_UI');
        }

        if (!wasConnectedBefore) {

            socket.broadcast.to(`${roomCode}`).emit('MESSAGE_IN_CHAT', { 
                type: 'system_message', 
                message: `${username} joined the chat`
            });
            
        }
    });
    
    socket.on('CHAT_MESSAGE', (obj) => {
        io.to(`${roomCode}`).emit('MESSAGE_IN_CHAT', { 
            type: 'chat_message', 
            sender: { 
                username: obj.sender, 
                avatar: obj.avatar 
            }, 
            message: obj.message 
        });
    });

    socket.on('START_GAME', (obj) => {
        const targetUser = users[roomCode][obj.targetUser];
        const targetedBy = users[roomCode][obj.targetedBy.username];

        io.to(`${targetUser.socketId}`).emit('START_GAME');
        io.to(`${targetedBy.socketId}`).emit('START_GAME');
    });

    socket.on('RPS_SELECTION', (submission, roundN, leaderboardObj) => {
        console.log(`checking round ${roundN} for ${username}`);

        // round doesnt exist yet
        if (!playerChoices[roomCode].hasOwnProperty(`round_${roundN}`))
            playerChoices[roomCode][`round_${roundN}`] = {};

        // check amount of player choices for this round
        const amountOfChoices = Object.keys(playerChoices[roomCode][`round_${roundN}`]).length;

        // insert user + their submission
        playerChoices[roomCode][`round_${roundN}`][`player${amountOfChoices + 1}`] = submission;
        
        // check new amount of choices
        const updatedAmount = Object.keys(playerChoices[roomCode][`round_${roundN}`]).length;

        if (updatedAmount == 2) {
            
            const result = rpsController.getResults(
                playerChoices[roomCode][`round_${roundN}`].player1, 
                playerChoices[roomCode][`round_${roundN}`].player2
            );

            playerChoices[roomCode][`round_${roundN}`] = result;

            if (Object.keys(leaderboardObj).length > 0) {
                leaderboard[roomCode] = leaderboardObj;
            }
            
            const usersInRoom = roomController.listRoomUsers(users[roomCode]);

            usersInRoom.forEach(username => {
                let increasePoint = false;

                if (result != 'tie') {
                    if (result.winner.username == username)
                        increasePoint = true;
                }

                if (!leaderboard[roomCode].hasOwnProperty(username)) {
                    leaderboard[roomCode][username] = (increasePoint ? 1 : 0);
                } else {
                    leaderboard[roomCode][username] = (leaderboard[roomCode][username] + (increasePoint ? 1 : 0));
                }
            });

            const usersWithThreePoints = Object.entries(leaderboard[roomCode])
            .filter(([user, points]) => {
                return points === 3;
            })
            .map(([user, points]) => {
                return user;
            });

            if (usersWithThreePoints.length > 0) {
                console.log('GAME OVER!!!');

                const winner = users[roomCode][usersWithThreePoints[0]].username;
                io.in(`${roomCode}`).emit('MESSAGE_IN_CHAT', { 
                    type: 'system_message', 
                    gameResult: playerChoices[roomCode][`round_${roundN}`],
                    message: `Game finished: ${winner} is the apex predator!`
                });

                io.in(`${roomCode}`).emit("GAME_FINISHED", 
                    leaderboard[roomCode]
                );
                
            } else {
                // only if theres no player with 3 wins
                playerChoices[roomCode][`round_${roundN + 1}`] = {};

                let resultMessage = `Round ${roundN} finished: `;
                let setNewAdmin = false;

                if (result == 'tie') {
                    resultMessage += '<strong>draw</strong>'
                } else {
                    setNewAdmin = true;
                    resultMessage += `<strong>${playerChoices[roomCode][`round_${roundN}`].winner.username}</strong> wins`;
                }

                if (setNewAdmin) {
                    const winningUsername = playerChoices[roomCode][`round_${roundN}`].winner.username;
                    const currentAdmin = roomController.getAdmin(users[roomCode]);

                    if (winningUsername != currentAdmin.username) {
                        users[roomCode][winningUsername].is_admin = true;
                        users[roomCode][currentAdmin.username].is_admin = false;

                        roomController.roomUsersBackup(users[roomCode]);

                        io.in(`${roomCode}`).emit('SET_ADMIN', playerChoices[roomCode][`round_${roundN}`].winner.username);
                        io.to(`${roomCode}`).emit('ROOM_USERS', users[roomCode]);
                    }
                    
                }

                io.in(`${roomCode}`).emit('MESSAGE_IN_CHAT', { 
                    type: 'system_message', 
                    gameResult: playerChoices[roomCode][`round_${roundN}`],
                    message: resultMessage
                });

                io.in(`${roomCode}`).emit("GAME_RESULT", 
                    playerChoices[roomCode][`round_${roundN}`],
                    (roundN + 1)
                );

            }
            
        }
    });

    socket.on('RESTART_LOBBY', () => {

        console.log('restart lobby');

        Object.keys(leaderboard[roomCode]).forEach((user) => {
            leaderboard[roomCode][user] = 0;
        });

        playerChoices[roomCode] = {};

        io.in(`${roomCode}`).emit('ROUND_UPDATE', 1);

        io.in(`${roomCode}`).emit('MESSAGE_IN_CHAT', { 
            type: 'system_message', 
            message: 'New game started!'
        });

        const currentAdmin = roomController.getAdmin(users[roomCode]);
        io.to(`${currentAdmin.socketId}`).emit('START_GAME_UI');

    });

    socket.on('CLEAR_ROOM', () => {

        io.in(`${roomCode}`).emit('MESSAGE_IN_CHAT', { 
            type: 'system_message', 
            message: 'Session over... bye bye!'
        });

        broadcastLeftMessage = false;

        io.in(`${roomCode}`).emit('EXIT_ROOM');

        // const socketsInRoom = io.sockets.adapter.rooms.get(`${roomCode}`);

        // // Loop through each socket and disconnect them from the room
        // if (socketsInRoom) {
        //     socketsInRoom.forEach(socketId => {
        //         io.sockets.sockets.get(socketId).leave(`${roomCode}`);
        //     });
        // }

    });

    socket.on('disconnect', () => {
        console.log(`${username} disconnected from socket`);

        // update state
        roomController.setConnectionState(false);

        setTimeout(() => {

            if (roomController.getConnectionState() && users[roomCode][username]) {
                console.log(`${username} RECONNECTED!!!!`);

                socket.broadcast.to(`${roomCode}`).emit("MESSAGE_IN_CHAT", {
                    type: 'system_message',
                    recon: true,
                    recon_by: username,
                    message: `${username} reconnected` 
                });

                io.to(`${users[roomCode][username].socketId}`).emit("ROUND_UPDATE", (Object.keys(playerChoices[roomCode]).length == 0 ? 1 : Object.keys(playerChoices[roomCode]).length));
                io.to(`${users[roomCode][username].socketId}`).emit("LEADERBOARD", leaderboard[roomCode]);

                // socket.broadcast.to(`${roomCode}`).emit("ROUND_UPDATE", Object.keys(playerChoices[roomCode]).length);
                // socket.broadcast.to(`${roomCode}`).emit("LEADERBOARD", leaderboard[roomCode]);
                
            } else {
                socket.leaveAll();

                let newAdmin;
                let usernamesInRoom = roomController.listRoomUsers(users[roomCode]);

                if (broadcastLeftMessage && (usernamesInRoom.length - 1) > 0) {

                    // check if user who left was admin -> set new admin if so
                    if (roomController.wasAdminBefore(username)) {
                        console.log('admin left! set new admin');

                        const allKeys = Object.keys(users[roomCode]);

                        let index = allKeys.indexOf(username);

                        if (index !== -1) {
                            allKeys.splice(index, 1);
                        }
                        
                        newAdmin = users[roomCode][allKeys[0]];
                    }

                    socket.broadcast.to(`${roomCode}`).emit("MESSAGE_IN_CHAT", {
                        type: 'system_message', 
                        message: `${username} left the chat` 
                    });
                }

                delete users[roomCode][username];
                usernamesInRoom = roomController.listRoomUsers(users[roomCode]);

                // no more users in room -> delete room
                if (usernamesInRoom.length == 0) {
                    delete users[roomCode];
                    roomController.deleteRoomFromJson(roomCode);

                    console.log('deleted room; no one left');

                    roomController.roomUsersBackup({});
                } else {

                    if (newAdmin) {
                       users[roomCode][newAdmin.username].is_admin = true; 
                    }

                    // update room users for client
                    io.to(`${roomCode}`).emit('ROOM_USERS', users[roomCode]);
                    roomController.roomUsersBackup(users[roomCode]);
                    
                    if (newAdmin) {
                        io.to(`${newAdmin.socketId}`).emit('SET_ADMIN', newAdmin.username);
                    }
                }

            }

        }, 2000);
        
    });
}