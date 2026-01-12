import React from 'react';
import { useScreenSize, type ScreenSize } from '@/hooks/use-mobile';
import secadorImage from '@/assets/images/secador_agroflowsystems.png';

interface SecadorCardProps {
  secadorId: number;
  nome: string;
  dados: {
    umidade_entrada: number;
    umidade_saida: number;
    temperatura_queimador: number;
    pressao_queimador: number;
    temperatura_entrada: number;
    temperatura_saida: number;
    tonelada_entrada: number;
    tonelada_saida: number;
  };
  status: 'ativo' | 'inativo' | 'manutencao';
  imagemUrl?: string;
}

interface SensorGroupProps {
  titulo: string;
  valor: number | string;
  unidade: string;
  posicaoDesktopMax: {
    x: number;
    y: number;
  };
  posicaoDesktopMedium: {
    x: number;
    y: number;
  };
  posicaoMobile: {
    x: number;
    y: number;
  };
}

const SensorGroup: React.FC<SensorGroupProps> = ({ 
  titulo, 
  valor, 
  unidade, 
  posicaoDesktopMax,
  posicaoDesktopMedium,
  posicaoMobile
}) => {
  const screenSize = useScreenSize();
  
  const getPosicao = (): { x: number; y: number } => {
    switch (screenSize) {
      case 'mobile':
        return posicaoMobile;
      case 'desktop-medium':
        return posicaoDesktopMedium;
      case 'desktop-max':
        return posicaoDesktopMax;
      default:
        return posicaoDesktopMax;
    }
  };
  
  const posicao = getPosicao();

  return (
    <div 
      className="absolute w-[115px] h-[45px] md:w-[125px]"
      style={{
        left: `${posicao.x}%`,
        top: `${posicao.y}%`
      }}
    >
      <div 
        className="absolute bg-[#d9d9d9] w-[125px] h-[45px] rounded-[8px]"
        style={{
          boxShadow: '0px 6px 4px 0px rgba(0,0,0,0.25)'
        }}
      />
      <p 
        className="absolute font-semibold text-[#050505] text-[14px] leading-normal whitespace-nowrap"
        style={{
          left: '8px',
          top: '4px'
        }}
      >
        {titulo}
      </p>
      <p 
        className="absolute font-semibold text-[#050505] text-[16px] leading-normal whitespace-nowrap"
        style={{
          left: '8px',
          top: '20px'
        }}
      >
        {valor} {unidade}
      </p>
    </div>
  );
};

const SecadorCard: React.FC<SecadorCardProps> = ({ 
  secadorId, 
  nome, 
  dados, 
  status, 
  imagemUrl 
}) => {
  return (
    <div className="relative w-full min-h-[700px] md:min-h-[700px] pb-8">
      {/* Card principal - fundo branco com bordas arredondadas */}
      <div className="absolute bg-white rounded-[15px] w-full h-full min-h-[700px] md:min-h-[700px]" />
      
      {/* Imagem do secador - Centralizada e Responsiva */}
      <div className="absolute w-[90%] max-w-[465px] h-[500px] md:h-[600px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <img 
          src={imagemUrl || secadorImage} 
          alt={`Secador ${nome}`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Grupos de sensores posicionados responsivamente */}
      <SensorGroup
        titulo="Umid. Entrada"
        valor={dados.umidade_entrada}
        unidade="%"
        posicaoDesktopMax={{ x: 43.7, y: 5 }}
        posicaoDesktopMedium={{ x: 33.7, y: 5 }}
        posicaoMobile={{ x: 5, y: 15 }}
      />

      <SensorGroup
        titulo="Temp. Saída"
        valor={dados.temperatura_saida}
        unidade="°C"
        posicaoDesktopMax={{ x: 35.7, y: 25.7 }}
        posicaoDesktopMedium={{ x: 25.7, y: 25.7 }}
        posicaoMobile={{ x: 5, y: 30 }}
      />

      <SensorGroup
        titulo="Temp. Entrada"
        valor={dados.temperatura_entrada}
        unidade="°C"
        posicaoDesktopMax={{ x: 50.7, y: 50 }}
        posicaoDesktopMedium={{ x: 40.7, y: 50 }}
        posicaoMobile={{ x: 50, y: 40 }}
      />

      <SensorGroup
        titulo="Press. Queimador"
        valor={dados.pressao_queimador}
        unidade="bar"
        posicaoDesktopMax={{ x: 62.3, y: 50.5 }}
        posicaoDesktopMedium={{ x: 65.3, y: 50.5 }}
        posicaoMobile={{ x: 55, y: 50 }}
      />

      <SensorGroup
        titulo="Temp. Queimador"
        valor={dados.temperatura_queimador}
        unidade="°C"
        posicaoDesktopMax={{ x: 62.3, y: 66.3 }}
        posicaoDesktopMedium={{ x: 65.3, y: 66.3 }}
        posicaoMobile={{ x: 55, y: 60 }}
      />

      <SensorGroup
        titulo="Umid. Saída"
        valor={dados.umidade_saida}
        unidade="%"
        posicaoDesktopMax={{ x: 43.7, y: 79.8 }}
        posicaoDesktopMedium={{ x: 33.7, y: 79.8 }}
        posicaoMobile={{ x: 5, y: 70 }}
      />

      <SensorGroup
        titulo="Tonelada Entrada"
        valor={dados.tonelada_entrada}
        unidade="ton/h"
        posicaoDesktopMax={{ x: 54.9, y: 5 }}
        posicaoDesktopMedium={{ x: 54.9, y: 5 }}
        posicaoMobile={{ x: 55, y: 15 }}
      />

      <SensorGroup
        titulo="Tonelada Saída"
        valor={dados.tonelada_saida}
        unidade="ton/h"
        posicaoDesktopMax={{ x: 54.9, y: 79.8 }}
        posicaoDesktopMedium={{ x: 54.9, y: 79.8 }}
        posicaoMobile={{ x: 55, y: 70 }}
      />
    </div>
  );
};

export default SecadorCard;

