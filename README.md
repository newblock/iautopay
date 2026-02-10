# iautopay-mcp

iAutoPay is an MCP service that enables AI agents to automatically pay for purchases. It currently runs on the Base chain (operated by Coinbase) and supports USDC payments. It can be used by intelligent agents to automatically purchase paid AI-related services and data.

## Features

- 🚀 **Smart Payment**: Small automatic payments, large amount manual approval
- 💳 **USDC Payments**: Support USDC-based payments on Base chain
- 🔐 **Secure**: Environment variable based configuration for private keys
- 🤖 **AI-Native**: Full MCP integration designed for AI agents
- 💸 **Fixed Transfer**: Preset fixed transfer account command, direct transfer by command
- 🔑 **API Key Purchase**: Support GLM4.7 LLM APIKEY purchase service

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
Use iauto-pay_pay_stablecoin tool to send 1 USDC to 0x123...
```

**Tip**: You can preset frequently used transfer addresses and amounts to avoid manual input each time, improving convenience.

### buy_glm_apikey

**Tip**: You can preset frequently used transfer addresses and amounts to avoid manual input each time, improving convenience.

### buy_glm_apikey

Purchase GLM4.7 LLM APIKEY.

**Parameters:**
```json
{}
```

**Returns:**
```json
{
  "apiKey": "sk-ABCD12345678901234567890",
  "txHash": "0x4d757c7e121ad31607ee1e9c5af65bfe13b82c112fcf077638814c031ecc3a6b",
  "payState": "paid"
}
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

For detailed usage examples and command aliases, see [Usage Guide](USAGE_GUIDE.md).

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

### Example 1: Purchase GLM4.7 API Key

```
Use iauto-pay_buy_glm_apikey tool to purchase GLM4.7 LLM API Key
```

### Example 2: Direct USDC Payment

```
Use iauto-pay_pay_stablecoin tool to send 0.01 USDC to 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c
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
