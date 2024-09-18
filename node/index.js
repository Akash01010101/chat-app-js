const express = require("express");  
const session = require("express-session");  
const http = require("http");  
const socketIo = require("socket.io");  
const cors = require("cors");  
const fs = require("fs");  
const path = require("path");  

const app = express();  
const server = http.createServer(app);  
app.use(session({  
    secret: 'your_secret_key',  
    resave: false,  
    saveUninitialized: true,  
    cookie: { secure: false }
}));  

app.use(express.json());  
app.use(express.static(path.join(__dirname, '../front')));  

const userFilePath = "users.txt";  

const loadUsers = () => {  
    if (fs.existsSync(userFilePath)) {  
        const rawData = fs.readFileSync(userFilePath);  
        return JSON.parse(rawData);  
    }  
    return [];  
};  

const saveUsers = (users) => {  
    fs.writeFileSync(userFilePath, JSON.stringify(users, null, 4));  
};  

app.post('/signupuser', (req, res) => {  
    const { username, password } = req.body;  
    const users = loadUsers();  

    if (users.some(user => user.username === username)) {  
        return res.status(400).json({ error: "User already exists." });  
    }  

    users.push({ username, password });  
    saveUsers(users);  
    res.status(201).json({ message: "User created successfully." });  
});  

app.post('/login', (req, res) => {  
    const { username, password } = req.body;  
    const users = loadUsers();  

    const user = users.find(user => user.username === username && user.password === password);  
    if (user) {  
        req.session.user = { username: user.username };  
        return res.status(200).json({ message: "Login successful." });  
    } else {  
        return res.status(401).json({ error: "Invalid username or password." });  
    }  
});  

// Middleware to protect routes  
const isAuthenticated = (req, res, next) => {  
    if (req.session.user) {  
        next(); // User is authenticated, proceed to the requested route  
    } else {  
        res.redirect('/login'); // Redirect to the login page  
    }  
};  

// Serve index.html only if authenticated  
app.get('/index.html', isAuthenticated, (req, res) => {  
    res.sendFile(path.join(__dirname, '../front/index.html'));  
});  

// Serve the login page  
app.get('/login', (req, res) => {  
    res.sendFile(path.join(__dirname, '../front/login.html')); // Ensure you have a login.html page  
});  

// Logout route  
app.post('/logout', (req, res) => {  
    req.session.destroy(err => {  
        if (err) {  
            return res.status(500).json({ error: "Could not log out." });  
        }  
        res.redirect('/login'); // Redirect to login page after logout  
    });  
});  

// Socket.io setup  
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
        if (currentUsers.includes(name)) {  
            const err = "already exists";  
            socket.emit("error", err);  
        } else {  
            userName = name.trim();  
            console.log("connect ", userName);  
            currentUsers.push(name);  
            socket.emit("load-chat-history", chatHistory, bufferedMessages);  
            number++;  
            socket.broadcast.emit("user-joined1", userName);  
        }  
        if (name == undefined) {  
            socket.emit("error", err);  
        }  
    });  
    
    socket.on("msg-send", (msg) => {  
        if (userName == undefined) {  
            socket.emit("userNameerr");  
        } else {  
            console.log(msg);  
            const messageData = { name: userName, message: msg };  
            bufferedMessages.push(messageData);  
            socket.broadcast.emit("recieve", messageData);  
        }  
    });  
    
    socket.on("disconnect", () => {  
        number--;  
        currentUsers = currentUsers.filter(x => x !== userName);  
        saveMessages();  
        console.log("disconnect", userName);  
    });  
});  

function saveMessages() {  
    if (number == 0) {  
        try {  
            chatHistory = chatHistory.concat(bufferedMessages);  
            fs.writeFileSync(messageFilePath, JSON.stringify(chatHistory, null, 4));  
            bufferedMessages = [];  
        } catch (error) {  
            console.error("Error saving messages:", error);  
        }  
    } else { return }  
}  

process.on('SIGINT', () => {  
    saveMessages();  
    process.exit();  
});  

server.listen(process.env.PORT || 8000, "192.168.0.106", () => {  
    console.log("Server is listening on port 8000");  
});