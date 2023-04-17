import express from 'express';
const app = express.Router();

app.get('/', async (req, res) => {
    res.render('layout', {
        'view': 'index',
    });
});

export default app;