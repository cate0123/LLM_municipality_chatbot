import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import { getFirestore } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { getAuth } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { firebaseConfig } from './firebase_Config.js';

let db, auth;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase init error:", error);
}

// ✅ Export so other files can import
export { db, auth };
