const express = require('express')
const app = express()
const server = require('http').Server(app, { transports: 'websocket' })
const io = require('socket.io')(server)
const rooms = {}

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const rooms = { }

app.use(function(req, res, next) {
  if ((req.get('X-Forwarded-Proto') !== 'https')) {
    res.redirect('https://' + req.get('Host') + req.url);
  } else
    next();
});

app.get('/', (req, res) => {
	res.render('index', { rooms: rooms })
})

app.post('/room', (req, res) => {
	console.log(rooms)
	if (rooms[req.body.room] != null) {
		return res.redirect('/')
	}
	rooms[req.body.room] = { users: {} }
	res.redirect(req.body.room)
	// Send message that new room was created
	io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
	if (rooms[req.params.room] == null) {
		return res.redirect('/')
	}
	res.render('room', { roomName: req.params.room })
})

server.listen(3001)

io.on('connection', socket => {
	socket.on('new-user', (room, name) => {
		socket.join(room)
		rooms[room].users[socket.id] = name
		socket.to(room).broadcast.emit('user-connected', name)
	})

	if (true) {
		console.log('we are logged in');

		socket.on('send-chat-message', (room, message) => {
			socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
			// error here
		})

	} else {
		console.log('no one here');
	}
	socket.on('disconnect', (reason) => {
		console.log(reason)
		getUserRooms(socket).forEach(room => {
			socket.to(room).broadcast.emit(reason, rooms[room].users[socket.id])

			socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
			// delete rooms[room].users[socket.id]
		})
	})
})

function getUserRooms(socket) {
	return Object.entries(rooms).reduce((names, [name, room]) => {
		if (room.users[socket.id] != null) names.push(name)
		return names
	}, [])
}

io.on('disconnect', function() {
	socket.socket.reconnect();
})