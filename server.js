import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import session from 'express-session';

import { route } from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 9000;

import { Server } from "socket.io";
const io = new Server(server);

const sessionLength = (1000 * 60 * 60 * 24) * 7; // 1 day

app.locals.fs = fs;

// SET TEMPLATE ENGINE
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(express.static('public'));
app.use('/public', express.static(__dirname + '/public/'));

app.use(session({
    name: 'chatsession',
    secret: "chatsecretsessiondata",
    saveUninitialized:true,
    cookie: { maxAge: sessionLength },
    resave: false
}));

app.use('/', route);

io.on('connection', (socket) => {
    console.log('User connected');

    const username = socket.username;
    console.log(username);
    
    socket.on('chat message', (msg) => {
        io.emit('chat message', (username + ': ' + msg));
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
       
    });

    socket.on("user joined", ({ username }) => {
        console.log(`${username} joined the chat`);
        socket.broadcast.emit("user joined", `${username} joined the chat`);
    });

});

io.on('disconnect', function () {
    console.log('USER DISCONNECTED?');
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;

  if (!username) {
    return next(new Error("invalid username"));
  }

  socket.username = username;
  next();
});

app.get('*', (req, res) => {
    res.render('layout', {
        'view': '404',
        'bodyClass': 'error',
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});