import React from 'react';
import { useRouter } from 'next/router';

interface HeaderProps {
  title: string;
  handleBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, handleBack }) => {
  const router = useRouter();

  const defaultBack = () => {
    router.push('/');
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <button onClick={handleBack || defaultBack} className="text-[#FF5F6D]">
        <span className="material-icons text-3xl">arrow_back_ios</span>
      </button>
      <h1 className="text-2xl font-bold text-center text-[#FF5F6D]">{title}</h1>
      <div className="w-8"></div> {/* Espace pour équilibrer l'alignement */}
    </div>
  );
};

export default Header; 