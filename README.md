# Assistente de Vendas IA

## Sobre o Projeto

O Assistente de Vendas IA é uma aplicação web que ajuda vendedores a melhorar seu desempenho durante chamadas e reuniões com clientes. Ele utiliza transcrição de áudio em tempo real e inteligência artificial para fornecer dicas e recomendações relevantes ao contexto da conversa.

## Funcionalidades

- **Transcrição em tempo real**: Capture o áudio da reunião e converta-o em texto.
- **Análise da conversa**: Avalie se o vendedor está seguindo as melhores práticas de vendas.
- **Dicas contextuais**: Receba sugestões relevantes para cada etapa do processo de vendas.
- **Feedback categorizado**: Visualize dicas categorizadas por severidade (normal, alerta, urgente).
- **Tracking de progresso**: Veja em qual etapa do processo de vendas você está.

## Tecnologias Utilizadas

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express, WebSockets
- **Serviços**: Deepgram (transcrição), OpenAI (análise de conversas)

## Requisitos

- Node.js 16+
- Chaves de API para Deepgram e OpenAI

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sales-assistant.git
cd sales-assistant
```

2. Instale as dependências do frontend:
```bash
npm install
```

3. Instale as dependências do backend:
```bash
cd server
npm install
cd ..
```

4. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na pasta `server`
   - Adicione suas chaves de API:
   ```
   DEEPGRAM_API_KEY=sua_chave_deepgram
   OPENAI_API_KEY=sua_chave_openai
   SERVER_PORT=3001
   ```

## Executando o Projeto

1. Inicie o servidor backend:
```bash
cd server
npm start
```

2. Em outro terminal, inicie o frontend:
```bash
npm run dev
```

3. Acesse a aplicação em `http://localhost:5173`

## Solucionando Problemas Comuns

### Tela em branco ao iniciar a aplicação
- Verifique se o servidor backend está rodando corretamente
- Confira no console do navegador se há erros JavaScript
- Verifique se as dependências foram instaladas corretamente

### Erro de conexão WebSocket
- Verifique se o servidor está rodando na porta 3001
- Confira se firewall ou antivírus não estão bloqueando a conexão

### Problemas com a gravação de áudio
- Certifique-se de dar permissão de acesso ao microfone quando solicitado
- Verifique se o navegador suporta as APIs de áudio utilizadas (WebAudio API)

## Como Usar

1. Clique no botão "Iniciar" para começar a capturar áudio
2. Conceda permissão de acesso ao microfone quando solicitado
3. Inicie sua conversa de vendas
4. Observe as transcrições no painel direito e as dicas no painel esquerdo
5. Quando terminar, clique em "Parar" para encerrar a gravação
6. Para limpar a conversa atual, clique em "Reiniciar"

## Licença

Este projeto está licenciado sob a licença MIT.