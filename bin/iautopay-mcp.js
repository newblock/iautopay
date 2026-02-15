#!/usr/bin/env node

import('../dist/iautopay-mcp.js').catch((err) => {
  console.error('Failed to load iautopay-mcp:', err);
  process.exit(1);
});
