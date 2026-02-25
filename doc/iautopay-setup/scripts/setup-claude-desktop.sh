#!/bin/bash

#
# Claude Desktop Auto-Setup Script for iAutoPay MCP
#
# This script:
# 1. Updates ~/.claude/claude_desktop_config.json
# 2. Adds autopay MCP server configuration
# 3. Prompts for BUYER_PRIVATE_KEY (hidden input)
# 4. Creates backup file
#

set -e

CONFIG_FILE="$HOME/.claude/claude_desktop_config.json"
BACKUP_FILE="$CONFIG_FILE.backup"
MCP_SERVER="autopay"
MCP_COMMAND="npx"
MCP_ARGS=(-y "@newblock/iautopay-mcp")

echo "=== iAutoPay MCP - Claude Desktop Setup ==="
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "✗ jq is not installed"
    echo "  Please install it: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

echo "✓ jq found"
echo ""

# Check if config file exists
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "✗ Claude Desktop config file not found: $CONFIG_FILE"
    echo "  Please install Claude Desktop first: https://claude.ai/download"
    exit 1
fi

echo "✓ Claude Desktop config file found: $CONFIG_FILE"
echo ""

# Create backup
echo "Creating backup: $BACKUP_FILE"
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "✓ Backup created"
echo ""

# Prompt for private key
echo -n "Enter your EVM wallet private key (input hidden): "
read -s PRIVATE_KEY
echo ""

# Validate private key
if [[ -z "$PRIVATE_KEY" ]]; then
    echo "✗ Private key cannot be empty"
    exit 1
fi

if [[ ! "$PRIVATE_KEY" =~ ^0x[0-9a-fA-F]{64}$ ]]; then
    echo "✗ Invalid private key format"
    echo "  Must be 66 characters starting with 0x"
    exit 1
fi

echo "✓ Private key format valid"
echo ""

# Add or update MCP server configuration
echo "Adding $MCP_SERVER server to Claude Desktop..."

# Build JSON payload for jq
JSON_PAYLOAD=$(cat <<EOF
{
  "mcpServers": {
    "$MCP_SERVER": {
      "command": "$MCP_COMMAND",
      "args": $(jq -n '$ARGS.positional' --args "${MCP_ARGS[@]}"),
      "env": {
        "BUYER_PRIVATE_KEY": "$PRIVATE_KEY"
      }
    }
  }
}
EOF
)

# Merge the new configuration
jq --argjson new "$JSON_PAYLOAD" '.mcpServers |= (if . == null then $new.mcpServers else (. + $new.mcpServers) end)' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"

echo "✓ Configuration updated"
echo ""

# Verify the configuration
echo "=== Setup Complete ==="
echo ""
echo "Config file: $CONFIG_FILE"
echo "Backup file: $BACKUP_FILE"
echo "MCP server: $MCP_SERVER"
echo ""

echo "Verification steps:"
echo "1. Restart Claude Desktop"
echo "2. Check MCP servers in Settings → Developer → MCP Servers"
echo "   Should see: $MCP_SERVER"
echo "3. Test by asking:"
echo "   'Use the info tool to get iAutoPay server information'"
echo ""

echo "=== Configured Server ==="
jq -r '.mcpServers.'$MCP_SERVER'' "$CONFIG_FILE"

echo ""
echo "Security reminder:"
echo "  ✓ Test on testnet before mainnet"
echo "  ✓ Use a dedicated wallet"
echo "  ✓ Never share or commit your private key"
echo "  ✓ Backup saved to: $BACKUP_FILE"
