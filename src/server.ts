import dotenv from "dotenv";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import {
  Server,
} from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  createPublicClient,
  createWalletClient,
  hexToSignature,
  http,
  isAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// ============================================================================
// Hardcoded Configuration (no .env dependency)
// ============================================================================

const CUR_ENV: 'dev' | 'prod' = 'dev';

const CONFIG = {
  // User's private key for signing payments (provided via opencode.json environment)
  BUYER_PRIVATE_KEY: process.env.BUYER_PRIVATE_KEY as string,
  
  // Remote Fact API server
  FACT_API_URL: (CUR_ENV as string)=='dev'?"https://apipaymcp.okart.fun":"https://apipaymcp.okart.fun",
  
  // Blockchain configuration (Base Sepolia for dev, Base Mainnet for prod)
  RPC_URL: (CUR_ENV as string)=='dev'?"https://sepolia.base.org":"https://mainnet.base.org",

  CHAIN_ID: (CUR_ENV as string)=='dev'?"84532":"8453",
  
  // Payment token details
  PAYMENT_TOKEN_NAME: "USDC",
} as const;

// Validate required configuration
if (!CONFIG.BUYER_PRIVATE_KEY) {
  throw new Error("BUYER_PRIVATE_KEY must be provided via opencode.json environment");
}

// Validate private key format
try {
  const account = privateKeyToAccount(CONFIG.BUYER_PRIVATE_KEY as `0x${string}`);
  console.log(`[CONFIG] Private key validated, account: ${account.address}`);
} catch (error) {
  throw new Error(`Invalid BUYER_PRIVATE_KEY format: ${error}`);
}

// Derive values from config
const BUYER_CHAIN_ID = CONFIG.CHAIN_ID;
const BUYER_RPC_URL = CONFIG.RPC_URL;
const FACT_API_URL = CONFIG.FACT_API_URL;

// USDC addresses
const USDC_ADDRESSES = {
  dev: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  prod: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
};
const CURRENT_USDC = USDC_ADDRESSES[CUR_ENV as keyof typeof USDC_ADDRESSES];

const paymentRequirementsSchema = z.object({
  scheme: z.string().optional(),
  network: z.string().min(1),
  asset: z.string().min(1),
  price: z.string().min(1),
  payee: z.string().optional(),
});
const payStablecoinInput = z.object({
  to: z.string().min(1),
  amount: z.string().min(1),
});
const buyApikeyInput = z.object({
  duration: z.number().optional().refine(val => !val || [1, 7, 30].includes(val), {
    message: "Duration must be 1, 7, or 30 days"
  })
});
const getInfoInput = z.object({});
const guideInput = z.object({});
const syncOpencodeConfigInput = z.object({});
const refreshPricingInput = z.object({});

// ============================================================================
// Dynamic Pricing from Fact API
// ============================================================================

let CACHED_PRICING: Record<string, string> | null = null;

async function fetchPricingFromFactAPI() {
  try {
    const res = await fetch(`${FACT_API_URL}/info`);
    if (res.ok) {
      const data = await res.json() as { prices?: { "1dayUsdc"?: number; "7daysUsdc"?: number; "30daysUsdc"?: number } };
      CACHED_PRICING = {
        "1day": `${data.prices?.["1dayUsdc"] || 0.09} USDC`,
        "7days": `${data.prices?.["7daysUsdc"] || 0.49} USDC`,
        "30days": `${data.prices?.["30daysUsdc"] || 0.99} USDC`
      };
      console.log(`[PRICING] Loaded from fact-api:`, CACHED_PRICING);
      return CACHED_PRICING;
    }
  } catch (error) {
    console.warn(`[PRICING] Failed to fetch from fact-api, using defaults. Error:`, error);
  }
  
  // Default pricing as fallback
  CACHED_PRICING = {
    "1day": "0.09 USDC",
    "7days": "0.49 USDC",
    "30days": "0.99 USDC"
  };
  console.log(`[PRICING] Using default pricing:`, CACHED_PRICING);
  return CACHED_PRICING;
}

