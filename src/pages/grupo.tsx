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
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-full">
        <h1 className="text-xl md:text-2xl font-bold text-industrial-primary mb-4 md:mb-8 text-center px-4 w-full">
          Seja bem-vindo, {userName || 'Usuário'}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl w-full px-4 md:px-0">
          {sistemas.map((sistema) => {
            const IconComponent = sistema.icon;
            return (
              <Card
                key={sistema.id}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-95 hover:scale-105 border-2 border-gray-200 touch-manipulation"
                onClick={() => handleCardClick(sistema.path)}
              >
                <CardHeader className="text-center pb-3 md:pb-4 px-4 md:px-6">
                  <div className="flex justify-center mb-3 md:mb-4">
                    <div className={`p-2 md:p-4 rounded-full bg-gray-100 ${sistema.color}`}>
                      <IconComponent className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                  </div>
                  <CardTitle className="text-base md:text-xl font-bold text-industrial-primary leading-tight">
                    {sistema.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
                  <CardDescription className="text-center text-sm md:text-base leading-relaxed">
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

