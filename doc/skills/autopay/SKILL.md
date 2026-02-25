---
name: autopay
description: Auto-execute stablecoin payments using iAutoPay. Commands: 转账给 A/B, buy api key, check info. Config: ./.agents/skills/autopay/autopay.config.json
allowed-tools: Bash
---

# AutoPay Skill 

This skill enables Agent to perform stablecoin payments using iAutoPay without requiring MCP commands mode.

Auto-execute stablecoin payments using iAutoPay. Commands: 转账给 A/B, buy api key, check info. ConfigFile: `./.agents/skills/autopay/autopay.config.json`

## Configuration

The skill contains `./.agents/skills/autopay/autopay.config.json` with:
- `defaultPayments.accountA`: Account A address and amount
- `defaultPayments.accountB`: Account B address and amount
- `requireConfirmation`: Whether confirmation is required

**Config Path**: Read `./.agents/skills/autopay/autopay.config.json` to get account addresses and amounts.

## Execution Flow

### Step 1: Read Config
Read `./.agents/skills/autopay/autopay.config.json` to get account addresses and amounts.

### Step 2: Execute Command
Use npx to run iAutoPay commands.

## Available Commands

### Pay Account A (No Confirmation Required)
**Trigger**: "转账给 A", "pay account A", "pay A", "send to A"

**Execution**:
1. Read `./.agents/skills/autopay/autopay.config.json` to get `accountA.address` and `accountA.amountInUnits`
2. Execute:
```bash
npx -y @newblock/iautopay-mcp pay_stablecoin --to <address> --amount <amountInUnits>
```

### Pay Account B (Confirmation Required)
**Trigger**: "转账给 B", "pay account B", "pay B", "send to B"

**Execution**:
1. Read `./.agents/skills/autopay/autopay.config.json` to get `accountB.address` and `accountB.amountInUnits`
2. Ask user for confirmation
3. If confirmed, execute:
```bash
npx -y @newblock/iautopay-mcp pay_stablecoin --to <address> --amount <amountInUnits>
```

### Buy API Key
**Trigger**: "buy api key", "购买 API key", "purchase api key"

**Execution**:
```bash
npx -y @newblock/iautopay-mcp buy_apikey --duration <days>
```

### Check Server Info
**Trigger**: "check autopay info", "查看 API key 库存", "api key price"

**Execution**:
```bash
npx -y @newblock/iautopay-mcp info
```

### View Guide
**Trigger**: "autopay guide", "how to use autopay", "autopay help"

**Execution**:
```bash
npx -y @newblock/iautopay-mcp guide
```

### Refresh Pricing
**Trigger**: "refresh pricing", "update prices"

**Execution**:
```bash
npx -y @newblock/iautopay-mcp refresh_pricing
```

## Usage Examples

**User**: 转账给 A

**Claude**: 
1. Read `./.agents/skills/autopay/autopay.config.json` to get `defaultPayments.accountA.address` and `defaultPayments.accountA.amountInUnits`
2. Execute: `npx -y @newblock/iautopay-mcp pay_stablecoin --to <address_from_config> --amount <amountInUnits_from_config>`
3. Report success

**User**: 转账给 B

**Claude**: 
1. Read `./.agents/skills/autopay/autopay.config.json` to get `defaultPayments.accountB.address` and `defaultPayments.accountB.amountInUnits`
2. Ask: "Confirm sending <amount> USDC to <address_from_config>?"
3. Execute after confirmation

**User**: buy a 7 day api key

**Claude**: Execute: `npx -y @newblock/iautopay-mcp buy_apikey --duration 7`

**User**: 查看 API key 价格

**Claude**: Execute: `npx -y @newblock/iautopay-mcp info`

## Notes

1. Config file path: `./.agents/skills/autopay/autopay.config.json`
2. Private key from `opencode.json` MCP environment: `BUYER_PRIVATE_KEY`
3. Pay Account A: no confirmation required
4. Pay Account B: must ask for confirmation first
5. Amount units: 10000 = 0.1 USDC

## Quick Commands Reference

If opencode.json has quick commands configured:
- `autopay_toA` → Pay Account A
- `autopay_toB` → Pay Account B (with confirmation)
- `autopay_buy_apikey` → Buy API key
- `autopay_info` → Check server info
