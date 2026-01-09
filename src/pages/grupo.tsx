import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind, Thermometer, Home } from 'lucide-react';

const Grupo = () => {
  const [userName, setUserName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Obtém o nome do usuário do localStorage
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const sistemas = [
    {
      id: 'secadores',
      title: 'Supervisão de Secadores',
      description: 'Monitoramento e supervisão de secadores',
      icon: Wind,
      path: '/secadores',
      color: 'text-blue-600'
    },
    {
      id: 'termometria',
      title: 'Sistema de Termometria para silos',
      description: 'Monitore a temperatura dos silos em tempo real',
      icon: Thermometer,
      path: '/termometria',
      color: 'text-red-600'
    },
    {
      id: 'aviarios',
      title: 'Monitoramento do Aviários',
      description: 'Controle e monitoramento completo para aviários',
      icon: Home,
      path: '/aviarios',
      color: 'text-green-600'
    }
  ];

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-industrial-primary mb-6 sm:mb-8 text-center px-4">
          Seja bem-vindo, {userName || 'Usuário'}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl w-full px-4 sm:px-0">
          {sistemas.map((sistema) => {
            const IconComponent = sistema.icon;
            return (
              <Card
                key={sistema.id}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-95 hover:scale-105 border-2 border-gray-200 hover:border-industrial-primary touch-manipulation"
                onClick={() => handleCardClick(sistema.path)}
              >
                <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className={`p-3 sm:p-4 rounded-full bg-gray-100 ${sistema.color}`}>
                      <IconComponent className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-industrial-primary leading-tight">
                    {sistema.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <CardDescription className="text-center text-sm sm:text-base leading-relaxed">
                    {sistema.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Grupo;

