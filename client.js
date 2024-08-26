
const socket = io("http://localhost:8000");
const form = document.getElementById("send-form");
const msginp = document.getElementById("mesginp");
const msgcontainer = document.querySelector(".msgs");
const nform = document.getElementById("n-form");
const name1 = document.getElementById("name");
function appendmsg(messgae, pos){
    const msg_element = document.createElement("div");
      msg_element.innerText = messgae;
      msg_element.classList.add("msg")
      msg_element.classList.add(pos)
      msgcontainer.append(msg_element)
}
nform.addEventListener("submit",e =>{
    e.preventDefault();
    const name = name1.value;
    socket.emit("user-joined", name)
socket.on("user-joined1", name=>{
    appendmsg(`${name} has joined `, "inc-left")
})
    document.getElementById("before").style.display = "none";
    document.getElementById("after").style.display = "block";
})


socket.on("recieve",data=>{
    appendmsg(`${data.name}: ${data.message} `, "inc-left")
})
form.addEventListener("submit", e=>{
    e.preventDefault();
    const msg = msginp.value;
    appendmsg(`${msg}`,"out-right")
    socket.emit("msg-send",msg)
    msginp.value = '';
})