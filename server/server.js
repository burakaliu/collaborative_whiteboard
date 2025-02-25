// Collaborative Whiteboard Tech Demo
// This is a simple prototype for a collaborative whiteboard using HTML5 Canvas and WebSockets
// to demonstrate real-time drawing functionality.

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (frontend)
app.use(express.static("public"));

// Store drawing data (optional, could be expanded for persistence)
let drawingData = [];

io.on("connection", (socket) => {
    console.log("A user connected");
    
    // Send existing drawing data to new users
    socket.emit("load_canvas", drawingData);

    // Handle drawing events from clients
    socket.on("draw", (data) => {
        drawingData.push(data);
        socket.broadcast.emit("draw", data); // Send drawing data to all users except sender
    });

    socket.on("clear", () => {
        drawingData = [];
        io.emit("clear"); // Clear the canvas for all users
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
