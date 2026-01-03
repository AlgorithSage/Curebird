import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyB6phfALFUYNvEhF3BkVwuHK4OeocV-IEo",
    authDomain: "curebird-535e5.firebaseapp.com",
    projectId: "curebird-535e5",
    storageBucket: "curebird-535e5.firebasestorage.app",
    messagingSenderId: "325018733204",
    appId: "1:325018733204:web:8b10b21d92afe506e1c281"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const appId = firebaseConfig.appId;

export default app;
