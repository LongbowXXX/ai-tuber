import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { WebSocketHandler } from './services/WebSocketHandler.js';
import { createMcpServer, SSEServerTransport } from './mcp-server.js';

export async function runServers() {
  // --- WebSocket Server (Port 8000) ---
  const wsApp = express();
  const wsPort = parseInt(process.env.STAGE_DIRECTOR_PORT || '8000', 10);
  const wsHost = process.env.STAGE_DIRECTOR_HOST || '127.0.0.1';

  const wsHttpServer = createServer(wsApp);
  const wss = new WebSocketServer({ server: wsHttpServer, path: '/ws' });
  new WebSocketHandler(wss);

  wsApp.get('/', (req, res) => {
    res.json({ message: 'Stage Director WebSocket Server is running' });
  });

  wsHttpServer.listen(wsPort, wsHost, () => {
    console.log(`WebSocket Server running on ${wsHost}:${wsPort}`);
  });

  // --- MCP Server (Port 8080) ---
  const mcpApp = express();
  const mcpPort = parseInt(process.env.STAGE_DIRECTOR_MCP_PORT || '8080', 10);
  const mcpHost = process.env.STAGE_DIRECTOR_MCP_HOST || '0.0.0.0';

  mcpApp.use(cors());
  mcpApp.use(express.json());

  const transports = new Map<string, SSEServerTransport>();

  mcpApp.get('/sse', async (req, res) => {
    console.log('New SSE connection established');
    const mcpServer = createMcpServer();
    const transport = new SSEServerTransport('/messages', res);
    transports.set(transport.sessionId, transport);

    // Clean up on close
    transport.onclose = () => {
      console.log(`SSE connection closed: ${transport.sessionId}`);
      transports.delete(transport.sessionId);
    };

    await mcpServer.connect(transport);
  });

  mcpApp.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);
    if (!transport) {
      console.warn(`Session not found: ${sessionId}`);
      res.status(404).send('Session not found');
      return;
    }

    try {
      await transport.handleMessage(req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error(`Error handling message: ${error}`);
      res.status(500).send(String(error));
    }
  });

  mcpApp.listen(mcpPort, mcpHost, () => {
    console.log(`MCP Server running on ${mcpHost}:${mcpPort} (SSE)`);
  });
}
