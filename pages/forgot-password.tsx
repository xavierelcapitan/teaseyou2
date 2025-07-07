import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Header from '../components/Header';

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      setLoading(false);
      return;
    }

    try {
      console.log('Envoi email de réinitialisation pour:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('Email envoyé avec succès');
      
      setMessage(
        'Email de réinitialisation envoyé ! ' +
        'Vérifiez votre boîte mail (et vos spams) puis cliquez sur le lien pour définir votre nouveau mot de passe.'
      );
      
      // Redirection automatique vers login après 5 secondes
      setTimeout(() => {
        router.push('/login');
      }, 5000);

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      
      // Gestion spécifique des erreurs Firebase
      if (error.code === 'auth/user-not-found') {
        setError('Aucun compte trouvé avec cette adresse email.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Adresse email invalide.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Veuillez attendre avant de réessayer.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Erreur de connexion. Vérifiez votre connexion internet.');
      } else {
        setError(`Erreur: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header title="Mot de passe oublié" />
      
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#FF5F6D] mb-2">
              Réinitialiser votre mot de passe
            </h2>
            <p className="text-gray-600 text-sm">
              Entrez votre email pour recevoir un lien de réinitialisation
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

          <form onSubmit={handleResetPassword} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5F6D] text-white py-2 px-4 rounded-md hover:bg-[#E54B5B] focus:outline-none focus:ring-2 focus:ring-[#FF5F6D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous vous souvenez de votre mot de passe ?{' '}
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
              1. Entrez votre adresse email<br />
              2. Cliquez sur "Envoyer le lien"<br />
              3. Vérifiez votre email (et les spams)<br />
              4. Cliquez sur le lien dans l'email<br />
              5. Définissez votre nouveau mot de passe<br />
              6. Connectez-vous avec votre nouveau mot de passe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 