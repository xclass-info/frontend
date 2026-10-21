// Firebase is used for Authentication only - all data, files and email go
// through our own backend (src/api.js).
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqpiDMssuavUdJGXUkxvow_8pP67KvUY8",
  authDomain: "xclass-3e2f3.firebaseapp.com",
  projectId: "xclass-3e2f3",
  appId: "1:260626133175:web:adfe6e09b32cadf3f0dd32",
};

export const firebaseAuth = getAuth(initializeApp(firebaseConfig));
