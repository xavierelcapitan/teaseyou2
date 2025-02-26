import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    getAnalytics(app);
  });
}

// Fonction pour s'inscrire
const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), { email: user.email });
    console.log('Utilisateur créé et email enregistré:', user.email);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
  }
};

// Fonction pour se connecter
const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in:', userCredential.user);
  } catch (error) {
    console.error('Error signing in:', error);
  }
};

// Fonction pour ajouter ou mettre à jour les informations utilisateur
const saveUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'users', userId), profileData, { merge: true });
    console.log('Profil utilisateur mis à jour');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
  }
};

const handleSaveProfile = async () => {
  if (user) {
    try {
      console.log('Tentative d\'enregistrement du profil:', profileData);
      await saveUserProfile(user.uid, profileData);
      console.log('Profil enregistré avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du profil:', error);
    }
  }
};

export { app, auth, db, storage, saveUserProfile, signUp, signIn }; 