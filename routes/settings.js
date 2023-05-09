import express from 'express';
const settingsRoute = express.Router();

settingsRoute.post('/admin', (req, res) => {
    const adminUser = req.body.username;

    if (adminUser != req.session.username) {
        res.json({success: false});
        return;
    }

    req.session.isAdmin = true;
    res.json({success: true});
});

settingsRoute.post('/default-user', (req, res) => {
    const username = req.body.username;

    if (username != req.session.username) {
        res.json({success: false});
        return;
    }

    req.session.isAdmin = false;
    res.json({success: true});
});

export { settingsRoute };