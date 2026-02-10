# iAutoPay MCP 使用指南

本文档提供 iAutoPay MCP 的详细使用方法、配置示例和使用案例。

## 目录

- [配置 opencode.json](#配置-opencodejson)
- [MCP 工具详解](#mcp-工具详解)
- [命令别名使用](#命令别名使用)

## 配置 opencode.json

确保 `opencode.json` 已正确配置：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "iauto-pay": {
      "type": "local",
      "command": ["sh", "-c", "cd /Users/michael/opc/proj/iautopay && npx tsx apps/mcp-server/src/server.ts"],
      "enabled": true,
      "environment": {
        "BUYER_PRIVATE_KEY": "你的私钥"
      }
    }
  },
  "command": {
    "payToA": {
      "template": "使用 iauto-pay_pay_stablecoin 工具向 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c 支付 0.01 USDC，参数为：to=\"0x1a85156c2943b63febeee7883bd84a7d1cf0da0c\", amount=\"10000\"",
      "description": "支付0.01 USDC给A账户"
    },
    "payToB": {
      "template": "首先使用 question 工具询问用户确认，选项包括：1) 确认（继续支付），2) 取消（不进行支付）。显示支付详情：向 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c 支付 0.05 USDC，参数为：to=\"0x1a85156c2943b63febeee7883bd84a7d1cf0da0c\", amount=\"50000\"。只有用户选择确认时才继续支付。",
      "description": "支付0.05 USDC给A账户（需要确认）"
    },
    "buy_GLM4.7_APIKEY": {
      "template": "使用 iauto-pay_buy_apikey 工具购买API Key",
      "description": "购买API Key"
    }
  }
}
```

## MCP 工具详解

### 1. pay_stablecoin

**功能**: 使用 EIP-3009 transferWithAuthorization 进行稳定币支付

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| to | string | 收款人地址 |
| amount | string | 支付金额（最小单位，1 USDC = 1,000,000） |

**使用网络**: 根据 `CUR_ENV` 自动选择（dev/prod）

**示例**:
```json
{
  "to": "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c",
  "amount": "10000"
}
```

**返回**:
```json
{
  "success": true,
  "txHash": "0x...",
  "amount": "10000",
  "to": "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c"
}
```

### 2. pay_test_stablecoin

**功能**: 在 Base Sepolia 测试网上强制支付

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| to | string | 收款人地址 |
| amount | string | 支付金额（最小单位） |

**使用网络**: 固定使用 Base Sepolia (Chain ID 84532)

**USDC 地址**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

**示例**:
```json
{
  "to": "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c",
  "amount": "10000"
}
```

### 3. buy_apikey

**功能**: 购买 API Key

**价格**: 0.2 USDC

**参数**: 无

**示例**:
```json
{}
```

**返回**:
```json
{
  "apiKey": "sk-RxmFQ2cLfBaefDFfkYlEGY51E74pl5h06bAHbF41vyCCCC",
  "txHash": "0x4d757c7e121ad31607ee1e9c5af65bfe13b82c112fcf077638814c031ecc3a6b",
  "payState": "paid"
}
```

## 命令别名使用

项目在 `opencode.json` 中预置了三个命令别名，简化常用操作：

### /payToA - 小额自动支付

**功能**: 向 A 账户支付 0.01 USDC（无需确认）

**快捷方式**: 输入 `/payToA`

**底层调用**:
```json
{
  "to": "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c",
  "amount": "10000"
}
```

**使用场景**:
- 小额测试转账
- 快速验证支付功能
- 开发调试

**示例**:
```
用户: /payToA
```

### /payToB - 大额确认支付

**功能**: 向 A 账户支付 0.05 USDC（需要用户确认）

**快捷方式**: 输入 `/payToB`

**底层调用**:
```json
{
  "to": "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c",
  "amount": "50000"
}
```

**使用场景**:
- 大额转账
- 需要二次确认的交易
- 生产环境支付

**示例**:
```
用户: /payToB
系统: 向 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c 支付 0.05 USDC，请选择：
  1) 确认（继续支付）
  2) 取消（不进行支付）
用户: 1
系统: ✓ 支付成功，交易哈希: 0x...
```

### /buy_GLM4.7_APIKEY - 购买 API Key

**功能**: 购买 API Key

**快捷方式**: 输入 `/buy_GLM4.7_APIKEY`

**底层调用**: `buy_apikey` 工具

**价格**: 0.2 USDC

**使用场景**:
- 获取 API Key 访问付费服务
- 购买 API Token
- 获取服务授权

**示例**:
```
用户: /buy_GLM4.7_APIKEY
系统: ✓ 购买成功
  API Key: sk-RxmFQ2cLfBaefDFfkYlEGY51E74pl5h06bAHbF41vyCCCC
  交易哈希: 0x4d757c7e121ad31607ee1e9c5af65bfe13b82c112fcf077638814c031ecc3a6b
  支付状态: paid
```
