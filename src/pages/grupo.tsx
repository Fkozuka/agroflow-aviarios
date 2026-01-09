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
      title: 'Monitoramento de Secadores',
      description: 'Acompanhe o monitoramento e controle dos secadores',
      icon: Wind,
      path: '/secadores',
      color: 'text-blue-600'
    },
    {
      id: 'termometria',
      title: 'Termometria de Silos',
      description: 'Monitore a temperatura dos silos em tempo real',
      icon: Thermometer,
      path: '/termometria',
      color: 'text-red-600'
    },
    {
      id: 'aviarios',
      title: 'Monitoramento do Aviários',
      description: 'Controle e monitoramento completo dos aviários',
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
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-industrial-primary mb-8 text-center">
          Bem-vindo, {userName || 'Usuário'}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl w-full">
          {sistemas.map((sistema) => {
            const IconComponent = sistema.icon;
            return (
              <Card
                key={sistema.id}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-industrial-primary"
                onClick={() => handleCardClick(sistema.path)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full bg-gray-100 ${sistema.color}`}>
                      <IconComponent size={48} />
                    </div>
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold text-industrial-primary">
                    {sistema.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
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

