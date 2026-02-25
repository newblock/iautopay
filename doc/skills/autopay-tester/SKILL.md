---
name: autopay-tester
description: Test and execute autopay operations with natural language prompts
allowed-tools: Bash, question, autopay_pay_stablecoin, autopay_buy_apikey, autopay_info, read
---

# AutoPay Tester Skill

This skill helps you test and execute autopay operations using natural language prompts.

## Supported Prompts

### Configuration Tests
- "test config", "check config", "verify config"
- "test account A", "test account A config"
- "test account B", "test account B config"

### Real Payments
- "转给A", "转账给A", "pay A", "pay to A"
- "转给B", "转账给B", "pay B", "pay to B"
- "buy 1 day", "buy 1 day api", "购买1天key"
- "buy 7 days", "buy 7 days api", "购买7天key"
- "buy 30 days", "buy 30 days api", "购买30天key"
- "check info", "查看信息", "server info"

### Full Test Suite
- "test all", "run all tests", "全部测试"
- "测试全部", "测试左右", "run tests", "执行测试"

### Full Test Suite Execution Flow (测试全部执行流程)
当用户说 "测试全部" 或 "测试全部":
1. 执行 autopay_info - 获取服务器状态、价格、余额
2. 执行 autopay_refresh_pricing - 刷新价格
3. 读取配置文件 - 验证账户配置
4. (可选) 执行实际交易测试 - 转账给 A、购买 API Key 等

### Transaction Tests (实际转账测试)
- "测试转账给A", "转账测试A", "pay test A"
- "测试转账给B", "转账测试B", "pay test B"
- "测试购买1天", "购买key测试", "buy 1 day test"
- "测试购买7天", "buy 7 days test"
- "测试购买30天", "buy 30 days test"
- "测试检查服务", "服务检查测试", "info test"

## Test Execution

### Test 1: Verify Config
1. Check if config exists at `./.agents/skills/autopay/autopay.config.json`
2. Read and display config content

### Test 2-3: Read Account Config
Extract and display account address and amount from config

### Full Test Suite (测试全部)
当用户说 "测试全部" 时执行完整测试流程:
1. 执行 autopay_info - 获取服务器状态、价格、余额、网络配置
2. 执行 autopay_refresh_pricing - 刷新价格
3. 读取配置文件 - 验证账户 A/B 配置
4. 显示完整测试报告 (服务器状态、价格、账户配置、余额)

### Transaction Test Actions (实际转账测试)
当用户说 "测试转账给 A" 或 "转账测试 A":
1. 读取账户 A 配置
2. 执行 autopay_pay_stablecoin 使用 amountInUnits
3. 显示交易结果

当用户说 "测试转账给 B" 或 "转账测试 B":
1. 读取账户 B 配置
2. 显示确认信息 (需确认)
3. 执行 autopay_pay_stablecoin
4. 显示交易结果

当用户说 "测试购买 1 天/7 天/30 天" 或 "购买 key 测试":
1. 执行 autopay_buy_apikey 对应时长
2. 显示 apiKey 和 txHash

当用户说 "测试检查服务" 或 "服务检查测试":
1. 执行 autopay_info
2. 显示价格、余额、网络配置

## Usage Examples

**User**: 转给A

**Claude**:
- Reads config: address=`0x1a85156c...`, amountInUnits=`10000`
- Executes: autopay_pay_stablecoin(to=0x..., amount=10000)

**User**: 转给B

**Claude**:
- Reads config: address=`0x1a85156c...`, amountInUnits=`50000`
- Asks: "确认支付 0.05 USDC 给 accountB？(y/n)"

**User**: buy 1 day

**Claude**:
- Executes: autopay_buy_apikey(duration=1)
- Returns: apiKey and txHash

**User**: check info

**Claude**:
- Executes: autopay_info
- Returns: pricing, balance, network info

**User**: 测试全部

**Claude**:
- 执行 autopay_info → 服务器状态、价格、余额
- 执行 autopay_refresh_pricing → 刷新价格
- 读取配置文件 → 验证账户配置
- 显示完整测试报告

