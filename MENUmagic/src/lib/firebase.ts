// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator} from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwCRg7WOC5GVdw6--OoP4Xkd2CPCMJyRs",
  authDomain: "webapp-63cf1.firebaseapp.com",
  databaseURL: "https://webapp-63cf1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webapp-63cf1",
  storageBucket: "webapp-63cf1.appspot.com",
  messagingSenderId: "129823687581",
  appId: "1:129823687581:web:9fd5132f27f189feb9e574",
  measurementId: "G-LG6BGSYF3W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app);
// const storageRef = ref(storage);

// connectFirestoreEmulator(db, '127.0.0.1', 9080)
// connectAuthEmulator(auth, 'http://127.0.0.1:9099')
export {
    db,
    auth,
    storage,
    // storageRef
}