import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAv4oXL_YqNBzo2v0zv4LZ924Ba4Fqe1ik",
  authDomain: "coopervision-diff.firebaseapp.com",
  databaseURL: "https://coopervision-diff-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "coopervision-diff",
  storageBucket: "coopervision-diff.firebasestorage.app",
  messagingSenderId: "48009854428",
  appId: "1:48009854428:web:687379fa010b1873086319",
  measurementId: "G-ST4CXSCZCD"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, get, onValue, remove };
