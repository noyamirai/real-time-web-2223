export default (io, socket) => {
    
    const username = socket.username;
    const roomCode = socket.roomCode;

    console.log(`${username} connected to socket via ${roomCode}`);

    socket.on('JOIN_ROOM', () => {
        socket.join(`${roomCode}`);

        const room = io.sockets.adapter.rooms.get(roomCode);
        const numUsers = room ? room.size : 0;

        if (numUsers == 1) {
            io.to(`${roomCode}`).emit('SET_ADMIN', username);
        }

        console.log(`${username} has joined the ${roomCode} chat! ✋`);
        socket.broadcast.to(`${roomCode}`).emit('NEW_USER', `${username} joined the chat`);
    });
    
    socket.on('CHAT_MESSAGE', (obj) => {
        io.to(`${roomCode}`).emit('CHAT_MESSAGE', {sender: obj.sender, message: obj.message});
    });

    socket.on('disconnect', () => {
        socket.leaveAll();

        // TODO: when to delete room?

        socket.broadcast.to(`${roomCode}`).emit("USER_LEFT", `${username} left the chat`);
    });
}