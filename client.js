const socket = io("http://192.168.0.106:8000");  

const msgcontainer = document.querySelector(".msgs");  
const form = document.getElementById("send-form");  
const msginp = document.getElementById("mesginp");  
const nform = document.getElementById("n-form");  
const name1 = document.getElementById("name");  

// Function to append messages to the message container  
function appendmsg(message, pos) {  
  const msg_element = document.createElement("div");  
  msg_element.innerText = message;  
  msg_element.classList.add("msg");  
  msg_element.classList.add(pos);  
  msgcontainer.append(msg_element);  
}  

// Listener for loading chat history  
socket.on("load-chat-history", (chatHistory) => {  
  chatHistory.forEach((data) => {  
    appendmsg(`${data.name}: ${data.message}`, "inc-left");  
  });  
});  

// Handling the user joining event  
nform.addEventListener("submit", (e) => {  
  console.log("Name Form Submitted");  
  e.preventDefault(); // Prevent page refresh  
  const name = name1.value;  

  socket.emit("user-joined", name); // Emit user joined event  
  console.log("User Joined: ", name); // Log the name  

  socket.on("user-joined1", (name) => {  
    appendmsg(`${name} has joined`, "inc-left");  
  });  

  document.getElementById("before").style.display = "none";  
  document.getElementById("after").style.display = "block";  
});  

// Handle receiving messages  
socket.on("recieve", (data) => {  
  appendmsg(`${data.name}: ${data.message}`, "inc-left");  
});  

// Handling message sending  
form.addEventListener("submit", (e) => {  
  console.log("Send Form Submitted");  
  e.preventDefault(); // Prevent page refresh  
  const msg = msginp.value.trim(); // Get and trim the message input  

  console.log("Message Input: ", msg); // Log the input  

  if (msg) {  
    appendmsg(`${msg}`, "out-right"); // Append sent message to chat  
    socket.emit("msg-send", msg); // Send message to the server  
    msginp.value = ""; // Clear the input field  
  }  
});