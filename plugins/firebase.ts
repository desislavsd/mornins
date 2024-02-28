// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: 'AIzaSyBSxmaRADso4Apw3PU6VxrGy3SpMhpovnE',
  authDomain: 'mornins-com.firebaseapp.com',
  projectId: 'mornins-com',
  storageBucket: 'mornins-com.appspot.com',
  messagingSenderId: '232628906808',
  appId: '1:232628906808:web:a81dfe8e550b9a80d12fcd',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

export default defineNuxtPlugin(() => {})
