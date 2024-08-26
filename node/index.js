const port = process.env.PORT || 8000;
const io = require("socket.io")(port, {  
    cors: {  
        origin: "*", // Allow requests from any origin  
        methods: ["GET", "POST"], // Allowed HTTP methods  
        allowedHeaders: "*", // Allow all headers  
        credentials: false 
    }  
});  

const users = {};  

io.on("connection", socket => {  
    socket.on("user-joined", name => {  
        console.log("new user",name) 
        users[socket.id] = name;  
        socket.broadcast.emit('user-joined1', name);  
    });  

    socket.on("msg-send", message => {  
        socket.broadcast.emit("recieve", { message: message, name: users[socket.id] });  
    });  
});