const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");
 
const server = express();
const WebSocket = require("ws");

const port = process.env.PORT || 8000;

const io = new WebSocket.Server({ port: port });

server.use(helmet());
server.use(express.json());

server.use(
  cors({
    origin: function(origin, callback) {
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true
  })
);
 
let players = [];
let currentPlayerId = 0;

randomRange = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; 
}

io.on("connection", socket => {
  spawn = randomRange(0, 100);
  socket.send(JSON.stringify({ message: "newid", id: currentPlayerId,  spawn: spawn}));
  players.push({
    id: currentPlayerId,
    socket: socket,
    time: new Date()
  });

  currentPlayerId++;

  disconnectPlayer = (player) =>
  {
    for (let i = 0; i < players.length; i++) {
      if (players[i].socket.readyState === 1)
        players[i].socket.send(JSON.stringify({message:'playerdisconnect', id: player.id}));
    }
  }
  socket.on("message", function(data) {
   
      let message = JSON.parse(data);
 
      if (message.message === 'killplayer'){
        spawn = randomRange(0, 100);
 
        for (let i = 0; i < players.length; i++) {
          players[i].socket.send(JSON.stringify({ message:'respawn', spawn: spawn, id: message.id}));
        }
      }

      for (let i = 0; i < players.length; i++) {
          if (data.id !== players[i].id && players[i].socket.readyState === 1)
            players[i].socket.send(data);
                  
      }

      for (let i = 0; i < players.length; i++) {
        if (players[i].socket.readyState === 3){
          disconnectPlayer(players[i]);
        }
      }
      
      players = players.filter((player) => { return player.socket.readyState === 1} );
  });
});

module.exports = io;
