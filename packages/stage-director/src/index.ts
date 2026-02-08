import { config } from 'dotenv';
import { runServers } from './app.js';

// Load environment variables
config();

// Start servers
runServers().catch((err: unknown) => {
  console.error('Failed to start servers:', err);
  process.exit(1);
});
