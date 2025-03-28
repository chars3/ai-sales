// src/components/TranscriptionPanel.jsx
import React, { useEffect, useRef } from 'react';

const TranscriptionPanel = ({ conversation }) => {
  const containerRef = useRef(null);
  
  // Scroll para o final sempre que a conversa mudar
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversation]);
  
  if (conversation.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 italic">
        Nenhuma conversa transcrita ainda. Inicie a gravação para começar.
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="h-64 overflow-y-auto pr-2 space-y-3"
    >
      {conversation.map((message) => (
        <div 
          key={message.id} 
          className={`p-3 rounded-lg ${
            message.role === 'vendedor' 
            ? 'bg-blue-50 border-l-4 border-blue-400 ml-4' 
            : 'bg-green-50 border-l-4 border-green-400 mr-4'
          }`}
        >
          <div className="font-semibold text-sm text-gray-600 mb-1">
            {message.role === 'vendedor' ? 'Você' : 'Cliente'}
          </div>
          <div>{message.text}</div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptionPanel;