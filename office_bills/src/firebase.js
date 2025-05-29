import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyCMKxxo81PKWlrXww6-wn5MZEICSOnjogo",
  authDomain: "pntbills-7d437.firebaseapp.com",
  projectId: "pntbills-7d437",
  storageBucket: "pntbills-7d437.firebasestorage.app",
  messagingSenderId: "40589600348",
  appId: "1:40589600348:web:b9d5238b0bd3c12b996899",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 
