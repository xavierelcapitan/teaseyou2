import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Header from '../components/Header';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [betaCode, setBetaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const BETA_CODE = 'teaseyoubeta777';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Vérification du code béta
    if (betaCode !== BETA_CODE) {
      setError('Code de sécurité béta test incorrect');
      setLoading(false);
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      setLoading(false);
      return;
    }

    try {
      // Créer un mot de passe temporaire aléatoire
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
      
      // Créer l'utilisateur avec Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
      const user = userCredential.user;

      // Créer le profil utilisateur dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        betaTester: true,
        profileComplete: false,
        firstName: '',
        age: '',
        city: '',
        gender: '',
        relationshipType: '',
        partnerGender: '',
        partnerAgeRange: { min: 18, max: 99 },
        bio: '',
        interests: [],
        imageURL: '',
        completionPercentage: 0
      });

      // Envoyer un email de réinitialisation de mot de passe
      await sendPasswordResetEmail(auth, email);

      setMessage(
        'Inscription réussie ! Un email de réinitialisation de mot de passe vous a été envoyé. ' +
        'Veuillez cliquer sur le lien dans l\'email pour définir votre mot de passe, puis vous connecter.'
      );

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà utilisée');
      } else if (error.code === 'auth/invalid-email') {
        setError('Adresse email invalide');
      } else if (error.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible');
      } else {
        setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header title="Inscription Béta" />
      
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#FF5F6D] mb-2">
              Rejoignez la Béta !
            </h2>
            <p className="text-gray-600 text-sm">
              Inscrivez-vous pour tester TeaseYou en avant-première
            </p>
          </div>

          {message && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5F6D] focus:border-transparent"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code de sécurité béta test
              </label>
              <input
                type="text"
                value={betaCode}
                onChange={(e) => setBetaCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5F6D] focus:border-transparent"
                placeholder="Entrez le code béta"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Demandez le code à l'équipe TeaseYou
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5F6D] text-white py-2 px-4 rounded-md hover:bg-[#E54B5B] focus:outline-none focus:ring-2 focus:ring-[#FF5F6D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Déjà inscrit ?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-[#FF5F6D] hover:text-[#E54B5B] font-medium"
              >
                Se connecter
              </button>
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Comment ça marche :</strong><br />
              1. Entrez votre email et le code béta<br />
              2. Cliquez sur "S'inscrire"<br />
              3. Vérifiez votre email et cliquez sur "Réinitialiser le mot de passe"<br />
              4. Définissez votre mot de passe<br />
              5. Connectez-vous avec votre email et nouveau mot de passe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 