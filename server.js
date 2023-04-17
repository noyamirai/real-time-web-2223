import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import index from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 9000;

import { Server } from "socket.io";
const io = new Server(server);

app.locals.fs = fs;

// SET TEMPLATE ENGINE
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use('/public', express.static(__dirname + '/public/'));

app.use('/', index);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('message', (msg) => {
    console.log('message: ' + msg);
    io.emit('message', msg);
  });

});

io.on('disconnect', () => {

    console.log('user disconnected');
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