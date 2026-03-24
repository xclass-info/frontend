import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoS-qeCJKM5Oc_XvXIwS3doMlW8Qs7ZEI",
  authDomain: "happy-programming-933fc.firebaseapp.com",
  projectId: "happy-programming-933fc",
  storageBucket: "happy-programming-933fc.firebasestorage.app",
  messagingSenderId: "748065796741",
  appId: "1:748065796741:web:95c33ad2fa3d702faf6fec",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
