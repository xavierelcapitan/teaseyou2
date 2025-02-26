import React from 'react';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <main className="flex-grow">
        {children}
      </main>

      {/* Menu en bas */}
      {router.pathname !== '/login' && (
        <footer
          className="bg-white fixed bottom-4 left-4 right-4 rounded-full z-50"
          style={{
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)', // x = 0, y = 4, blur = 4
          }}
        >
          <nav className="flex justify-around p-3">
            <a href="/" className="flex flex-col items-center text-[#E63946] hover:text-[#D4AF37] active:text-[#D4AF37] transition duration-300">
              <span className="material-icons text-2xl">home</span>
              <span className="text-xs">Home</span>
            </a>
            <a href="/favorites" className="flex flex-col items-center text-[#E63946] hover:text-[#D4AF37] active:text-[#D4AF37] transition duration-300">
              <span className="material-icons text-2xl">favorite</span>
              <span className="text-xs">Favoris</span>
            </a>
            <a href="/explorer" className="flex flex-col items-center text-[#E63946] hover:text-[#D4AF37] active:text-[#D4AF37] transition duration-300">
              <span className="material-icons text-3xl">explore</span>
              <span className="text-xs">Explorer</span>
            </a>
            <a href="/matchs" className="flex flex-col items-center text-[#E63946] hover:text-[#D4AF37] active:text-[#D4AF37] transition duration-300">
              <span className="material-icons text-2xl">volunteer_activism</span>
              <span className="text-xs">Matchs</span>
            </a>
            <a href="/profile" className="flex flex-col items-center text-[#E63946] hover:text-[#D4AF37] active:text-[#D4AF37] transition duration-300">
              <span className="material-icons text-2xl">manage_accounts</span>
              <span className="text-xs">Profil</span>
            </a>
          </nav>
        </footer>
      )}
    </div>
  );
};

export default Layout; 