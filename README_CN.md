# iAutoPay MCP 服务

iAutoPay 是一个 MCP (Model Context Protocol) 服务，使 AI 智能体能够自动支付购买费用。它目前运行在 Base 链上（由 Coinbase 运营），支持 USDC 支付。智能体可以通过它自动购买付费的 AI 相关服务和数据。

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

## 配置

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

### 快捷命令配置

在 `opencode.json` 中添加这些快捷命令以更快访问：

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
  },
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

### Opencode 快捷命令使用示例

1：/autopay_guide

输出结果：

iAutoPay 使用指南
可用工具
- guide - 显示完整使用指南
- info - 获取服务器信息（库存、价格、网络配置）
- buy_apikey - 购买 API key（支持1/7天时长）
- pay_stablecoin - 支付稳定币到指定地址
- sync_opencode_config - 自动配置 opencode.json 快捷命令
- refresh_pricing - 从服务器刷新价格
快捷命令
- autopay_toA - 快速支付 0.01 USDC
- autopay_toB - 支付 0.1 USDC（需确认）
- autopay_buy_apikey_1day - 购买1天API Key（0.1 USDC）
- autopay_buy_apikey_7days - 购买7天API Key（0.9 USDC）
- autopay_get_info - 快速获取服务器信息
网络信息
- Testnet: Base Sepolia (84532)
- Mainnet: Base Mainnet (8453)
- 当前网络: Base Sepolia (84532)
定价
- 1天: 0.1 USDC
- 7天: 0.9 USDC
环境: dev

2：/autopay_toA

输出结果：

正在向 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c 支付 0.01 USDC...
交易哈希: 0xabc123...
支付成功！

3：/autopay_toB

输出结果：

请确认支付操作：
- 支付金额: 0.05 USDC
- 收款地址: 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c
- 网络: Base Sepolia (84532)

选择: 1) 确认  2) 取消
[用户选择确认]

正在向 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c 支付 0.05 USDC...
交易哈希: 0xdef456...
支付成功！

4：/autopay_buy_apikey_1day

输出结果：

购买1天API Key...
价格: 0.09 USDC
正在支付...
交易哈希: 0xghi789...
购买成功！

您的API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
有效期: 1天


## 许可证

知识共享署名-非商业性使用 4.0 国际许可协议 (CC BY-NC 4.0) - 详见 [LICENSE](LICENSE) 文件。

## 仓库地址

[https://github.com/newblock/iautopay](https://github.com/newblock/iautopay)

## 支持

如有问题和疑问，请使用 [GitHub Issues](https://github.com/newblock/iautopay/issues)。

## 文档

- [CLAUDE_CLI_MCP_SETUP.md](CLAUDE_CLI_MCP_SETUP.md) - Claude CLI 集成指南
- [mcp-config.json.example](mcp-config.json.example) - MCP 配置模板
