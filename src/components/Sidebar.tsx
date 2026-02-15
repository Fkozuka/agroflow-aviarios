
import React, { useEffect, useMemo } from 'react';
import { List, Factory, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useStatusCLP } from '@/hooks/useStatusCLP';
import { useConfigSecador } from '@/hooks/hooksSecador/useConfigSecador';
import { setSecadorContext } from '@/utils/apiConfig';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Sidebar = () => {
  const { statusCLP, loading, error } = useStatusCLP();
  const { dadosConfigSecador, loading: loadingSecador, carregarConfigSecador } = useConfigSecador();
  
  useEffect(() => {
    carregarConfigSecador();
  }, [carregarConfigSecador]);

  // Agrupa os secadores por unidade
  const secadoresPorUnidade = useMemo(() => {
    const agrupados: Record<string, Array<{ secador: string; unidade: string; empresa: string }>> = {};
    
    dadosConfigSecador.forEach((item) => {
      if (!agrupados[item.unidade]) {
        agrupados[item.unidade] = [];
      }
      agrupados[item.unidade].push({
        secador: item.secador,
        unidade: item.unidade,
        empresa: item.empresa
      });
    });
    
    return agrupados;
  }, [dadosConfigSecador]);
  
  // Determina o status baseado nos dados do CLP
  const getSystemStatus = () => {
    if (loading) {
      return {
        color: 'bg-yellow-500',
        text: 'Carregando...',
        status: 'loading'
      };
    }
    
    if (error) {
      return {
        color: 'bg-red-500',
        text: 'Desconectado',
        status: 'error'
      };
    }
    
    if (statusCLP.length > 0 && statusCLP[0].status === true) {
      return {
        color: 'bg-industrial-success',
        text: 'Conectado',
        status: 'online'
      };
    }
    
    return {
      color: 'bg-red-500',
      text: 'Desconectado',
      status: 'offline'
    };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="bg-industrial-primary text-white w-64 flex-shrink-0 hidden md:block">
      <div className="p-4 h-full flex flex-col overflow-y-auto">
        <div className="space-y-1">
          {/* Botão Home */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white/80 hover:bg-industrial-primary/80 hover:text-white py-2 px-0"
            asChild
          >
            <Link to="/grupo" className="flex items-center w-full">
              <Home className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>
          </Button>
          
          {/* Secadores agrupados por unidade */}
          {Object.keys(secadoresPorUnidade).length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(secadoresPorUnidade).map(([unidade, secadores]) => (
                <AccordionItem key={unidade} value={unidade} className="border-none">
                  <AccordionTrigger className="text-white hover:no-underline py-2 px-0">
                    <div className="flex items-center">
                      <Factory className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">{unidade}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="space-y-1 pl-6">
                      {secadores.map((item) => (
                        <Button
                          key={`${item.unidade}-${item.secador}`}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-white/80 hover:bg-industrial-primary/80 hover:text-white text-xs"
                          asChild
                        >
                          <Link to={`/secador/${item.secador}`} onClick={() => setSecadorContext({ empresa: item.empresa, unidade: item.unidade, secador: item.secador })}>
                            <List className="mr-2 h-3 w-3" />
                            {item.secador}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-white/60 text-sm text-center py-4">
              {loadingSecador ? 'Carregando secadores...' : 'Nenhum secador encontrado'}
            </div>
          )}
        </div>
        
        <div className="mt-auto p-4 bg-industrial-dark/30 rounded-lg">
          <div className="text-sm text-gray-300">Status do Sistema</div>
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 ${systemStatus.color} rounded-full mr-2`}></div>
            <span className="text-sm font-medium">{systemStatus.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
