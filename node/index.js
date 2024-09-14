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
let number = 0;
let bufferedMessages = [];  

io.on("connection", (socket) => {  
    let userName;  
    socket.emit("load-chat-history", chatHistory,bufferedMessages);  
    socket.on("user-joined", (name) => {  
        userName = name;  
        number++
        socket.broadcast.emit("user-joined1", userName);  
    });  
    socket.on("msg-send", (msg) => {  
        const messageData = { name: userName, message: msg };  
        bufferedMessages.push(messageData);   
        socket.broadcast.emit("recieve", messageData);  
    });  
    socket.on("disconnect", () => {   
        number--
        saveMessages();
    });  
});  
function saveMessages() {  
    if (number == 0){
        try {  
            chatHistory = chatHistory.concat(bufferedMessages);  
            fs.writeFileSync(messageFilePath, JSON.stringify(chatHistory, null, 4));  
            console.log("Messages saved successfully.");  
    
            bufferedMessages = [];  
        } catch (error) {  
            console.error("Error saving messages:", error);    
        }
    }  else { return }
}  
process.on('SIGINT', () => {  
    saveMessages(); 
    process.exit();  
});  
server.listen(8000, () => {  
    console.log("Server is listening on port 8000");  
});