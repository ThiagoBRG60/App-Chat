const socket = io();

const usersOnline = document.querySelector(".info p span");
const userTyping = document.querySelector(".userTyping")

socket.on("usersCount", (count) => {
  usersOnline.textContent = count;
});

const usernameInput = document.querySelector(".info input")
const messagesDiv = document.querySelector(".chatArea")
const messageInput = document.getElementById("messageInput")
const sendButton = document.querySelector('.sendInfo button')

let typing = false
let timeout = null

function scrollToBottom() {
   messagesDiv.scrollTop = messagesDiv.scrollHeight;
 }

usernameInput.addEventListener("keydown", (e) => {
   if (e.key === "Enter") {
      sendUsername()
   }
})

socket.on('username', (username) => {
   socket.username = username
})

function sendUsername() {
   const username = usernameInput.value.trim()

   if (username !== "") {
      socket.emit('username', username)
   }
}

sendButton.addEventListener("click", sendMessage)

messageInput.addEventListener("keyup", (e) => {
   if (e.key === "Enter") {
      sendMessage()
      clearTimeout(timeout)
      typing = false
      socket.emit('stopTyping')
   }else {
      if (messageInput.value != "") {
         if (!typing) {
            typing = true
            socket.emit('typing')
         }
      }else {
         clearTimeout(timeout)
         timeout = setTimeout(stopTyping, 2000)
      }
   }
})

function stopTyping() {
   typing = false
   socket.emit("stopTyping")
}

socket.on('message', (data) => {
   const messageElement = document.createElement("p")
   messageElement.textContent = `${data.senderId === socket.id && data.username === undefined ? "Você" : data.username !== undefined ? data.username : "Estranho"}: ${data.message}`
   messageElement.classList.add(data.senderId === socket.id ? 'sent' : 'stranger');
   messagesDiv.appendChild(messageElement)
   scrollToBottom()
})

socket.on('typing', () => {
   userTyping.classList.add("isTyping")
})

socket.on('stopTyping', () => {
   userTyping.classList.remove("isTyping")
})

function sendMessage() {
   const message = messageInput.value

   if (message.trim() !== "") {
      socket.emit('message', message)
      messageInput.value = ""
      clearTimeout(timeout)
      typing = false
      socket.emit('stopTyping')
   }
}

window.addEventListener('beforeunload', (e) => {
   const confirmationMessage = 'Você realmente quer sair? As alterações não salvas serão perdidas.';
   e.returnValue = confirmationMessage;
   return confirmationMessage; 
 });