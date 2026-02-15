#!/usr/bin/env node

import('../dist/iautopay-mcp.js').catch((err) => {
  process.exit(1);
});
