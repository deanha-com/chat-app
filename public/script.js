const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

if (messageForm != null) {
  const name = prompt('What is your name?')
  appendMessage('You joined as ' + name, socket.id, 'joined')
  socket.emit('new-user', roomName, name)

  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value

    if ( message != '' ) { // send message if input is not empty
      appendMessage(`${message}`, socket.id)
      socket.emit('send-chat-message', roomName, message)
      messageInput.value = ''
    }
  })
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
  appendMessage(`${data.name + socket.id} : ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`, null, 'joined')
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`, null, 'exited')
})

function appendMessage(message, userid, cssClass) {
  const messageElement = document.createElement('p')
  messageElement.className = 'msg'
  if (userid != null ) {
    messageElement.classList.add('outgoing-msg')
  } else {
    messageElement.classList.add('incoming-msg')
  }
  if (cssClass != null ) {
    messageElement.classList.add(cssClass)
  }
  messageElement.innerText = message
  messageContainer.append(messageElement)
}