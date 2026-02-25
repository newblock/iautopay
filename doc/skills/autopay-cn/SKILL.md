---
name: autopay-cn
description: 自动执行稳定币转账使用 iAutoPay。命令：转账给 A/B, buy api key, check info. 配置：autopay.config.json
allowed-tools: Bash
---

# AutoPay Skill for Claude Code (中文版)

此技能使 Claude Code 能够通过 iAutoPay 执行稳定币转账，无需 MCP commands 模式。

## 配置文件

技能目录包含 `autopay.config.json`，包含：
- `defaultPayments.accountA`: 账号 A 地址和金额
- `defaultPayments.accountB`: 账号 B 地址和金额
- `requireConfirmation`: 是否需要确认

**配置路径**: 技能目录根目录（脚本自动定位）

## 执行流程

### 1. 读取配置
使用 `scripts/read_config.py` 脚本自动从技能目录读取配置。

### 2. 执行命令
使用脚本或 npx 运行 iAutoPay 命令。

## 可用脚本

### read_config.py
读取配置文件，输出 JSON 格式：
```bash
# 获取账户 A 信息
./.agents/skills/autopay-cn/scripts/read_config.py A
# 输出：{"address": "...", "amountInUnits": "10000", ...}

# 获取账户 B 信息
./.agents/skills/autopay-cn/scripts/read_config.py B

# 获取完整配置
./.agents/skills/autopay-cn/scripts/read_config.py all
```

### pay_to_a.sh
转账给 A（无需确认）：
```bash
./.agents/skills/autopay-cn/scripts/pay_to_a.sh
```

### pay_to_b.sh
转账给 B（需要确认）：
```bash
./.agents/skills/autopay-cn/scripts/pay_to_b.sh
```

## 可用命令

### 转账给 A (无需确认)
**触发**: "转账给 A", "pay account A", "pay A", "send to A"

**执行**:
```bash
./.agents/skills/autopay-cn/scripts/pay_to_a.sh
```

或手动执行：
1. 读取配置：`./.agents/skills/autopay-cn/scripts/read_config.py A`
2. 执行：
```bash
npx -y @newblock/iautopay-mcp pay_stablecoin --to <address> --amount <amountInUnits>
```

### 转账给 B (需要确认)
**触发**: "转账给 B", "pay account B", "pay B", "send to B"

**执行**:
```bash
./.agents/skills/autopay-cn/scripts/pay_to_b.sh
```

或手动执行：
1. 读取配置：`./.agents/skills/autopay-cn/scripts/read_config.py B`
2. 询问用户确认
3. 确认后执行：
```bash
npx -y @newblock/iautopay-mcp pay_stablecoin --to <address> --amount <amountInUnits>
```

### 购买 API Key
**触发**: "buy api key", "购买 API key", "purchase api key"

**执行**:
```bash
npx -y @newblock/iautopay-mcp buy_apikey --duration <days>
```

### 查看服务器信息
**触发**: "check autopay info", "查看 API key 库存", "api key price"

**执行**:
```bash
npx -y @newblock/iautopay-mcp info
```

### 查看使用指南
**触发**: "autopay guide", "how to use autopay", "autopay help"

**执行**:
```bash
npx -y @newblock/iautopay-mcp guide
```

### 刷新价格
**触发**: "refresh pricing", "update prices"

**执行**:
```bash
npx -y @newblock/iautopay-mcp refresh_pricing
```

## 使用示例

**User**: 转账给 A

**Claude**: 
执行：`./.agents/skills/autopay-cn/scripts/pay_to_a.sh`
报告成功

**User**: 转账给 B

**Claude**: 
执行：`./.agents/skills/autopay-cn/scripts/pay_to_b.sh`
询问确认，确认后执行

**User**: buy a 7 day api key

**Claude**: 执行：`npx -y @newblock/iautopay-mcp buy_apikey --duration 7`

**User**: 查看 API key 价格

**Claude**: 执行：`npx -y @newblock/iautopay-mcp info`

## 注意事项

1. 配置文件位于技能目录根目录，脚本自动定位
2. 私钥来自 `opencode.json` MCP 环境：`BUYER_PRIVATE_KEY`
3. 转账给 A：无需确认
4. 转账给 B：必须先询问确认
5. 金额单位：10000 = 0.1 USDC

## 快捷命令参考

如果 opencode.json 配置了快捷命令：
- `autopay_toA` → 转账给 A
- `autopay_toB` → 转账给 B (需确认)
- `autopay_buy_apikey` → 购买 API key
- `autopay_info` → 查看服务器信息
