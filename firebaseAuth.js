import { auth } from './firebase.js';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";


// Auth state observer
export function observeAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// Sign in anonymously
export async function signInAnon() {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log("Signed in anon:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Anon signin error:", error);
    throw error;
  }
}

// Sign out
export async function logout() {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Signout error:", error);
  }
}
