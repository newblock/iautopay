# iAutoPay Setup Skill

This skill helps users quickly install and configure iAutoPay MCP service for OpenCode, Claude CLI, and Claude Code Desktop.

## Directory Structure

```
iautopay-setup/
├── SKILL.md                                 # Main skill documentation
├── scripts/
│   ├── setup-opencode.js                    # OpenCode auto-configuration
│   ├── setup-claude-cli.sh                  # Claude CLI auto-configuration
│   └── setup-claude-desktop.sh              # Claude Desktop auto-configuration
└── references/
    ├── opencode-config.example.json         # OpenCode config example
    ├── claude-cli-config.example.json       # Claude CLI config example
    └── claude-desktop-config.example.json   # Claude Desktop config example
```

## Installation as System Skill

To make this skill available system-wide:

1. **Create skill directory in agent skills folder:**
   ```bash
   mkdir -p ~/.agents/skills/iautopay-setup
   ```

2. **Copy all files:**
   ```bash
   cd /Users/michael/opc/proj/iap_npm/doc/iautopay-setup
   cp -r . ~/.agents/skills/iautopay-setup/
   ```

3. **Verify installation:**
   ```bash
   ls -la ~/.agents/skills/iautopay-setup/
   ```

## Usage

The skill is automatically triggered when users ask about:
- Installing iAutoPay MCP
- Setting up iAutoPay for OpenCode, Claude CLI, or Claude Desktop
- Configuring AI payment system

### Automated Setup Scripts

#### For OpenCode:
```bash
node scripts/setup-opencode.js
```
- Detects or creates `opencode.json`
- Adds MCP configuration with environment variables
- Adds 6 quick commands for fast access
- Secure private key input (hidden)

#### For Claude CLI:
```bash
bash scripts/setup-claude-cli.sh
```
- Runs `claude mcp add autopay` command
- Configures environment variables
- Verifies MCP connection

#### For Claude Desktop:
```bash
bash scripts/setup-claude-desktop.sh
```
- Updates `~/.claude/claude_desktop_config.json`
- Adds MCP server configuration
- Creates backup file (.backup)
- Secure private key input (hidden)

## Quick Commands (OpenCode)

After setup, these commands are available:

- `/autopay_guide` - Show usage guide
- `/autopay_buy_apikey_1day` - Buy 1-day API Key
- `/autopay_buy_apikey_7days` - Buy 7-day API Key
- `/autopay_get_info` - Get server information

## Available MCP Tools

When properly configured, the iAutoPay MCP provides these tools:

- `guide` - Display complete usage guide
- `info` - Get server info (stock, prices, network)
- `buy_apikey` - Buy API key (1/7/30 days)
- `refresh_pricing` - Refresh prices from server

## Security

**Important Security Reminders:**

- ✅ Never share your private key
- ✅ Test on testnet before mainnet
- ✅ Use a dedicated wallet, not your main wallet
- ✅ Keep private key secure, never commit to version control
- ✅ Use environment variables, never hardcode in files
- ✅ Backup existing configurations before setup

## Troubleshooting

**MCP not connecting:**
- Verify package installed: `npx @newblock/iautopay-mcp`
- Check private key format (starts with 0x, 66 characters)
- Restart your AI assistant

**Private key errors:**
- Ensure key starts with 0x
- Check no extra spaces or quotes
- Use proper 64-char hex string (after 0x)

**Script permissions:**
```bash
chmod +x scripts/*.sh
```

## Verification

### OpenCode:
```bash
# MCP tools should appear automatically
# Run /autopay_guide to verify
```

### Claude CLI:
```bash
claude mcp list        # Should show autopay: connected
claude mcp get autopay # Should show server details
```

### Claude Desktop:
- Restart Claude Desktop
- Check MCP servers in Settings → Developer → MCP Servers

## Support

For issues and questions:
- GitHub: https://github.com/newblock/iautopay
- Issues: https://github.com/newblock/iautopay/issues
