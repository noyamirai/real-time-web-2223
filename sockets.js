
export default (io, socket) => {
    
    const username = socket.username;
    console.log(username);
    console.log(`${username} connected to socket`);

    socket.on('NEW_USER', (username) => {
        console.log(`${username} has joined the chat! ✋`);
        socket.broadcast.emit("NEW_USER", `${username} joined the chat`);
    })
    
    socket.on('chat message', (obj) => {
        io.emit('chat message', {sender: obj.sender, message: obj.message});
    });

    socket.on('disconnect', () => {
        console.log(`${username} disconnected from socket`);
    });
}