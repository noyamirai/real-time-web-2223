import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import session from 'express-session';

import { onboardingRoute } from './routes/onboarding.js';
import { lobbyRoute } from './routes/lobby.js';
import { settingsRoute } from './routes/settings.js';

import chatSocket from './sockets.js';

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

app.use('/', onboardingRoute);
app.use('/lobby', lobbyRoute);
app.use('/set', settingsRoute);

io.on("connection", (socket) => {
    chatSocket(io, socket);
});

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const roomCode = socket.handshake.auth.roomCode;
    const avatarUrl = socket.handshake.auth.avatarUrl;
    const isAdmin = socket.handshake.auth.isAdmin ?? false;

    if (!username) {
        return next(new Error("no username"));
    }
    if (!roomCode) {
        return next(new Error("no roomcode"));
    }

    socket.username = username;
    socket.roomCode = roomCode;
    socket.avatarUrl = avatarUrl;
    socket.isAdmin = isAdmin;

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