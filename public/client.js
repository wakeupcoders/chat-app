const socket = io();

let myName = "";
let currentChat = "group"; // 'group' or username

const loginDiv = document.getElementById("loginDiv");
const chatDiv = document.getElementById("chatDiv");
const nameInput = document.getElementById("nameInput");
const joinBtn = document.getElementById("joinBtn");

const userList = document.getElementById("userList");
const groupChatBtn = document.getElementById("groupChatBtn");
const chatTitle = document.getElementById("chatTitle");

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

joinBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) return alert("Enter a name");
  myName = name;
  socket.emit("join", name);
  loginDiv.classList.add("hidden");
  chatDiv.classList.remove("hidden");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  if (currentChat === "group") {
    socket.emit("group message", text);
  } else {
    socket.emit("private message", { to: currentChat, text });
  }
  input.value = "";
});

socket.on("chat message", (msg) => {
  addMessage(msg, msg.username === myName ? "mine" : "theirs");
});

socket.on("private message", (msg) => {
  const sender = msg.self ? msg.to : msg.from;
  if (currentChat !== sender) {
    addNotification(`${sender} sent you a message`);
  }
  addMessage(
    { username: msg.from, text: msg.text },
    msg.self ? "mine" : "theirs"
  );
});

socket.on("user list", (users) => {
  userList.innerHTML = "";
  users
    .filter((u) => u !== myName)
    .forEach((u) => {
      const li = document.createElement("li");
      li.textContent = u;
      li.onclick = () => openPrivateChat(u);
      userList.appendChild(li);
    });
});

groupChatBtn.addEventListener("click", () => {
  openGroupChat();
});

function openPrivateChat(user) {
  currentChat = user;
  chatTitle.textContent = `Chat with ${user} 💬`;
  messages.innerHTML = "";
}

function openGroupChat() {
  currentChat = "group";
  chatTitle.textContent = "Group Chat 🌍";
  messages.innerHTML = "";
}

function addMessage(msg, type) {
  const li = document.createElement("li");
  li.className = type === "mine" ? "my-msg" : "other-msg";
  li.innerHTML = `
    <div class="bubble ${type === "mine" ? "mine" : "theirs"}">
      ${msg.system ? msg.text : `<strong>${msg.username}:</strong> ${msg.text}`}
    </div>`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function addNotification(text) {
  const li = document.createElement("li");
  li.className = "system-msg";
  li.textContent = text;
  messages.appendChild(li);
}
