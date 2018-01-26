'use strict';
const cors = require('cors');
const fs = require('fs');
const express = require('express');
const pg = require('pg');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT;
const connectionString = process.env.DATABASE_URL;
const client = new pg.Client(connectionString);
client.connect();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/test', (req, res) => res.send('hello world'));

app.listen(PORT, () => {
    console.log(`currently listening on ${PORT}`);
});

app.get('*', (req, res) => {
    res.sendFile('index.html', { root: '../client-rainy-day' })
})