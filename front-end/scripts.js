import { db, auth } from '../firebase.js'; 
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { signInAnonymously } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

// Ensure authentication
auth.onAuthStateChanged(user => {
  if (!user) {
    signInAnonymously(auth).catch(console.error);
  }
});

// ------------------- MESSAGE APPENDING -------------------

function appendMessage(type, text, docId = null) {
  const row = document.createElement("div");

  if (type === "user-message") {
    row.className = "row user";
    const avatar = createAvatar("../images/avatar.png");
    const bubble = createBubble("bubble user", text);
    row.appendChild(avatar);
    row.appendChild(bubble);
  } 
  else if (type === "bot-message") {
    row.className = "row";
    const avatar = createAvatar("../images/chatbot_logo.jpg");
    const bubble = createBubble("bubble bot", text);
    row.appendChild(avatar);
    row.appendChild(bubble);
  } 
  else if (type === "bot-text") {
    row.className = "row";
    const bubble = document.createElement("div");
    bubble.style.fontSize = "14px";
    bubble.style.color = "#333";
    bubble.style.padding = "6px 0";
    bubble.textContent = text;
    row.appendChild(bubble);
  }

 // Add Edit/Delete icons if docId exists
if (docId) {
  const iconContainer = document.createElement("div");
  iconContainer.style.marginLeft = "10px";

  //  Add: helper function to show action text
  function showActionText(message) {
    const textEl = document.createElement("span");
    textEl.textContent = message;
    textEl.style.marginLeft = "6px";
    textEl.style.fontSize = "12px";
    textEl.style.color = "#555";
    textEl.style.fontStyle = "italic";

    iconContainer.appendChild(textEl);
    setTimeout(() => textEl.remove(), 1500); // disappears after 1.5s
  }

  if (type === "user-message") {
    const editIcon = createIcon("../images/pencil.png", async () => {
      //Show text when edit is clicked
      showActionText("Edit");

      const newText = prompt("Edit your message:", text);
      if (newText?.trim()) {
        try {
          await updateMessage(docId, newText);

          const bubble = row.querySelector(".bubble");
          if (bubble) bubble.textContent = newText;

          //  Regenerate new bot response based on edited text
          const res = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: newText })
          });

          const data = await res.json();
          const botDocId = await createMessage('bot', data.reply);
          appendMessage("bot-message", data.reply, botDocId);

        } catch (e) {
          console.error("Error handling message edit:", e);
        }
      }
    });

    // ✅ Add hover tooltip for Edit
    addHoverTooltip(editIcon, "Edit");

    iconContainer.appendChild(editIcon);
  }

  const deleteIcon = createIcon("../images/delete.png", async () => {
    //  Show text when delete is clicked
    showActionText("Delete");

    if (confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(docId);
      row.remove();
    }
  });

  // ✅ Add hover tooltip for Delete
  addHoverTooltip(deleteIcon, "Delete");

  iconContainer.appendChild(deleteIcon);

  row.appendChild(iconContainer);
}

  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ------------------- HELPER FUNCTIONS -------------------

function createAvatar(src) {
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  const img = document.createElement("img");
  img.src = src;
  img.alt = "avatar";
  img.style.width = "32px";
  img.style.height = "32px";
  img.style.borderRadius = "50%";
  avatar.appendChild(img);
  return avatar;
}

function createBubble(className, text) {
  const bubble = document.createElement("div");
  bubble.className = className;
  bubble.textContent = text;
  return bubble;
}

function createIcon(src, onClick) {
  const icon = document.createElement("img");
  icon.src = src;
  icon.alt = "icon";
  icon.style.width = "18px";
  icon.style.height = "18px";
  icon.style.cursor = "pointer";
  icon.style.marginRight = "10px";
  icon.style.borderRadius = "50%";
  icon.onclick = onClick;
  return icon;
}

