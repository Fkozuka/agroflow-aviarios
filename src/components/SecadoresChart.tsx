import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useScreenSize } from '@/hooks/use-mobile';

interface SecadorDados {
  id: number;
  secadorId: number;
  timestamp: string;
  umidade_entrada: number;
  umidade_saida: number;
  temperatura_queimador: number;
  pressao_queimador: number;
  temperatura_entrada: number;
  temperatura_saida: number;
  tc_entrada: number;
  tc_saida: number;
}

interface SecadoresChartProps {
  chartData: SecadorDados[];
  selectedDryer: string;
  secadorNome: string; // Adicione esta prop
  selectedParameter: string;
  dateInicial: Date | undefined;
  dateFinal: Date | undefined;
  setDateInicial: (date: Date | undefined) => void;
  setDateFinal: (date: Date | undefined) => void;
  setSelectedParameter: (parameter: string) => void;
  onFilter?: (secador: string, dataInicial?: Date, dataFinal?: Date) => void;
  loading?: boolean;
}

const SecadoresChart: React.FC<SecadoresChartProps> = ({
  chartData,
  selectedDryer,
  secadorNome,
  selectedParameter,
  dateInicial,
  dateFinal,
  setDateInicial,
  setDateFinal,
  setSelectedParameter,
  onFilter,
  loading = false
}) => {
  // Detecta o tamanho da tela
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile';
  
  // Estado para múltiplos parâmetros selecionados
  const [selectedParameters, setSelectedParameters] = useState<string[]>([selectedParameter]);

  // Atualiza quando selectedParameter muda externamente
  useEffect(() => {
    setSelectedParameters(prev => {
      if (!prev.includes(selectedParameter)) {
        return [...prev, selectedParameter];
      }
      return prev;
    });
  }, [selectedParameter]);

  const parameterLabels = {
    umidade_entrada: 'Umidade de Entrada',
    umidade_saida: 'Umidade de Saída',
    temperatura_queimador: 'Temperatura do Queimador',
    pressao_queimador: 'Pressão do Queimador',
    temperatura_entrada: 'Temperatura de Entrada',
    temperatura_saida: 'Temperatura de Saída',
    tc_entrada: 'TC - Entrada',
    tc_saida: 'TC - Saída'
  };

  const parameterUnits = {
    umidade_entrada: '%',
    umidade_saida: '%',
    temperatura_queimador: '°C',
    pressao_queimador: 'bar',
    temperatura_entrada: '°C',
    temperatura_saida: '°C',
    tc_entrada: '°C',
    tc_saida: '°C'
  };

  const parameterColors = {
    umidade_entrada:       '#1F77B4', // azul forte
    umidade_saida:         '#17BECF', // ciano vivo
    temperatura_queimador: '#FF7F0E', // laranja vibrante
    pressao_queimador:     '#D62728', // vermelho forte
    temperatura_entrada:   '#2CA02C', // verde marcante
    temperatura_saida:     '#98DF8A', // verde claro de contraste
    tc_entrada:            '#9467BD', // roxo intenso
    tc_saida:              '#BCBD22'  // amarelo oliva destacado
  };
  

  const parameterKeys = {
    umidade_entrada: 'umidade_entrada',
    umidade_saida: 'umidade_saida',
    temperatura_queimador: 'temperatura_queimador',
    pressao_queimador: 'pressao_queimador',
    temperatura_entrada: 'temperatura_entrada',
    temperatura_saida: 'temperatura_saida',
    tc_entrada: 'tc_entrada',
    tc_saida: 'tc_saida'
  };

  // Processa os dados para incluir todos os parâmetros selecionados
  const data = chartData
    .filter(d => {
      const dataMedicao = new Date(d.timestamp);
      const dataMedicaoStr = format(dataMedicao, 'yyyy-MM-dd');
      
      // Se ambas as datas estão definidas, filtra por range
      if (dateInicial && dateFinal) {
        const inicioStr = format(dateInicial, 'yyyy-MM-dd');
        const fimStr = format(dateFinal, 'yyyy-MM-dd');
        return dataMedicaoStr >= inicioStr && dataMedicaoStr <= fimStr;
      }
      
      // Se apenas data inicial está definida, filtra por ela
      if (dateInicial) {
        const inicioStr = format(dateInicial, 'yyyy-MM-dd');
        return dataMedicaoStr === inicioStr;
      }
      
      // Se apenas data final está definida, filtra por ela
      if (dateFinal) {
        const fimStr = format(dateFinal, 'yyyy-MM-dd');
        return dataMedicaoStr === fimStr;
      }
      
      // Se nenhuma data está definida, retorna todos os dados
      return true;
    })
    .map(d => {
      const dataPoint: any = {
        time: format(new Date(d.timestamp), 'HH:mm:ss')
      };
      
      // Adiciona cada parâmetro selecionado como uma propriedade
      selectedParameters.forEach(param => {
        const key = parameterKeys[param as keyof typeof parameterKeys] as keyof typeof d;
        dataPoint[param] = d[key];
      });
      
      return dataPoint;
    });

  const handleParameterToggle = (parameter: string) => {
    setSelectedParameters(prev => {
      if (prev.includes(parameter)) {
        // Remove se já estiver selecionado (mas mantém pelo menos um)
        if (prev.length > 1) {
          return prev.filter(p => p !== parameter);
        }
        return prev;
      } else {
        // Adiciona se não estiver selecionado
        return [...prev, parameter];
      }
    });
  };

  const handleFilter = () => {
    if (onFilter) {
      onFilter(selectedDryer, dateInicial, dateFinal);
    }
  };

  const handleExportReport = () => {
    if (!chartData || chartData.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    // Filtra os dados conforme as datas selecionadas
    const dadosFiltrados = chartData.filter(d => {
      const dataMedicao = new Date(d.timestamp);
      const dataMedicaoStr = format(dataMedicao, 'yyyy-MM-dd');
      
      if (dateInicial && dateFinal) {
        const inicioStr = format(dateInicial, 'yyyy-MM-dd');
        const fimStr = format(dateFinal, 'yyyy-MM-dd');
        return dataMedicaoStr >= inicioStr && dataMedicaoStr <= fimStr;
      }
      
      if (dateInicial) {
        const inicioStr = format(dateInicial, 'yyyy-MM-dd');
        return dataMedicaoStr === inicioStr;
      }
      
      if (dateFinal) {
        const fimStr = format(dateFinal, 'yyyy-MM-dd');
        return dataMedicaoStr === fimStr;
      }
      
      return true;
    });

    // Prepara os dados para exportação
    const dadosExportacao = dadosFiltrados.map(d => {
      const registro: any = {
        'Data/Hora': format(new Date(d.timestamp), 'dd/MM/yyyy HH:mm:ss'),
        'Umidade Entrada (%)': d.umidade_entrada,
        'Umidade Saída (%)': d.umidade_saida,
        'Temperatura Queimador (°C)': d.temperatura_queimador,
        'Pressão Queimador (bar)': d.pressao_queimador,
        'Temperatura Entrada (°C)': d.temperatura_entrada,
        'Temperatura Saída (°C)': d.temperatura_saida,
        'TC Entrada (°C)': d.tc_entrada,
        'TC Saída (°C)': d.tc_saida
      };
      return registro;
    });

    // Gera nome do arquivo com data
    const nomeSecadorFormatado = secadorNome.replace(/\s+/g, '_'); // Remove espaços e substitui por underscore
    const dataInicialStr = dateInicial ? format(dateInicial, 'yyyy-MM-dd') : 'todos';
    const dataFinalStr = dateFinal ? format(dateFinal, 'yyyy-MM-dd') : 'todos';
    const filename = `Relatorio_${nomeSecadorFormatado}_${dataInicialStr}_${dataFinalStr}`;

    // TODO: Implementar exportação CSV
  };

  return (
    <Card>
      <CardHeader className={isMobile ? "p-4" : ""}>
        <div className="flex flex-col gap-4">
          {/* Header com título e botões */}
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
            <CardTitle className={isMobile ? "text-lg" : ""}>Histórico de Dados</CardTitle>
            <div className={`flex ${isMobile ? 'flex-col gap-2 w-full' : 'items-center gap-2'}`}>
              <div className={`flex ${isMobile ? 'flex-col gap-2 w-full' : 'items-center gap-2'}`}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`${isMobile ? 'w-full' : 'w-[180px]'} justify-start text-left font-normal`}
                      size={isMobile ? "sm" : "default"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateInicial ? format(dateInicial, 'dd/MM/yyyy', { locale: ptBR }) : 'Data Inicial'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateInicial}
                      onSelect={(date) => setDateInicial(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {!isMobile && <span className="text-sm text-gray-500">até</span>}
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`${isMobile ? 'w-full' : 'w-[180px]'} justify-start text-left font-normal`}
                      size={isMobile ? "sm" : "default"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFinal ? format(dateFinal, 'dd/MM/yyyy', { locale: ptBR }) : 'Data Final'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFinal}
                      onSelect={(date) => setDateFinal(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {onFilter && (
                <Button
                  onClick={handleFilter}
                  disabled={loading}
                  className={`flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''} bg-industrial-primary hover:bg-industrial-primary/90`}
                  size={isMobile ? "sm" : "default"}
                >
                  <Filter className="h-4 w-4" />
                  {loading ? (isMobile ? "Filtrando..." : "Filtrando...") : (isMobile ? "Filtrar" : "Filtrar")}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleExportReport}
                className={`flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
                size={isMobile ? "sm" : "default"}
              >
                <Download className="h-4 w-4" />
                {isMobile ? "Exportar" : "Exportar CSV"}
              </Button>
            </div>
          </div>
          
          {/* Seleção múltipla de parâmetros */}
          <div className="flex flex-col gap-2">
            <span className={`font-medium text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Parâmetros:</span>
            <div className={`flex flex-wrap ${isMobile ? 'gap-2' : 'gap-4'} ${isMobile ? 'pl-0' : 'pl-4'}`}>
              {Object.entries(parameterLabels).map(([key, label]) => (
                <div key={key} className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
                  <Checkbox
                    id={`param-${key}`}
                    checked={selectedParameters.includes(key)}
                    onCheckedChange={() => handleParameterToggle(key)}
                    className={isMobile ? "h-3 w-3" : ""}
                  />
                  <label
                    htmlFor={`param-${key}`}
                    className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${isMobile ? 'text-xs' : 'text-sm'}`}
                    style={{ color: parameterColors[key as keyof typeof parameterColors] }}
                  >
                    {isMobile ? (
                      <span>
                        {label.split(' ')[0]} ({parameterUnits[key as keyof typeof parameterUnits]})
                      </span>
                    ) : (
                      <span>
                        {label} ({parameterUnits[key as keyof typeof parameterUnits]})
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className={isMobile ? "p-4" : ""}>
        <div className={`w-full ${isMobile ? 'h-[300px]' : 'h-[400px]'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={isMobile ? { top: 5, right: 5, left: -20, bottom: 5 } : { top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                interval={isMobile ? "preserveStartEnd" : 0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 60 : 30}
              />
              <YAxis 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 40 : 60}
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: isMobile ? '12px' : '14px',
                  padding: isMobile ? '8px' : '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}
                iconSize={isMobile ? 10 : 12}
                verticalAlign={isMobile ? "bottom" : "top"}
                height={isMobile ? 60 : 36}
              />
              {selectedParameters.map((param) => (
                <Line
                  key={param}
                  type="natural"
                  dataKey={param}
                  name={isMobile ? `${parameterLabels[param as keyof typeof parameterLabels].split(' ')[0]} (${parameterUnits[param as keyof typeof parameterUnits]})` : `${parameterLabels[param as keyof typeof parameterLabels]} (${parameterUnits[param as keyof typeof parameterUnits]})`}
                  stroke={parameterColors[param as keyof typeof parameterColors]}
                  strokeWidth={isMobile ? 1.5 : 2}
                  activeDot={{ r: isMobile ? 4 : 6 }}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecadoresChart;
