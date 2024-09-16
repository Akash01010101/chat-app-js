const express = require("express");  
const http = require("http");  
const socketIo = require("socket.io");  
const cors = require("cors");  
const fs = require("fs");  
const path = require("path");  

const app = express();  
const server = http.createServer(app);  
app.use(express.static(path.join(__dirname, '../front')));  

app.get('/home', (req, res) => {  
    res.send('<h1>Welcome to the Home Page!</h1><p>This is a simple route added to the Express server.</p>');  
});  

const io = socketIo(server, {  
    cors: {  
        origin: "*",  
        methods: ["GET", "POST"],  
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Custom-Header'],  
        credentials: true,  
    },  
}); 
const messageFilePath = "messages.json";  
let chatHistory = [];  
let currentUsers = [];
if (fs.existsSync(messageFilePath)) {  
    const rawData = fs.readFileSync(messageFilePath);  
    chatHistory = JSON.parse(rawData);  
}  
let number = 0;
let bufferedMessages = [];  

io.on("connection", (socket) => {  
    let userName;  
    socket.on("user-joined", (name) => { 
        if(currentUsers.includes(name)){
            const err = "already exists"
            socket.emit("error",err)
        }
      else {
        userName = name.trim();  
        console.log("connect ",userName)
        currentUsers.push(name)
        socket.emit("load-chat-history", chatHistory,bufferedMessages);   
        number++
        socket.broadcast.emit("user-joined1", userName);
      }  
    });  
    socket.on("msg-send", (msg) => {  
        if(userName) { 
            const messageData = { name: userName, message: msg };
            bufferedMessages.push(messageData);   
            socket.broadcast.emit("recieve", messageData); 
         } else { 
            socket.emit("userNameerr")
          }
         
    });  
    socket.on("disconnect", () => {   
        number--
        currentUsers = currentUsers.filter( x => x !== userName)
        saveMessages();  
        console.log("disconnect",userName)
    });  
    
});  
function saveMessages() { 
    if (number == 0){
        try {  
            chatHistory = chatHistory.concat(bufferedMessages);  
            fs.writeFileSync(messageFilePath, JSON.stringify(chatHistory, null, 4));  
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
server.listen(process.env.PORT || 8000, () => {  
    console.log("Server is listening on port 8000");  
});  