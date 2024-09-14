const express = require("express");  
const http = require("http");  
const socketIo = require("socket.io");  
const cors = require("cors");  
const fs = require("fs");  

const app = express();  
const server = http.createServer(app);  
const io = socketIo(server, {  
    cors: {  
        origin: "http://192.168.0.106:5500",  
        methods: ["GET", "POST"],  
        allowedHeaders: ["my-custom-header"],  
        credentials: true,  
    },  
});  
 
const messageFilePath = "messages.json";  

let chatHistory = [];  

if (fs.existsSync(messageFilePath)) {  
    const rawData = fs.readFileSync(messageFilePath);  
    chatHistory = JSON.parse(rawData);  
}  
io.on("connection", (socket) => {  
    let userName;  
    const tempMessages = []; 
    socket.emit("load-chat-history", chatHistory);  
    socket.on("user-joined", (name) => {  
        userName = name;  
        socket.broadcast.emit("user-joined1", userName);  
    });  
    socket.on("msg-send", (msg) => {  
        const messageData = { name: userName, message: msg };  
        tempMessages.push(messageData);
        socket.broadcast.emit("recieve", messageData);  
    });  
    socket.on("disconnect", () => {  
        chatHistory.push(...tempMessages);  
        saveMessages(); 
    });  
});  
 
function saveMessages() {  
    fs.writeFileSync(messageFilePath, JSON.stringify(chatHistory, null, 4));  
}  

server.listen(8000, () => {  
    console.log("Server is listening on port 8000");  
});