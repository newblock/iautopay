#!/usr/bin/env node

/**
 * OpenCode Auto-Setup Script for iAutoPay MCP
 * 
 * This script:
 * 1. Detects or creates opencode.json in current directory
 * 2. Adds autopay MCP configuration
 * 3. Adds 6 quick commands for fast access
 * 4. Prompts for BUYER_PRIVATE_KEY (hidden input)
 * 5. Validates private key format
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  MCP_SERVER: 'autopay',
  COMMAND: 'npx',
  ARGS: ['-y', '@newblock/iautopay-mcp'],
};

const QUICK_COMMANDS = {
  "autopay_toA": {
    "template": "Use pay_stablecoin tool to pay 0.01 USDC to 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c, params: to=\"0x1a85156c2943b63febeee7883bd84a7d1cf0da0c\", amount=\"10000\"",
    "description": "Pay 0.01 USDC to account A"
  },
  "autopay_toB": {
    "template": "First use question tool to ask user confirmation with options: 1) Confirm (continue payment), 2) Cancel (do not pay). Show payment details: Pay 0.05 USDC to 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c, params: to=\"0x1a85156c2943b63febeee7883bd84a7d1cf0da0c\", amount=\"50000\". Only proceed if user confirms.",
    "description": "Pay 0.05 USDC to account A (requires confirmation)"
  },
  "autopay_buy_apikey_1day": {
    "template": "Use buy_apikey tool to buy 1-day API Key, params: {\"duration\": 1}",
    "description": "Buy 1-day API Key (0.09 USDC)"
  },
  "autopay_buy_apikey_7days": {
    "template": "Use buy_apikey tool to buy 7-day API Key, params: {\"duration\": 7}",
    "description": "Buy 7-day API Key (0.49 USDC)"
  },
  "autopay_get_info": {
    "template": "Use info tool to get server information (API Key stock, prices, network config)",
    "description": "Get iAutoPay server information"
  },
  "autopay_guide": {
    "template": "Use guide tool to show iAutoPay usage guide",
    "description": "Show iAutoPay usage guide"
  }
};

function findOpencodeConfig() {
  // Check current directory first
  const currentDir = path.join(process.cwd(), 'opencode.json');
  if (fs.existsSync(currentDir)) {
    return currentDir;
  }
  
  // Check ~/.opencode directory
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const opencodeHome = path.join(homeDir, '.opencode', 'opencode.json');
  if (fs.existsSync(opencodeHome)) {
    return opencodeHome;
  }
  
  // Default to current directory
  return currentDir;
}

function validatePrivateKey(key) {
  if (!key) {
    return { valid: false, error: 'Private key cannot be empty' };
  }
  
  if (!key.startsWith('0x')) {
    return { valid: false, error: 'Private key must start with 0x' };
  }
  
  const hexPart = key.slice(2);
  if (hexPart.length !== 64) {
    return { valid: false, error: 'Private key must be 66 characters (0x + 64 hex chars)' };
  }
  
  const hexRegex = /^[0-9a-fA-F]{64}$/;
  if (!hexRegex.test(hexPart)) {
    return { valid: false, error: 'Private key contains invalid characters' };
  }
  
  return { valid: true };
}

function hiddenPrompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const muteStdout = process.stdout.isTTY ? () => {
    process.stdout.write('\x1B[?25l');
  } : () => {};
  const restoreStdout = process.stdout.isTTY ? () => {
    process.stdout.write('\x1B[?25h');
  } : () => {};

  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';
    const onData = (char) => {
      if (char === '\n' || char === '\r' || char === '\u0004') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        console.log('');
        restoreStdout();
        resolve(password);
      } else if (char === '\u0003') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        console.log('\nCancelled.');
        restoreStdout();
        process.exit(0);
      } else if (char === '\u007f') {
        if (password.length > 0) {
          password = password.slice(0, -1);
        }
      } else if (char.length === 1) {
        password += char;
      }
    };

    stdin.on('data', onData);
    console.log(query);
  });
}

async function main() {
  console.log('=== iAutoPay MCP - OpenCode Setup ===\n');

  // Find opencode.json
  const configPath = findOpencodeConfig();
  console.log(`Config file: ${configPath}`);

  // Read existing config or create new
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(content);
      console.log('✓ Found existing configuration\n');
    } catch (error) {
      console.log('⚠  Existing config is invalid, will create new\n');
      config = { "$schema": "https://opencode.ai/config.json" };
    }
  } else {
    config = { "$schema": "https://opencode.ai/config.json" };
    console.log('✓ Will create new configuration\n');
  }

  // Prompt for private key
  const privateKey = await hiddenPrompt('Enter your EVM wallet private key (input hidden): ');
  
  const validation = validatePrivateKey(privateKey);
  if (!validation.valid) {
    console.error(`✗ Invalid private key: ${validation.error}`);
    process.exit(1);
  }
  console.log('✓ Private key format valid\n');

  // Add MCP configuration
  if (!config.mcp) {
    config.mcp = {};
  }
  config.mcp[CONFIG.MCP_SERVER] = {
    type: 'local',
    command: [CONFIG.COMMAND, ...CONFIG.ARGS],
    enabled: true,
    environment: {
      BUYER_PRIVATE_KEY: privateKey
    }
  };

  // Add quick commands
  if (!config.command) {
    config.command = {};
  }
  
  let addedCommands = [];
  for (const [key, value] of Object.entries(QUICK_COMMANDS)) {
    if (!config.command[key]) {
      config.command[key] = value;
      addedCommands.push(key);
    }
  }

  // Write configuration
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log('✓ Configuration saved successfully\n');
  } catch (error) {
    console.error(`✗ Failed to write config: ${error.message}`);
    process.exit(1);
  }

  // Summary
  console.log('=== Setup Complete ===\n');
  console.log(`Config file: ${configPath}`);
  console.log(`MCP server: ${CONFIG.MCP_SERVER}`);
  console.log(`Quick commands added: ${addedCommands.length}`);
  if (addedCommands.length > 0) {
    console.log('  - ' + addedCommands.join('\n  - '));
  } else {
    console.log('  (all commands already exist)');
  }
  console.log('\n');
  console.log('Verification steps:');
  console.log('1. Restart OpenCode');
  console.log('2. Run /autopay_guide to verify MCP tools are working');
  console.log('3. Try /autopay_get_info to check server status');
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
