#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const opencodeJsonPath = join(projectRoot, 'opencode.json');
const claudeMcpConfigPath = join(projectRoot, 'mcp-config.json');

const defaultCommands = {
  autopay_toA: {
    template: "使用 iauto-pay_pay_preset 工具，参数为：{\"preset\":\"toA\"}。支付完成后，显示：1. deductedAmount (扣款金额), 2. currentBalance (当前余额), 3. Transaction Hash (交易哈希), 4. Transfer Amount (转账金额), 5. preset (预设描述)。",
    description: "支付0.01 USDC给A账户（预设快捷命令）"
  },
  autopay_toB: {
    template: "首先使用 question 工具询问用户确认，选项包括：1) 确认（继续支付），2) 取消（不进行支付）。显示支付详情：0.05 USDC。用户选择确认后，使用 iauto-pay_pay_preset 工具，参数为：{\"preset\":\"toB\"}。支付完成后，显示：1. deductedAmount (扣款金额), 2. currentBalance (当前余额), 3. Transaction Hash (交易哈希), 4. Transfer Amount (转账金额), 5. preset (预设描述)。",
    description: "支付0.05 USDC给B账户（预设快捷命令，需确认）"
  },
  autopay_buy_glm_nvidia_apikey: {
    template: "使用 iauto-pay_buy_glm_nvidia_apikey 工具购买 GLM NVIDIA API Key。支付完成后，显示：1. deductedAmount (扣款金额), 2. currentBalance (当前余额), 3. Transaction Hash (交易哈希), 4. API Key, 5. price (价格)。",
    description: "购买 GLM NVIDIA API Key（预设快捷命令）"
  },
  autopay_custom: {
    template: "使用 iauto-pay_pay_stablecoin 工具进行自定义转账。需要用户指定：to（收款地址）和 amount（金额，以wei为单位）。支付完成后，显示：1. deductedAmount (扣款金额), 2. currentBalance (当前余额), 3. Transaction Hash (交易哈希), 4. Transfer Amount (转账金额)。",
    description: "自定义转账（需指定收款地址和金额）"
  },
  autopay_getInfo: {
    template: "使用 iauto-pay_get_info 工具获取服务信息，包括API Key库存和价格",
    description: "获取服务信息"
  }
};

function generateOpencodeConfig() {
  let opencodeConfig;
  
  if (existsSync(opencodeJsonPath)) {
    try {
      const existing = JSON.parse(readFileSync(opencodeJsonPath, 'utf-8'));
      opencodeConfig = existing;
      
      if (!opencodeConfig.command) {
        opencodeConfig.command = {};
      }
      
      let updated = false;
      for (const [key, value] of Object.entries(defaultCommands)) {
        if (!opencodeConfig.command[key]) {
          opencodeConfig.command[key] = value;
          console.log(`✓ 添加命令: ${key}`);
          updated = true;
        }
      }
      
      if (!updated) {
        console.log('所有命令已存在，无需更新');
        return;
      }
      
    } catch (error) {
      console.log('解析现有 opencode.json 失败，将创建新配置');
      opencodeConfig = {
        $schema: "https://opencode.ai/config.json",
        mcp: {
          "iauto-pay": {
            type: "local",
            command: ["sh", "-c", `cd ${projectRoot} && npx tsx src/server.ts`],
            enabled: true,
            environment: {
              BUYER_PRIVATE_KEY: process.env.BUYER_PRIVATE_KEY || ""
            }
          }
        },
        command: defaultCommands
      };
    }
  } else {
    opencodeConfig = {
      $schema: "https://opencode.ai/config.json",
      mcp: {
        "iauto-pay": {
          type: "local",
          command: ["sh", "-c", `cd ${projectRoot} && npx tsx src/server.ts`],
          enabled: true,
          environment: {
            BUYER_PRIVATE_KEY: process.env.BUYER_PRIVATE_KEY || ""
          }
        }
      },
      command: defaultCommands
    };
  }
  
  writeFileSync(opencodeJsonPath, JSON.stringify(opencodeConfig, null, 2), 'utf-8');
  console.log(`✓ OpenCode 配置已生成: ${opencodeJsonPath}`);
  return true;
}

function generateClaudeConfig() {
  const claudeConfig = {
    mcpServers: {
      "iauto-pay": {
        command: "npx",
        args: ["-y", "@newblock/iautopay-mcp"],
        env: {
          BUYER_PRIVATE_KEY: buyerPrivateKey
        }
      }
    }
  };
  
  writeFileSync(claudeMcpConfigPath, JSON.stringify(claudeConfig, null, 2), 'utf-8');
  console.log(`✓ Claude CLI MCP 配置已生成: ${claudeMcpConfigPath}`);
  return true;
}

console.log('========================================');
console.log('iAutoPay 配置生成器');
console.log('========================================\n');

const buyerPrivateKey = process.env.BUYER_PRIVATE_KEY || "";

let opencodeUpdated = generateOpencodeConfig();
const claudeUpdated = generateClaudeConfig();

if (opencodeUpdated || claudeUpdated) {
  console.log(`\n可用命令列表 (OpenCode):`);
  Object.keys(defaultCommands).forEach(key => {
    console.log(`  - ${key}: ${defaultCommands[key].description}`);
  });

  console.log(`\n可用工具列表 (Claude CLI MCP):`);
  console.log(`  - pay_stablecoin: 通用USDC转账`);
  console.log(`  - buy_glm_nvidia_apikey: 购买GLM NVIDIA API Key`);
  console.log(`  - get_info: 获取服务信息`);
  console.log(`  - pay_preset: 预设快捷支付 (toA/toB)`);

  console.log(`\n使用说明:`);
  console.log(`  OpenCode: 配置已自动应用`);
  console.log(`  Claude CLI: 运行以下命令使用生成的配置文件:\n`);
  console.log(`    claude --mcp-config ${claudeMcpConfigPath}\n`);
  console.log(`  或者手动添加 MCP 服务器:\n`);
  console.log(`    BUYER_PRIVATE_KEY="${buyerPrivateKey}" claude mcp add iauto-pay -e BUYER_PRIVATE_KEY="${buyerPrivateKey}" -- npx -y @newblock/iautopay-mcp\n`);
}
