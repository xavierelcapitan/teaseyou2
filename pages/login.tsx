import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); // Réinitialiser l'erreur
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Connexion réussie');
      router.push('/'); // Rediriger vers la page d'accueil
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      setError('Houston, nous avons un problème ! Veuillez réessayer.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Veuillez entrer votre email d\'abord');
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
      setError('');
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      setError('Erreur lors de l\'envoi de l\'email. Vérifiez votre adresse email.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white w-full">
      <img src="/login-screen.png" alt="Logo" className="mb-4 w-4/5" />
      <h1 className="text-4xl font-bold text-center text-[#FF5F6D] mb-2 mt-10">TeaseYou</h1>
      <p className="text-center font-bold text-[#22172A] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Rencontrez. Autrement. Soyez vrai.
      </p>
      <form className="w-full max-w-sm px-4 mt-20" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white"></label>
          <input
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm focus:outline-none focus:ring-[#FF5F6D] focus:border-[#FF5F6D] placeholder-white text-center"
            placeholder="Email"
            style={{ backgroundColor: '#E63946', color: 'white' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            pattern="^[^@\s]+@[^@\s]+\.[^@\s]+$"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm focus:outline-none focus:ring-[#FF5F6D] focus:border-[#FF5F6D] placeholder-white text-center"
            placeholder="Mot de passe"
            style={{ backgroundColor: '#D4AF37', color: 'white' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        {message && (
          <p className="text-green-600 text-center mb-4">{message}</p>
        )}
        <div className="flex justify-center">
          <button
            type="submit"
            className="py-2 px-4 bg-[#FF5F6D] text-white rounded-3xl shadow hover:bg-[#D4AF37] transition duration-300 mt-5">
            Se connecter
          </button>
        </div>
        
        {/* Liens sous le formulaire */}
        <div className="mt-6 text-center space-y-3">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-[#FF5F6D] hover:text-[#E54B5B] text-sm font-medium underline"
          >
            Mot de passe oublié ?
          </button>
          
          <div className="text-gray-400">ou</div>
          
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="block w-full py-2 px-4 bg-[#D4AF37] text-white rounded-3xl shadow hover:bg-[#B8941F] transition duration-300"
          >
            S'inscrire à la béta
          </button>
        </div>
      </form>
      
      <p className="text-center font-light text-[#777676] mt-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Rejoignez la béta avec le code secret !
      </p>
    </div>
  );
};

export default LoginPage;