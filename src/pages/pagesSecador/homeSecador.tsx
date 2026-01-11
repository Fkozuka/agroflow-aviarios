import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const HomeSecador = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-industrial-primary mb-6">Secadores</h2>
            
            {/* Conteúdo da página será adicionado aqui */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeSecador;

