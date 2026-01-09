
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Wheat, Clock } from 'lucide-react';
import MobileNav from './MobileNav';
import UserMenu from './UserMenu';

const Header = () => {
  const location = useLocation();
  const isGrupoPage = location.pathname === '/grupo';
  
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }));
  
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }));
      setCurrentDate(now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-industrial-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex w-full md:w-auto justify-between items-center mb-3 md:mb-0">
          <div className="flex items-center gap-3">
            <Wheat size={32} className="text-industrial-warning" />
            <h1 className="text-2xl font-bold">AgroFlow Sistemas</h1>
          </div>
          <div className="flex items-center gap-4">
            {!isGrupoPage && <MobileNav />}
            <div className="md:hidden">
              <UserMenu />
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex flex-row items-center gap-6">          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span className="font-medium">{currentTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{currentDate}</span>
            </div>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
