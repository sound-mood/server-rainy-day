'use strict';
const cors = require('cors');
const fs = require('fs');
const express = require('express');
const pg = require('pg');
// const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const connectionString = 'postgres://localhost:5432/soundmood';
const client = new pg.Client(connectionString);
client.connect();
app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// THIS IS A TEST

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
            console.log(results);
            res.send(results.rows);
        })
        .catch(err => {
            console.error('get error', err);
        })
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
        name VARCHAR(30)
    );`
    )
        .then(function(response){
            console.log('created user table in db!');
        })
        .then(loadUsers)
    }
    
    

function createSongsTable() {
    client.query(`
    CREATE TABLE IF NOT EXISTS songs(
      song_id SERIAL PRIMARY KEY,
      name VARCHAR(30),
      artist VARCHAR(20),
      URI VARCHAR(15),
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
      name VARCHAR(30),
      URI VARCHAR(15),
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

function createAmbianceTable() {
    client.query(`
    CREATE TABLE IF NOT EXISTS ambiance(
      ambiance_id SERIAL PRIMARY KEY,
      name VARCHAR(30),
      URI VARCHAR(15),
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
      name VARCHAR(30),
      ambiance_id INTEGER,
      video_id INTEGER,
      user_id INTEGER REFERENCES users(user_id)
    );`
    )
        .then(function (response) {
            console.log('created ambiance table in db!!!!');
        })
        .then(loadPlaylist)
}



app.listen(PORT, () => {
    console.log(`currently listening on ${PORT}`);
});
