
// ✅ Use modular CDN imports instead of compat
import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import { getFirestore, collection } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase config
export const firebaseConfig = {
  apiKey: "AIzaSyDnLDVOy9zp5G2rPpBI8-l7YSKeqoNLQyU",
  authDomain: "llm-chatbot-db.firebaseapp.com",
  projectId: "llm-chatbot-db",
  storageBucket: "llm-chatbot-db.firebasestorage.app",
  messagingSenderId: "260690230624",
  appId: "1:260690230624:web:b87e2c52568ad9de967205",
  measurementId: "G-BE97CNMRJT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore instance
const db = getFirestore(app);

// ✅ Export collections using modular syntax
const Chats = collection(db, "Chats");

export { db, Chats };
