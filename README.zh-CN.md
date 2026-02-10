# @newblock/iautopay-mcp

iAutoPay 是一个让智能体自动进行支付购买的 MCP 服务，当前使用 Base 链（Coinbase 运营），支持 USDC 进行支付，可用于智能体 Agent 自动购买付费的 AI 相关服务和数据。

## 特性

- 🚀 **智能支付**：小额自动支付功能，大额人工审核放行功能
- 💳 **USDC 支付**：支持基于 Base 链的 USDC 支付购买
- 🔐 **安全可靠**：基于环境变量的私钥配置
- 🤖 **AI 原生**：完整的 MCP 集成，专为 AI 智能体设计
- 💸 **固定转账**：预设固定转账账户命令，命令直接转账
- 🔑 **API Key 购买**：支持 GLM4.7 LLM 的 APIKEY 购买服务

## 快速开始（推荐）

无需安装！直接运行：

```bash
npx @newblock/iautopay-mcp
```

这将自动下载并缓存该包。

## 安装方式

### 方式 1：npx（推荐）

```bash
npx @newblock/iautopay-mcp
```

### 方式 2：全局安装

```bash
npm install -g @newblock/iautopay-mcp
iautopay-mcp
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
# 必需：用于签名支付的私钥
export BUYER_PRIVATE_KEY="0x..."
```

### OpenCode 配置

在你的 `opencode.json` 中添加：

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

### Claude Code 配置

在你的 `~/.claude/claude_desktop_config.json` 中添加：

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

## MCP 工具

### pay_stablecoin

使用 EIP-3009 transferWithAuthorization 直接支付稳定币。

**参数：**
```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "1000000"
}
```

**使用示例：**
```
使用 iauto-pay_pay_stablecoin 工具向 0x123... 发送 1 USDC
```

**提示**：可以预设常用转账地址和金额，避免每次手动输入，提高使用便利性。

### buy_glm_apikey

购买 GLM4.7 LLM 的 APIKEY。

**参数：**
```json
{}
```

**返回值：**
```json
{
  "apiKey": "sk-ABCD12345678901234567890",
  "txHash": "0x4d757c7e121ad31607ee1e9c5af65bfe13b82c112fcf077638814c031ecc3a6b",
  "payState": "paid"
}
```


## 示例工作流

### 示例 1：购买 GLM4.7 API Key

```
使用 iauto-pay_buy_glm_apikey 工具购买 GLM4.7 LLM 的 API Key
```

### 示例 2：直接 USDC 支付

```
使用 iauto-pay_pay_stablecoin 工具向 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c 发送 0.01 USDC
```

## 系统要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 依赖项

- @modelcontextprotocol/sdk ^1.0.0
- @x402/core ^2.3.0
- @x402/evm ^2.3.0
- viem ^2.21.35
- zod ^3.24.1
- zod-to-json-schema ^3.24.1

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 仓库

[https://github.com/newblock/iautopay](https://github.com/newblock/iautopay)

## 支持

如有问题和建议，请使用 [GitHub Issues](https://github.com/newblock/iautopay/issues)。
