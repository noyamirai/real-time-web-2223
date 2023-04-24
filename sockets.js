import RoomController from "./controllers/RoomController.js";
const users = {};
const roomController = new RoomController();

export default (io, socket) => {
    
    const username = socket.username;
    const roomCode = socket.roomCode;
    const avatarUrl = socket.avatarUrl;

    let broadcastLeftMessage = true;

    console.log(`${username} connected to socket via ${roomCode}`);

    if (!users.hasOwnProperty(roomCode))
        users[roomCode] = {};

    const usernamesInRoom = roomController.listRoomUsers(users[roomCode]);

    socket.on('JOIN_ROOM', () => {

        // Username taken!
        if (usernamesInRoom.length > 0 && usernamesInRoom.includes(username)) {            
            socket.emit('ERROR', { type: 'username_taken' });
            broadcastLeftMessage = false;

            return;
        }

        socket.join(`${roomCode}`);

        const room = io.sockets.adapter.rooms.get(roomCode);
        const numUsers = room ? room.size : 0;

        // create user
        users[roomCode][socket.id] = {
            username: username,
            socketId: socket.id,
            is_admin: (numUsers == 1 ? true : false),
            avatarUrl: avatarUrl
        }

        io.to(`${roomCode}`).emit('ROOM_USERS', users[roomCode]);

        // If first user in room
        if (numUsers == 1) {
            socket.emit('SET_ADMIN', username);
        } else {
            socket.emit('SET_DEFAULT_USER', username);
        }

        console.log(`${username} has joined the ${roomCode} chat! ✋`);
        socket.broadcast.to(`${roomCode}`).emit('MESSAGE_IN_CHAT', { type: 'system_message', message: `${username} joined the chat` });
    });
    
    socket.on('CHAT_MESSAGE', (obj) => {
        io.to(`${roomCode}`).emit('MESSAGE_IN_CHAT', { type: 'chat_message', sender: { username: obj.sender, avatar: obj.avatar }, message: obj.message });
    });

    socket.on('disconnect', (reason) => {
        socket.leaveAll();
        console.log(`${username} disconnected from socket`);

        if (broadcastLeftMessage) {

            // TODO: when to delete room?
            // TODO: check how many users are left in room -> if 0 -> delete room
            delete users[roomCode][socket.id];

            socket.broadcast.to(`${roomCode}`).emit("MESSAGE_IN_CHAT", { type: 'system_message', message: `${username} left the chat` });
            
        }
    });
}