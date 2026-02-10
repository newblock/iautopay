# @newblock/iautopay-mcp

基于 iAutoPay 的 x402 支付协议和 EIP-3009 支持的 MCP（Model Context Protocol）服务器。

## 特性

- 🚀 **自主支付**：使用 EIP-3009 transferWithAuthorization 支付稳定币
- 💳 **USDC 支持**：支持 Base 主网和 Base Sepolia 测试网的 USDC
- 🔐 **安全可靠**：基于环境变量的私钥配置
- 🤖 **AI 友好**：完整的 MCP 集成，支持 Claude Code 和 OpenCode
- 📊 **事件管理**：注册、解决和获取事件证明

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

# 可选：自定义 Fact API 地址（默认：http://localhost:8787）
# export FACT_API_URL="http://localhost:8787"
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

### pay_test_stablecoin

在 Base Sepolia 测试网上强制支付。

**参数：**
```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "1000000"
}
```

### buy_apikey

购买 API 密钥，价格 0.2 USDC。

**参数：**
```json
{}
```

**返回值：**
```json
{
  "apiKey": "sk-RxmFQ2cLfBaefDFfkYlEGY51E74pl5h06bAHbF41vyCCCC",
  "txHash": "0x4d757c7e121ad31607ee1e9c5af65bfe13b82c112fcf077638814c031ecc3a6b",
  "payState": "paid"
}
```

## 环境配置

MCP 服务器支持在 `src/server.ts` 中配置的两个环境：

### 生产环境（Base 主网）
- Chain ID: 8453
- RPC URL: https://mainnet.base.org
- USDC 地址: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
- Token 名称: "USD Coin"

### 开发环境（Base Sepolia）
- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- USDC 地址: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- Token 名称: "USDC"

切换环境，修改 `src/server.ts` 中的 `CUR_ENV` 并重新构建：

```bash
# 编辑 src/server.ts: const CUR_ENV: 'dev' | 'prod' = 'prod';
npm run build
npm publish
```

## 示例工作流

### 示例 1：购买 API 密钥

```
使用 iauto-pay_buy_apikey 工具购买 API 密钥
```

### 示例 2：发送支付

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
