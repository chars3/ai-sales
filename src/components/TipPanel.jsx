// src/components/TipPanel.jsx
import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

const TipPanel = ({ tip }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tipHistory, setTipHistory] = useState([]);
  
  // Efeito para animação de entrada e saída da dica
  useEffect(() => {
    if (tip) {
      setIsVisible(true);
      
      // Adicionar à história de dicas (limitado a 5)
      setTipHistory(prev => {
        const newHistory = [tip, ...prev];
        return newHistory.slice(0, 5);
      });
      
      // Esconder após 10 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [tip]);
  
  // Renderizar ícone de acordo com a severidade
  const renderIcon = (severity) => {
    switch (severity) {
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" size={24} />;
      case 'alert':
        return <FaExclamationCircle className="text-red-500" size={24} />;
      default:
        return <FaLightbulb className="text-blue-500" size={24} />;
    }
  };
  
  // Renderizar classe de severidade
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'warning':
        return 'tip-warning';
      case 'alert':
        return 'tip-alert';
      default:
        return 'tip-normal';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Dica atual animada */}
      {tip && (
        <div 
          className={`tip-card ${getSeverityClass(tip.severity)} ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <div className="flex items-start space-x-3">
            {renderIcon(tip.severity)}
            <div>
              <div className="font-medium">Dica:</div>
              <div>{tip.text}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Histórico de dicas */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Dicas anteriores:</h3>
        {tipHistory.length > 0 ? (
          <div className="space-y-2">
            {tipHistory.map((historyTip) => (
              <div 
                key={historyTip.id}
                className={`p-3 rounded-lg text-sm ${getSeverityClass(historyTip.severity)} opacity-75`}
              >
                {historyTip.text}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic text-sm">
            Ainda não há dicas para mostrar.
          </div>
        )}
      </div>
    </div>
  );
};

export default TipPanel;