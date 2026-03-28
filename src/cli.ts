#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './index.js';

process.on('uncaughtException', (err) => {
  console.error('[Fatal]', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('[Fatal]', err);
  process.exit(1);
});

const server = createServer();

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

const transport = new StdioServerTransport();
server
  .connect(transport)
  .then(() => {
    console.error('Steelmind MCP server running — think + verify');
  })
  .catch((err) => {
    console.error('[Fatal] Server failed to start:', err);
    process.exit(1);
  });
