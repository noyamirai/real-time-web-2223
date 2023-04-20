import express from 'express';
import RoomController from '../controllers/RoomController.js';
const onboardingRoute = express.Router();

let username;
const roomController = new RoomController();

onboardingRoute.get('/', (req, res) => {

    let type = 'join-game';

    if (req.query && req.query.type) {
        type = req.query.type;
    }

    res.render('layout', {
        'view': 'index',
        'toggleType': type,
        'bodyClass': 'onboarding'
    });
});

onboardingRoute.post("/", (req, res) => {
    const postData = req.body;

    // Switching tabs in case JS doesn't work for whatever reason
    if (postData.toggle) {
        res.redirect("/?type=" + postData.toggle);
        return;
    }

    // Room creation
    if (postData.form_type == 'create') {
        req.session.room_code = roomController.getRoomCode();

    // Joining a game by room code
    } else if (postData.form_type == 'join' && postData.room_code != '') {
        const doesCodeExist = roomController.doesRoomCodeExist(postData.room_code);

        // Room doesnt exist!! 
        // TODO: error handling
        if (!doesCodeExist) {
            res.redirect('/?m=error');
            return;
        }

        // Room exists -> save code
        req.session.room_code = postData.room_code;

    // Something else went wrong
    } else {
        res.redirect('/');
        return;
    }

    req.session.username = postData.username;
    res.redirect("/lobby");
});

onboardingRoute.get('/user', (req, res) => {
    req.session.connected = req.session.loggedIn ?? false;

    const resultObj  = {
        connected: req.session.connected, 
        username: req.session.username,
        room_code: req.session.room_code
    }

    req.session.loggedIn = true;

    res.send(resultObj);
});

export { onboardingRoute };