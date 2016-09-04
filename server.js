//Express server and socket.io initialization
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
  socket.on('room', function(room){
    socket.join(room);
    socket.room = room;
    socket.on('chat message', function(msgArray){
      io.in(room).emit('chat message', msgArray);
    });
    socket.on('p1 answer', function(choice){
      io.in(room).emit('p1 answer', choice);
    });
    socket.on('p2 answer', function(choice){
      io.in(room).emit('p2 answer', choice);
    });
  });
});

http.listen(port, function(){
  console.log('listening on *:'+port);
});