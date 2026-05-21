import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAqpiDMssuavUdJGXUkxvow_8pP67KvUY8",
  authDomain: "xclass-3e2f3.firebaseapp.com",
  projectId: "xclass-3e2f3",
  storageBucket: "xclass-3e2f3.firebasestorage.app",
  messagingSenderId: "260626133175",
  appId: "1:260626133175:web:adfe6e09b32cadf3f0dd32",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
