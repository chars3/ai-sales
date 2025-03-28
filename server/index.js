const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const { Deepgram } = require("@deepgram/sdk");
const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

// Verificar se as chaves de API estão configuradas
if (!process.env.DEEPGRAM_API_KEY) {
  console.error("ERRO: A chave de API do Deepgram não está configurada no arquivo .env");
  console.error("Por favor, crie um arquivo .env na pasta server e adicione DEEPGRAM_API_KEY=sua_chave_aqui");
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error("ERRO: A chave de API do OpenAI não está configurada no arquivo .env");
  console.error("Por favor, crie um arquivo .env na pasta server e adicione OPENAI_API_KEY=sua_chave_aqui");
  process.exit(1);
}

// Configuração do servidor Express
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuração do cliente Deepgram - atualizado para API mais recente
const deepgramClient = new Deepgram(process.env.DEEPGRAM_API_KEY);

// Configuração do cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Armazenar conversas por conexão
const connectionConversations = new Map();

// Configuração do Deepgram para uma conexão WebSocket - atualizada para nova API
const setupDeepgram = (ws, connectionId) => {
  console.log("Configurando conexão com Deepgram...");
  
  // Cria uma conexão de transcrição ao vivo com Deepgram
  const deepgramLive = deepgramClient.transcription.live({
    punctuate: true,
    smart_format: true,
    model: "nova-2",
    language: "pt-BR", 
    diarize: true,
    interim_results: true,
  });

  // Configurar timer de keepalive para manter a conexão
  const keepAlive = setInterval(() => {
    if (deepgramLive.getReadyState() === 1) {
      deepgramLive.keepAlive();
    } else {
      clearInterval(keepAlive);
    }
  }, 10 * 1000);

  // Configurar eventos Deepgram
  deepgramLive.addListener('open', () => {
    console.log(`[${connectionId}] Deepgram: Conectado`);
  });

  deepgramLive.addListener('transcriptReceived', async (data) => {
    // Processar transcrição apenas se for final
    if (data.is_final) {
      console.log(`[${connectionId}] Deepgram: Transcrição recebida (final)`);
      
      // Atualizar a conversa armazenada
      if (!connectionConversations.has(connectionId)) {
        connectionConversations.set(connectionId, []);
      }
      
      const transcript = data.channel.alternatives[0].transcript;
      if (transcript.trim() === "") return;
      
      // Identificar o falante (se disponível)
      let speaker = "unknown";
      if (data.channel.alternatives[0].words && data.channel.alternatives[0].words.length > 0) {
        speaker = data.channel.alternatives[0].words[0].speaker || "unknown";
      }
      
      // Determinar se é vendedor ou cliente (simplificado)
      const role = speaker === "0" ? "vendedor" : "cliente";
      
      // Adicionar à conversa
      const conversation = connectionConversations.get(connectionId);
      conversation.push({ role, text: transcript });
      
      // Manter apenas as últimas 20 mensagens para contexto
      if (conversation.length > 20) {
        conversation.shift();
      }
      
      // Enviar transcrição para o cliente
      ws.send(JSON.stringify({
        type: "transcript",
        data: {
          text: transcript,
          role: role
        }
      }));
      
      // Verificar se deve dar uma dica
      try {
        const shouldGiveTip = await identifyTipOpportunity(conversation);
        
        if (shouldGiveTip === "Sim") {
          const tip = await generateTip(conversation);
          ws.send(JSON.stringify({
            type: "tip",
            data: {
              text: tip.text,
              severity: tip.severity
            }
          }));
        }
      } catch (error) {
        console.error(`[${connectionId}] Erro ao analisar conversa:`, error);
      }
    }
  });

  deepgramLive.addListener('close', () => {
    console.log(`[${connectionId}] Deepgram: Desconectado`);
    clearInterval(keepAlive);
  });

  deepgramLive.addListener('error', (error) => {
    console.error(`[${connectionId}] Deepgram: Erro`, error);
  });

  return { deepgram: deepgramLive, cleanup: () => clearInterval(keepAlive) };
};

