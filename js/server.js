const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(express.static(__dirname + '/../public'))

let usersCount = 0

io.on('connection', (socket) => {
   console.log("Um cliente se conectou");
   usersCount++
   updateUsersCount()

   socket.on('username', (username) => {
      console.log('Received username:', username);
      socket.username = username
      console.log('Socket username:', socket.username);
   })

   socket.on('message', (message) => {
      io.emit('message', { username: socket.username, message: message, senderId: socket.id })
   })

   socket.on('typing', () => {
      socket.broadcast.emit('typing', { username: socket.username })
   })

   socket.on('stopTyping', () => {
      socket.broadcast.emit('stopTyping', { username: socket.username })
   })

   socket.on('disconnect', () => {
      console.log("Um cliente se desconectou");
      usersCount--
      updateUsersCount()
   })

   console.log("Conexão estabelecida com cliente", socket.id);
})

function updateUsersCount() {
   io.emit('usersCount', usersCount)
}

http.listen(3000, () => {
   console.log("O servidor está em execução em http://localhost:3000");
})