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

    const endpoint = "https://api.dicebear.com/6.x/bottts-neutral/svg?seed=";
    const randomImages = [];

    for (let i = 0; i < 6; i++) {
        // generate a random name for the icon
        const name = Math.random().toString(36).substring(7);

        // build the URL for the random icon
        randomImages.push(endpoint + name);
    }

    res.render('layout', {
        'view': 'index',
        'toggleType': type,
        'randomAvatars': randomImages,
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

    console.log(postData);

    // Room creation
    if (postData.form_type == 'create') {
        req.session.room_code = roomController.getRoomCode();

    // Joining a game by room code
    } else if (postData.form_type == 'join' && postData.room_code != '') {
        if (postData.username == '') {
            res.redirect('/?m=no_username');
            return;
        }

        const doesCodeExist = roomController.doesRoomCodeExist(postData.room_code);

        // Room doesnt exist!! 
        // TODO: error handling
        if (!doesCodeExist) {
            res.redirect('/?m=no_room');
            return;
        }

        // Room exists -> save code
        req.session.room_code = postData.room_code;

    } else if (postData.username == '') {
        res.redirect('/?m=no_username');
        return;

    // Something else went wrong
    } else {
        res.redirect('/?m=error');
        return;
    }

    req.session.avatar_url = postData.avatar;
    req.session.username = postData.username;
    res.redirect("/lobby");
});

onboardingRoute.get('/user', (req, res) => {
    req.session.connected = req.session.loggedIn ?? false;

    const resultObj  = {
        connected: req.session.connected, 
        username: req.session.username,
        room_code: req.session.room_code,
        avatar_url: req.session.avatar_url
    }

    req.session.loggedIn = true;

    res.send(resultObj);
});

export { onboardingRoute };