//  Copyright (c) 2025 LongbowXXX
//
//  This software is released under the MIT License.
//  http://opensource.org/licenses/mit-license.php

import * as dotenv from 'dotenv';
import { StageDirectorWebSocketServer } from './websocketServer.js';
import { StageDirectorMCPServer } from './mcpServer.js';

// Load environment variables
dotenv.config();

const STAGE_DIRECTOR_HOST = process.env.STAGE_DIRECTOR_HOST || '127.0.0.1';
const STAGE_DIRECTOR_PORT = parseInt(process.env.STAGE_DIRECTOR_PORT || '8000', 10);

async function main(): Promise<void> {
  console.log('Starting Stage Director...');

  // Start WebSocket server
  new StageDirectorWebSocketServer(STAGE_DIRECTOR_PORT, STAGE_DIRECTOR_HOST);
  console.log(`WebSocket server started on ws://${STAGE_DIRECTOR_HOST}:${STAGE_DIRECTOR_PORT}/ws`);

  // Start MCP server on stdio
  const mcpServer = new StageDirectorMCPServer();
  await mcpServer.run();
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
