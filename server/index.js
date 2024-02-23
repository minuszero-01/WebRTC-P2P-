// Server Logic here

const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const io = new Server({
  cors: true,
});
const app = express();

app.use(bodyParser.json());

const emailToSocketMapping = new Map(); // Bascially Mapping the emailID with their specific SocketID
const socketToEmailidMapping = new Map();
io.on("connection", (socket) => {
  console.log("New Connection", socket.id);
  socket.on("join-room", (data) => {
    const { roomId, emailId } = data; // when new user joined give me their emailID and roomID
    console.log("User", emailId, "Joined Room", roomId);
    emailToSocketMapping.set(emailId, socket.id);
    socketToEmailidMapping.set(socket.id, emailId);
    io.to(roomId).emit("user-joined", { emailId, id: socket.id }); //Tell everyone that user with this email has joined
    socket.join(roomId);
    io.to(socket.id).emit("joined-room", data);
  });

  socket.on("call-user", (data) => {
    const { to, offer } = data;
    io.to(to).emit("incoming-call", { from: socket.id, offer });
  });

  socket.on("call-accepted", (data) => {
    const { to, ans } = data;
    io.to(to).emit("call-accepted", { from: socket.id, ans });
  });

  socket.on("peer-nego", ({ to, offer }) => {
    io.to(to).emit("peer-nego", { from: socket.id, offer });
  });

  socket.on("peer-nego-done", ({ to, ans }) => {
    io.to(to).emit("peer-nego-final", { from: socket.id, ans });
  });
});
app.listen(8000, () => console.log("Express Server listening on PORT 8000"));
io.listen(8001);
