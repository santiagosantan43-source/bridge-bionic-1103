
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
const firebaseConfig = {
   apiKey: "AIzaSyDdWgvOqokCGt0aY1vJBHva_i1SUfuRyYY",
  authDomain: "bridged-bionics.firebaseapp.com",
  projectId: "bridged-bionics",
  storageBucket: "bridged-bionics.firebasestorage.app",
  messagingSenderId: "1016685467822",
  appId: "1:1016685467822:web:9434f178bfabb66f891aa",
  measurementId: "G-M6Bf2TN16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);



export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email, password, name) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credential.user, {
    displayName: name
  });

  return credential;
}


export function logout() {
  return signOut(auth);
}

export function onUserStateChanged(callback) {
  return onAuthStateChanged(auth, callback);
}

export { auth };
