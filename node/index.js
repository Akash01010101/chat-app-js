const fs = require("fs");  
const path = require("path");  
const io = require("socket.io")(8000, {  
    cors: {  
        origin: "*",  
        methods: ["GET", "POST"],  
        allowedHeaders: "*",  
        credentials: false,  
    },  
});
function loadChatHistory() {  
    const filePath = path.join(__dirname, "chatHistory.json");  
    if (fs.existsSync(filePath)) {  
        const data = fs.readFileSync(filePath, "utf8");  
        return JSON.parse(data);  
    }  
    return [];  
}
function saveChatMessage(message) {  
    const filePath = path.join(__dirname, "chatHistory.json");  
    const chatHistory = loadChatHistory();  
    chatHistory.push(message);  
    fs.writeFileSync(filePath, JSON.stringify(chatHistory, null, 2));  
}  
io.on("connection", (socket) => {  
    console.log("New user connected"); 
    const chatHistory = loadChatHistory();  
    socket.emit("load-chat-history", chatHistory);  
    socket.on("user-joined", (name) => {  
        socket.username = name; 
        console.log(`${name} has joined`);  
    }); 
    socket.on("msg-send", (msg) => {  
        const messageData = {  
            name: socket.username || "Anonymous",  
            message: msg,  
            timestamp: new Date(),  
        };  
        saveChatMessage(messageData); 
        socket.broadcast.emit("recieve", messageData); 
    });
    socket.on("disconnect", () => {  
        console.log(`${socket.username} has disconnected`);  
    });  
});