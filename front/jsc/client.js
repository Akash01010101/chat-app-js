const socket = io(); 
const msgcontainer = document.querySelector(".msgs");
const form = document.getElementById("send-form");
const msginp = document.getElementById("mesginp");
const nform = document.getElementById("n-form");
const name1 = document.getElementById("name");
let currentPage = 'www';
let to ="www";
function appendmsg(message, pos) {
  const msg_element = document.createElement("div");
  msg_element.innerText = message;
  msg_element.classList.add("msg");
  msg_element.classList.add(pos);
  msgcontainer.append(msg_element);
}

window.onload = function(){
  document.getElementById("name").focus();
}

nform.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = name1.value.trim();
  socket.emit("user-joined", name);
  socket.on("load-chat-history", (chatHistory, bufferedMessages) => {
    chatHistory.forEach((data) => {
      if(data.to == currentPage){
        if (data.name == name) {
          appendmsg(`${data.message}`, "out-right");
        } else {
          appendmsg(`username: ${data.name} \n ${data.message}`, "inc-left");
        }
      }
    });
    bufferedMessages.forEach((data) => {
     if (data.to == currentPage){
      if (data.name == name) {
        appendmsg(` ${data.message}`, "out-right");
      } else {
        appendmsg(`user : ${data.name} \n ${data.message}`, "inc-left");
      }
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
  if (data.to == currentPage){
    appendmsg(`${data.name}: ${data.message}`, "inc-left");
  }
  msgcontainer.scrollTo(0, msgcontainer.scrollHeight);
});

form.addEventListener("submit", (e) => {
  e.preventDefault(); 
  const msg = msginp.value.trim(); 
  if (msg) {
    appendmsg(`${msg}`, "out-right"); 
    socket.emit("msg-send", {msg,to}); 
    msgcontainer.scrollTo(0, msgcontainer.scrollHeight);
    msginp.value = ""; 
  }
});
socket.on("error", (err) => {
  window.location.replace("err.html")
})
let src = document.getElementById("svg");
src.addEventListener("click",()=>{
  let sform = document.createElement("form")
  document.querySelector(".sv").appendChild(sform);
  sform.id = "userto";
  let searchuser = document.createElement("input");
  searchuser.id = "search";
  let sub = document.createElement("button");
  sform.appendChild(searchuser)
  sform.appendChild(sub)
  sub.textContent = "submit";
  sub.id = "priv";
  src.remove()
  let searchform = document.getElementById("userto");
searchform.addEventListener("submit",(e)=>{
  e.preventDefault()
  const valinp = document.getElementById("search");
  let cal = valinp.value;
  to = cal;
  currentPage = cal;
  socket.emit("change");
  rmmsg();
})
})
function rmmsg(){
  msgcontainer.innerHTML='';
}