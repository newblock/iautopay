import { createPublicClient, http, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, base } from "viem/chains";

// Hardcoded configuration
const CUR_ENV: 'dev' | 'prod' = 'prod';
const BUYER_PRIVATE_KEY = process.env.BUYER_PRIVATE_KEY as string;

if (!BUYER_PRIVATE_KEY) {
  console.error("Please provide BUYER_PRIVATE_KEY env var via opencode.json");
  process.exit(1);
}

const account = privateKeyToAccount(BUYER_PRIVATE_KEY as `0x${string}`);
console.log("付款地址 (Address):", account.address);

const chain = (CUR_ENV as string) === 'dev' ? baseSepolia : base;
const client = createPublicClient({
  chain,
  transport: http(),
});

console.log(`当前环境: ${CUR_ENV.toUpperCase()}`);
console.log(`区块链: ${chain.name} (chain ID: ${chain.id})`);
console.log("----------------------------------------");

// USDC addresses
const USDC_ADDRESSES = {
  sepolia: {
    official: "0x4200000000000000000000000000000000000006",
    custom: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
  mainnet: {
    official: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  }
};

const currentUSDC = (CUR_ENV as string) === 'dev' ? USDC_ADDRESSES.sepolia : USDC_ADDRESSES.mainnet;

const usdcAbi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
      name: "decimals",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "uint8" }],
  },
  {
      name: "name",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "string" }],
  },
  {
      name: "version",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "string" }],
  }
] as const;

async function checkToken(address: string, label: string) {
  try {
    const decimals = await client.readContract({
        address: address as `0x${string}`,
        abi: usdcAbi,
        functionName: "decimals",
    });

    const balance = await client.readContract({
      address: address as `0x${string}`,
      abi: usdcAbi,
      functionName: "balanceOf",
      args: [account.address],
    });

    let tokenName = "Unknown";
    try {
        tokenName = await client.readContract({
            address: address as `0x${string}`,
            abi: usdcAbi,
            functionName: "name",
        });
    } catch {}

    let tokenVersion = "Unknown";
    try {
        tokenVersion = await client.readContract({
            address: address as `0x${string}`,
            abi: usdcAbi,
            functionName: "version",
        });
    } catch {}

    console.log(`[${label}] ${tokenName} (v${tokenVersion}) - ${address}`);
    console.log(`  余额: ${formatUnits(balance, decimals)}`);
    console.log(`  原始: ${balance.toString()}`);
  } catch (e: any) {
    console.error(`[${label}] 查询失败:`, e?.message || e);
  }
}

async function main() {
  const ethBalance = await client.getBalance({ address: account.address });
  console.log("付款地址:", account.address);
  console.log("ETH 余额:", formatUnits(ethBalance, 18), "ETH");
  console.log("----------------------------------------");

  if ('official' in currentUSDC) {
    await checkToken(currentUSDC.official as string, "Official USDC");
    console.log("----------------------------------------");
  }
  if ('custom' in currentUSDC) {
    await checkToken(currentUSDC.custom as string, "Custom USDC");
  }
}

main();