// Função para identificar oportunidade de dar dica
async function identifyTipOpportunity(conversation) {
  if (conversation.length < 2) return "Não";
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é um assistente de vendas especializado em técnicas de vendas (incluindo SPIN e metodologias consultivas), 
e deve avaliar a conversa entre um vendedor e um cliente em um chat. 
Você tem os seguintes objetivos:
- Identificar a etapa atual da venda.
- Detectar se o vendedor está precisando de ajuda (ex: falando demais, não deixando o cliente falar, etc.).
- Caso perceba que o vendedor precise de uma sugestão de melhoria, responda "Sim". 
- Caso contrário, responda apenas "Não".

Responda sempre exatamente com "Sim" ou "Não".`
        },
        {
          role: "user",
          content: `Aqui está a conversa atual entre vendedor e cliente:

${conversation.map((msg, index) => `${index + 1}. ${msg.role.toUpperCase()}: ${msg.text}`).join("\n")}

Com base nessa conversa, devo dar uma dica agora? 
Responda somente "Sim" ou "Não".`
        }
      ]
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Erro ao chamar OpenAI para identificar oportunidade:", error);
    return "Não";
  }
}

// Função para gerar dica com base na conversa
async function generateTip(conversation) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é um assistente de vendas especializado em técnicas de vendas (incluindo SPIN e metodologias consultivas). 
Você vai dar uma dica rápida para o vendedor continuar a conversa de forma mais efetiva.
Considere as 8 etapas do processo de vendas:
1) Abordagem e Contato Inicial
2) Qualificação
3) Apresentação e Demonstração de Valor
4) Tratamento de Objeções
5) Negociação
6) Fechamento
7) Pós-venda e Fidelização

Formate sua resposta no seguinte formato JSON:
{
  "text": "Sua dica aqui",
  "severity": "normal | warning | alert"
}

As severidades são:
- normal: dicas de melhoria gerais
- warning: alertas quando o vendedor começa a se desviar
- alert: alertas urgentes quando há problemas sérios (como monólogo, interrupções constantes, etc.)

A dica deve ser objetiva, clara e focada na ação que o vendedor deve tomar neste momento.`
        },
        {
          role: "user",
          content: `Esta é a conversa até agora:

${conversation.map((msg, index) => `${index + 1}. ${msg.role.toUpperCase()}: ${msg.text}`).join("\n")}

Com base nessa conversa, que dica você daria ao vendedor agora? Responda apenas com o objeto JSON conforme o formato especificado.`
        }
      ]
    });

    // Extrair o JSON da resposta
    const content = response.choices[0].message.content.trim();
    try {
      // Buscar o JSON na resposta (caso a IA inclua texto antes ou depois)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // Fallback para formato simples se não conseguir extrair JSON
        return {
          text: content,
          severity: "normal"
        };
      }
    } catch (parseError) {
      console.error("Erro ao parsear resposta JSON:", parseError);
      return {
        text: content,
        severity: "normal"
      };
    }
  } catch (error) {
    console.error("Erro ao chamar OpenAI para gerar dica:", error);
    return {
      text: "Não foi possível gerar uma dica neste momento.",
      severity: "normal"
    };
  }
}

// Conexões WebSocket
let connections = {};
let connectionCounter = 0;

wss.on("connection", (ws) => {
  const connectionId = `conn_${connectionCounter++}`;
  console.log(`[${connectionId}] Nova conexão WebSocket estabelecida`);
  
  // Inicializar a conexão
  connections[connectionId] = {
    ws,
    deepgramConnection: null,
    active: true
  };
  
  // Enviar ID de conexão para o cliente
  ws.send(JSON.stringify({
    type: "connection",
    data: { id: connectionId }
  }));

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      // Lidar com diferentes tipos de mensagens
      switch (data.type) {
        case "start_transcription":
          // Iniciar transcrição
          if (!connections[connectionId].deepgramConnection) {
            const { deepgram, cleanup } = setupDeepgram(ws, connectionId);
            connections[connectionId].deepgramConnection = { deepgram, cleanup };
            console.log(`[${connectionId}] Transcrição iniciada`);
          }
          break;
          
        case "stop_transcription":
          // Parar transcrição
          if (connections[connectionId].deepgramConnection) {
            const { deepgram, cleanup } = connections[connectionId].deepgramConnection;
            deepgram.finish();
            cleanup();
            connections[connectionId].deepgramConnection = null;
            console.log(`[${connectionId}] Transcrição encerrada`);
          }
          break;
          
        case "audio_data":
          // Processar dados de áudio
          if (connections[connectionId].deepgramConnection) {
            const { deepgram } = connections[connectionId].deepgramConnection;
            if (deepgram.getReadyState() === 1) { // Verificar se está aberto
              const audioData = Buffer.from(data.data, 'base64');
              deepgram.send(audioData);
            }
          }
          break;
          
        case "reset_conversation":
          // Resetar conversa
          connectionConversations.set(connectionId, []);
          console.log(`[${connectionId}] Conversa resetada`);
          ws.send(JSON.stringify({
            type: "notification",
            data: { message: "Conversa resetada com sucesso" }
          }));
          break;
          
        default:
          console.log(`[${connectionId}] Mensagem desconhecida:`, data.type);
      }
    } catch (error) {
      console.error(`[${connectionId}] Erro ao processar mensagem:`, error);
    }
  });

  ws.on("close", () => {
    console.log(`[${connectionId}] Conexão WebSocket encerrada`);
    
    // Limpar recursos
    if (connections[connectionId]?.deepgramConnection) {
      const { deepgram, cleanup } = connections[connectionId].deepgramConnection;
      deepgram.finish();
      cleanup();
    }
    
    // Remover conversa armazenada
    connectionConversations.delete(connectionId);
    
    // Marcar conexão como inativa
    if (connections[connectionId]) {
      connections[connectionId].active = false;
      delete connections[connectionId];
    }
  });
});

// Rota de status
app.get("/api/status", (req, res) => {
  res.json({ status: "online" });
});

// Iniciar servidor
const PORT = process.env.SERVER_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});