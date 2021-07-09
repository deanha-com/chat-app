const socket = io('http://localhost:3001')
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
      appendMessage(`${message} <span class='ts'>${getCurrentTime()}</span>`, socket.id)
      socket.emit('send-chat-message', roomName, message)
      messageInput.value = ''
      document.getElementById("message-input").focus();
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
  appendMessage(`<span>${data.name}</span><span class='user-socketid'>(${socket.id})</span>: ${data.message} <span class='ts'>${getCurrentTime()}</span>`)
  window.scrollTo(0,document.body.scrollHeight)
  document.getElementById("message-input").focus();
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`, null, 'joined')
  return Promise.resolve("Dummy response - User Connected")
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`, null, 'exited')
  return Promise.resolve("Dummy response - User Disconnected")
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
  messageElement.innerHTML = message
  messageContainer.append(messageElement)
  window.scrollTo(0,document.body.scrollHeight); // Scroll down 
}

function addZero(i) {
	if (i < 10) {
	  i = "0" + i;
	}
	return i;
  }

function getCurrentTime() {
	var d = new Date();
	var h = addZero(d.getHours());
	var m = addZero(d.getMinutes());
	var suffix = '';
	if (h >= 12) {
	 suffix = 'pm'
	} else {
	suffix = 'am'
	}
	return h + ":" + m + suffix;
  }