const express = require("express");
const { is } = require("express/lib/request");
const app = express()
const fs = require("fs")
const path = require('path')
const PORT = 3000;
app.use(express.static("static"))

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

let players = [],
    playing = -1,
    time = 0

// Player state
// 0 - awaiting players
// 1 - ready to play
// 2 - playing
// 3 - awaiting move confirm
// 4 - move sync pending

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})

app.route("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
})

app.post("/login", function (req, res) {
    let color = players.length
    let name = req.body.login

    if (players.map(p => p.name).includes(name)) {
        // check if user exists
        res.send(JSON.stringify({ isPlayer: false, error: 1 }));
    } else if (color < 2) {
        // add player, assign color
        players.push(
            // player creation
            { name: name, color: color, state: 0, time: -1, move: null }
        )
        console.log(name, "joined")

        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({ isPlayer: true, color: color }));

        if (color == 1) {
            players.forEach(p => p.state = 1);
            playing = 0;
        }
    }
    else {
        // already have 2 players
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({ isPlayer: false, error: 0 }));
    }

    // error 0 : too many players
    // error 1 : username exists
})

app.post("/reset", function (req, res) {
    console.log("Reset players")
    players = []
    playing = -1;

    res.setHeader("content-type", 'application/json')
    res.send(JSON.stringify({}));
})

app.post("/update", function (req, res) {
    let p = players[req.body.isWhite ? 0 : 1];

    //console.log(req.body, p)
    if (p.state == 3) {
        // send move to sync
        console.log("Synced move with player", req.body.isWhite ? 0 : 1)

        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 3,
            move: (p.move),
            hasMove: playing == (!req.body.isWhite ? 0 : 1),
            time: time
        }));

        p.state = 2
    } else if (p.state == 2) {
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 2,
            time: time
        }));
    } else if (p.state == 1) {
        console.log("loaded player", req.body.isWhite ? 1 : 2)

        p.state = 2
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 1,
            time: time
        }));
    } else {
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 0,
            time: time
        }));
    }
})

app.post("/move", function (req, res) {
    console.log("Recieved move", req.body)

    let e = players[!req.body.isWhite ? 0 : 1];

    e.state = 3;
    e.move = req.body;

    playing = req.body.isWhite ?
        (req.body.isTaking ? 0 : 1) :
        (req.body.isTaking ? 1 : 0)

    res.setHeader("content-type", 'application/json')
    res.send(JSON.stringify({

    }));
})

app.post("/timereset", function(req,res){
    time = 0
    res.send(JSON.stringify({}))
})

setInterval(() => {
    time++
}, 1000)