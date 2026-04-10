/*
 * Firebase Configuration
 *
 * Replace the placeholder values below with your Firebase project config.
 * To find your config:
 *   1. Go to https://console.firebase.google.com
 *   2. Select your project
 *   3. Click the gear icon > Project settings
 *   4. Scroll to "Your apps" > Web app
 *   5. Copy the config object
 */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let db, auth, storage;
let firebaseReady = false;

function isFirebaseConfigured() {
    return !firebaseConfig.apiKey.startsWith('YOUR_');
}

if (isFirebaseConfigured()) {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        storage = firebase.storage();
        firebaseReady = true;
    } catch (e) {
        console.warn('Firebase initialization failed:', e.message);
    }
} else {
    console.warn(
        'Firebase not configured. Replace placeholder values in assets/js/firebase-config.js\n' +
        'The site will work with static defaults until Firebase is set up.'
    );
}
