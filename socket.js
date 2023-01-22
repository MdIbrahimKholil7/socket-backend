require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express()
app.use(express.json())
app.use(cors())
const PORT = process.env.port || 5000
// const io = require('socket.io')(5000, {
//     cors: {
//         origin: '*',
//         method: ['POST', "GET"]
//     }
// });
// const io = require('socket.io');

let users = []

const addUser = (userId, socketId, user) => {

    const isUser = users.some(u => u.userId === userId)
    if (!isUser) {
        users.push({ userId, socketId, user })
    }

}

const removeUser = (id) => {
    users = users.filter(u => u.socketId !== id)
}

const activeUser = (id) => {

    const u = users.find(u => u.userId === id)
    return u
}

const server = app.listen(PORT, () => {
    console.log('socket server is running on port ', PORT)
})

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

io.on('connection', (socket) => {

    socket.on('add-user', (userId, user) => {
        addUser(userId, socket?.id, user)
        io.emit('getUser', users)

    })

    socket.on("sendMessage", (msg) => {
        const active = activeUser(msg.receiverId)
        if (active !== undefined) {
            socket.to(active.socketId).emit('sendMessageToUser', msg)
        }
    })
    socket.on('sendTypingInput', data => {
        console.log(data)
        const active = activeUser(data.receiverId)
        if (active !== undefined) {
            socket.to(active.socketId).emit('sendTypingInputMsg', data)
        }
    })
    socket.on('disconnect', () => {
        removeUser(socket.id)
    })
})


