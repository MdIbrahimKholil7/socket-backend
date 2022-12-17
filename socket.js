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
const server=app.listen(PORT,()=>{
    console.log('socket server is running on port ',PORT)
})

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });
  
io.on('connection', (socket) => {
    console.log('user is connected')
    socket.on('add-user',(id)=>{
        console.log(id)
    })
})