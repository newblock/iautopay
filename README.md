# iAutoPay MCP Service

An MCP (Model Context Protocol) service that enables AI agents to automatically pay for purchases. It currently runs on the Base chain (operated by Coinbase) and supports USDC payments. It can be used by intelligent agents to automatically purchase paid AI-related services and data.

## Features

- 🚀 **Smart Payment**: Small automatic payments, large amount manual approval
- 💳 **USDC Payments**: Support USDC-based payments on Base chain
- 🔐 **Secure**: Environment variable based configuration for private keys
- 🤖 **AI-Native**: Full MCP integration designed for AI agents
- 💸 **Fixed Transfer**: Preset fixed transfer account command, direct transfer by command
- 🔑 **API Key Purchase**: Support GLM4.7 LLM API Key purchase service with dynamic pricing

## Tech Stack

- Node.js + TypeScript
- Model Context Protocol (MCP) SDK
- Viem (Ethereum library)
- Base Chain (Base Sepolia for dev, Base Mainnet for prod)
- USDC (EIP-3009 transferWithAuthorization)

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

#### Auto-generate OpenCode Configuration with Commands

To generate a complete `opencode.json` with predefined command shortcuts, run:

```bash
npm run install:opencode-config
```

This will create/update `opencode.json` in your project root with the following shortcut commands:

- `autopay_toA`: Pay 0.01 USDC to Account A
- `autopay_toB`: Pay 0.05 USDC to Account B (with confirmation)
- `autopay_custom`: Custom transfer (specify recipient address and amount)
- `autopay_getInfo`: Get service information (API key stock and price)
- `autopay_buy_glm_nvidia_apikey`: Buy GLM NVIDIA API Key

### Claude CLI Configuration

For detailed instructions on using Claude CLI with MCP, see [CLAUDE_CLI_MCP_SETUP.md](CLAUDE_CLI_MCP_SETUP.md).

#### Quick Setup

To generate configurations for both OpenCode and Claude CLI:

```bash
# Generate all configurations
npm run install:opencode-config

# Use with Claude CLI
claude --mcp-config mcp-config.json
```

Or manually add to Claude CLI:

```bash
BUYER_PRIVATE_KEY="your_private_key" claude mcp add iauto-pay \
  -e BUYER_PRIVATE_KEY="your_private_key" \
  -- npx -y @newblock/iautopay-mcp
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

To switch environments, modify `CUR_ENV` in `src/server.ts` and rebuild:

```bash
# Edit src/server.ts: const CUR_ENV: 'dev' | 'prod' = 'prod';
npm run build
npm publish
```

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

## Project Structure

```
iap_npm/
├── src/
│   ├── server.ts              # Main MCP server implementation
│   └── check_balance.ts       # Balance checking utilities
├── dist/                      # Compiled JavaScript output
├── scripts/
│   └── generate-opencode-config.js  # Config generation script
├── test/                      # Test files
├── package.json               # Dependencies and scripts
├── README.md                  # This file
├── QUICKSTART.md             # Quick start guide (5 min)
├── mcp-config.json.example   # MCP configuration template
└── CLAUDE_CLI_MCP_SETUP.md   # Claude CLI setup guide
```

## Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0

## Dependencies

- @modelcontextprotocol/sdk ^1.0.0
- @x402/core ^2.3.0
- @x402/evm ^2.3.0
- viem ^2.21.35
- zod ^3.24.1
- zod-to-json-schema ^3.24.1

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Type checking
npm run typecheck
```

## Security Considerations

1. **Private Key Management**
   - Private keys are stored in environment variables only
   - Never commit private keys to version control
   - Use different keys for development and production

2. **Payment Security**
   - EIP-3009 provides secure delegated transfers
   - Balance checks before transactions
   - Transaction logging for audit trail

3. **API Key Security**
   - API keys use UUID format (hard to guess)
   - Time-limited validity (1/7/30 days)
   - Automatic expiration

## License

Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0) - see [LICENSE](LICENSE) file for details.

## Repository

[https://github.com/newblock/iautopay](https://github.com/newblock/iautopay)

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/newblock/iautopay/issues).

## 📚 Documentation

### Quick Start
- [QUICKSTART.md](QUICKSTART.md) - 5分钟快速上手指南

### Detailed Documentation
- [CLAUDE_CLI_MCP_SETUP.md](CLAUDE_CLI_MCP_SETUP.md) - Claude CLI integration guide
- [mcp-config.json.example](mcp-config.json.example) - MCP configuration template

### Integration Guides
- OpenCode Integration (see Configuration section)
- Claude CLI Integration (see CLAUDE_CLI_MCP_SETUP.md)
- Claude Desktop Integration (see Configuration section)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### Version 0.0.3
- Updated to sync with iautopay/apps/mcp-server
- Added dynamic pricing support from Fact API
- Added retry mechanism for pay_stablecoin (max 3 retries with exponential backoff)
- Note: buy_apikey does NOT use retry mechanism (generates new nonce on each attempt)
- Added guide tool for new users
- Added sync_opencode_config for quick setup
- Added refresh_pricing for manual price updates
- Improved error messages and logging
- Updated API to use remote Fact API server

### Version 0.0.1
- Initial release
- Basic payment functionality
- API key purchase support
- OpenCode and Claude CLI integration
