const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
  res.render('index.html');
});

const users = {}
let messages = [];

io.on('connection', socket => { 
  console.log(`Socket conectado ${socket.id}`);

  socket.on('newUser', name => {
    console.log('newuser: ' + name);
    users[socket.id] = name
    socket.broadcast.emit('userConnected', name);
  });


  socket.emit('previousMessages', messages); 

  socket.on('sendMessage', data => { 
    messages.push(data);
    socket.broadcast.emit('receivedMessage', data);
    console.log(data); 
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('userDisconnected', users[socket.id])
    delete users[socket.id]
  });
});

server.listen(3000);