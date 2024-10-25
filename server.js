// var express = require('express');
// const { Server } = require('socket.io');
// var app = express();
// app.use(express.static(__dirname + '/public'));

// var http = require('http').createServer(app);
// // var io = require('socket.io')(http, {allowEIO3: true, allowEIO4: true, serveClient: true});

// var io = require('socket.io')(http, {
//   allowEIO3: true,
//   allowEIO4: true,
//   serveClient: true,
//   cors: { origin: '*'}
// });

// http.listen(3000, function(){ console.log('listening on *:3000');});

// var serverID = 'undefined';
// io.on('connection', function (socket){
//     console.log('a user connected: ' + socket.id + " (server: " + serverID + " )");
//     //register the server id, received the command from unity
//     socket.on('RegServerId', function (data){
//         serverID = socket.id;
//         console.log('reg server id : ' + serverID);
//     });

//     socket.on('disconnect', function(){
//         if (serverID == socket.id)
//         {
//            serverID = 'undefined';
//            console.log('removed Server: ' + socket.id);
//         }
//         else
//         {
//            console.log('user disconnected: ' + socket.id);
//         }
//     });

//     socket.on('OnReceiveData', function (data){
//         if (serverID != 'undefined')
//         {
//             switch(data.EmitType)
//             {
//                 //emit type: all;
//                 case 0: io.emit('OnReceiveData', { DataString: data.DataString, DataByte: data.DataByte }); break;
//                 //emit type: server;
//                 case 1: io.to(serverID).emit('OnReceiveData', { DataString: data.DataString, DataByte: data.DataByte }); break;
//                 //emit type: others;
//                 case 2: socket.broadcast.emit('OnReceiveData', { DataString: data.DataString, DataByte: data.DataByte }); break;
//             }
//         }
//         else
//         {
//             console.log('cannot find any active server');
//         }
//     });
// });
const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  allowEIO3: true,
  allowEIO4: true,
  serveClient: true,
  cors: { origin: '*' }
});

app.use(express.static(__dirname + '/public'));

let serverID = 'undefined';
io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id + " (server: " + serverID + " )");

  socket.on('RegServerId', (data) => {
    serverID = socket.id;
    console.log('reg server id : ' + serverID);
  });

  socket.on('disconnect', () => {
    if (serverID == socket.id) {
      serverID = 'undefined';
      console.log('removed Server: ' + socket.id);
    } else {
      console.log('user disconnected: ' + socket.id);
    }
  });

  socket.on('OnReceiveData', (data) => {
    if (serverID != 'undefined') {
      switch(data.EmitType) {
        case 0: io.emit('OnReceiveData', { DataString: data.DataString, DataByte: data.DataByte }); break;
        case 1: io.to(serverID).emit('OnReceiveData', { DataString: data.DataString, DataByte: data.DataByte }); break;
        case 2: socket.broadcast.emit('OnReceiveData', { DataString: data.DataString, DataByte: data.DataByte }); break;
      }
    } else {
      console.log('cannot find any active server');
    }
  });
});

module.exports = (req, res) => {
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");
    server.listen(3000, () => {
      console.log('listening on *:3000');
    });
    res.socket.server.io = io;
  }
  res.end();
};
