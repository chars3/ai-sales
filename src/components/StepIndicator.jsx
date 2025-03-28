// src/components/StepIndicator.jsx
import React from 'react';
import { FaHandshake, FaSearch, FaChartLine, FaShieldAlt, FaBalanceScale, FaCheckCircle, FaStar } from 'react-icons/fa';

const steps = [
  { id: 1, name: 'Abordagem', icon: FaHandshake },
  { id: 2, name: 'Qualificação', icon: FaSearch },
  { id: 3, name: 'Apresentação', icon: FaChartLine },
  { id: 4, name: 'Objeções', icon: FaShieldAlt },
  { id: 5, name: 'Negociação', icon: FaBalanceScale },
  { id: 6, name: 'Fechamento', icon: FaCheckCircle },
  { id: 7, name: 'Pós-venda', icon: FaStar },
];

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="py-2">
      <ol className="relative border-l border-gray-300">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isPast = step.id < currentStep;
          
          return (
            <li key={step.id} className="mb-6 ml-6">
              <span 
                className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : isPast
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                <step.icon size={16} />
              </span>
              <div 
                className={`ml-2 ${
                  isActive
                    ? 'font-semibold text-primary-700'
                    : isPast
                      ? 'font-medium text-green-600'
                      : 'font-normal text-gray-500'
                }`}
              >
                {step.name}
                {isActive && (
                  <span className="flex items-center ml-2 text-sm font-normal text-primary-500">
                    <span className="inline-block w-2 h-2 mr-1 bg-primary-500 rounded-full animate-pulse"></span>
                    Etapa atual
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default StepIndicator;