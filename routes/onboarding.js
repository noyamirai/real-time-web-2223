import express from 'express';
import RoomController from '../controllers/RoomController.js';
import MessageController from '../controllers/MessageController.js';
const onboardingRoute = express.Router();

const roomController = new RoomController();
const errorMessageController = new MessageController();

onboardingRoute.get('/', (req, res) => {

    const endpoint = "https://api.dicebear.com/6.x/bottts-neutral/svg?seed=";
    const randomImages = [];

    let type = 'join-game';
    let error = false;
    let errorMessage = '';

    if (req.query && req.query.type)
        type = req.query.type;

    if (req.query && req.query.m) {
        error = true;   
        errorMessage = errorMessageController.getErrorMessage(req.query.m);
    }

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
        'bodyClass': 'onboarding',
        'error': error,
        'errorMessage': errorMessage 
    });
});

onboardingRoute.get('/exit', (req, res) => {
    req.session.destroy();
    res.redirect('/');
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

    // No data for room join
    } else if (postData.form_type == 'join' && postData.username == '' && postData.room_code == '') {
        res.redirect('/?m=no_info');
        return;

    // Joining a game by room code
    } else if (postData.form_type == 'join') {

        // no username
        if (postData.username == '') {
            res.redirect('/?m=no_username');
            return;
        }

        // no room code
        if (postData.roomCode == '') {
            res.redirect('/?m=no_room');
            return;
        }

        const doesCodeExist = roomController.doesRoomCodeExist(postData.room_code);
        if (!doesCodeExist) {
            res.redirect('/?m=no_room');
            return;
        }

        // Room exists -> save code
        req.session.room_code = postData.room_code;

    // room create but no username
    } else if (postData.username == '') {
        res.redirect('/?m=no_username');
        return;

    // Something else went wrong
    } else {
        res.redirect('/?m=error');
        return;
    }

    // SAVE DATA IN SESSION

    req.session.avatar_url = postData.avatar;
    req.session.username = postData.username;

    if (!req.session.users) {
        req.session.users = {};
    }

    const sessionId = uniqid();

    req.session.users[sessionId] = {
        express_session_id: sessionId, 
        connected: false, 
        username: req.session.username,
        room_code: req.session.room_code,
        avatar_url: req.session.avatar_url,
        loggedIn: false
    }

    res.redirect(`/lobby?esi=${sessionId}`);
});

// Providing session data to client
onboardingRoute.get('/user/:esi', (req, res) => {
    const sessionId = req.params.esi;

    req.session.users[sessionId].connected = req.session.users[sessionId].loggedIn ? true : false;

    const resultObj = req.session.users[sessionId];
    req.session.users[sessionId].loggedIn = true;

    res.send(resultObj);
});

// ChatGPT slay
function uniqid(prefix = "", random = false) {
    const sec = Date.now() * 1000 + Math.random() * 1000;
    const id = sec.toString(16).replace(/\./g, "").padEnd(14, "0");
    return `${prefix}${id}${random ? `.${Math.trunc(Math.random() * 100000000)}`:""}`;
};

export { onboardingRoute };