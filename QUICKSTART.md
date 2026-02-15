# Quick Start Guide

## 🚀 Service Ready

The iAutoPay MCP service is now fully operational with the following features:

### ✅ Core Features

1. **Multiple Payment Options**
   - `pay_stablecoin` - Direct USDC payment to any address
   - `buy_apikey` - Purchase API keys with 1/7/30 day duration options

2. **API Key Management**
   - Create API keys with 1, 7, or 30 day validity periods
   - Automatic expiration management
   - Balance checking before purchase

3. **Smart Payment System**
   - EIP-3009 transferWithAuthorization support
   - USDC-based payments on Base chain
   - Real-time balance tracking

4. **Developer Tools**
   - Quick command shortcuts for common operations
   - Real-time pricing updates
   - OpenCode and Claude CLI integration

## 📋 Configuration

### Environment Variables

Set required environment variables:

```bash
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

## 🎯 Quick Steps

### 1. Start the Service

```bash
# Using npx (recommended)
npx @newblock/iautopay-mcp

# Or install globally
npm install -g @newblock/iautopay-mcp
iautopay-mcp
```

### 2. Get Service Information

Run the `info` tool to check API key stock and pricing:

```json
{"name": "info", "arguments": {}}
```

### 3. Purchase API Key

```json
{"name": "buy_apikey", "arguments": {"duration": 1}}
```

Duration options: `1` (1 day), `7` (7 days), `30` (30 days)

### 4. Make a Payment

```json
{
  "name": "pay_stablecoin",
  "arguments": {
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "10000"
  }
}
```

Amount is in smallest units (10000 = 0.01 USDC)

## 🧪 Testing

Run the built-in test:

```bash
npm test
```

## 📚 Code Examples

### Node.js (OpenAI SDK)

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'YOUR_IAP_API_KEY',
  baseURL: 'http://localhost:3000/v1'
});

// Simple completion
const response = await client.chat.completions.create({
  model: 'z-ai/glm4.7',
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Streaming
const stream = await client.chat.completions.create({
  model: 'z-ai/glm4.7',
  messages: [{ role: 'user', content: 'Write a poem' }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    api_key='YOUR_IAP_API_KEY',
    base_url='http://localhost:3000/v1'
)

# Simple completion
response = client.chat.completions.create(
    model='z-ai/glm4.7',
    messages=[{'role': 'user', content': 'Hello!'}]
)
print(response.choices[0].message.content)

# Streaming
stream = client.chat.completions.create(
    model='z-ai/glm4.7',
    messages=[{'role': 'user', content': 'Write a poem'}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end='')
```

## 🔧 Architecture

```
iap_npm/
├── src/
│   ├── server.ts              # Main MCP server implementation
│   └── check_balance.ts       # Balance checking utilities
├── dist/                      # Compiled JavaScript output
├── scripts/
│   └── generate-opencode-config.js  # Config generation script
├── package.json               # Dependencies and scripts
├── README.md                  # Project documentation
├── QUICKSTART.md             # This file
├── mcp-config.json.example   # MCP configuration template
└── CLAUDE_CLI_MCP_SETUP.md   # Claude CLI setup guide
```

## ⚡ Performance Optimization

1. **API Caching**
   - Pricing information cached from Fact API
   - Automatic refresh on startup and on demand

2. **Retry Mechanism**
   - pay_stablecoin: Up to 3 retry attempts with exponential backoff for failed requests
   - buy_apikey: No retry (generates new nonce on each attempt for security)

3. **Balance Validation**
   - Pre-transaction balance checks
   - Real-time balance tracking

## 🛡️ Security Recommendations

1. Private keys are stored in environment variables, never in code
2. All payments require explicit authorization
3. API keys use UUID format for security
4. Payment signatures use EIP-3009 for secure delegated transfers

## 📝 Documentation

- `README.md` - Full project documentation
- `CLAUDE_CLI_MCP_SETUP.md` - Claude CLI setup instructions
- `mcp-config.json.example` - MCP configuration template

## 🎉 Done!

The service is ready to use. Start making payments and purchasing API keys today!
