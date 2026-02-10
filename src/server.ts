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
  BUYER_PRIVATE_KEY: process.env.BUYER_PRIVATE_KEY as string || process.env.BUYER_PRIVATE_KEY as string,
  
  // Local Fact API server
  FACT_API_URL: (CUR_ENV as string)=='dev'?"http://localhost:8787":"http://localhost:8787",
  
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
const payTestStablecoinInput = z.object({
  to: z.string().min(1),
  amount: z.string().min(1),
});
const buyApikeyInput = z.object({});
const getInfoInput = z.object({});

const buyerAccount = privateKeyToAccount(CONFIG.BUYER_PRIVATE_KEY as `0x${string}`);
const publicClient = createPublicClient({
  transport: http(BUYER_RPC_URL),
});
const walletClient = createWalletClient({
  account: buyerAccount,
  transport: http(BUYER_RPC_URL),
});

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
  const validBefore = BigInt(now + 3600);
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
 
  const transferRes = await fetch(`${FACT_API_URL}/v1/transfer`, {
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
  });
 
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
  { name: "iauto-pay-server", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "pay_stablecoin",
        description: "Pay stablecoin to a recipient address using EIP-3009 transferWithAuthorization (Uses configured network: Mainnet or Testnet based on CUR_ENV)",
        inputSchema: zodToJsonSchema(payStablecoinInput),
      },
      {
        name: "pay_test_stablecoin",
        description: "Pay stablecoin to a recipient address using EIP-3009 transferWithAuthorization (Force Base Sepolia Testnet)",
        inputSchema: zodToJsonSchema(payTestStablecoinInput),
      },
      {
        name: "buy_apikey",
        description: "Pay stablecoin to buy an API key (Uses configured network)",
        inputSchema: zodToJsonSchema(buyApikeyInput),
      },
      {
        name: "get_info",
        description: "Get iAutoPay server information including API key stock, price, network configuration",
        inputSchema: zodToJsonSchema(getInfoInput),
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

  if (name === "pay_test_stablecoin") {
    const parsed = payTestStablecoinInput.parse(args);
    
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
    
    const buyRes = await fetch(`${FACT_API_URL}/v1/buy-apikey`, {
      method: "POST",
      headers: { "content-type": "application/json" },
    });

    if (buyRes.status === 402) {
      const errorData = await buyRes.json() as {
        payment?: unknown;
        paymentRequirements?: unknown;
        requirements?: unknown;
      };
      const requirements = paymentRequirementsSchema.parse(
        errorData.payment ?? errorData.paymentRequirements ?? errorData.requirements ?? errorData
      );
      
      const priceNumber = Number(requirements.price) / 1e6;
      
      if (balanceNumber < priceNumber) {
        throw new Error(`Insufficient balance: required ${priceNumber.toFixed(6)} USDC, available ${balanceNumber.toFixed(6)} USDC`);
      }
      
      const signaturePayload = await buildPaymentSignature(requirements);
      
      const retryRes = await fetch(`${FACT_API_URL}/v1/buy-apikey`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "PAYMENT-SIGNATURE": JSON.stringify(signaturePayload),
        },
      });

      if (!retryRes.ok) {
        const error = await retryRes.text();
        throw new Error(`Buy API key failed: ${error}`);
      }

      const result = await retryRes.json() as object;
      
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            ...result,
            price: `${priceNumber.toFixed(6)} USDC`,
            network: requirements.network,
            asset: requirements.asset,
            deductedAmount: `${priceNumber.toFixed(6)} USDC`,
            currentBalance: `${(balanceNumber - priceNumber).toFixed(6)} USDC`
          }) 
        }] 
      };
    }

    if (!buyRes.ok) {
      const error = await buyRes.text();
      throw new Error(`Buy API key failed: ${error}`);
    }

    // Bypass flow (no payment)
    const result = await buyRes.json() as object;
    return { 
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          ...result,
          deductedAmount: `0.000000 USDC`,
          currentBalance: `${balanceNumber.toFixed(6)} USDC`
        }) 
      }] 
    };
  }

  if (name === "get_info") {
    const parsed = getInfoInput.parse(args);
    
    try {
      const res = await fetch(`${FACT_API_URL}/info`);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Get info failed: ${error}`);
      }
      const result = await res.json();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      throw error;
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();

// Log configuration on startup
console.log(`========================================`);
console.log(`[CONFIG] MCP Server Starting...`);
console.log(`[CONFIG] Environment: ${CUR_ENV.toUpperCase()}`);
console.log(`[CONFIG] Chain ID: ${BUYER_CHAIN_ID}`);
console.log(`[CONFIG] RPC URL: ${BUYER_RPC_URL}`);
console.log(`[CONFIG] Fact API URL: ${FACT_API_URL}`);
console.log(`[CONFIG] USDC Address: ${CURRENT_USDC}`);
console.log(`[CONFIG] Buyer Address: ${buyerAccount.address}`);
console.log(`========================================`);

await server.connect(transport);
