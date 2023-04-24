import RoomController from "./controllers/RoomController.js";
const users = {};
const roomController = new RoomController();

export default (io, socket) => {

    roomController.setConnectionState(true);

    const username = socket.username;
    const roomCode = socket.roomCode;
    const avatarUrl = socket.avatarUrl;

    let isAdmin = socket.isAdmin ?? false;
    let broadcastLeftMessage = true;

    if (!users.hasOwnProperty(roomCode))
        users[roomCode] = {};

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
            users[roomCode][username] = roomController.getUserFromBackup(username);
            users[roomCode][username].socketId = socket.id;

            if (roomController.wasAdminBefore(username)) {
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

        io.to(`${roomCode}`).emit('ROOM_USERS', users[roomCode]);
        const currentUser = users[roomCode][username];

        // If admin or first user in room
        if (currentUser.is_admin) {
            socket.emit('SET_ADMIN', username);
        } else {
            socket.emit('SET_DEFAULT_USER', username);
        }

        // create/update backup of all users in room
        roomController.roomUsersBackup(users[roomCode]);

        console.log(`${username} has joined the ${roomCode} chat! ✋`);

        // if there are now more than 1 users in room, trigger start game UI
        if (Object.keys(users[roomCode]).length > 1) {
            const adminUser = roomController.getAdmin(users[roomCode]);
            io.to(`${adminUser.socketId}`).emit('START_GAME_UI');
        }

        socket.broadcast.to(`${roomCode}`).emit('MESSAGE_IN_CHAT', { 
            type: 'system_message', 
            message: `${username} joined the chat`
         });
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

    socket.on('disconnect', (reason) => {
        console.log(`${username} disconnected from socket`);

        // update state
        roomController.setConnectionState(false);

        setTimeout(() => {

            if (roomController.getConnectionState() && users[roomCode][username]) {
                console.log(`${username} RECONNECTED!!!!`);

                socket.broadcast.to(`${roomCode}`).emit("MESSAGE_IN_CHAT", {
                    type: 'system_message', 
                    message: `${username} reconnected` 
                });
                
            } else {
                socket.leaveAll();

                let newAdmin;
                let usernamesInRoom = roomController.listRoomUsers(users[roomCode]);

                if (broadcastLeftMessage && (usernamesInRoom.length - 1) > 0) {

                    // still some users in room -> show message
                    console.log('show left chat message');

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