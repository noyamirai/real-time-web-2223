import express from 'express';
const lobbyRoute = express.Router();

lobbyRoute.get('/', (req, res) => {

    if (!req.session.username || !req.session.room_code) {
        res.redirect('/');
        return;
    }

    res.render('layout', {
        'view': 'lobby',
        'roomCode': req.session.room_code,
        'bodyClass': 'lobby'
    });
})

export {lobbyRoute };