const buyerAccount = privateKeyToAccount(CONFIG.BUYER_PRIVATE_KEY as `0x${string}`);
const publicClient = createPublicClient({
  transport: http(BUYER_RPC_URL),
});
const walletClient = createWalletClient({
  account: buyerAccount,
  transport: http(BUYER_RPC_URL),
});

// ============================================================================
// Retry Configuration
// ============================================================================

const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
} as const;

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  context: string = 'API Request'
): Promise<Response> {
  for (let i = 0; i < RETRY_CONFIG.MAX_RETRIES; i++) {
    try {
      const response = await fetch(url, options);

      if (response.ok || response.status < 500) {
        return response;
      }

      console.log(`[RETRY] ${context} - Attempt ${i + 1}/${RETRY_CONFIG.MAX_RETRIES} failed, status: ${response.status}`);
    } catch (error) {
      console.log(`[RETRY] ${context} - Attempt ${i + 1}/${RETRY_CONFIG.MAX_RETRIES} error:`, error);
    }

    if (i < RETRY_CONFIG.MAX_RETRIES - 1) {
      const delay = RETRY_CONFIG.BASE_DELAY * Math.pow(2, i);
      console.log(`[RETRY] ${context} - Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`${context} failed after ${RETRY_CONFIG.MAX_RETRIES} retries`);
}

// ============================================================================
// Token ABI
// ============================================================================

const tokenAbi = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "transferWithAuthorization",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const transferWithAuthorizationTypes = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

function parseChainId(network: string) {
  const parts = network.split(":");
  if (parts.length === 2 && parts[0] === "eip155") {
    const value = Number(parts[1]);
    if (!Number.isNaN(value)) return value;
  }
  return Number(BUYER_CHAIN_ID);
}

async function buildPaymentSignature(requirements: {
  network: string;
  asset: string;
  price: string;
  payee?: string;
}) {
  const chainId = parseChainId(requirements.network);
  const verifyingContract = requirements.asset as `0x${string}`;
  if (!isAddress(verifyingContract)) {
    throw new Error("Invalid payment asset address");
  }

  let tokenName = await publicClient
    .readContract({
      address: verifyingContract,
      abi: tokenAbi,
      functionName: "name",
    })
    .catch(() => CONFIG.PAYMENT_TOKEN_NAME);

  let version = "1";

  // Special handling for Base Sepolia USDC and Base Mainnet USDC
  const sepoliaUSDC = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
  const mainnetUSDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
  
  if (requirements.network === "eip155:84532" && 
      requirements.asset.toLowerCase() === sepoliaUSDC.toLowerCase()) {
    tokenName = "USDC";
    version = "2";
  } else if (requirements.network === "eip155:8453" && 
      requirements.asset.toLowerCase() === mainnetUSDC.toLowerCase()) {
    tokenName = "USD Coin";
    version = "2";
  }

  const nonce = `0x${crypto.randomBytes(32).toString("hex")}` as `0x${string}`;
  const now = Math.floor(Date.now() / 1000);
  const validAfter = BigInt(0);
  const validBefore = BigInt(now + 28800);
  const payee = requirements.payee ?? buyerAccount.address;

  const signature = await walletClient.signTypedData({
    domain: {
      name: tokenName,
      version,
      chainId,
      verifyingContract,
    },
    types: transferWithAuthorizationTypes,
    primaryType: "TransferWithAuthorization",
    message: {
      from: buyerAccount.address,
      to: payee as `0x${string}`,
      value: BigInt(requirements.price),
      validAfter,
      validBefore,
      nonce,
    },
  });

  const { v, r, s } = hexToSignature(signature);
  return {
    from: buyerAccount.address,
    to: payee,
    value: requirements.price,
    validAfter: validAfter.toString(),
    validBefore: validBefore.toString(),
    nonce,
    v: Number(v),
    r,
    s,
  };
}

async function payStablecoin(params: {
  to: string;
  amount: string;
  asset: string;
  isTestnet?: boolean;
}) {
  console.log(`[PAY_STABLECOIN] Starting payment...`);
  console.log(`[PAY_STABLECOIN] Network: ${params.isTestnet ? "eip155:84532 (Testnet)" : `eip155:${BUYER_CHAIN_ID}`}`);
  console.log(`[PAY_STABLECOIN] Asset: ${params.asset}`);
  console.log(`[PAY_STABLECOIN] Amount: ${params.amount}`);
  console.log(`[PAY_STABLECOIN] To: ${params.to}`);
  
  const [balance, decimals] = await Promise.all([
    publicClient.readContract({
      address: params.asset as `0x${string}`,
      abi: tokenAbi,
      functionName: 'balanceOf',
      args: [buyerAccount.address]
    }),
    publicClient.readContract({
      address: params.asset as `0x${string}`,
      abi: tokenAbi,
      functionName: 'decimals'
    })
  ]);
  
  const balanceNumber = Number(balance) / (10 ** Number(decimals));
  const amountNumber = Number(params.amount) / 1e6;
  
  console.log(`[PAY_STABLECOIN] Current balance: ${balanceNumber.toFixed(6)} USDC`);
  console.log(`[PAY_STABLECOIN] Required: ${amountNumber.toFixed(6)} USDC`);
  
  if (balanceNumber < amountNumber) {
    console.log(`[PAY_STABLECOIN] Insufficient balance!`);
    throw new Error(`Insufficient balance: required ${amountNumber.toFixed(6)} USDC, available ${balanceNumber.toFixed(6)} USDC`);
  }
  
  const requirements = {
    scheme: "exact",
    network: params.isTestnet ? "eip155:84532" : `eip155:${BUYER_CHAIN_ID}`,
    asset: params.asset,
    price: params.amount,
    payee: params.to,
  };
  
  console.log(`[PAY_STABLECOIN] Building payment signature...`);
  const signaturePayload = await buildPaymentSignature(requirements);
  console.log(`[PAY_STABLECOIN] Signature built, calling fact-api...`);
  console.log(`[PAY_STABLECOIN] Fact API URL: ${FACT_API_URL}/v1/transfer`);

  const transferRes = await fetchWithRetry(
    `${FACT_API_URL}/v1/transfer`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "PAYMENT-SIGNATURE": JSON.stringify(signaturePayload),
      },
      body: JSON.stringify({
        to: params.to,
        amount: params.amount,
        asset: params.asset,
      }),
    },
    'PAY_STABLECOIN Transfer'
  );
 
  console.log(`[PAY_STABLECOIN] Fact API response status: ${transferRes.status}`);
  
  if (!transferRes.ok) {
    const error = await transferRes.text();
    console.log(`[PAY_STABLECOIN] Transfer failed: ${error}`);
    
    const networkInfo = params.isTestnet ? "Testnet (Base Sepolia 84532)" : `Mainnet (Base ${BUYER_CHAIN_ID === '8453' ? 'Mainnet' : BUYER_CHAIN_ID})`;
    throw new Error(`Transfer failed (${networkInfo}): ${error}`);
  }
 
  const result = await transferRes.json() as object;
  console.log(`[PAY_STABLECOIN] Transfer successful:`, result);
  
  const deductedAmount = amountNumber.toFixed(6);
  const currentBalance = (balanceNumber - amountNumber).toFixed(6);
  
  return {
    ...result,
    from: buyerAccount.address,
    to: params.to,
    amount: `${amountNumber.toFixed(6)} USDC`,
    asset: params.asset,
    network: params.isTestnet ? "Testnet (Base Sepolia)" : "Mainnet (Base)",
    deductedAmount: `${deductedAmount} USDC`,
    currentBalance: `${currentBalance} USDC`
  };
}

const server = new Server(
  { name: "autopay-server", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "guide",
        description: "⭐ FIRST TIME? Run this guide to learn how to use iAutoPay tools and commands.",
        inputSchema: zodToJsonSchema(guideInput),
      },
      {
        name: "info",
        description: "Get iAutoPay server information (API key stock, price, network config). Tip: Check before buying API keys.",
        inputSchema: zodToJsonSchema(getInfoInput),
      },
      {
        name: "buy_apikey",
        description: "Purchase an API key with optional duration (1/7/30 days). Prices: 1 day=0.9 USDC, 7 days=4.9 USDC, 30 days=9.9 USDC. Run 'info' first to confirm stock.",
        inputSchema: zodToJsonSchema(buyApikeyInput),
      },
      {
        name: "pay_stablecoin",
        description: "Pay stablecoin to any address using EIP-3009. Amount is in smallest unit (e.g., 100000 = 0.1 USDC).",
        inputSchema: zodToJsonSchema(payStablecoinInput),
      },
      {
        name: "sync_opencode_config",
        description: "Auto-configure opencode.json with quick commands (autopay_toA, autopay_toB, etc.)",
        inputSchema: zodToJsonSchema(syncOpencodeConfigInput),
      },
      {
        name: "refresh_pricing",
        description: "Refresh pricing from API. Use this if prices are changed on the server.",
        inputSchema: zodToJsonSchema(refreshPricingInput),
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
 
  if (name === "pay_stablecoin") {
    const parsed = payStablecoinInput.parse(args);
    
    try {
      const result = await payStablecoin({
        to: parsed.to,
        amount: parsed.amount,
        asset: CURRENT_USDC,
        isTestnet: (CUR_ENV as string) === 'dev',
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (error) {
      throw error;
    }
  }

  if (name === "buy_apikey") {
    const parsed = buyApikeyInput.parse(args);
    const duration = parsed.duration || 1;

    const [balance, decimals] = await Promise.all([
      publicClient.readContract({
        address: CURRENT_USDC as `0x${string}`,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [buyerAccount.address]
      }),
      publicClient.readContract({
        address: CURRENT_USDC as `0x${string}`,
        abi: tokenAbi,
        functionName: 'decimals'
      })
    ]);

    const balanceNumber = Number(balance) / (10 ** Number(decimals));

    const priceMap = {
      1: CACHED_PRICING?.["1day"] || "0.09 USDC",
      7: CACHED_PRICING?.["7days"] || "0.49 USDC",
      30: CACHED_PRICING?.["30days"] || "0.99 USDC",
    };
    const priceString = priceMap[duration as keyof typeof priceMap];
    const priceNumber = parseFloat(priceString);

    const priceWei = (priceNumber * 1e6).toString();

    console.log(`[BUY_APIKEY] Checking balance...`);
    console.log(`[BUY_APIKEY] Required: ${priceNumber.toFixed(6)} USDC, Available: ${balanceNumber.toFixed(6)} USDC`);

    if (balanceNumber < priceNumber) {
      throw new Error(`Insufficient balance: required ${priceNumber.toFixed(6)} USDC, available ${balanceNumber.toFixed(6)} USDC`);
    }

    const requirements = {
      scheme: "exact",
      network: (CUR_ENV as string) === 'dev' ? "eip155:84532" : `eip155:${BUYER_CHAIN_ID}`,
      asset: CURRENT_USDC,
      price: priceWei,
      payee: "0x1a85156c2943b63febeee7883bd84a7d1cf0da0c",
    };

    console.log(`[BUY_APIKEY] Building payment signature...`);
    const signaturePayload = await buildPaymentSignature(requirements);
    console.log(`[BUY_APIKEY] Signature built, calling fact-api...`);
    console.log(`[BUY_APIKEY] Fact API URL: ${FACT_API_URL}/v1/buy-apikey`);

    console.log(`[BUY_APIKEY] Sending request to fact-api (no retry, generate new nonce on failure)...`);
    const buyRes = await fetch(`${FACT_API_URL}/v1/buy-apikey`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "PAYMENT-SIGNATURE": JSON.stringify(signaturePayload),
      },
      body: JSON.stringify({ duration })
    });

    console.log(`[BUY_APIKEY] Fact API response status: ${buyRes.status}`);
    
    if (!buyRes.ok) {
      const error = await buyRes.text();
      console.log(`[BUY_APIKEY] Buy API key failed ${error}`);

      const networkInfo = (CUR_ENV as string) === 'dev' ? "Testnet (Base Sepolia 84532)" : `Mainnet (Base ${BUYER_CHAIN_ID})`;
      throw new Error(`Buy API key failed (${networkInfo}): ${error}`);
    }

    const result = await buyRes.json() as object;
     console.log(`[BUY_APIKEY] Buy API key successful:`, result);

     return {
       content: [{
         type: "text",
         text: JSON.stringify({
           ...result,
           price: `${priceNumber.toFixed(6)} USDC`,
           deductedAmount: `${priceNumber.toFixed(6)} USDC`,
           currentBalance: `${(balanceNumber - priceNumber).toFixed(6)} USDC`
         })
       }]
     };
  }

  if (name === "info") {
    const parsed = getInfoInput.parse(args);
    
    try {
      const res = await fetch(`${FACT_API_URL}/info`);
      if (res.ok) {
        const data = await res.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } else {
        throw new Error(`Failed to fetch info: ${res.statusText}`);
      }
    } catch (error) {
      throw error;
    }
  }

  if (name === "guide") {
    const parsed = guideInput.parse(args);
    
    const networkInfo = `${BUYER_CHAIN_ID === '84532' ? 'Base Sepolia' : 'Base Mainnet'} (${BUYER_CHAIN_ID})`;
    const pricing = CACHED_PRICING || {
      "1day": "0.09 USDC",
      "7days": "0.49 USDC",
      "30days": "0.99 USDC"
    };
    
    const toolsData = {
      tools: [
        { name: "guide", description: "显示完整使用指南" },
        { name: "info", description: "获取服务器信息（库存、价格、网络配置）" },
        { name: "buy_apikey", description: "购买 API key（支持1/7/30天时长）" },
        { name: "pay_stablecoin", description: "支付稳定币到指定地址" },
        { name: "sync_opencode_config", description: "自动配置 opencode.json 快捷命令" },
        { name: "refresh_pricing", description: "从服务器刷新价格" }
      ],
      commands: [
        { name: "autopay_toA", description: "快速支付 0.01 USDC" },
        { name: "autopay_toB", description: "支付 0.05 USDC（需确认）" },
        { name: "autopay_buy_apikey_1day", description: `购买1天API Key（${pricing["1day"]}）` },
        { name: "autopay_buy_apikey_7days", description: `购买7天API Key（${pricing["7days"]}）` },
        { name: "autopay_buy_apikey_30days", description: `购买30天API Key（${pricing["30days"]}）` },
        { name: "autopay_get_info", description: "快速获取服务器信息" }
      ],
      network: {
        testnet: "Base Sepolia (84532)",
        mainnet: "Base Mainnet (8453)",
        current: networkInfo
      },
      pricing,
      environment: CUR_ENV
    };
    
    return { content: [{ type: "text", text: JSON.stringify(toolsData, null, 2) }] };
  }

  if (name === "sync_opencode_config") {
    const parsed = syncOpencodeConfigInput.parse(args);
    
    try {
      const fs = await import('fs/promises');
      const opencodePath = '/Users/michael/opc/proj/iautopay/opencode.json';
      
      const opencodeData = JSON.parse(await fs.readFile(opencodePath, 'utf-8'));
      
      const pricing = CACHED_PRICING || {
        "1day": "0.09 USDC",
        "7days": "0.49 USDC",
        "30days": "0.99 USDC"
      };
      
      const requiredCommands = {
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
          "description": `购买1天API Key（${pricing["1day"]}）`
        },
        "autopay_buy_apikey_7days": {
          "template": "使用 buy_apikey 工具购买7天API Key，参数为：{\"duration\": 7}",
          "description": `购买7天API Key（${pricing["7days"]}）`
        },
        "autopay_buy_apikey_30days": {
          "template": "使用 buy_apikey 工具购买30天API Key，参数为：{\"duration\": 30}",
          "description": `购买30天API Key（${pricing["30days"]}）`
        },
        "autopay_get_info": {
          "template": "使用 info 工具获取服务器信息（API Key 库存、价格、网络配置）",
          "description": "获取iAutoPay服务器信息"
        },
        "autopay_guide": {
          "template": "使用 guide 工具显示 iAutoPay 使用指南",
          "description": "显示iAutoPay使用指南"
        }
      };
      
      let addedCommands: string[] = [];
      let updatedCommands: string[] = [];
      
      if (!opencodeData.command) {
        opencodeData.command = {};
      }
      
      for (const [key, value] of Object.entries(requiredCommands)) {
        if (!opencodeData.command[key]) {
          opencodeData.command[key] = value;
          addedCommands.push(key);
        }
      }
      
      if (addedCommands.length > 0) {
        await fs.writeFile(opencodePath, JSON.stringify(opencodeData, null, 2), 'utf-8');
        return { 
          content: [{ 
            type: "text", 
            text: `✅ 已添加 ${addedCommands.length} 个命令到 opencode.json:\n${addedCommands.map(c => `  - ${c}`).join('\n')}` 
          }] 
        };
      } else {
        return { 
          content: [{ 
            type: "text", 
            text: "✅ 所有 autopay_ 命令已存在，无需更新" 
          }] 
        };
      }
    } catch (error) {
      throw new Error(`同步配置失败: ${error}`);
    }
  }

  if (name === "refresh_pricing") {
    const parsed = refreshPricingInput.parse(args);
    
    try {
      await fetchPricingFromFactAPI();
      return { 
        content: [{ 
          type: "text", 
          text: `✅ 价格已刷新:\n${JSON.stringify(CACHED_PRICING, null, 2)}` 
        }] 
      };
    } catch (error) {
      throw new Error(`刷新价格失败: ${error}`);
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();

console.log(`========================================`);
console.log(`[CONFIG] Environment: ${CUR_ENV}`);
console.log(`[CONFIG] RPC URL: ${BUYER_RPC_URL}`);
console.log(`[CONFIG] Chain ID: ${BUYER_CHAIN_ID}`);
console.log(`[CONFIG] Fact API: ${FACT_API_URL}`);
console.log(`[CONFIG] USDC Address: ${CURRENT_USDC}`);
console.log(`[CONFIG] Buyer Address: ${buyerAccount.address}`);
console.log(`========================================`);

// Fetch pricing from Fact API on startup
await fetchPricingFromFactAPI();

console.log(`========================================`);
console.log(`[PRICING] 1 Day: ${CACHED_PRICING?.["1day"]}`);
console.log(`[PRICING] 7 Days: ${CACHED_PRICING?.["7days"]}`);
console.log(`[PRICING] 30 Days: ${CACHED_PRICING?.["30days"]}`);

// Check USDC balance on startup
try {
  const usdcBalance = await publicClient.readContract({
    address: CURRENT_USDC as `0x${string}`,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: [buyerAccount.address]
  });
  const decimals = await publicClient.readContract({
    address: CURRENT_USDC as `0x${string}`,
    abi: tokenAbi,
    functionName: 'decimals'
  });
  const balanceNumber = Number(usdcBalance) / (10 ** Number(decimals));
  console.log(`[BALANCE] USDC Balance: ${balanceNumber.toFixed(6)} USDC`);
} catch (error) {
  console.warn(`[BALANCE] Failed to check USDC balance:`, error);
}
console.log(`========================================`);

await server.connect(transport);

// Display startup message for users
setTimeout(() => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           iAutoPay MCP Server 已启动                          ║
╠════════════════════════════════════════════════════════════╣
║  快速开始：                                                  ║
║  1. 输入 "guide" 查看完整使用指南                             ║
║  2. 输入 "info" 查看服务器信息和价格                          ║
║  3. 输入 "buy_apikey" 购买 API Key (可选1/7/30天)             ║
╠════════════════════════════════════════════════════════════╣
║  提示：请确保 opencode.json 已配置 autopay_ 命令            ║
║  运行 "sync_opencode_config" 自动添加缺失的命令               ║
╚════════════════════════════════════════════════════════════╝
`);
}, 1000);
