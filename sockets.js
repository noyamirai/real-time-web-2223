const users = {};

export default (io, socket) => {
    
    const username = socket.username;
    const roomCode = socket.roomCode;

    if (!users.hasOwnProperty(roomCode)) {
        users[roomCode] = {};
    }

    console.log(`${username} connected to socket via ${roomCode}`);

    socket.on('JOIN_ROOM', () => {
        socket.join(`${roomCode}`);

        const room = io.sockets.adapter.rooms.get(roomCode);
        const numUsers = room ? room.size : 0;

        users[roomCode][socket.id] = {
            username: username,
            socketId: socket.id,
            is_admin: false
        }

        if (numUsers == 1) {
            socket.emit('SET_ADMIN', username);
            users[roomCode][socket.id].is_admin = true;
        } else {
            socket.emit('SET_DEFAULT_USER', username);
        }

        io.to(`${roomCode}`).emit('ROOM_USERS', users[roomCode]);

        console.log(`${username} has joined the ${roomCode} chat! ✋`);
        socket.broadcast.to(`${roomCode}`).emit('MESSAGE_IN_CHAT', { type: 'system_message', message: `${username} joined the chat` });
    });
    
    socket.on('CHAT_MESSAGE', (obj) => {
        io.to(`${roomCode}`).emit('MESSAGE_IN_CHAT', { type: 'chat_message', sender: obj.sender, message: obj.message});
    });

    socket.on('disconnect', () => {
        socket.leaveAll();

        // TODO: when to delete room?
        delete users[roomCode][socket.id];

        socket.broadcast.to(`${roomCode}`).emit("MESSAGE_IN_CHAT", { type: 'system_message', message: `${username} left the chat` });
    });
}