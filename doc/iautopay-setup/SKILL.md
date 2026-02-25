---
name: iautopay-setup
description: Install and configure iAutoPay MCP service for OpenCode, Claude CLI, and Claude Code Desktop. Includes automated setup scripts and quick commands configuration. Use when users need to set up AI-powered automatic payment system supporting USDC on all EVM-compatible chains.
---

# iAutoPay MCP Setup

iAutoPay enables AI agents to automatically pay for purchases using USDC on all EVM-compatible chains.

## Quick Install

No installation required - use npx:
```bash
npx @newblock/iautopay-mcp
```

## Platform Selection

Choose your platform:

- **OpenCode** - Use `setup-opencode.js` script
- **Claude CLI** - Use `setup-claude-cli.sh` script
- **Claude Desktop** - Use `setup-claude-desktop.sh` script

## Automated Setup

### OpenCode

```bash
node scripts/setup-opencode.js
```
Script will:
- Detect or create opencode.json in current directory
- Add autopay MCP configuration
- Add 4 quick commands (buy_apikey_1day/7days, get_info, guide)
- Prompt for BUYER_PRIVATE_KEY (hidden input)

### Claude CLI

```bash
bash scripts/setup-claude-cli.sh
```
Script will:
- Run `claude mcp add autopay` with npx command
- Configure BUYER_PRIVATE_KEY environment variable
- Verify MCP connection

### Claude Desktop

```bash
bash scripts/setup-claude-desktop.sh
```
Script will:
- Update ~/.claude/claude_desktop_config.json
- Add autopay MCP server
- Prompt for BUYER_PRIVATE_KEY (hidden input)
- Create backup (.backup)

## Manual Configuration

See references/ for complete configuration examples:
- opencode-config.example.json - OpenCode full config with quick commands
- claude-cli-config.example.json - Claude CLI MCP config
- claude-desktop-config.example.json - Claude Desktop config

## Quick Commands (OpenCode)

After setup, these commands are available:
- `/autopay_guide` - Show usage guide
- `/autopay_buy_apikey_1day` - Buy 1-day API Key (0.09 USDC)
- `/autopay_buy_apikey_7days` - Buy 7-day API Key (0.49 USDC)
- `/autopay_get_info` - Get server information

## Verification

### OpenCode
```bash
# MCP tools should appear automatically
# Run /autopay_guide to verify
```

### Claude CLI
```bash
claude mcp list        # Should show autopay: connected
claude mcp get autopay # Should show server details
```

### Claude Desktop
- Restart Claude Desktop
- Check MCP servers in settings

## Security

**Never share your private key.** Always:
- Test on dev/testnet before mainnet
- Use a dedicated wallet, not your main wallet
- Keep private key secure and never commit to version control
- Use environment variables, never hardcode in files

## Available MCP Tools

When properly configured:
- `guide` - Display complete usage guide
- `info` - Get server info (stock, prices, network)
- `buy_apikey` - Buy API key (1/7/30 days)
- `refresh_pricing` - Refresh prices from server

## Troubleshooting

**MCP not connecting:**
- Verify package installed: `npx @newblock/iautopay-mcp`
- Check private key format (starts with 0x)
- Restart your AI assistant

**Wrong network:**
- Dev environment uses Base Sepolia testnet
- Production requires custom build or prod release

**Private key errors:**
- Ensure key starts with 0x
- Check no extra spaces or quotes
- Use proper 64-char hex string (after 0x)
