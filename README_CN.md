# iAutoPay MCP 服务

iAutoPay 是一个 MCP (Model Context Protocol) 服务，使 AI 智能体能够自动支付购买费用。它目前运行在 Base 链上（由 Coinbase 运营），支持 USDC 支付。智能体可以通过它自动购买付费的 AI 相关服务和数据。

## 功能特性

- 🚀 **智能支付**：小额自动支付，大额需要人工批准
- 💳 **USDC 支付**：支持基于 Base 链的 USDC 支付
- 🔐 **安全配置**：基于环境变量的私钥配置
- 🤖 **AI 原生**：专为 AI 智能体设计的完整 MCP 集成
- 💸 **固定转账**：预设固定转账账户命令，直接通过命令转账
- 🔑 **API Key 购买**：支持 GLM4.7 LLM API Key 购买服务，动态定价

## 支持的模型

通过本服务购买的 API Key 可访问以下模型：
- `z-ai/glm4.7`（支持思维链的 GLM4.7）
- `minimaxai/minimax-m2.1`（MiniMax 通用大模型）
- `deepseek-ai/deepseek-v3.2`（支持思维链的 DeepSeek）

## 安装

### 方式 1：npx（推荐）

无需安装！直接运行：

```bash
npx @newblock/iautopay-mcp
```

这会自动下载并缓存该包。

### 方式 2：全局安装

```bash
npm install -g @newblock/iautopay-mcp
@newblock/iautopay-mcp
```

### 方式 3：项目依赖

```bash
npm install @newblock/iautopay-mcp
node node_modules/@newblock/iautopay-mcp/dist/iautopay-mcp.js
```

## 配置

### 环境变量

设置必需的环境变量：

```bash
# 必需：用于签名支付的钱包私钥
export BUYER_PRIVATE_KEY="0x..."
```

### OpenCode 配置

添加到你的 `opencode.json`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "autopay": {
      "type": "local",
      "command": ["npx", "-y", "@newblock/iautopay-mcp"],
      "enabled": true,
      "environment": {
        "BUYER_PRIVATE_KEY": "0xEVM_wallet_private_key"
      }
    }
  }
}
```

### Claude CLI 配置

关于使用 Claude CLI 与 MCP 集成的详细说明，请参阅 [CLAUDE_CLI_MCP_SETUP.md](CLAUDE_CLI_MCP_SETUP.md)。

#### 快速设置

```bash
# 安装并添加到 Claude CLI
BUYER_PRIVATE_KEY="your_private_key" claude mcp add autopay \
  -e BUYER_PRIVATE_KEY="your_private_key" \
  -- npx -y @newblock/iautopay-mcp

# 使用 MCP 配置
claude --mcp-config mcp-config.json
```

### Claude Code 配置

添加到你的 `~/.claude/claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "autopay": {
      "command": "npx",
      "args": ["-y", "@newblock/iautopay-mcp"],
      "env": {
        "BUYER_PRIVATE_KEY": "0xEVM_wallet_private_key"
      }
    }
  }
}
```

## MCP 工具

### guide

⭐ **首次使用？** 运行此指南了解如何使用 iAutoPay 工具和命令。

**参数：**
```json
{}
```

**返回：**
- 包含所有工具和命令的完整指南
- 价格信息
- 网络配置

### info

获取 iAutoPay 服务器信息（API Key 库存、价格、网络配置）。

**参数：**
```json
{}
```

**返回：**
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

购买 API Key，可选时长（1/7/30 天）。

**参数：**
```json
{
  "duration": 1
}
```

**时长选项：**
- `1`：1 天有效期
- `7`：7 天有效期
- `30`：30 天有效期

**返回：**
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

使用 EIP-3009 向任意地址支付稳定币。

**参数：**
```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "100000"
}
```

**金额以最小单位计**（例如：100000 = 0.1 USDC，1000000 = 1 USDC）

**返回：**
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

自动配置 opencode.json 添加快捷命令（autopay_toA、autopay_toB 等）。

**参数：**
```json
{}
```

**返回：**
```json
{
  "message": "✅ 已添加 7 个命令到 opencode.json"
}
```

### 快捷命令

在 `opencode.json` 中添加这些快捷命令以更快访问：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "command": {
    "autopay_toA": {
      "template": "使用 pay_stablecoin 工具向 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c 支付 0.01 USDC，参数为：to=\"0x1a85156c2943b63febeee7883bd84a7d1cf0da0c\", amount=\"10000\"",
      "description": "支付0.01 USDC给A账户"
    },
    "autopay_toB": {
      "template": "首先使用 question 工具询问用户确认，选项包括：1) 确认（继续支付），2) 取消（不进行支付）。显示支付详情：向 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c 支付 0.05 USDC，参数为：to=\"0x1a85156c2943b63febeee7883bd84a7d1cf0da0c\", amount=\"50000\"。只有用户选择确认时才继续支付。",
      "description": "支付0.05 USDC给A账户（需要确认）"
    },
    "autopay_buy_apikey_1day": {
      "template": "使用 buy_apikey 工具购买1天API Key，参数为：{\"duration\": 1}",
      "description": "购买1天API Key（0.09 USDC）"
    },
    "autopay_buy_apikey_7days": {
      "template": "使用 buy_apikey 工具购买7天API Key，参数为：{\"duration\": 7}",
      "description": "购买7天API Key（0.49 USDC）"
    },
    "autopay_buy_apikey_30days": {
      "template": "使用 buy_apikey 工具购买30天API Key，参数为：{\"duration\": 30}",
      "description": "购买30天API Key（0.99 USDC）"
    },
    "autopay_get_info": {
      "template": "使用 info 工具获取服务器信息（API Key 库存、价格、网络配置）",
      "description": "获取iAutoPay服务器信息"
    },
    "autopay_guide": {
      "template": "使用 guide 工具显示 iAutoPay 使用指南",
      "description": "显示iAutoPay使用指南"
    }
  }
}
```

运行 `sync_opencode_config` 工具可自动将这些命令添加到你的配置中。

### refresh_pricing

从 API 刷新价格。如果服务器价格发生变化，请使用此工具。

**参数：**
```json
{}
```

**返回：**
```json
{
  "1day": "0.09 USDC",
  "7days": "0.49 USDC",
  "30days": "0.99 USDC"
}
```

## 环境配置

MCP 服务器支持在 `src/server.ts` 中配置两种环境：

### 开发环境（Base Sepolia）
- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- USDC 地址: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- Token 名称: "USDC"

### 生产环境（Base Mainnet）
- Chain ID: 8453
- RPC URL: https://mainnet.base.org
- USDC 地址: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
- Token 名称: "USD Coin"

## 使用示例

### 示例 1：购买 GLM4.7 API Key

```
使用 info 工具检查库存和价格
使用 buy_apikey 工具，参数 duration: 1
在响应中接收 API Key
```

### 示例 2：直接 USDC 支付

```
使用 pay_stablecoin 工具，参数 to: "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c" 和 amount: "10000"
交易自动执行
接收交易哈希
```

## 许可证

知识共享署名-非商业性使用 4.0 国际许可协议 (CC BY-NC 4.0) - 详见 [LICENSE](LICENSE) 文件。

## 仓库地址

[https://github.com/newblock/iautopay](https://github.com/newblock/iautopay)

## 支持

如有问题和疑问，请使用 [GitHub Issues](https://github.com/newblock/iautopay/issues)。

## 文档

- [CLAUDE_CLI_MCP_SETUP.md](CLAUDE_CLI_MCP_SETUP.md) - Claude CLI 集成指南
- [mcp-config.json.example](mcp-config.json.example) - MCP 配置模板
