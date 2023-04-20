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

export { settingsRoute };