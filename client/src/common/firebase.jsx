import { initializeApp } from "firebase/app";
import {GoogleAuthProvider, getAuth, signInWithPopup} from 'firebase/auth'
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUrPp4PFqAIqarWw_W5ASRTRls4Hl-eH0",
  authDomain: "react-blogging-52b70.firebaseapp.com",
  projectId: "react-blogging-52b70",
  storageBucket: "react-blogging-52b70.appspot.com",
  messagingSenderId: "551502308053",
  appId: "1:551502308053:web:3b942ba7096bc6f555b85c"
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider()

const auth = getAuth()

export const authWithGoogle = async() =>{
    let user = null;
    await signInWithPopup(auth, provider).then((result) =>{
        user = result.user
    }).catch((err)=>
    {
        console.log(err)
    })
    return user;
}