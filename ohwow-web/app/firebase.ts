import { initializeApp } from 'firebase/app';
import { getAuth, getIdToken, signInAnonymously } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB-VCaFC-HOTVdj13HKbhlEZnwKbLzM_Q8",
    authDomain: "ohwow-enterprise.firebaseapp.com",
    projectId: "ohwow-enterprise",
    storageBucket: "ohwow-enterprise.appspot.com",
    messagingSenderId: "993242464078",
    appId: "1:993242464078:web:cb63e897bdf08a33cce81f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const authenticateAnonymously = async () => {
    try {
        await signInAnonymously(auth);
        if (auth.currentUser) {
            return await getIdToken(auth.currentUser, true);
        }
        return null;
    } catch (error) {
        console.error("Error signing in anonymously:", error);
    }
};

export default app;
