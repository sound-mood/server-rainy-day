'use strict';
const cors = require('cors');
const fs = require('fs');
const express = require('express');
const pg = require('pg');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const connectionString = 'postgres://localhost:5432/soundmood';
const client = new pg.Client(connectionString);
client.connect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/test', (req, res) => res.send('hello world'));

app.get('/api/v1/songs', (req, res) => {
    console.log('get songs from api');
    client.query(`SELECT * FROM songs;`)
        .then(results => {
            res.send(results.rows);
        })
        .catch(err => {
            console.error('get error', err);
        })
})

app.get('/api/v1/ambiance', (req, res) => {
    console.log('get ambiance from api');
    client.query(`SELECT * FROM ambiance;`)
        .then(results => {
            res.send(results.rows);
        })
        .catch(err => {
            console.error('get error', err);
        })
})

app.get('/api/v1/videos', (req, res) => {
    console.log('get videos from api');
    client.query(`SELECT * FROM videos;`)
        .then(results => {
            res.send(results.rows);
        })
        .catch(err => {
            console.error('get error', err);
        })
})

app.get('/api/v1/playlists', (req, res) => {
    console.log('get playlists from api');
    client.query(`SELECT * FROM playlists;`)
        .then(results => {
            res.send(results.rows);
        })
        .catch(err => {
            console.error('get error', err);
        })
})

app.get('/api/v1/playlists', (req, res) => {
    console.log('get playlists from api');
    client.query(`SELECT * FROM playlists;`)
        .then(results => {
            console.log(results);
            res.send(results.rows);
        })
        .catch(err => {
            console.error('get error', err);
        })
})

app.get('/api/v1/users', (req, res) => {
    console.log('get users from api');
    client.query(`SELECT * FROM users;`)
        .then(results => {
            console.log(results);
            res.send(results.rows);
        })
        .catch(err => {
            console.error('get error', err);
        })
})

app.get('/api/v1/users/login', (req, res) => {
    console.log('get users from api');
    console.log(req.body.name);
    client.query(`SELECT * FROM users WHERE NAME = ${req.body.name};`)
        .then(results => {
            console.log(results);
            res.send(results.rows);
        })
        .catch(err => {
            console.error('get error', err);
        })
})


app.post('/api/v1/users', function (req, res) {
    client.query(`INSERT INTO users(name) VALUES($1);`,
        [req.body.name],
        function (err) {
            if (err) console.error(err);
            res.send('user added');
        }
    )
})

app.post('/api/v1/playlists', function (req, res) {
    client.query('INSERT INTO playlists(name, user_id) VALUES($1, $2) ON CONFLICT DO NOTHING',
        [req.body.name, req.body.user_id],
        function (err) {
            if (err) console.error(err);
            res.send('playlist added');
        }
    )
})

app.post('/api/v1/songs', function (req, res) {
    client.query(`
    INSERT INTO songs(name, artist, URI) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [req.body.name, req.body.artist, req.body.URI],
        function (err) {
            if (err) console.error(err);
            res.send('song added');
        }
    )
})

app.post('/api/v1/videos', function (req, res) {
    client.query(`
    INSERT INTO videos(name, URI) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [req.body.name, req.body.URI],
        function (err) {
            if (err) console.error(err);
            res.send('video added');
        }
    )
})

