// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Firebase Configuration
// Auth + Google Provider + Cloud Functions
// ═══════════════════════════════════════════════

import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    connectAuthEmulator,
} from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// ── Firebase config from env ──
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ── Initialize Firebase (singleton) ──
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ── Auth ──
export const auth = getAuth(app);

// ── Google Provider ──
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ── Cloud Functions (europe-west1) ──
export const functions = getFunctions(app, "europe-west1");

// ── Emulator support for local dev ──
if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_USE_EMULATORS === "true"
) {
    connectAuthEmulator(auth, "http://localhost:9099", {
        disableWarnings: true,
    });
    connectFunctionsEmulator(functions, "localhost", 5001);
}

export default app;
