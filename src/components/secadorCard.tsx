
import React from 'react';

interface SecadorCardProps {
  title: string;
  value1: number | string;
  value2: number | string;
  description1?: string;
  description2?: string;
  unit1?: string;
  unit2?: string;
  status: string;
  icon: React.ReactNode;
}

const SecadorCard: React.FC<SecadorCardProps> = ({ 
  title, 
  value1,
  value2,
  description1,
  description2,
  unit1 = '', 
  unit2 = '', 
  status, 
  icon 
}) => {
  const statusColors: Record<string, string> = {
    '0': 'bg-gray-400', // Desligado
    '1': 'bg-industrial-success', // Ligado
    '2': 'bg-industrial-error', // Falha
    '3': 'bg-industrial-warning' // Manutenção
  };

  const iconColors: Record<string, string> = {
    '0': 'text-gray-400', // Desligado
    '1': 'text-industrial-success', // Ligado
    '2': 'text-industrial-error', // Falha
    '3': 'text-industrial-warning' // Manutenção
  };

  const iconColor = iconColors[status] || 'text-industrial-primary';

  return (
    <div className="sensor-indicator bg-white p-4 rounded-lg border shadow-sm flex items-center relative overflow-hidden">
      <div className={`status-indicator w-1 absolute left-0 top-0 bottom-0 ${statusColors[status]}`}></div>
      <div className="flex-1 ml-2">
        <div className="text-sm font-bold text-industrial-primary mb-2">{title}</div>
        <div className="space-y-1">
          <div>
            {description1 && (
              <div className="text-xs text-industrial-gray mb-0.5">{description1}</div>
            )}
            <div className="text-xl font-bold">
              {value1}{unit1 && <span className="text-xs ml-1">{unit1}</span>}
            </div>
          </div>
          {value2 && (
            <div>
              {description2 && (
                <div className="text-xs text-industrial-gray mb-0.5">{description2}</div>
              )}
              <div className="text-xl font-bold">
                {value2}{unit2 && <span className="text-xs ml-1">{unit2}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={`${iconColor} text-opacity-80`}>
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, { 
              className: `${iconColor} ${(icon as React.ReactElement<any>).props?.className || ''}` 
            })
          : icon
        }
      </div>
    </div>
  );
};

export default SecadorCard;