app.post('/api/v1/ambiance', function (req, res) {
    client.query(`
    INSERT INTO ambiance(name, URI, user_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [req.body.name, req.body.URI, req.body.user_id],
        function (err) {
            if (err) console.error(err);
            res.send(' ambiance added');
        }
    )
})

createUserTable();
createPlaylistTable();
createSongsTable();
createVideosTable();
createAmbianceTable();

function loadSongs() {
    fs.readFile('../client-rainy-day/data/songs.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
            client.query(
                'INSERT INTO songs(name, artist, URI, playlist_id) VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                [ele.name, ele.artist, ele.URI, ele.playlist_id]
            )
                .catch(console.error);
        })
    })
}

function loadUsers() {
    fs.readFile('../client-rainy-day/data/users.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
            client.query(
                'INSERT INTO users(name) VALUES($1) ON CONFLICT DO NOTHING',
                [ele.name]
            )
                .catch(console.error);
        })
    })
}

function createUserTable() {
    client.query(`
    CREATE TABLE IF NOT EXISTS users(
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(40) UNIQUE
    );`
    )
        .then(function (response) {
            console.log('created user table in db!');
        })
        .then(loadUsers)
}



function createSongsTable() {
    client.query(`
    CREATE TABLE IF NOT EXISTS songs(
      song_id SERIAL PRIMARY KEY,
      name VARCHAR(40),
      artist VARCHAR(40),
      URI VARCHAR(40),
      playlist_id INTEGER REFERENCES playlists(playlist_id)
    );`
    )
        .then(function (response) {
            console.log('created songs table in db!!!!');
        })
        .then(loadSongs)
}

function loadVideos() {
    fs.readFile('../client-rainy-day/data/videos.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
            client.query(
                'INSERT INTO videos(name, URI, user_id) VALUES($1, $2, $3) ON CONFLICT DO NOTHING',
                [ele.name, ele.URI, ele.user_id]
            )
                .catch(console.error);
        })
    })
}

function createVideosTable() {
    client.query(`
    CREATE TABLE IF NOT EXISTS videos(
      video_id SERIAL PRIMARY KEY,
      name VARCHAR(40),
      URI VARCHAR(40),
      user_id INTEGER REFERENCES users(user_id)
    );`
    )
        .then(function (response) {
            console.log('created video table in db!!!!');
        })
        .then(loadVideos)
}

function loadAmbiance() {
    fs.readFile('../client-rainy-day/data/ambiance.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
            client.query(
                'INSERT INTO ambiance(name, URI, user_id) VALUES($1, $2, $3) ON CONFLICT DO NOTHING',
                [ele.name, ele.URI, ele.user_id]
            )
                .catch(console.error);
        })
    })
}



function loadPlaylist() {
    fs.readFile('../client-rainy-day/data/playlist.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
            client.query(
                'INSERT INTO playlists(name, ambiance_id, video_id, user_id) VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                [ele.name, ele.ambiance_id, ele.video_id, ele.user_id]
            )
                .catch(console.error);
        })
    })
}








function loadVideos() {
    fs.readFile('../client-rainy-day/data/videos.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
            client.query(
                'INSERT INTO videos(name, URI, user_id) VALUES($1, $2, $3) ON CONFLICT DO NOTHING',
                [ele.name, ele.URI, ele.user_id]
            )
                .catch(console.error);
        })
    })
}



function loadAmbiance() {
    fs.readFile('../client-rainy-day/data/ambiance.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
            client.query(
                'INSERT INTO ambiance(name, URI, user_id) VALUES($1, $2, $3) ON CONFLICT DO NOTHING',
                [ele.name, ele.URI, ele.user_id]
            )
                .catch(console.error);
        })
    })
}

function createAmbianceTable() {
    client.query(`
    CREATE TABLE IF NOT EXISTS ambiance(
      ambiance_id SERIAL PRIMARY KEY,
      name VARCHAR(40),
      URI VARCHAR(60),
      user_id INTEGER REFERENCES users(user_id)
    );`
    )
        .then(function (response) {
            console.log('created ambiance table in db!!!!');
        })
        .then(loadAmbiance)
}

function loadPlaylist() {
    fs.readFile('../client-rainy-day/data/playlist.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
            client.query(
                'INSERT INTO playlists(name, ambiance_id, video_id, user_id) VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                [ele.name, ele.ambiance_id, ele.video_id, ele.user_id]
            )
                .catch(console.error);
        })
    })
}

function createPlaylistTable() {
    client.query(`
    CREATE TABLE IF NOT EXISTS playlists(
      playlist_id SERIAL PRIMARY KEY,
      name VARCHAR(40),
      ambiance_id INTEGER,
      video_id INTEGER,
      user_id INTEGER REFERENCES users(user_id)
    );`
    )
        .then(function (response) {
            console.log('created playlist table in db!!!!');
        })
        .then(loadPlaylist)
}



app.listen(PORT, () => {
    console.log(`currently listening on ${PORT}`);
});
