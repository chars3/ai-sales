// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaRedo, FaInfoCircle } from 'react-icons/fa';
import TranscriptionPanel from './components/TranscriptionPanel';
import TipPanel from './components/TipPanel';
import StepIndicator from './components/StepIndicator';
import InfoModal from './components/InfoModal';

const WS_URL = 'ws://localhost:3001';

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentTip, setCurrentTip] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const ws = useRef(null);
  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const audioContext = useRef(null);
  const connectionId = useRef(null);
  
  // Inicializar WebSocket
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, []);
  
  // Função para conectar ao WebSocket
  const connectWebSocket = () => {
    ws.current = new WebSocket(WS_URL);
    
    ws.current.onopen = () => {
      console.log('Conexão WebSocket estabelecida');
      setIsConnected(true);
    };
    
    ws.current.onclose = () => {
      console.log('Conexão WebSocket fechada');
      setIsConnected(false);
      setIsRecording(false);
      
      // Tentar reconectar após 2s
      setTimeout(() => {
        connectWebSocket();
      }, 2000);
    };
    
    ws.current.onerror = (error) => {
      console.error('Erro de WebSocket:', error);
      setIsConnected(false);
    };
    
    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'connection':
            connectionId.current = message.data.id;
            console.log('Conexão ID:', connectionId.current);
            break;
            
          case 'transcript':
            // Adicionar transcrição à conversa
            setConversation(prev => [...prev, {
              id: Date.now(),
              role: message.data.role,
              text: message.data.text
            }]);
            break;
            
          case 'tip':
            // Mostrar dica
            setCurrentTip({
              id: Date.now(),
              text: message.data.text,
              severity: message.data.severity
            });
            // Estimar a etapa de vendas com base na dica (simplificado)
            if (message.data.text.toLowerCase().includes('abordagem') || 
                message.data.text.toLowerCase().includes('contato inicial')) {
              setCurrentStep(1);
            } else if (message.data.text.toLowerCase().includes('qualificação')) {
              setCurrentStep(2);
            } else if (message.data.text.toLowerCase().includes('apresentação') || 
                       message.data.text.toLowerCase().includes('demonstração')) {
              setCurrentStep(3);
            } else if (message.data.text.toLowerCase().includes('objeções')) {
              setCurrentStep(4);
            } else if (message.data.text.toLowerCase().includes('negociação')) {
              setCurrentStep(5);
            } else if (message.data.text.toLowerCase().includes('fechamento')) {
              setCurrentStep(6);
            } else if (message.data.text.toLowerCase().includes('pós-venda')) {
              setCurrentStep(7);
            }
            break;
            
          case 'notification':
            console.log('Notificação:', message.data.message);
            break;
            
          default:
            console.log('Mensagem não tratada:', message);
        }
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    };
  };
  
  // Função para desconectar o WebSocket
  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }
  };
  
  // Função para iniciar a gravação
  const startRecording = async () => {
    try {
      if (!isConnected) {
        alert('Sem conexão com o servidor. Tentando reconectar...');
        connectWebSocket();
        return;
      }
      
      // Solicitar acesso ao microfone
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configurar AudioContext para processamento de áudio
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.current.createMediaStreamSource(mediaStream.current);
      
      // Configurar processador de áudio
      const processor = audioContext.current.createScriptProcessor(1024, 1, 1);
      processor.onaudioprocess = (e) => {
        if (isRecording && ws.current && ws.current.readyState === WebSocket.OPEN) {
          // Obter dados do canal de áudio
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Converter para Int16
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = inputData[i] * 0x7FFF;
          }
          
          // Enviar para o servidor
          const buffer = Buffer.from(pcmData.buffer);
          ws.current.send(JSON.stringify({
            type: 'audio_data',
            data: buffer.toString('base64')
          }));
        }
      };
      
      // Conectar nós de áudio
      source.connect(processor);
      processor.connect(audioContext.current.destination);
      
      // Iniciar MediaRecorder (usado apenas para tracking de estado)
      mediaRecorder.current = new MediaRecorder(mediaStream.current);
      mediaRecorder.current.start();
      
      // Notificar o servidor para iniciar a transcrição
      ws.current.send(JSON.stringify({
        type: 'start_transcription'
      }));
      
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  };
  
  // Função para parar a gravação
  const stopRecording = () => {
    // Parar MediaRecorder
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    
    // Parar streams
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
    }
    
    // Fechar AudioContext
    if (audioContext.current) {
      audioContext.current.close();
    }
    
    // Notificar o servidor para parar a transcrição
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'stop_transcription'
      }));
    }
    
    setIsRecording(false);
  };
  
  // Função para alternar gravação
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Função para resetar a conversa
  const resetConversation = () => {
    setConversation([]);
    setCurrentTip(null);
    setCurrentStep(1);
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'reset_conversation'
      }));
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary-700 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Assistente de Vendas IA</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowInfoModal(true)}
              className="p-2 rounded-full hover:bg-primary-600 transition-colors"
              aria-label="Informações"
            >
              <FaInfoCircle size={20} />
            </button>
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel lateral com indicador de etapas */}
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-4">Dicas de Vendas</h2>
              <TipPanel tip={currentTip} />
            </div>
          </div>
          
          {/* Painel principal de transcrição */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Transcrição da Conversa</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={resetConversation}
                    className="btn btn-outline flex items-center space-x-1"
                    aria-label="Reiniciar conversa"
                  >
                    <FaRedo size={16} />
                    <span>Reiniciar</span>
                  </button>
                  <button
                    onClick={toggleRecording}
                    className={`btn ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'btn-primary'} flex items-center space-x-2`}
                    aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
                  >
                    {isRecording ? (
                      <>
                        <FaMicrophoneSlash size={16} />
                        <span>Parar</span>
                      </>
                    ) : (
                      <>
                        <FaMicrophone size={16} />
                        <span>Iniciar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <TranscriptionPanel conversation={conversation} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal de informações */}
      <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
    </div>
  );
};

export default App;