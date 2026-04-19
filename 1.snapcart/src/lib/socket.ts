import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:5001"

    console.log("Connecting socket to:", socketUrl)

    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true
    })
  }

  return socket
}