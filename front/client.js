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

nform.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = name1.value.trim();
  socket.emit("user-joined", name);
  socket.on("load-chat-history", (chatHistory, bufferedMessages) => {
    chatHistory.forEach((data) => {
      if (data.name == name) {
        appendmsg(`${data.message}`, "out-right");
      } else {
        appendmsg(`username: ${data.name} \n ${data.message}`, "inc-left");
      }
    });
    bufferedMessages.forEach((data) => {
      if (data.name == name) {
        appendmsg(` ${data.message}`, "out-right");
      } else {
        appendmsg(`user : ${data.name} \n ${data.message}`, "inc-left");
      }
    });
    msgcontainer.scrollTo(0, msgcontainer.scrollHeight);
  });
  socket.on("user-joined1", (name) => {
    appendmsg(`${name} has joined`, "inc-left");
  });
  document.getElementById("before").style.display = "none";
  document.getElementById("after").style.display = "block";
});

socket.on("recieve", (data) => {
  appendmsg(`${data.name}: ${data.message}`, "inc-left");
  msgcontainer.scrollTo(0, msgcontainer.scrollHeight);
});

form.addEventListener("submit", (e) => {
  e.preventDefault(); 
  const msg = msginp.value.trim(); 
  if (msg) {
    appendmsg(`${msg}`, "out-right"); 
    socket.emit("msg-send", msg); 
    msgcontainer.scrollTo(0, msgcontainer.scrollHeight);
    msginp.value = ""; 
  }
});
socket.on("error", (err) => {
  window.location.replace("err.html")
})