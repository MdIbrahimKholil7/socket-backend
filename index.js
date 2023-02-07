require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express()
app.use(express.json())
app.use(cors())
const PORT = process.env.PORT || 5000

let users = []

// for checking 
app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Success',
        status: true
    })
})


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

const io = require("socket.io")(server, {cors: {origin: "*"}});

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

        const active = activeUser(data.receiverId)
        if (active !== undefined) {
            socket.to(active.socketId).emit('sendTypingInputMsg', data)
        }
    })
    socket.on('disconnect', () => {
        removeUser(socket.id)
    })


    // calling 
    socket.emit("me", socket.id);
    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded")
    });

    socket.on("callUser", ({ userToCall, signalData, from, name }) => {

        io.to(userToCall).emit("callUsers", { signal: signalData, from, name });
    });

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal)
    });
})


