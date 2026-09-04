import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey:
        "AIzaSyCWaQbWLteRDMiGcyTdfJanDiuSiPUFdeU",

    authDomain:
        "sataycelup-registration-af033.firebaseapp.com",

    projectId:
        "sataycelup-registration-af033",

    storageBucket:
        "sataycelup-registration-af033.firebasestorage.app",

    messagingSenderId:
        "485590570714",

    appId:
        "1:485590570714:web:d693b857a99e5bf821f7e3"

};


console.log(
    "🔥 FIREBASE CONFIG LOADED - VERSION 999"
);


const app =
    initializeApp(
        firebaseConfig
    );


export const auth =
    getAuth(app);


export const db =
    getFirestore(app);


export { app };
