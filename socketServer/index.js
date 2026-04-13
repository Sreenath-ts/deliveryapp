// import express from "express"
// import http from "http"
// import dotenv from "dotenv"
// import { Server } from "socket.io"
// import axios from "axios"

// dotenv.config()
// const app=express()
// app.use(express.json())
// const server=http.createServer(app)
// const port=process.env.PORT || 5001

// const io=new Server(server,{
//     cors:{
//         origin:process.env.NEXT_BASE_URL
//     }
// })

// io.on("connection",(socket)=>{

//    socket.on("identity",async (userId)=>{
    
//     await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`,{userId,socketId:socket.id})
//    }) 

//    socket.on("update-location",async ({userId,latitude,longitude})=>{
//     const location={
//         type:"Point",
//         coordinates:[longitude,latitude]
//     }
//     await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`,{userId,location})
//      io.emit("update-deliveryBoy-location",{userId,location})
//    })

//    socket.on("join-room",(roomId)=>{
//     console.log("join room with",roomId)
//     socket.join(roomId)
//    })

//   socket.on("send-message",async (message)=>{
//     console.log(message)
//     await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`,message)
//     io.to(message.roomId).emit("send-message",message)
//   })
  
//     socket.on("disconnect",()=>{
// console.log("user disconnected",socket.id)
//     })

// })


// app.post("/notify",(req,res)=>{
//     const {event,data,socketId}=req.body
//     if(socketId){
//         io.to(socketId).emit(event,data)
//     }else{
//         io.emit(event,data)
//     }

//     return res.status(200).json({"success":true})
// })



// server.listen(port,()=>{
//     console.log("server started at",port)
// })



import express from "express"
import http from "http"
import dotenv from "dotenv"
import { Server } from "socket.io"
import axios from "axios"

dotenv.config()

const app = express()
app.use(express.json())

const server = http.createServer(app)
const port = process.env.PORT || 5001

console.log("NEXT_BASE_URL =", process.env.NEXT_BASE_URL)
console.log("PORT =", process.env.PORT)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

io.on("connection", (socket) => {
  console.log("socket connected", socket.id)

  socket.on("identity", async (userId) => {
    try {
      if (!process.env.NEXT_BASE_URL) {
        console.log("NEXT_BASE_URL is missing in socketServer/.env")
        return
      }

      await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`, {
        userId,
        socketId: socket.id
      })
    } catch (error) {
      console.log("identity error", error?.message || error)
    }
  })

  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    try {
      if (!process.env.NEXT_BASE_URL) {
        console.log("NEXT_BASE_URL is missing in socketServer/.env")
        return
      }

      const location = {
        type: "Point",
        coordinates: [longitude, latitude]
      }

      await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`, {
        userId,
        location
      })

      io.emit("update-deliveryBoy-location", { userId, location })
    } catch (error) {
      console.log("update-location error", error?.message || error)
    }
  })

  socket.on("join-room", (roomId) => {
    console.log("join room with", roomId)
    socket.join(roomId)
  })

  socket.on("send-message", async (message) => {
    try {
      if (!process.env.NEXT_BASE_URL) {
        console.log("NEXT_BASE_URL is missing in socketServer/.env")
        return
      }

      await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`, message)
      io.to(message.roomId).emit("send-message", message)
    } catch (error) {
      console.log("send-message error", error?.message || error)
    }
  })

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id)
  })
})

app.get("/", (_req, res) => {
  res.status(200).send("Socket server running")
})

app.post("/notify", (req, res) => {
  const { event, data, socketId } = req.body

  if (socketId) {
    io.to(socketId).emit(event, data)
  } else {
    io.emit(event, data)
  }

  return res.status(200).json({ success: true })
})

server.listen(port, () => {
  console.log("server started at", port)
})