**User**: 测试转账给A

**Claude**:
- 读取配置: address=`0x1a85156c...`, amountInUnits=`10000`
- 执行: autopay_pay_stablecoin(to=0x..., amount=10000)
- 显示: 交易哈希和状态

**User**: 测试转账给B

**Claude**:
- 读取配置: address=`0x1a85156c...`, amountInUnits=`50000`
- 显示: "确认支付 0.05 USDC 给 accountB？(y/n)"
- 执行: autopay_pay_stablecoin
- 显示: 交易哈希和状态

**User**: 测试购买1天

**Claude**:
- 执行: autopay_buy_apikey(duration=1)
- 返回: apiKey 和 txHash

**User**: 测试检查服务

**Claude**:
- 执行 autopay_info
- 返回：价格、余额、网络配置

## Example Output (测试全部输出示例)

**测试全部 执行结果:**
```
✅ 服务器状态：iAutoPay API v0.1.0 (dev 环境)
✅ 网络：Base Sepolia (eip155:84532)
✅ 价格刷新：成功
✅ 账户 A: 0x1a85156c... - 0.01 USDC (无需确认)
✅ 账户 B: 0x1a85156c... - 0.05 USDC (需确认)
✅ API Key 价格：1 天 0.09 USDC, 7 天 0.49 USDC, 30 天 0.99 USDC
✅ 当前余额：15.609000 USDC
```

## Prompt Processing Flow (提示词处理流程)

当收到用户输入时，按以下流程处理：

```
用户输入 → 模式匹配 → 解析意图 → 读取配置 → 调用工具 → 显示结果
```

### 示例 1: "转给 A"
```
[1] 匹配模式：/(转给 | 转账|pay)\s*A/i
[2] 解析意图：pay_to_account_A
[3] 读取配置：./agents/skills/autopay/autopay.config.json
    → accountA.address = 0x1a85156c2943b63febeee7883bd84a7d1cf0da0c
    → accountA.amountInUnits = 10000
[4] 调用工具：autopay_pay_stablecoin(to="0x1a85...", amount="10000")
[5] 显示结果：交易哈希、金额、余额
```

### 示例 2: "测试全部"
```
[1] 匹配模式：/(测试全部 |test all|run tests)/i
[2] 解析意图：full_test_suite
[3] 执行流程：
    → Step 1: autopay_info() → 获取服务器状态
    → Step 2: autopay_refresh_pricing() → 刷新价格
    → Step 3: read(autopay.config.json) → 验证配置
[4] 显示结果：完整测试报告
```

### 示例 3: "buy 1 day"
```
[1] 匹配模式：/buy\s*(1|one)\s*(day|天)/i
[2] 解析意图：buy_apikey_1day
[3] 调用工具：autopay_buy_apikey(duration=1)
[4] 显示结果：apiKey、txHash、价格
```

## 提示词 - 工具映射表

| 提示词模式 | 解析意图 | 工具 | 参数 |
|-----------|---------|------|------|
| 转给 A / pay A | pay_to_A | autopay_pay_stablecoin | to=A.address, amount=A.amountInUnits |
| 转给 B / pay B | pay_to_B | autopay_pay_stablecoin | to=B.address, amount=B.amountInUnits |
| buy 1 day | buy_1day | autopay_buy_apikey | duration=1 |
| buy 7 days | buy_7days | autopay_buy_apikey | duration=7 |
| buy 30 days | buy_30days | autopay_buy_apikey | duration=30 |
| check info | check_info | autopay_info | - |
| 测试全部 | full_test | 多个工具 | info + refresh + config |
| 测试转账给 A | test_pay_A | autopay_pay_stablecoin | to=A.address, amount=A.amountInUnits |

## Notes

1. Use natural language prompts to trigger actions
2. Account B requires confirmation before payment
3. All payments execute on Base Sepolia testnet
4. Config path: `./.agents/skills/autopay/autopay.config.json`
5. "测试全部" executes info + refresh_pricing + config validation (no actual transactions)
6. "测试转账给 A/B" executes actual transactions (use with caution)
