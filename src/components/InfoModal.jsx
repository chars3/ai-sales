// src/components/InfoModal.jsx
import React, { useEffect, useRef } from 'react';
import { FaTimes, FaMicrophone, FaLightbulb, FaInfoCircle } from 'react-icons/fa';

const InfoModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  
  // Fechar modal ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Como usar o Assistente de Vendas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Fechar"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <FaInfoCircle className="text-primary-500 mr-2" />
              Sobre o Assistente
            </h3>
            <p className="text-gray-700">
              O Assistente de Vendas IA foi projetado para ajudar vendedores a 
              melhorar suas habilidades durante chamadas e reuniões com clientes. 
              Ele monitora a conversa, identifica a etapa atual da venda, e fornece 
              dicas em tempo real para otimizar o processo de vendas.
            </p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <FaMicrophone className="text-primary-500 mr-2" />
              Como Gravar
            </h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Clique no botão <span className="font-medium">Iniciar</span> para começar a captura de áudio.</li>
              <li>Permita o acesso ao microfone quando solicitado pelo navegador.</li>
              <li>Fale normalmente durante sua chamada ou reunião de vendas.</li>
              <li>O sistema transcreverá automaticamente a conversa.</li>
              <li>Quando terminar, clique em <span className="font-medium">Parar</span> para encerrar a gravação.</li>
              <li>Você pode reiniciar a conversa a qualquer momento clicando em <span className="font-medium">Reiniciar</span>.</li>
            </ol>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <FaLightbulb className="text-primary-500 mr-2" />
              Dicas e Sugestões
            </h3>
            <div className="text-gray-700 space-y-4">
              <p>
                O assistente analisará sua conversa e fornecerá três tipos de feedback:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full mr-3">
                    <FaLightbulb className="text-primary-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Dicas Normais</h4>
                    <p className="text-sm">Sugestões de melhoria e orientações sobre a próxima etapa da venda.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <FaLightbulb className="text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Alertas</h4>
                    <p className="text-sm">Aviso quando você começa a se desviar do processo de vendas ideal.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <FaLightbulb className="text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Alertas Urgentes</h4>
                    <p className="text-sm">Indicação de problemas críticos, como monólogos longos ou interrupções frequentes.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3">Metodologia SPIN de Vendas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium text-primary-600 mb-1">S - Situação</h4>
                <p className="text-sm">Perguntas que identificam o contexto atual do cliente.</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium text-primary-600 mb-1">P - Problema</h4>
                <p className="text-sm">Perguntas que revelam problemas, dificuldades ou insatisfações.</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium text-primary-600 mb-1">I - Implicação</h4>
                <p className="text-sm">Perguntas que exploram as consequências dos problemas.</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium text-primary-600 mb-1">N - Necessidade</h4>
                <p className="text-sm">Perguntas que levam o cliente a expressar o valor da solução.</p>
              </div>
            </div>
          </section>
        </div>
        
        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;