// ------------------- ADD / REPLACE THIS addHoverTooltip FUNCTION -------------------
function addHoverTooltip(icon, message) {
  // create tooltip element and style it
  const tooltip = document.createElement('div');
  tooltip.textContent = message;
  Object.assign(tooltip.style, {
    position: 'fixed',
    background: '#333',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',    // allows clicks to pass through to the icon
    opacity: '0',
    transition: 'opacity 0.12s ease',
    zIndex: '10000',
    transform: 'translateY(0)',
  });

  // append to body so position calculations are stable
  document.body.appendChild(tooltip);

  let showTimer = null;

  function positionTooltip(rect) {
    // prefer above the icon; if not enough space, place below
    const margin = 8;
    let left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
    // constrain horizontally
    left = Math.max(6, Math.min(left, window.innerWidth - tooltip.offsetWidth - 6));

    let top = rect.top - tooltip.offsetHeight - margin;
    if (top < 6) top = rect.bottom + margin; // place below if not enough space above

    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
  }

  // show after a very short delay (prevents flicker on quick mouse moves)
  function show() {
    const rect = icon.getBoundingClientRect();
    positionTooltip(rect);
    tooltip.style.opacity = '1';
  }

  function hide() {
    clearTimeout(showTimer);
    tooltip.style.opacity = '0';
  }

  icon.addEventListener('mouseenter', () => {
    clearTimeout(showTimer);
    // small delay so accidental passes don't show it immediately
    showTimer = setTimeout(show, 80);
  });

  icon.addEventListener('mouseleave', () => {
    clearTimeout(showTimer);
    hide();
  });

  // show on mousedown too (user is about to click)
  icon.addEventListener('mousedown', () => {
    clearTimeout(showTimer);
    show(); // immediate show when user presses mouse button
  });

  // hide on mouseup (after click)
  icon.addEventListener('mouseup', () => {
    // keep briefly visible, then hide
    setTimeout(hide, 200);
  });

  // keep tooltip positioned if window scrolls or resizes while visible
  window.addEventListener('scroll', () => {
    if (tooltip.style.opacity === '1') {
      const rect = icon.getBoundingClientRect();
      positionTooltip(rect);
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (tooltip.style.opacity === '1') {
      const rect = icon.getBoundingClientRect();
      positionTooltip(rect);
    }
  });
}


// ------------------- INITIAL BOT MESSAGE -------------------

appendMessage(
  "bot-message",
  "Hello! I'm Theo, your municipality assistant."
);

// ------------------- FORM SUBMISSION -------------------

chatForm.addEventListener("submit", async e => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";

  try {
    const userDocId = await createMessage('user', text);
    appendMessage("user-message", text, userDocId);

    // Removed "processing your query" temporary message

    const res = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    const botDocId = await createMessage('bot', data.reply);
    appendMessage("bot-message", data.reply, botDocId);

  } catch (e) {
    console.error("Message save error:", e);
    appendMessage("bot-message", "Sorry, I could not get a response from the server.");
  }
});

// ------------------- FIREBASE CRUD OPERATIONS -------------------

async function createMessage(type, text) {
  try {
    const docRef = await addDoc(collection(db, "THEOmessages"), {
      type,
      text,
      timestamp: new Date(),
      userId: auth.currentUser?.uid
    });
    console.log("Document written with ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document:", e);
  }
}

async function readMessages() {
  try {
    const snapshot = await getDocs(collection(db, "THEOmessages"));
    const messages = [];
    snapshot.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
    console.log("Messages:", messages);
    return messages;
  } catch (e) {
    console.error("Error reading documents:", e);
  }
}

async function updateMessage(docId, newText) {
  try {
    const docRef = doc(db, "THEOmessages", docId);
    await updateDoc(docRef, { text: newText, timestamp: new Date() });
    console.log("Document updated:", docId);
  } catch (e) {
    console.error("Error updating document:", e);
  }
}

async function deleteMessage(docId) {
  try {
    const docRef = doc(db, "THEOmessages", docId);
    await deleteDoc(docRef);
    console.log("Document deleted:", docId);
  } catch (e) {
    console.error("Error deleting document:", e);
  }
}
