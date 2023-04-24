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

    // TODO: if admin leaves and others are left -> set new admin user

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

        if (wasConnectedBefore && roomController.wasAdminBefore(username)) {
            console.log('use data from backup');
            users[roomCode][username] = roomController.getUserFromBackup(username);
            users[roomCode][username].socketId = socket.id;
            isAdmin = true;
        } else {
            console.log('create new user');
            // create new user
            users[roomCode][username] = {
                username: username,
                socketId: socket.id,
                is_admin: isAdmin ? isAdmin : (numUsers == 1 ? true : false),
                avatarUrl: avatarUrl
            }

        }

        io.to(`${roomCode}`).emit('ROOM_USERS', users[roomCode]);

         // If first user in room
        if (isAdmin || numUsers == 1) {
            socket.emit('SET_ADMIN', username);
        } else {
            socket.emit('SET_DEFAULT_USER', username);
        }

        roomController.roomUsersBackup(users[roomCode]);

        console.log(`${username} has joined the ${roomCode} chat! ✋`);

        if (Object.keys(users[roomCode]).length > 1) {
            const adminUser = roomController.getAdmin(users[roomCode]);
            console.log(adminUser);
            io.to(`${adminUser.socketId}`).emit('START_GAME_UI');
        }

        socket.broadcast.to(`${roomCode}`).emit('MESSAGE_IN_CHAT', { type: 'system_message', message: `${username} joined the chat` });
    });
    
    socket.on('CHAT_MESSAGE', (obj) => {
        io.to(`${roomCode}`).emit('MESSAGE_IN_CHAT', { type: 'chat_message', sender: { username: obj.sender, avatar: obj.avatar }, message: obj.message });
    });

    socket.on('disconnect', (reason) => {
        console.log(`${username} disconnected from socket`);
        roomController.setConnectionState(false);

        setTimeout(() => {

            if (roomController.getConnectionState() && users[roomCode][username]) {
                console.log(`${username} RECONNECTED!!!!`);

                socket.broadcast.to(`${roomCode}`).emit("MESSAGE_IN_CHAT", { type: 'system_message', message: `${username} reconnected` });
                
            } else {

                socket.leaveAll();
                delete users[roomCode][username];

                if (broadcastLeftMessage && users[roomCode]) {
                    const usernamesInRoom = roomController.listRoomUsers(users[roomCode]);

                    if (usernamesInRoom.length == 0) {
                        delete users[roomCode];
                        roomController.deleteRoomFromJson(roomCode);

                        console.log('deleted room; no one left');
                    } else {
                        console.log('show left chat message');

                        if (roomController.wasAdminBefore(username)) {
                            console.log('admin left! set new admin');
                            io.to(`${users[roomCode][0].socketId}`).emit('SET_ADMIN', username);
                        }

                        io.to(`${roomCode}`).emit('ROOM_USERS', users[roomCode]);

                        socket.broadcast.to(`${roomCode}`).emit("MESSAGE_IN_CHAT", { type: 'system_message', message: `${username} left the chat` });
                    }
                }

            }

        }, 2000);
        
    });
}