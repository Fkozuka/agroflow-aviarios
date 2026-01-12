import React from 'react';

interface SecadorProps {
  umidadeEntrada?: number;
  tempSaida?: number;
  toneladaEntrada?: number;
  pressaoQueimador?: number;
  tempQueimador?: number;
  tempEntrada?: number;
  umidadeSaida?: number;
  toneladaSaida?: number;
  showUmidadeEntrada?: boolean;
  showTempSaida?: boolean;
  showToneladaEntrada?: boolean;
  showPressaoQueimador?: boolean;
  showTempQueimador?: boolean;
  showTempEntrada?: boolean;
  showUmidadeSaida?: boolean;
  showToneladaSaida?: boolean;
}

const Secador: React.FC<SecadorProps> = ({
  umidadeEntrada,
  tempSaida,
  toneladaEntrada,
  pressaoQueimador,
  tempQueimador,
  tempEntrada,
  umidadeSaida,
  toneladaSaida,
  showUmidadeEntrada = false,
  showTempSaida = false,
  showToneladaEntrada = false,
  showPressaoQueimador = false,
  showTempQueimador = false,
  showTempEntrada = false,
  showUmidadeSaida = false,
  showToneladaSaida = false,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 relative overflow-visible">
      {/* Container da Ilustração Isométrica */}
      <div className="relative w-full min-h-[600px] flex items-center justify-center">
        {/* Container relativo para imagem e SVG */}
        <div className="relative w-full max-w-5xl" style={{ maxHeight: '600px' }}>
          {/* Imagem de fundo do secador */}
          <img
            src="/secador_agroflowsystems.png"
            alt="Secador AgroFlow Systems"
            className="w-full h-auto object-contain"
            style={{ maxHeight: '600px' }}
          />

          {/* SVG Overlay para etiquetas e linhas de conexão - exatamente sobreposto */}
          <svg
            viewBox="0 0 1000 600"
            className="absolute inset-0 w-full h-full z-10"
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: 'none' }}
          >
            {/* Linhas de Conexão e Etiquetas - Baseado no design exato do Figma */}
            
            {/* 1. Umidade Entrada - Topo Esquerdo (conectado ao topo da torre, entrada) */}
            {showUmidadeEntrada && umidadeEntrada !== undefined && (
              <DataLabelSVG
                x={30}
                y={40}
                label="Umidade"
                value={`Entrada: ${umidadeEntrada} %`}
                connectionX={270}
                connectionY={80}
              />
            )}

            {/* 2. Temp. Saída - Meio Esquerdo (conectado à seção média da torre, abaixo dos cones) */}
            {showTempSaida && tempSaida !== undefined && (
              <DataLabelSVG
                x={30}
                y={140}
                label="Temp."
                value={`Saída: ${tempSaida}°C`}
                connectionX={270}
                connectionY={190}
              />
            )}

            {/* 3. Tonelada Entrada - Topo Direito (conectado ao topo direito da torre) */}
            {showToneladaEntrada && toneladaEntrada !== undefined && (
              <DataLabelSVG
                x={970}
                y={40}
                label="Tonelada"
                value={`Entrada: ${toneladaEntrada} ton/h`}
                connectionX={350}
                connectionY={80}
              />
            )}

            {/* 4. Pressão Queimador - Meio Direito Superior (conectado ao queimador, topo direito) */}
            {showPressaoQueimador && pressaoQueimador !== undefined && (
              <DataLabelSVG
                x={970}
                y={250}
                label="Pressão"
                value={`Queimador: ${pressaoQueimador} mbar`}
                connectionX={450}
                connectionY={310}
              />
            )}

            {/* 5. Temp. Queimador - Meio Direito Inferior (conectado ao queimador, frente direita, abaixo da pressão) */}
            {showTempQueimador && tempQueimador !== undefined && (
              <DataLabelSVG
                x={970}
                y={310}
                label="Temp."
                value={`Queimador: ${tempQueimador}°C`}
                connectionX={450}
                connectionY={340}
              />
            )}

            {/* 6. Temp. Entrada - Meio Esquerdo Inferior (conectado à parte inferior esquerda da torre) */}
            {showTempEntrada && tempEntrada !== undefined && (
              <DataLabelSVG
                x={30}
                y={250}
                label="Temp."
                value={`Entrada: ${tempEntrada}°C`}
                connectionX={270}
                connectionY={270}
              />
            )}

            {/* 7. Umidade Saída - Inferior Esquerdo (conectado à parte inferior esquerda da torre, abaixo de Temp. Entrada) */}
            {showUmidadeSaida && umidadeSaida !== undefined && (
              <DataLabelSVG
                x={30}
                y={400}
                label="Umidade"
                value={`Saída: ${umidadeSaida} %`}
                connectionX={270}
                connectionY={350}
              />
            )}

            {/* 8. Tonelada Saída - Inferior Direito (conectado à área de saída, base da torre e conexão do queimador) */}
            {showToneladaSaida && toneladaSaida !== undefined && (
              <DataLabelSVG
                x={970}
                y={400}
                label="Tonelada"
                value={`Saída: ${toneladaSaida} ton/h`}
                connectionX={350}
                connectionY={350}
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

interface DataLabelSVGProps {
  x: number;
  y: number;
  label: string;
  value: string;
  connectionX: number;
  connectionY: number;
}

const DataLabelSVG: React.FC<DataLabelSVGProps> = ({
  x,
  y,
  label,
  value,
  connectionX,
  connectionY,
}) => {
  const labelWidth = 160;
  const labelHeight = 55;
  const labelX = x < 500 ? x : x - labelWidth;
  
  return (
    <g>
      {/* Linha de Conexão Azul - Horizontal reta - Posicionada abaixo da caixa */}
      <line
        x1={labelX + labelWidth / 2}
        y1={y + labelHeight}
        x2={connectionX}
        y2={y + labelHeight}
        stroke="#1A3A5A"
        strokeWidth="2"
        opacity="1"
      />
      
      {/* Retângulo da Etiqueta - Fundo Cinza Claro com bordas arredondadas */}
      <rect
        x={labelX}
        y={y}
        width={labelWidth}
        height={labelHeight}
        fill="#D1D5DB"
        stroke="none"
        rx="8"
        ry="8"
      />
      
      {/* Texto do Label - Primeira linha em preto, negrito */}
      <text
        x={labelX + labelWidth / 2}
        y={y + 22}
        textAnchor="middle"
        fill="#111827"
        fontSize="13"
        fontWeight="600"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      >
        {label}
      </text>
      
      {/* Texto do Valor - Segunda linha em preto, normal */}
      <text
        x={labelX + labelWidth / 2}
        y={y + 38}
        textAnchor="middle"
        fill="#111827"
        fontSize="11"
        fontWeight="400"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      >
        {value}
      </text>
    </g>
  );
};

export default Secador;
