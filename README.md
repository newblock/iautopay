# @newblock/iautopay-mcp

iAutoPay is an MCP service that enables AI agents to automatically pay for purchases. It currently runs on the Base chain (operated by Coinbase) and supports USDC payments. It can be used by intelligent agents to automatically purchase paid AI-related services and data.

## Features

- 🚀 **Autonomous Payments**: AI agents can automatically purchase paid services and data
- 💳 **USDC Support**: Pay with USDC on the Base blockchain
- 🔐 **Secure**: Environment variable based configuration for private keys
- 🤖 **AI-Native**: Full MCP integration designed for AI agents
- 📊 **Event Management**: Register, resolve, and get attestations for events

## Quick Start with npx (Recommended)

No installation required! Just run:

```bash
npx @newblock/iautopay-mcp
```

This will automatically download and cache the package.

## Installation

### Option 1: npx (Recommended)

```bash
npx @newblock/iautopay-mcp
```

### Option 2: Global Install

```bash
npm install -g @newblock/iautopay-mcp
iautopay-mcp
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

### pay_stablecoin

Direct stablecoin payment using EIP-3009 transferWithAuthorization.

**Parameters:**
```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "1000000"
}
```

**Usage example:**
```
Use the iauto-pay_pay_stablecoin tool to send 1 USDC to 0x123...
```

### pay_test_stablecoin

Force payment on Base Sepolia testnet.

**Parameters:**
```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "1000000"
}
```

### buy_apikey

Purchase an API key for 0.2 USDC.

**Parameters:**
```json
{}
```

**Returns:**
```json
{
  "apiKey": "sk-RxmFQ2cLfBaefDFfkYlEGY51E74pl5h06bAHbF41vyCCCC",
  "txHash": "0x4d757c7e121ad31607ee1e9c5af65bfe13b82c112fcf077638814c031ecc3a6b",
  "payState": "paid"
}
```

## Environment Configuration

The MCP server supports two environments configured in `src/server.ts`:

### Production (Base Mainnet)
- Chain ID: 8453
- RPC URL: https://mainnet.base.org
- USDC Address: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
- Token Name: "USD Coin"

### Development (Base Sepolia)
- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- USDC Address: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- Token Name: "USDC"

To switch environments, modify `CUR_ENV` in `src/server.ts` and rebuild:

```bash
# Edit src/server.ts: const CUR_ENV: 'dev' | 'prod' = 'prod';
npm run build
npm publish
```

## Example Workflows

### Example 1: Buy API Key

```
Use the iauto-pay_buy_apikey tool to purchase an API key
```

### Example 2: Send Payment

```
Use the iauto-pay_pay_stablecoin tool to send 0.01 USDC to 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c
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

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Repository

[https://github.com/newblock/iautopay](https://github.com/newblock/iautopay)

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/newblock/iautopay/issues).
