# Claude CLI MCP Configuration

This project supports both OpenCode and Claude CLI MCP servers.

## OpenCode

Configuration is automatically generated at installation via `opencode.json`.

Available commands:
- `/autopay_toA` - Quick payment of 0.01 USDC
- `/autopay_toB` - Quick payment of 0.05 USDC (with confirmation)
- `/autopay_buy_glm_nvidia_apikey` - Purchase GLM NVIDIA API Key
- `/autopay_custom` - Custom payment
- `/autopay_getInfo` - Get service information

## Claude CLI

### Option 1: Use Pre-generated Config File (Recommended)

```bash
# Use the auto-generated mcp-config.json
claude --mcp-config mcp-config.json
```

This method uses the configuration file generated at `mcp-config.json` during installation.

### Option 2: Add to Local Config

```bash
# Add MCP server to Claude CLI
BUYER_PRIVATE_KEY="your_private_key" claude mcp add iauto-pay \
  -e BUYER_PRIVATE_KEY="your_private_key" \
  -- npx -y @newblock/iautopay-mcp

# Verify connection:
claude mcp list

# Should show:
# iauto-pay: npx -y @newblock/iautopay-mcp - ✓ Connected
```

After adding, you can simply run `claude` without any additional flags.

### Option 3: Manual Setup

```bash
# Create mcp-config.json manually:
{
  "mcpServers": {
    "iauto-pay": {
      "command": "npx",
      "args": ["-y", "@newblock/iautopay-mcp"],
      "env": {
        "BUYER_PRIVATE_KEY": "your_private_key_here"
      }
    }
  }
}

# Then use it:
claude --mcp-config mcp-config.json
```

## Available Tools

When using Claude CLI with MCP enabled, the following tools are available:

- `pay_stablecoin` - Pay USDC to any address (auto-detects mainnet/testnet based on CUR_ENV)
- `buy_glm_nvidia_apikey` - Purchase GLM NVIDIA API Key
- `get_info` - Get server information (stock, price, network config)
- `pay_preset` - Quick preset payments (toA: 0.01 USDC, toB: 0.05 USDC)

## Usage Examples

### Using Config File
```bash
# Start Claude CLI with MCP support
claude --mcp-config mcp-config.json
```

### Using Local Config
```bash
# Start Claude CLI (MCP servers from local config are auto-loaded)
claude
```

## Verification

```bash
# List configured MCP servers
claude mcp list

# Get details of specific server
claude mcp get iauto-pay
```

## Removing MCP Server

If you added to local config:
```bash
claude mcp remove iauto-pay -s local
```

If using config file, simply remove the `--mcp-config mcp-config.json` flag when running `claude`.

## Troubleshooting

**MCP server not connecting:**
1. Ensure dependencies are installed: `npm install -g @newblock/iautopay-mcp`
2. Verify npx can run the package: `npx @newblock/iautopay-mcp`
3. Check environment variable is set correctly in `mcp-config.json` or local config

**Tools not showing up:**
1. Verify MCP connection: `claude mcp list`
2. Check server health: `claude mcp get iauto-pay`
3. Restart Claude CLI

**Wrong environment (dev vs prod):**
- The published npm package uses dev environment by default
- For production environment, you may need to build from source or request a prod release

## Configuration Files

- `opencode.json` - OpenCode configuration (auto-generated)
- `mcp-config.json` - Claude CLI MCP configuration (auto-generated)
- `mcp-config.json.example` - Example MCP config template
- `scripts/generate-opencode-config.js` - Configuration generation script
- `~/.claude.json` (project-scoped) or `~/.claude/mcp.json` (global) - Claude CLI local config

## Environment Variables

Set `BUYER_PRIVATE_KEY` when running the configuration script:

```bash
BUYER_PRIVATE_KEY="your_private_key" npm run install:opencode-config
```

This ensures both OpenCode and Claude CLI configurations have the correct key.
