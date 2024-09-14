const socket = io("http://192.168.0.106:8000");  

const msgcontainer = document.querySelector(".msgs");  
const form = document.getElementById("send-form");  
const msginp = document.getElementById("mesginp");  
const nform = document.getElementById("n-form");  
const name1 = document.getElementById("name");  

function appendmsg(message, pos) {  
  const msg_element = document.createElement("div");  
  msg_element.innerText = message;  
  msg_element.classList.add("msg");  
  msg_element.classList.add(pos);  
  msgcontainer.append(msg_element);  
}  
socket.on("load-chat-history", (chatHistory,bufferedMessages) => {  
  chatHistory.forEach((data) => {  
    appendmsg(`${data.name}: ${data.message}`, "inc-left");  
  });  
  bufferedMessages.forEach((data)=>{
    appendmsg(`${data.name}: ${data.message}`, "inc-left");  
  })

});  
nform.addEventListener("submit", (e) => {  
  console.log("Name Form Submitted");  
  e.preventDefault(); 
  const name = name1.value;  
  socket.emit("user-joined", name); 
  console.log("User Joined: ", name); 

  socket.on("user-joined1", (name) => {  
    appendmsg(`${name} has joined`, "inc-left");  
  });  

  document.getElementById("before").style.display = "none";  
  document.getElementById("after").style.display = "block";  
});  

socket.on("recieve", (data) => {  
  appendmsg(`${data.name}: ${data.message}`, "inc-left");  
});  
 
form.addEventListener("submit", (e) => {  
  console.log("Send Form Submitted");  
  e.preventDefault(); // Prevent page refresh  
  const msg = msginp.value.trim(); // Get and trim the message input  
  if (msg) {  
    appendmsg(`${msg}`, "out-right"); // Append sent message to chat  
    socket.emit("msg-send", msg); // Send message to the server  
    msginp.value = ""; // Clear the input field  
  }  
});