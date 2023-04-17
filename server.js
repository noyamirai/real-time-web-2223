import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import index from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 9000;

app.locals.fs = fs;

// SET TEMPLATE ENGINE
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use('/public', express.static(__dirname + '/public/'));

app.use('/', index);

app.get('*', (req, res) => {

    res.render('layout', {
        'view': '404',
        'bodyClass': 'error',
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});