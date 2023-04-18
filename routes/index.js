import express from 'express';
const route = express.Router();

let username;

route.get('/', (req, res) => {
    res.render('layout', {
        'view': 'index',
        'bodyClass': 'onboarding'
    });
});
route.post("/", (req, res) => {
  const postData = req.body;
    req.session.username = postData.username;

  res.redirect("/lobby");
});

route.get('/username', (req, res) => {
    req.session.connected = req.session.loggedIn ?? false;

    const resultObj  = {
        connected: req.session.connected, 
        username: req.session.username
    }

    req.session.loggedIn = true;

    res.send(resultObj);
});

route.get('/lobby', (req, res) => {

    if (!req.session.username) {
        res.redirect('/');
        return;
    }

    res.render('layout', {
        'view': 'lobby',
        'bodyClass': 'lobby'
    });
})

export {route, username };