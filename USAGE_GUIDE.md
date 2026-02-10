# iAutoPay MCP Usage Guide

This document provides detailed usage instructions, configuration examples, and use cases for iAutoPay MCP.

## Table of Contents

- [Configuring opencode.json](#configuring-opencodejson)
- [MCP Tools Details](#mcp-tools-details)
- [Command Alias Usage](#command-alias-usage)

## Configuring opencode.json

Ensure `opencode.json` is properly configured:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "iauto-pay": {
      "type": "local",
      "command": ["sh", "-c", "cd /Users/michael/opc/proj/iautopay && npx tsx apps/mcp-server/src/server.ts"],
      "enabled": true,
      "environment": {
        "BUYER_PRIVATE_KEY": "your_private_key"
      }
    }
  },
  "command": {
    "payToA": {
      "template": "Use iauto-pay_pay_stablecoin tool to send 0.01 USDC to 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c, parameters: to=\"0x1a85156c2943b63febeee7883bd84a7d1cf0da0c\", amount=\"10000\"",
      "description": "Pay 0.01 USDC to account A"
    },
    "payToB": {
      "template": "First use question tool to ask user for confirmation, options: 1) Confirm (continue payment), 2) Cancel (no payment). Show payment details: send 0.05 USDC to 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c, parameters: to=\"0x1a85156c2943b63febeee7883bd84a7d1cf0da0c\", amount=\"50000\". Only proceed with payment when user confirms.",
      "description": "Pay 0.05 USDC to account A (requires confirmation)"
    },
    "buy_GLM4.7_APIKEY": {
      "template": "Use iauto-pay_buy_apikey tool to purchase API Key",
      "description": "Purchase API Key"
    }
  }
}
```

## MCP Tools Details

### 1. pay_stablecoin

**Function**: Use EIP-3009 transferWithAuthorization for stablecoin payment

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| to | string | Recipient address |
| amount | string | Payment amount (smallest unit, 1 USDC = 1,000,000) |

**Network**: Automatically selected based on `CUR_ENV` (dev/prod)

**Example**:
```json
{
  "to": "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c",
  "amount": "10000"
}
```

**Returns**:
```json
{
  "success": true,
  "txHash": "0x...",
  "amount": "10000",
  "to": "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c"
}
```

### 2. pay_test_stablecoin

**Function**: Force payment on Base Sepolia testnet

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| to | string | Recipient address |
| amount | string | Payment amount (smallest unit) |

**Network**: Fixed to Base Sepolia (Chain ID 84532)

**USDC Address**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

**Example**:
```json
{
  "to": "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c",
  "amount": "10000"
}
```

### 3. buy_apikey

**Function**: Purchase API Key

**Price**: 0.2 USDC

**Parameters**: None

**Example**:
```json
{}
```

**Returns**:
```json
{
  "apiKey": "sk-RxmFQ2cLfBaefDFfkYlEGY51E74pl5h06bAHbF41vyCCCC",
  "txHash": "0x4d757c7e121ad31607ee1e9c5af65bfe13b82c112fcf077638814c031ecc3a6b",
  "payState": "paid"
}
```

## Command Alias Usage

The project includes three command aliases in `opencode.json` to simplify common operations:

### /payToA - Small Automatic Payment

**Function**: Pay 0.01 USDC to account A (no confirmation required)

**Shortcut**: Enter `/payToA`

**Underlying Call**:
```json
{
  "to": "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c",
  "amount": "10000"
}
```

**Use Cases**:
- Small test transfers
- Quick payment verification
- Development and debugging

**Example**:
```
User: /payToA
```

### /payToB - Large Confirmation Payment

**Function**: Pay 0.05 USDC to account A (requires user confirmation)

**Shortcut**: Enter `/payToB`

**Underlying Call**:
```json
{
  "to": "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c",
  "amount": "50000"
}
```

**Use Cases**:
- Large transfers
- Transactions requiring secondary confirmation
- Production environment payments

**Example**:
```
User: /payToB
System: Send 0.05 USDC to 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c, please choose:
  1) Confirm (continue payment)
  2) Cancel (no payment)
User: 1
System: ✓ Payment successful, transaction hash: 0x...
```

### /buy_GLM4.7_APIKEY - Purchase API Key

**Function**: Purchase API Key

**Shortcut**: Enter `/buy_GLM4.7_APIKEY`

**Underlying Call**: `buy_apikey` tool

**Price**: 0.2 USDC

**Use Cases**:
- Get API Key for paid services
- Purchase API Token
- Obtain service authorization

**Example**:
```
User: /buy_GLM4.7_APIKEY
System: ✓ Purchase successful
  API Key: sk-RxmFQ2cLfBaefDFfkYlEGY51E74pl5h06bAHbF41vyCCCC
  Transaction Hash: 0x4d757c7e121ad31607ee1e9c5af65bfe13b82c112fcf077638814c031ecc3a6b
  Payment Status: paid
```
