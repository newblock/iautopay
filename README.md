# iAutoPay MCP Service

An MCP (Model Context Protocol) service that enables AI agents to automatically pay for purchases. It currently runs on Base chain (operated by Coinbase) and supports USDC payments. It can be used by intelligent agents to automatically purchase paid AI-related services and data.

## Features

- 🚀 **Smart Payment**: Small automatic payments, large amount manual approval
- 💳 **USDC Payments**: Support USDC-based payments on Base chain
- 🔐 **Secure**: Environment variable based configuration for private keys
- 🤖 **AI-Native**: Full MCP integration designed for AI agents
- 💸 **Fixed Transfer**: Preset fixed transfer account command, direct transfer by command
- 🔑 **API Key Purchase**: Support GLM4.7 LLM API Key purchase service with dynamic pricing

## Supported Models

API keys purchased through this service provide access to:
- `z-ai/glm4.7` (GLM4.7 with thinking chain support)
- `minimaxai/minimax-m2.1` (MiniMax general LLM)
- `deepseek-ai/deepseek-v3.2` (DeepSeek with thinking chain)

## Installation

### Option 1: npx (Recommended)

No installation required! Just run:

```bash
npx @newblock/iautopay-mcp
```

This will automatically download and cache the package.

### Option 2: Global Install

```bash
npm install -g @newblock/iautopay-mcp
@newblock/iautopay-mcp
```

### Option 3: Project Dependency

```bash
npm install @newblock/iautopay-mcp
node node_modules/@newblock/iautopay-mcp/dist/iautopay-mcp.js
```

## Configuration

### Environment Variables

Set required environment variables:

```bash
# Required: Your wallet private key for signing payments
export BUYER_PRIVATE_KEY="0x..."
```

### OpenCode Configuration

Add to your `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "iauto-pay": {
      "type": "local",
      "command": ["npx", "-y", "@newblock/iautopay-mcp"],
      "enabled": true,
      "environment": {
        "BUYER_PRIVATE_KEY": "{env:BUYER_PRIVATE_KEY}"
      }
    }
  }
}
```

### Claude CLI Configuration

For detailed instructions on using Claude CLI with MCP, see [CLAUDE_CLI_MCP_SETUP.md](CLAUDE_CLI_MCP_SETUP.md).

#### Quick Setup

```bash
# Install and add to Claude CLI
BUYER_PRIVATE_KEY="your_private_key" claude mcp add iauto-pay \
  -e BUYER_PRIVATE_KEY="your_private_key" \
  -- npx -y @newblock/iautopay-mcp

# Use with MCP config
claude --mcp-config mcp-config.json
```

### Claude Code Configuration

Add to your `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "iauto-pay": {
      "command": "npx",
      "args": ["@newblock/iautopay-mcp"],
      "env": {
        "BUYER_PRIVATE_KEY": "{env:BUYER_PRIVATE_KEY}"
      }
    }
  }
}
```

## MCP Tools

### guide

⭐ **FIRST TIME?** Run this guide to learn how to use iAutoPay tools and commands.

**Parameters:**
```json
{}
```

**Returns:**
- Complete guide with all tools and commands
- Pricing information
- Network configuration

### info

Get iAutoPay server information (API key stock, price, network config).

**Parameters:**
```json
{}
```

**Returns:**
```json
{
  "stock": 100,
  "prices": {
    "1day": "0.09 USDC",
    "7days": "0.49 USDC",
    "30days": "0.99 USDC"
  },
  "network": {
    "chainId": 84532,
    "rpcUrl": "https://sepolia.base.org"
  }
}
```

### buy_apikey

Purchase an API key with optional duration (1/7/30 days).

**Parameters:**
```json
{
  "duration": 1
}
```

**Duration Options:**
- `1`: 1 day validity
- `7`: 7 days validity
- `30`: 30 days validity

**Returns:**
```json
{
  "apiKey": "sk-ABCD12345678901234567890",
  "txHash": "0x4d757c7e121ad31607ee1e9c5af65bfe13b82c112fcf077638814c031ecc3a6b",
  "payState": "paid",
  "price": "0.09 USDC",
  "deductedAmount": "0.09 USDC",
  "currentBalance": "9.91 USDC"
}
```

### pay_stablecoin

Pay stablecoin to any address using EIP-3009.

**Parameters:**
```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "100000"
}
```

**Amount is in smallest units** (e.g., 100000 = 0.1 USDC, 1000000 = 1 USDC)

**Returns:**
```json
{
  "from": "0x...",
  "to": "0x...",
  "amount": "0.1 USDC",
  "txHash": "0x...",
  "deductedAmount": "0.1 USDC",
  "currentBalance": "9.9 USDC"
}
```

### sync_opencode_config

Auto-configure opencode.json with quick commands (autopay_toA, autopay_toB, etc.).

**Parameters:**
```json
{}
```

**Returns:**
```json
{
  "message": "✅ 已添加 7 个命令到 opencode.json"
}
```

### refresh_pricing

Refresh pricing from API. Use this if prices are changed on the server.

**Parameters:**
```json
{}
```

**Returns:**
```json
{
  "1day": "0.09 USDC",
  "7days": "0.49 USDC",
  "30days": "0.99 USDC"
}
```

## Environment Configuration

The MCP server supports two environments configured in `src/server.ts`:

### Development (Base Sepolia)
- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- USDC Address: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- Token Name: "USDC"

### Production (Base Mainnet)
- Chain ID: 8453
- RPC URL: https://mainnet.base.org
- USDC Address: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
- Token Name: "USD Coin"

## Example Workflows

### Example 1: Purchase GLM4.7 API Key

```
Use info tool to check stock and pricing
Use buy_apikey tool with duration: 1
Receive API key in response
```

### Example 2: Direct USDC Payment

```
Use pay_stablecoin tool with to: "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c" and amount: "10000"
Transaction executes automatically
Receive transaction hash
```

## License

Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0) - see [LICENSE](LICENSE) file for details.

## Repository

[https://github.com/newblock/iautopay](https://github.com/newblock/iautopay)

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/newblock/iautopay/issues).

## Documentation

- [CLAUDE_CLI_MCP_SETUP.md](CLAUDE_CLI_MCP_SETUP.md) - Claude CLI integration guide
- [mcp-config.json.example](mcp-config.json.example) - MCP configuration template
